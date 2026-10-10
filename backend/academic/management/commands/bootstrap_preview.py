"""Create private, idempotent role accounts for an explicitly enabled hosted preview.

Never uses the known local-demo passwords, never prints credentials, and never
replaces a password or elevates an existing account.
"""
import os
from datetime import timedelta

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from academic.models import (
    AcademicCalendar,
    Assessment,
    AssessmentResult,
    AttendanceRecord,
    ClassEnrollment,
    ClassGroup,
    Course,
    StudentProfile,
    Subject,
    TeacherProfile,
    WeeklySchedule,
)
from management_app.models import ContactMessage, FinancialInvoice
from notifications_app.models import Notification

ACCOUNT_CONFIG = (
    ("campus-student", "Aluno", "CAMPUS_PREVIEW_STUDENT_PASSWORD", False),
    ("campus-teacher", "Professor", "CAMPUS_PREVIEW_TEACHER_PASSWORD", False),
    ("campus-admin", "Administrador", "CAMPUS_PREVIEW_ADMIN_PASSWORD", True),
)


class Command(BaseCommand):
    help = "Provisiona os três perfis da prévia apenas quando habilitado com senhas fortes."

    def handle(self, *args, **kwargs):
        flag = os.environ.get("CAMPUS_PREVIEW_BOOTSTRAP", "").strip().lower()
        if flag not in {"1", "true", "yes", "on"}:
            self.stdout.write("Provisionamento da prévia desativado.")
            return
        if settings.DEBUG:
            raise CommandError("Contas hospedadas exigem DEBUG=False.")
        if os.environ.get("CAMPUS_ENVIRONMENT", "").strip().lower() != "preview":
            raise CommandError("Defina CAMPUS_ENVIRONMENT=preview em um banco exclusivo de homologação.")

        User = get_user_model()
        new_passwords = {}
        for username, _, variable, _ in ACCOUNT_CONFIG:
            candidate = os.environ.get(variable, "")
            if len(candidate) < 16:
                raise CommandError(f"Defina {variable} com uma senha privada de pelo menos 16 caracteres.")
            try:
                validate_password(candidate, user=User(username=username))
            except ValidationError as exc:
                raise CommandError(f"{variable}: senha não atende aos validadores de segurança.") from exc
            new_passwords[username] = candidate

        with transaction.atomic():
            users = {}
            for username, group_name, _, is_admin in ACCOUNT_CONFIG:
                group, _ = Group.objects.get_or_create(name=group_name)
                existing = User.objects.filter(username=username).first()
                if existing is not None:
                    # Never silently take over or grant privileges to an existing account.
                    valid_role = (
                        existing.is_active
                        and existing.is_staff == is_admin
                        and existing.is_superuser == is_admin
                        and set(existing.groups.values_list("name", flat=True)) == {group_name}
                    )
                    if not valid_role:
                        raise CommandError(f"Conta existente incompatível: {username}. Nenhuma permissão foi alterada.")
                    user = existing
                else:
                    user = User.objects.create_user(
                        username=username,
                        password=new_passwords[username],
                        is_staff=is_admin,
                        is_superuser=is_admin,
                        first_name=group_name,
                        last_name="Homologação",
                    )
                    user.groups.add(group)
                users[group_name] = user

            course, _ = Course.objects.get_or_create(
                name="Takion Campus — Curso de Testes",
                defaults={"duration_semesters": 4},
            )
            student, _ = StudentProfile.objects.get_or_create(
                user=users["Aluno"],
                defaults={"registration": "TC-PREVIEW-001", "course": course, "semester": 1},
            )
            if student.course_id != course.pk or student.registration != "TC-PREVIEW-001":
                raise CommandError("Perfil de homologação existente incompatível. Nenhum dado foi alterado.")
            teacher, _ = TeacherProfile.objects.get_or_create(
                user=users["Professor"],
                defaults={"employee_code": "TC-PREVIEW-P", "department": "Homologação"},
            )
            subject, _ = Subject.objects.get_or_create(
                code="TC-PREVIEW-01",
                defaults={"name": "Introdução ao Takion Campus", "workload": 40, "period": 1},
            )
            class_group, _ = ClassGroup.objects.get_or_create(
                name="Turma de Homologação",
                subject=subject,
                semester="2026.2",
                year=2026,
                defaults={"teacher": teacher},
            )
            # Existing records are checked, not reassigned.
            if class_group.teacher_id != teacher.pk:
                raise CommandError("Turma de homologação pertence a outro docente.")
            ClassEnrollment.objects.get_or_create(class_group=class_group, student=student)

            # Only add synthetic preview records; never reset edited results on restart.
            today = timezone.localdate()
            assessment, _ = Assessment.objects.get_or_create(
                class_group=class_group,
                title="Projeto sintético de homologação",
                defaults={"category": "project", "due_date": today + timedelta(days=7)},
            )
            AssessmentResult.objects.get_or_create(
                assessment=assessment, student=student,
                defaults={"score": "8.50", "feedback": "Resultado fictício para validar o portal."},
            )
            AttendanceRecord.objects.get_or_create(
                class_group=class_group, student=student, held_at=assessment.created_at.date(),
                defaults={"present": True, "recorded_by": users["Professor"]},
            )
            WeeklySchedule.objects.get_or_create(
                class_group=class_group, subject=subject, teacher=teacher,
                weekday="monday", start_time="09:00", end_time="10:00",
                defaults={"location": "Sala de homologação"},
            )
            AcademicCalendar.objects.get_or_create(
                title="Encontro sintético de homologação",
                defaults={"start_date": today + timedelta(days=7), "description": "Evento fictício, sem participantes reais."},
            )
            ContactMessage.objects.get_or_create(
                user=users["Aluno"], subject="Chamado sintético de homologação",
                defaults={"message": "Validar atendimento no portal.", "return_channel": "portal"},
            )
            FinancialInvoice.objects.get_or_create(
                user=users["Aluno"], description="Registro fictício — sem cobrança",
                defaults={"amount": "100.00", "due_date": today + timedelta(days=30)},
            )
            for user in users.values():
                Notification.objects.get_or_create(
                    user=user, title="Ambiente privado de homologação",
                    defaults={"message": "Todos os registros demonstrativos são sintéticos."},
                )

        self.stdout.write(self.style.SUCCESS("Três contas de homologação preparadas sem expor senhas."))
