from datetime import timedelta

from django.contrib.auth.models import Group, User
from django.test import TestCase
from django.utils import timezone
from django.urls import reverse
from rest_framework.test import APIClient

from .models import (
    AcademicCalendar,
    Assessment,
    AssessmentResult,
    AttendanceRecord,
    ClassEnrollment,
    ClassGroup,
    Course,
    Grade,
    StudentProfile,
    Subject,
    TeacherProfile,
)


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
        self.course, _ = Course.objects.get_or_create(name="Sistemas para Internet")
        self.student = StudentProfile.objects.create(
            user=self.student_user,
            registration="S-001",
            course=self.course,
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

    def test_teacher_cannot_access_a_non_enrolled_student_grade(self):
        other_user = User.objects.create_user(
            username="other-student", password="student-password"
        )
        other_student = StudentProfile.objects.create(
            user=other_user,
            registration="S-002",
            course=self.course,
            semester=4,
        )
        other_grade = Grade.objects.create(
            student=other_student,
            subject=self.subject,
            grade=7,
            absence=0,
        )
        self.client.force_authenticate(self.teacher_user)
        response = self.client.get(
            reverse("grades-detail", args=[other_grade.pk])
        )
        self.assertEqual(response.status_code, 404)

    def test_student_can_update_only_approved_profile_fields(self):
        self.client.force_authenticate(self.student_user)
        allowed = self.client.patch(
            reverse("students-detail", args=[self.student.pk]),
            {"phone": "555-0100"},
            format="json",
        )
        self.assertEqual(allowed.status_code, 200)
        self.student.refresh_from_db()
        self.assertEqual(self.student.phone, "555-0100")

        forbidden = self.client.patch(
            reverse("students-detail", args=[self.student.pk]),
            {"cpf": "111.222.333-44"},
            format="json",
        )
        self.assertEqual(forbidden.status_code, 403)

    def test_teacher_sees_only_enrolled_students_without_sensitive_fields(self):
        other_user = User.objects.create_user(
            username="other-student", password="student-password"
        )
        StudentProfile.objects.create(
            user=other_user,
            registration="S-002",
            course=self.course,
            semester=4,
        )
        self.client.force_authenticate(self.teacher_user)
        response = self.client.get(reverse("students-list"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertNotIn("cpf", response.data[0])
        self.assertNotIn("address", response.data[0])

    def test_teacher_can_list_grades(self):
        self.client.force_authenticate(self.teacher_user)
        response = self.client.get(reverse("grades-list"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], self.grade.pk)


class AcademicCalendarFilteringTests(TestCase):
    def test_active_only_keeps_events_without_expiry(self):
        user = User.objects.create_user(username="student")
        today = timezone.localdate()
        AcademicCalendar.objects.create(
            title="Sem expiração",
            description="Válido sem data final.",
            event_type="notice",
            start_date=today,
            visible_until=None,
        )
        AcademicCalendar.objects.create(
            title="Vigente",
            description="Ainda está vigente.",
            event_type="notice",
            start_date=today,
            visible_until=today + timedelta(days=1),
        )
        AcademicCalendar.objects.create(
            title="Expirado",
            description="Não deve aparecer.",
            event_type="notice",
            start_date=today - timedelta(days=3),
            visible_until=today - timedelta(days=1),
        )
        client = APIClient()
        client.force_authenticate(user)

        response = client.get(reverse("calendar-list"), {"active_only": "true"})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            {item["title"] for item in response.data},
            {"Sem expiração", "Vigente"},
        )


class AssessmentWorkflowTests(TestCase):
    def setUp(self):
        professor_group, _ = Group.objects.get_or_create(name="Professor")
        self.teacher_user = User.objects.create_user(username="teacher")
        self.teacher_user.groups.add(professor_group)
        self.other_teacher_user = User.objects.create_user(username="other-teacher")
        self.other_teacher_user.groups.add(professor_group)
        self.student_user = User.objects.create_user(username="student")
        self.other_student_user = User.objects.create_user(username="other-student")
        self.teacher = TeacherProfile.objects.create(
            user=self.teacher_user,
            employee_code="T-401",
            department="Tecnologia",
        )
        self.other_teacher = TeacherProfile.objects.create(
            user=self.other_teacher_user,
            employee_code="T-402",
            department="Tecnologia",
        )
        self.course = Course.objects.create(name="Sistemas para Internet")
        self.student = StudentProfile.objects.create(
            user=self.student_user,
            registration="S-401",
            course=self.course,
            semester=4,
        )
        self.other_student = StudentProfile.objects.create(
            user=self.other_student_user,
            registration="S-402",
            course=self.course,
            semester=4,
        )
        self.subject = Subject.objects.create(
            name="Avaliação de Software",
            code="AS-401",
            workload=60,
            professor="Professor",
        )
        self.group = ClassGroup.objects.create(
            name="Turma A",
            subject=self.subject,
            teacher=self.teacher,
            semester="2026.2",
            year=2026,
        )
        self.other_group = ClassGroup.objects.create(
            name="Turma B",
            subject=self.subject,
            teacher=self.other_teacher,
            semester="2026.1",
            year=2026,
        )
        ClassEnrollment.objects.create(class_group=self.group, student=self.student)
        self.assessment = Assessment.objects.create(
            class_group=self.group,
            title="Prova N1",
            category="n1",
            weight=1,
            maximum_score=10,
        )
        self.client = APIClient()

    def test_student_only_sees_assessments_for_enrolled_classes(self):
        Assessment.objects.create(
            class_group=self.other_group,
            title="Avaliação de outra turma",
        )
        self.client.force_authenticate(self.student_user)

        response = self.client.get(reverse("assessments-list"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual([row["id"] for row in response.data], [self.assessment.pk])

    def test_teacher_can_create_result_only_for_enrolled_student(self):
        self.client.force_authenticate(self.teacher_user)
        wrong_student = self.client.post(
            reverse("assessment-results-list"),
            {
                "assessment": self.assessment.pk,
                "student": self.other_student.pk,
                "score": "8.00",
            },
            format="json",
        )
        self.assertEqual(wrong_student.status_code, 400)
        self.assertEqual(AssessmentResult.objects.count(), 0)

        valid_result = self.client.post(
            reverse("assessment-results-list"),
            {
                "assessment": self.assessment.pk,
                "student": self.student.pk,
                "score": "8.00",
                "feedback": "Bom trabalho.",
            },
            format="json",
        )
        self.assertEqual(valid_result.status_code, 201)
        self.assertEqual(AssessmentResult.objects.count(), 1)

    def test_assessment_result_cannot_exceed_maximum_score(self):
        self.client.force_authenticate(self.teacher_user)
        response = self.client.post(
            reverse("assessment-results-list"),
            {
                "assessment": self.assessment.pk,
                "student": self.student.pk,
                "score": "11.00",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(AssessmentResult.objects.count(), 0)

    def test_teacher_can_record_attendance_for_enrolled_student(self):
        self.client.force_authenticate(self.teacher_user)
        response = self.client.post(
            reverse("attendance-list"),
            {
                "class_group": self.group.pk,
                "student": self.student.pk,
                "held_at": timezone.now().isoformat(),
                "present": False,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(AttendanceRecord.objects.count(), 1)
        self.assertEqual(response.data["recorded_by"], self.teacher_user.pk)

class OptionalPaginationAndGradePolicyTests(TestCase):
    def setUp(self):
        self.admin = User.objects.create_user(username="admin", is_staff=True)
        self.client = APIClient()
        self.client.force_authenticate(self.admin)

    def test_list_responses_remain_arrays_without_page_parameter(self):
        Course.objects.create(name="Curso A")
        response = self.client.get(reverse("courses-list"))
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, list)

    def test_page_parameter_returns_page_metadata(self):
        Course.objects.create(name="Curso A")
        Course.objects.create(name="Curso B")
        response = self.client.get(reverse("courses-list"), {"page": 1, "page_size": 1})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 2)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertIsNone(response.data["previous"])

    def test_staff_can_create_only_one_grade_policy(self):
        payload = {"passing_score": "7.00", "attention_score": "5.00", "maximum_absences": 20}
        response = self.client.post(reverse("grade-policy-list"), payload, format="json")
        self.assertEqual(response.status_code, 201)
        duplicate = self.client.post(reverse("grade-policy-list"), payload, format="json")
        self.assertEqual(duplicate.status_code, 400)

    def test_grade_policy_rejects_invalid_thresholds(self):
        response = self.client.post(
            reverse("grade-policy-list"),
            {"passing_score": "5.00", "attention_score": "6.00"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
