from datetime import timedelta

from django.conf import settings
from django.contrib.auth.models import Group, User
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from academic.models import (
    AcademicCalendar,
    ClassEnrollment,
    ClassGroup,
    Course,
    Grade,
    StudentProfile,
    Subject,
    TeacherProfile,
    WeeklySchedule,
)
from management_app.models import ContactMessage, FinancialInvoice
from notifications_app.models import Notification


class Command(BaseCommand):
    help = "Cria dados de demonstração para apresentação do UPA"

    @transaction.atomic
    def handle(self, *args, **kwargs):
        if not settings.DEBUG and not settings.DEMO_MODE:
            raise CommandError("seed_demo exige DEBUG=True ou DEMO_MODE=True em banco isolado.")
        aluno_group, _ = Group.objects.get_or_create(name="Aluno")
        professor_group, _ = Group.objects.get_or_create(name="Professor")
        admin_group, _ = Group.objects.get_or_create(name="Administrador")

        admin = self.create_user("admin", "admin123", "Administrador", "UPA", "admin@example.test", True, True)
        admin.groups.add(admin_group)

        professor = self.create_user("leandro", "prof123", "Leandro", "Santana", "leandro@example.test")
        professor.groups.add(professor_group)

        teacher_profile, _ = TeacherProfile.objects.update_or_create(
            user=professor,
            defaults={
                "employee_code": "PROF001",
                "department": "Tecnologia",
                "title": "Professor",
                "phone": "(83) 99999-1111",
            },
        )

        students_data = [
            ("rodrigo", "Rodrigo", "Maciel", "2026001", "Sistemas para Internet", 4),
            ("ana", "Ana", "Beatriz", "2026002", "Sistemas para Internet", 4),
            ("lucas", "Lucas", "Silva", "2026003", "Sistemas para Internet", 3),
            ("marina", "Marina", "Costa", "2026004", "Sistemas para Internet", 2),
        ]

        students = []

        for username, first_name, last_name, registration, course, semester in students_data:
            course_record, _ = Course.objects.get_or_create(name=course)
            user = self.create_user(username, "aluno123", first_name, last_name, f"{username}@example.test")
            user.groups.add(aluno_group)

            profile, _ = StudentProfile.objects.update_or_create(
                user=user,
                defaults={
                    "registration": registration,
                    "course": course_record,
                    "semester": semester,
                    "cpf": "000.000.000-00",
                    "phone": "(83) 99999-0000",
                    "address": "Endereço fictício para demonstração",
                    "mother_name": "Nome da mãe",
                    "father_name": "Nome do pai",
                    "guardian_name": "Responsável financeiro",
                },
            )

            students.append(profile)

        subjects_data = [
            ("Desenvolvimento Front-End Avançado", "FEA001", 80, 4),
            ("Banco de Dados", "BD001", 80, 4),
            ("Engenharia de Software", "ES001", 60, 4),
            ("UX/UI Design", "UX001", 60, 4),
            ("Programação Web com Django", "DJ001", 80, 4),
            ("Projeto Integrador", "PI001", 100, 4),
        ]

        subjects = []

        for name, code, workload, period in subjects_data:
            subject, _ = Subject.objects.update_or_create(
                code=code,
                defaults={
                    "name": name,
                    "workload": workload,
                    "period": period,
                    "availability_status": "available",
                },
            )
            subjects.append(subject)

        groups = []
        for subject in [subjects[0], subjects[4], subjects[5]]:
            group, _ = ClassGroup.objects.update_or_create(
                name=f"Turma {subject.name}",
                subject=subject,
                semester="2026.1",
                year=2026,
                defaults={"teacher": teacher_profile},
            )
            groups.append(group)

        for group in groups:
            for student in students:
                ClassEnrollment.objects.get_or_create(class_group=group, student=student)

        grades_data = [
            ("rodrigo", "FEA001", 9.5, 2),
            ("rodrigo", "BD001", 6.0, 1),
            ("rodrigo", "ES001", 4.8, 4),
            ("rodrigo", "DJ001", 9.8, 0),
            ("ana", "FEA001", 8.9, 1),
            ("lucas", "FEA001", 7.2, 3),
            ("marina", "FEA001", 5.5, 5),
        ]

        for username, code, grade_value, absence in grades_data:
            Grade.objects.update_or_create(
                student=StudentProfile.objects.get(user__username=username),
                subject=Subject.objects.get(code=code),
                class_group=None,
                attempt=1,
                defaults={"grade": grade_value, "absence": absence},
            )

        events = [
            ("Feriado - Confraternização Universal", "Não haverá atividades acadêmicas.", "holiday", "2026-01-01", None, "2026-01-02"),
            ("Renovação de matrícula", "Período de renovação de matrícula para veteranos.", "enrollment", "2026-01-05", "2026-01-31", "2026-01-31"),
            ("Feriado - Tiradentes", "Não haverá atividades acadêmicas e administrativas.", "holiday", "2026-04-21", None, "2026-04-22"),
            ("Entrega do Projeto UPA", "Entrega final do projeto acadêmico.", "exam", "2026-05-28", None, "2026-05-28"),
            ("Provas finais", "Período de provas finais.", "final_exam", "2026-06-16", "2026-06-19", "2026-06-19"),
        ]

        for title, description, event_type, start_date, end_date, visible_until in events:
            AcademicCalendar.objects.update_or_create(
                title=title,
                defaults={
                    "description": description,
                    "event_type": event_type,
                    "start_date": start_date,
                    "end_date": end_date,
                    "visible_until": visible_until,
                },
            )

        schedule_data = [
            ("FEA001", "monday", "14:00", "15:40", "Laboratório 01"),
            ("DJ001", "wednesday", "14:00", "15:40", "Laboratório 02"),
            ("PI001", "friday", "19:00", "21:45", "Sala 203"),
        ]

        for code, weekday, start, end, location in schedule_data:
            subject = Subject.objects.get(code=code)
            class_group = ClassGroup.objects.filter(
                subject=subject, teacher=teacher_profile
            ).first()
            WeeklySchedule.objects.update_or_create(
                subject=subject,
                weekday=weekday,
                start_time=start,
                defaults={
                    "class_group": class_group,
                    "teacher": teacher_profile,
                    "end_time": end,
                    "location": location,
                },
            )

        for student in students:
            Notification.objects.get_or_create(
                user=student.user,
                title="Bem-vindo ao UPA",
                message="Seu mural acadêmico está pronto para uso.",
                notification_type="academic",
                expires_at="2026-06-30",
            )
            Notification.objects.get_or_create(
                user=student.user,
                title="Vaga de estágio disponível",
                message="Nova vaga de estágio para estudantes de tecnologia.",
                notification_type="internship",
                expires_at="2026-06-10",
            )
            Notification.objects.get_or_create(
                user=student.user,
                title="Comunicado de feriado",
                message="Não haverá atividades acadêmicas no feriado informado.",
                notification_type="notice",
                expires_at="2026-04-22",
            )

        FinancialInvoice.objects.update_or_create(
            user=students[0].user,
            description="Mensalidade Maio/2026",
            defaults={
                "amount": 599.90,
                "due_date": "2026-05-10",
                "status": "pending",
                "payment_method": "pix",
            },
        )

        FinancialInvoice.objects.update_or_create(
            user=students[0].user,
            description="Mensalidade Abril/2026",
            defaults={
                "amount": 599.90,
                "due_date": "2026-04-10",
                "status": "paid",
                "payment_method": "boleto",
            },
        )

        ContactMessage.objects.get_or_create(
            user=students[0].user,
            destination="Secretaria Acadêmica",
            contact_type="academic",
            return_channel="email",
            subject="Dúvida sobre apresentação",
            message="Gostaria de confirmar o horário da apresentação do projeto UPA.",
        )

        today = timezone.localdate()
        AcademicCalendar.objects.update_or_create(title="Semana acadêmica de demonstração", defaults={"description": "Evento fictício para validar o calendário.", "event_type": "event", "start_date": today + timedelta(days=7), "visible_until": today + timedelta(days=8)})
        for student in students:
            Notification.objects.update_or_create(user=student.user, title="Aviso de demonstração", defaults={"message": "Comunicado fictício ativo para validar leitura.", "notification_type": "academic", "expires_at": today + timedelta(days=30)})
        self.create_user("recuperacao", "Senha-demo-recuperacao-123!", "Conta", "Recuperação", "recuperacao@example.test")

        self.stdout.write(self.style.SUCCESS("Dados de demonstração criados com sucesso."))
        self.stdout.write("Aluno: rodrigo / aluno123")
        self.stdout.write("Professor: leandro / prof123")
        self.stdout.write("Admin: admin / admin123")

    def create_user(self, username, password, first_name, last_name, email, is_staff=False, is_superuser=False):
        user, created = User.objects.get_or_create(username=username)
        demo_group, _ = Group.objects.get_or_create(name="UPA Demo")
        if not created:
            if not user.groups.filter(pk=demo_group.pk).exists():
                raise CommandError(f"A conta {username} já existe e não pertence à demonstração. Nenhum dado foi alterado.")
            return user
        user.groups.add(demo_group)
        user.set_password(password)
        user.first_name = first_name
        user.last_name = last_name
        user.email = email
        user.is_staff = is_staff
        user.is_superuser = is_superuser
        user.save()
        return user