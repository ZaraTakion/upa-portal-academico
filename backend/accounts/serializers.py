from django.contrib.auth.models import Group, User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from rest_framework import serializers


class CurrentUserSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    username = serializers.CharField()
    email = serializers.EmailField(allow_blank=True)
    first_name = serializers.CharField(allow_blank=True)
    last_name = serializers.CharField(allow_blank=True)
    full_name = serializers.CharField()
    groups = serializers.ListField(child=serializers.CharField())
    is_staff = serializers.BooleanField()
    is_superuser = serializers.BooleanField()
    uploads_enabled = serializers.BooleanField()

class CsrfSerializer(serializers.Serializer):
    csrfToken = serializers.CharField()


class DetailSerializer(serializers.Serializer):
    detail = serializers.CharField()


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    new_password = serializers.CharField(write_only=True)


class AccessTokenSerializer(serializers.Serializer):
    access = serializers.CharField()


class ManagedUserSerializer(serializers.ModelSerializer):
    """Administrative accounts; never expose hashes or arbitrary permission flags."""

    password = serializers.CharField(write_only=True, required=False, trim_whitespace=False)
    role = serializers.ChoiceField(choices=("student", "professor", "admin"))
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "full_name", "is_active", "role", "password"]

    def get_full_name(self, obj) -> str:
        return obj.get_full_name() or obj.username

    def to_representation(self, instance):
        instance.role = "admin" if instance.is_staff else "professor" if any(group.name == "Professor" for group in instance.groups.all()) else "student"
        data = super().to_representation(instance)
        data["role"] = "admin" if instance.is_staff else "professor" if any(group.name == "Professor" for group in instance.groups.all()) else "student"
        return data

    def validate(self, attrs):
        actor = self.context["request"].user
        target = self.instance
        if target and (target.is_superuser or target.is_staff) and not actor.is_superuser:
            raise serializers.ValidationError("Somente um superusuário pode editar administradores.")
        if attrs.get("role") == "admin" and not actor.is_superuser:
            raise serializers.ValidationError({"role": "Somente um superusuário pode conceder administração."})
        if target and target.pk == actor.pk:
            if attrs.get("is_active") is False or attrs.get("role", "admin") != "admin":
                raise serializers.ValidationError("Você não pode remover seu próprio acesso administrativo.")
        role = attrs.get("role")
        if target and role:
            if role != "student" and hasattr(target, "studentprofile"):
                raise serializers.ValidationError({"role": "Preserve o perfil de estudante existente. Crie uma conta distinta para outro perfil."})
            if role != "professor" and hasattr(target, "teacherprofile"):
                raise serializers.ValidationError({"role": "Preserve o perfil docente existente. Crie uma conta distinta para outro perfil."})
        password = attrs.get("password")
        if not target and not password:
            raise serializers.ValidationError({"password": "Informe a senha inicial."})
        if password is not None:
            candidate = User(username=attrs.get("username", getattr(target, "username", "")), email=attrs.get("email", getattr(target, "email", "")))
            try:
                validate_password(password, user=candidate)
            except DjangoValidationError as error:
                raise serializers.ValidationError({"password": error.messages}) from error
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        role = validated_data.pop("role")
        password = validated_data.pop("password")
        user = User.objects.create_user(password=password, **validated_data)
        self.set_role(user, role)
        return user

    @transaction.atomic
    def update(self, instance, validated_data):
        role = validated_data.pop("role", None)
        password = validated_data.pop("password", None)
        for key, value in validated_data.items():
            setattr(instance, key, value)
        if password is not None:
            instance.set_password(password)
        instance.save()
        if role:
            self.set_role(instance, role)
        return instance

    @staticmethod
    def set_role(user, role):
        user.groups.remove(*Group.objects.filter(name__in=("Aluno", "Professor", "Administrador")))
        name = {"student": "Aluno", "professor": "Professor", "admin": "Administrador"}[role]
        group, _ = Group.objects.get_or_create(name=name)
        user.groups.add(group)
        user.is_staff = role == "admin"
        user.save(update_fields=["is_staff"])
