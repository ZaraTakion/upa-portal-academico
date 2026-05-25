from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        return Response(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "full_name": user.get_full_name() or user.username,
                "groups": list(user.groups.values_list("name", flat=True)),
                "is_staff": user.is_staff,
                "is_superuser": user.is_superuser,
            }
        )


class PasswordResetView(APIView):
    def post(self, request):
        username = request.data.get("username")
        new_password = request.data.get("new_password")

        if not username or not new_password:
            return Response(
                {"detail": "Informe usuário e nova senha."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response(
                {"detail": "Usuário não encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )

        user.set_password(new_password)
        user.save()

        return Response(
            {"detail": "Senha atualizada com sucesso."},
            status=status.HTTP_200_OK,
        )