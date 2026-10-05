import logging

from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_protect
from django.utils.decorators import method_decorator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .throttles import LoginRateThrottle


logger = logging.getLogger(__name__)


def set_refresh_cookie(response, token):
    if not token:
        return
    response.set_cookie(
        settings.JWT_REFRESH_COOKIE,
        token,
        max_age=int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()),
        httponly=True,
        secure=settings.JWT_REFRESH_COOKIE_SECURE,
        samesite=settings.CSRF_COOKIE_SAMESITE,
        path="/api/token/",
    )


class LoginTokenObtainPairView(TokenObtainPairView):
    throttle_classes = [LoginRateThrottle]

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code < 300:
            refresh = response.data.pop("refresh", None)
            set_refresh_cookie(response, refresh)
            get_token(request)
        return response


class CookieTokenRefreshView(TokenRefreshView):
    serializer_class = TokenRefreshSerializer

    @method_decorator(csrf_protect)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        refresh = request.COOKIES.get(settings.JWT_REFRESH_COOKIE)
        if not refresh:
            return Response({"detail": "Refresh token ausente."}, status=401)
        serializer = self.get_serializer(data={"refresh": refresh})
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError:
            return Response({"detail": "Refresh token inválido ou revogado."}, status=401)
        data = dict(serializer.validated_data)
        response = Response(data)
        if data.get("refresh"):
            set_refresh_cookie(response, data["refresh"])
            response.data.pop("refresh", None)
        return response


class LogoutView(APIView):
    permission_classes = [AllowAny]

    @method_decorator(csrf_protect)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def post(self, request):
        refresh = request.COOKIES.get(settings.JWT_REFRESH_COOKIE)
        if refresh:
            try:
                RefreshToken(refresh).blacklist()
            except TokenError:
                pass
        response = Response(status=status.HTTP_205_RESET_CONTENT)
        response.delete_cookie(
            settings.JWT_REFRESH_COOKIE,
            path="/api/token/",
            samesite=settings.CSRF_COOKIE_SAMESITE,
        )
        return response


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


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AnonRateThrottle]

    def post(self, request):
        email = request.data.get("email")
        email = email.strip() if isinstance(email, str) else ""
        matching_users = User.objects.filter(
            email__iexact=email, is_active=True
        ).exclude(email="")

        # Duplicate email addresses are ambiguous; never send a reset link to
        # an arbitrary account when ownership cannot be determined.
        if email and matching_users.count() == 1:
            user = matching_users.first()
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            reset_url = (
                f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}"
            )
            try:
                send_mail(
                    subject="Redefinição de senha do Portal Acadêmico",
                    message=(
                        "Recebemos uma solicitação para redefinir sua senha. "
                        "Use este link temporário para escolher uma nova senha:\n\n"
                        f"{reset_url}\n\n"
                        "Se você não solicitou a redefinição, ignore esta mensagem."
                    ),
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    fail_silently=False,
                )
            except Exception:
                # Keep the public response generic while making mail failures
                # visible to operators in application logs.
                logger.exception("Password reset email delivery failed")

        return Response(
            {
                "detail": (
                    "Se houver uma conta ativa associada a esse e-mail, "
                    "você receberá instruções para redefinir a senha."
                )
            },
            status=status.HTTP_200_OK,
        )


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AnonRateThrottle]

    def post(self, request, uidb64, token):
        new_password = request.data.get("new_password", "")
        try:
            user_id = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=user_id, is_active=True)
        except (
            TypeError,
            ValueError,
            OverflowError,
            UnicodeDecodeError,
            User.DoesNotExist,
        ):
            return Response(
                {"detail": "Link inválido ou expirado."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not default_token_generator.check_token(user, token):
            return Response(
                {"detail": "Link inválido ou expirado."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            validate_password(new_password, user=user)
        except ValidationError as error:
            return Response(
                {"detail": list(error.messages)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(new_password)
        user.save(update_fields=["password"])
        return Response(
            {"detail": "Senha atualizada com sucesso."},
            status=status.HTTP_200_OK,
        )
