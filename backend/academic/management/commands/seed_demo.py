from django.contrib.auth.models import Group, User
from django.core.management.base import BaseCommand

from academic.models import (
    AcademicCalendar,
    ClassEnrollment,
    ClassGroup,
    Grade,
    StudentProfile,
    Subject,
    TeacherProfile,
)
from management_app.models import ContactMessage
from notifications_app.models import Notification


class Command(BaseCommand):
    help = "Cria dados de demonstração para apresentação do UPA"

    def handle(self, *args, **kwargs):
        aluno_group, _ = Group.objects.get_or_create(name="Aluno")
        professor_group, _ = Group.objects.get_or_create(name="Professor")
        admin_group, _ = Group.objects.get_or_create(name="Administrador")

        admin, _ = User.objects.get_or_create(username="admin")
        admin.set_password("admin123")
        admin.first_name = "Administrador"
        admin.last_name = "UPA"
        admin.email = "admin@upa.edu.br"
        admin.is_staff = True
        admin.is_superuser = True
        admin.save()
        admin.groups.add(admin_group)

        professor, _ = User.objects.get_or_create(username="leandro")
        professor.set_password("prof123")
        professor.first_name = "Leandro"
        professor.last_name = "Santana"
        professor.email = "leandro@upa.edu.br"
        professor.is_staff = False
        professor.is_superuser = False
        professor.save()
        professor.groups.add(professor_group)

        teacher_profile = self.upsert_teacher_profile(
            user=professor,
            employee_code="PROF001",
            department="Tecnologia",
            title="Professor",
        )

        alunos_data = [
            ("rodrigo", "Rodrigo", "Maciel", "2026001", "Sistemas para Internet", 4),
            ("ana", "Ana", "Beatriz", "2026002", "Sistemas para Internet", 4),
            ("lucas", "Lucas", "Silva", "2026003", "Sistemas para Internet", 3),
            ("marina", "Marina", "Costa", "2026004", "Sistemas para Internet", 2),
            ("joao", "João", "Pedro", "2026005", "Sistemas para Internet", 1),
            ("carla", "Carla", "Mendes", "2026006", "Sistemas para Internet", 5),
        ]

        students = []

        for username, first_name, last_name, registration, course, semester in alunos_data:
            user, _ = User.objects.get_or_create(username=username)
            user.set_password("aluno123")
            user.first_name = first_name
            user.last_name = last_name
            user.email = f"{username}@aluno.upa.edu.br"
            user.is_staff = False
            user.is_superuser = False
            user.save()
            user.groups.add(aluno_group)

            profile = self.upsert_student_profile(
                user=user,
                registration=registration,
                course=course,
                semester=semester,
            )

            students.append(profile)

        subjects_data = [
            ("Desenvolvimento Front-End Avançado", "FEA001", 80, "Prof. Leandro Santana"),
            ("Banco de Dados", "BD001", 80, "Prof. Camila Rocha"),
            ("Engenharia de Software", "ES001", 60, "Prof. Marcos Lima"),
            ("UX/UI Design", "UX001", 60, "Prof. Juliana Alves"),
            ("Programação Web com Django", "DJ001", 80, "Prof. Leandro Santana"),
            ("Projeto Integrador", "PI001", 100, "Prof. Coordenação Acadêmica"),
            ("Arquitetura de Software", "ARQ001", 60, "Prof. Renato Alves"),
            ("Metodologias Ágeis", "AGI001", 40, "Prof. Patrícia Lima"),
        ]

        subjects = []

        for name, code, workload, professor_name in subjects_data:
            subject, _ = Subject.objects.update_or_create(
                code=code,
                defaults={
                    "name": name,
                    "workload": workload,
                    "professor": professor_name,
                },
            )
            subjects.append(subject)

        class_groups_data = [
            ("Turma Front-End Avançado", subjects[0], "2026.1", 2026),
            ("Turma Django Web", subjects[4], "2026.1", 2026),
            ("Turma Projeto Integrador", subjects[5], "2026.1", 2026),
        ]

        class_groups = []

        for name, subject, semester, year in class_groups_data:
            class_group, _ = ClassGroup.objects.update_or_create(
                name=name,
                subject=subject,
                semester=semester,
                year=year,
                defaults={
                    "teacher": teacher_profile,
                },
            )

            class_groups.append(class_group)

        for class_group in class_groups:
            for student in students:
                ClassEnrollment.objects.get_or_create(
                    class_group=class_group,
                    student=student,
                )

        grade_rows = [
            ("rodrigo", "FEA001", 9.5, 2),
            ("rodrigo", "BD001", 8.7, 1),
            ("rodrigo", "ES001", 9.0, 0),
            ("rodrigo", "UX001", 8.5, 3),
            ("rodrigo", "DJ001", 9.8, 0),
            ("rodrigo", "PI001", 9.2, 1),

            ("ana", "FEA001", 8.9, 1),
            ("ana", "BD001", 9.1, 0),
            ("ana", "UX001", 9.4, 0),
            ("ana", "PI001", 8.8, 2),

            ("lucas", "FEA001", 7.8, 4),
            ("lucas", "ES001", 8.0, 2),
            ("lucas", "DJ001", 7.5, 5),

            ("marina", "UX001", 8.2, 2),
            ("marina", "BD001", 7.9, 3),

            ("joao", "FEA001", 8.0, 1),
            ("joao", "AGI001", 8.4, 0),

            ("carla", "PI001", 9.7, 0),
            ("carla", "ARQ001", 9.3, 1),
        ]

        for username, subject_code, grade_value, absence in grade_rows:
            student = StudentProfile.objects.get(user__username=username)
            subject = Subject.objects.get(code=subject_code)

            Grade.objects.update_or_create(
                student=student,
                subject=subject,
                defaults={
                    "grade": grade_value,
                    "absence": absence,
                },
            )

        events_data = [
            ("Entrega do Projeto UPA", "Entrega final do sistema acadêmico.", "2026-05-28"),
            ("Apresentação Front-End Avançado", "Demonstração do portal para avaliação.", "2026-06-02"),
            ("Avaliação de Banco de Dados", "Prova prática com modelagem relacional.", "2026-06-05"),
            ("Semana Acadêmica", "Palestras e atividades institucionais.", "2026-06-10"),
            ("Prazo final para envio de arquivos", "Último dia para submissão de documentos acadêmicos.", "2026-06-15"),
            ("Revisão de Projeto Integrador", "Encontro para ajustes finais do projeto.", "2026-06-18"),
        ]

        for title, description, event_date in events_data:
            AcademicCalendar.objects.update_or_create(
                title=title,
                defaults={
                    "description": description,
                    "event_date": event_date,
                },
            )

        student_notifications = [
            ("Bem-vindo ao UPA", "Seu mural acadêmico está pronto para uso."),
            ("Nova nota publicada", "Sua nota de Front-End Avançado foi atualizada."),
            ("Evento próximo", "A apresentação do projeto acontecerá em breve."),
            ("Atualização cadastral", "Confira se seus dados acadêmicos estão corretos."),
            ("Arquivo disponível", "Novo material de apoio foi publicado."),
        ]

        for student in students:
            for title, message in student_notifications:
                Notification.objects.get_or_create(
                    user=student.user,
                    title=title,
                    message=message,
                )

        teacher_notifications = [
            ("Turmas atualizadas", "Suas turmas de 2026.1 foram carregadas."),
            ("Lançamento de notas", "Você pode acompanhar as notas dos alunos vinculados."),
            ("Apresentação próxima", "A avaliação de Front-End Avançado está se aproximando."),
        ]

        for title, message in teacher_notifications:
            Notification.objects.get_or_create(
                user=professor,
                title=title,
                message=message,
            )

        ContactMessage.objects.get_or_create(
            user=students[0].user,
            subject="Dúvida sobre apresentação",
            message="Gostaria de confirmar o horário da apresentação do projeto UPA.",
        )

        ContactMessage.objects.get_or_create(
            user=students[1].user,
            subject="Solicitação de material",
            message="Poderiam disponibilizar o material complementar da aula?",
        )

        self.stdout.write(self.style.SUCCESS("Dados de demonstração criados com sucesso."))

        self.stdout.write(self.style.SUCCESS("Usuários criados:"))
        self.stdout.write("Aluno: rodrigo / aluno123")
        self.stdout.write("Professor: leandro / prof123")
        self.stdout.write("Admin: admin / admin123")

    def upsert_student_profile(self, user, registration, course, semester):
        profile = StudentProfile.objects.filter(user=user).first()

        if profile:
            profile.registration = registration
            profile.course = course
            profile.semester = semester
            profile.save()
            return profile

        existing_registration = StudentProfile.objects.filter(registration=registration).first()

        if existing_registration:
            existing_registration.user = user
            existing_registration.course = course
            existing_registration.semester = semester
            existing_registration.save()
            return existing_registration

        return StudentProfile.objects.create(
            user=user,
            registration=registration,
            course=course,
            semester=semester,
        )

    def upsert_teacher_profile(self, user, employee_code, department, title):
        profile = TeacherProfile.objects.filter(user=user).first()

        if profile:
            profile.employee_code = employee_code
            profile.department = department
            profile.title = title
            profile.save()
            return profile

        existing_code = TeacherProfile.objects.filter(employee_code=employee_code).first()

        if existing_code:
            existing_code.user = user
            existing_code.department = department
            existing_code.title = title
            existing_code.save()
            return existing_code

        return TeacherProfile.objects.create(
            user=user,
            employee_code=employee_code,
            department=department,
            title=title,
        )