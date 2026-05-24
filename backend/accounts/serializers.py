from rest_framework import serializers


class CurrentUserSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    username = serializers.CharField()
    email = serializers.EmailField(allow_blank=True)
    first_name = serializers.CharField(allow_blank=True)
    last_name = serializers.CharField(allow_blank=True)
    groups = serializers.ListField(child=serializers.CharField())
    is_staff = serializers.BooleanField()
    is_superuser = serializers.BooleanField()