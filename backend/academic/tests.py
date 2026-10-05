from django.contrib.auth.models import Group, User
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from .models import ClassEnrollment, ClassGroup, Grade, StudentProfile, Subject, TeacherProfile


class GradePermissionTests(TestCase):
    def setUp(self):
        self.professor_group, _ = Group.objects.get_or_create(name="Professor")
        self.student_user = User.objects.create_user(
            username="student", password="student-password"
        )
        self.teacher_user = User.objects.create_user(
            username="teacher", password="teacher-password"
        )
        self.teacher_user.groups.add(self.professor_group)
        self.student = StudentProfile.objects.create(
            user=self.student_user,
            registration="S-001",
            course="Sistemas para Internet",
            semester=4,
        )
        self.teacher = TeacherProfile.objects.create(
            user=self.teacher_user,
            employee_code="T-001",
            department="Tecnologia",
        )
        self.subject = Subject.objects.create(
            name="Banco de Dados",
            code="BD-001",
            workload=80,
            professor="Professor",
            period=4,
        )
        self.class_group = ClassGroup.objects.create(
            name="Turma A",
            subject=self.subject,
            teacher=self.teacher,
            semester="2026.2",
            year=2026,
        )
        ClassEnrollment.objects.create(
            class_group=self.class_group,
            student=self.student,
        )
        self.grade = Grade.objects.create(
            student=self.student,
            subject=self.subject,
            grade=6,
            absence=1,
        )
        self.url = reverse("grades-detail", args=[self.grade.pk])
        self.client = APIClient()

    def test_student_cannot_change_their_grade(self):
        self.client.force_authenticate(self.student_user)
        response = self.client.patch(
            self.url,
            {"grade": "10.00", "absence": 0},
            format="json",
        )
        self.assertEqual(response.status_code, 403)
        self.grade.refresh_from_db()
        self.assertEqual(str(self.grade.grade), "6.00")
        self.assertEqual(self.grade.absence, 1)

    def test_teacher_can_update_grade_for_their_enrolled_student(self):
        self.client.force_authenticate(self.teacher_user)
        response = self.client.patch(
            self.url,
            {"grade": "8.50", "absence": 2},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.grade.refresh_from_db()
        self.assertEqual(str(self.grade.grade), "8.50")
        self.assertEqual(self.grade.absence, 2)
