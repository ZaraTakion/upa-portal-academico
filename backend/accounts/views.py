from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView


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