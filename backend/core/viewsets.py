from django.db import IntegrityError, transaction
from django.db.models.deletion import ProtectedError, RestrictedError
from rest_framework import status, viewsets
from rest_framework.exceptions import APIException, ValidationError
from rest_framework.fields import DateField, IntegerField


class Conflict(APIException):
    status_code = status.HTTP_409_CONFLICT
    default_detail = "Registro vinculado a dados acadêmicos. Preserve o histórico e atualize a situação."


class PortalModelViewSet(viewsets.ModelViewSet):
    """Preserve protected records and validate typed query parameters at the boundary."""

    integer_filters: tuple[str, ...] = ()
    date_filters: tuple[str, ...] = ()

    def initial(self, request, *args, **kwargs):
        super().initial(request, *args, **kwargs)
        for name in self.integer_filters:
            value = request.query_params.get(name)
            if value:
                try:
                    IntegerField(min_value=1).run_validation(value)
                except ValidationError as error:
                    raise ValidationError({name: error.detail}) from error
        for name in self.date_filters:
            value = request.query_params.get(name)
            if value:
                try:
                    DateField().run_validation(value)
                except ValidationError as error:
                    raise ValidationError({name: error.detail}) from error

    def create(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                return super().create(request, *args, **kwargs)
        except IntegrityError as error:
            raise Conflict("O registro conflita com dados existentes ou viola uma regra de integridade.") from error

    def update(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                return super().update(request, *args, **kwargs)
        except IntegrityError as error:
            raise Conflict("A alteração conflita com dados existentes ou viola uma regra de integridade.") from error

    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except (ProtectedError, RestrictedError) as error:
            raise Conflict() from error
