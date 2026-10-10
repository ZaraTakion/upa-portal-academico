from django.apps import AppConfig


class AcademicConfig(AppConfig):
    name = 'academic'

    def ready(self):
        from . import signals  # noqa: F401
