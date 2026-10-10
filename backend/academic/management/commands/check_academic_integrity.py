"""Report aggregate inconsistencies before applying release constraints."""
from django.core.management.base import BaseCommand, CommandError
from django.db import connection
from django.db.models import Count, F, Q

from academic.models import (
    AcademicCalendar,
    AcademicTerm,
    Assessment,
    AssessmentResult,
    Grade,
    WeeklySchedule,
)


class Command(BaseCommand):
    help = "Verifica integridade sem alterar dados, inclusive antes da migração 0007."

    def handle(self, *args, **options):
        required = {model._meta.db_table for model in (
            AcademicCalendar, AcademicTerm, Assessment, AssessmentResult, Grade, WeeklySchedule,
        )}
        existing = set(connection.introspection.table_names())
        if not required.intersection(existing):
            self.stdout.write("Banco novo; aplique as migrações antes da validação de registros.")
            return
        if not required.issubset(existing):
            raise CommandError("Schema acadêmico parcial. Revise o plano de migrações antes de iniciar o serviço.")
        checks = {
            "notas fora de 0–10": Grade.objects.filter(Q(grade__lt=0) | Q(grade__gt=10)),
            "tentativas fora de 1–2": Grade.objects.filter(Q(attempt__lt=1) | Q(attempt__gt=2)),
            "notas históricas duplicadas": Grade.objects.filter(class_group__isnull=True).values("student_id", "subject_id", "attempt").annotate(total=Count("pk")).filter(total__gt=1),
            "avaliações com peso/máximo inválido": Assessment.objects.filter(Q(weight__lte=0) | Q(maximum_score__lte=0)),
            "resultados fora da escala": AssessmentResult.objects.filter(Q(score__lt=0) | Q(score__gt=F("assessment__maximum_score"))),
            "períodos invertidos": AcademicTerm.objects.filter(ends_on__lt=F("starts_on")),
            "eventos invertidos": AcademicCalendar.objects.filter(end_date__lt=F("start_date")),
            "horários invertidos": WeeklySchedule.objects.filter(end_time__lte=F("start_time")),
        }
        failures = {label: query.count() for label, query in checks.items() if query.exists()}
        if failures:
            raise CommandError("Integridade pendente: " + "; ".join(f"{label}: {count}" for label, count in failures.items()) + ". Nenhum dado foi alterado.")
        self.stdout.write(self.style.SUCCESS("Integridade acadêmica verificada; nenhum dado foi alterado."))
