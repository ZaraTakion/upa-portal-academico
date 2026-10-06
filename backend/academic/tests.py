from datetime import timedelta
from decimal import Decimal
from importlib import import_module
from types import SimpleNamespace

from django.apps import apps
from django.contrib.auth.models import Group, User
from django.db import connection
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
    GradePolicy,
    StudentProfile,
    Subject,
    TeacherProfile,
)


class SubjectCatalogMigrationTests(TestCase):
    def test_legacy_status_is_preserved_while_catalog_status_is_normalized(self):
        subject = Subject.objects.create(
            name="História da disciplina",
            code="HIST-001",
            workload=40,
            period=1,
            legacy_professor="Docente antigo",
            legacy_status="failed",
        )
        locked_subject = Subject.objects.create(
            name="Disciplina bloqueada",
            code="HIST-002",
            workload=40,
            period=1,
            legacy_status="locked",
        )
        migration = import_module(
            "academic.migrations.0006_normalize_subject_catalog"
        )

        migration.normalize_catalog_statuses(
            apps,
            SimpleNamespace(connection=connection),
        )

        subject.refresh_from_db()
        locked_subject.refresh_from_db()
        self.assertEqual(subject.availability_status, "available")
        self.assertEqual(subject.legacy_status, "failed")
        self.assertEqual(subject.legacy_professor, "Docente antigo")
        self.assertEqual(locked_subject.availability_status, "locked")

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

    def test_student_can_filter_grades_by_class_and_sees_attempt_details(self):
        class_grade = Grade.objects.create(
            student=self.student,
            subject=self.subject,
            class_group=self.class_group,
            attempt=2,
            grade=8,
        )
        self.client.force_authenticate(self.student_user)

        response = self.client.get(
            reverse("grades-list"), {"class_group": self.class_group.pk}
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual([row["id"] for row in response.data], [class_grade.pk])
        self.assertEqual(response.data[0]["attempt"], 2)
        self.assertEqual(response.data[0]["class_group_name"], "Turma A")

    def test_subject_api_uses_current_offering_teacher_and_catalog_status(self):
        self.client.force_authenticate(self.student_user)

        response = self.client.get(reverse("subjects-list"))

        self.assertEqual(response.status_code, 200)
        subject = next(row for row in response.data if row["id"] == self.subject.pk)
        self.assertEqual(subject["professor"], self.teacher_user.username)
        self.assertEqual(subject["status"], "available")
        self.assertEqual(subject["status_display"], "Disponível")

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

    def test_assessment_results_update_weighted_final_grade(self):
        first = Assessment.objects.create(
            class_group=self.group,
            title="N1",
            category="n1",
            weight=2,
            maximum_score=20,
        )
        second = Assessment.objects.create(
            class_group=self.group,
            title="N2",
            category="n2",
            weight=1,
            maximum_score=10,
        )
        self.client.force_authenticate(self.teacher_user)

        first_result = self.client.post(
            reverse("assessment-results-list"),
            {"assessment": first.pk, "student": self.student.pk, "score": "16.00"},
            format="json",
        )
        self.assertEqual(first_result.status_code, 201)
        grade = Grade.objects.get(
            student=self.student, class_group=self.group, attempt=1
        )
        self.assertEqual(grade.grade, Decimal("8.00"))

        manual_edit = self.client.patch(
            reverse("grades-detail", args=[grade.pk]),
            {"grade": "10.00"},
            format="json",
        )
        self.assertEqual(manual_edit.status_code, 400)
        grade.refresh_from_db()
        self.assertEqual(grade.grade, Decimal("8.00"))

        second_result = self.client.post(
            reverse("assessment-results-list"),
            {"assessment": second.pk, "student": self.student.pk, "score": "9.00"},
            format="json",
        )
        self.assertEqual(second_result.status_code, 201)
        grade.refresh_from_db()
        self.assertEqual(grade.grade, Decimal("8.33"))

        changed = self.client.patch(
            reverse("assessment-results-detail", args=[second_result.data["id"]]),
            {"score": "5.00"},
            format="json",
        )
        self.assertEqual(changed.status_code, 200)
        grade.refresh_from_db()
        self.assertEqual(grade.grade, Decimal("7.00"))

        ungraded = self.client.patch(
            reverse("assessment-results-detail", args=[second_result.data["id"]]),
            {"score": None},
            format="json",
        )
        self.assertEqual(ungraded.status_code, 200)
        grade.refresh_from_db()
        self.assertEqual(grade.grade, Decimal("8.00"))

        recovery = Assessment.objects.create(
            class_group=self.group,
            title="Recuperação",
            category="recovery",
            maximum_score=10,
        )
        recovery_result = self.client.post(
            reverse("assessment-results-list"),
            {"assessment": recovery.pk, "student": self.student.pk, "score": "6.00"},
            format="json",
        )
        self.assertEqual(recovery_result.status_code, 201)
        recovery_grade = Grade.objects.get(
            student=self.student, class_group=self.group, attempt=2
        )
        self.assertEqual(recovery_grade.grade, Decimal("6.00"))

    def test_deleting_assessment_result_recalculates_final_grade(self):
        assessment = Assessment.objects.create(
            class_group=self.group,
            title="Prova",
            category="n1",
            maximum_score=10,
        )
        self.client.force_authenticate(self.teacher_user)
        created = self.client.post(
            reverse("assessment-results-list"),
            {"assessment": assessment.pk, "student": self.student.pk, "score": "8.00"},
            format="json",
        )
        self.assertEqual(created.status_code, 201)
        grade = Grade.objects.get(
            student=self.student, class_group=self.group, attempt=1
        )
        self.assertEqual(grade.grade, Decimal("8.00"))

        deleted = self.client.delete(
            reverse("assessment-results-detail", args=[created.data["id"]])
        )
        self.assertEqual(deleted.status_code, 204)
        grade.refresh_from_db()
        self.assertIsNone(grade.grade)
        self.assertEqual(grade.status, "pending")

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

    def test_attendance_updates_linked_grade_absences_and_status(self):
        GradePolicy.objects.create(
            passing_score="7.00",
            attention_score="5.00",
            maximum_absences=1,
        )
        grade = Grade.objects.create(
            student=self.student,
            subject=self.subject,
            class_group=self.group,
            grade=Decimal("8.00"),
            absence=99,
        )
        self.assertEqual(grade.absence, 0)

        self.client.force_authenticate(self.teacher_user)
        first_date = timezone.now()
        response = self.client.post(
            reverse("attendance-list"),
            {
                "class_group": self.group.pk,
                "student": self.student.pk,
                "held_at": first_date.isoformat(),
                "present": False,
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        grade.refresh_from_db()
        self.assertEqual(grade.absence, 1)
        self.assertEqual(grade.status, "approved")

        second_record = AttendanceRecord.objects.create(
            class_group=self.group,
            student=self.student,
            held_at=first_date + timedelta(days=1),
            present=False,
        )
        grade.refresh_from_db()
        self.assertEqual(grade.absence, 2)
        self.assertEqual(grade.status, "failed")

        second_record.present = True
        second_record.save()
        grade.refresh_from_db()
        self.assertEqual(grade.absence, 1)
        self.assertEqual(grade.status, "approved")

        first_record = AttendanceRecord.objects.get(pk=response.data["id"])
        first_record.delete()
        grade.refresh_from_db()
        self.assertEqual(grade.absence, 0)
        self.assertEqual(grade.status, "approved")

    def test_legacy_grade_without_class_keeps_manual_absences(self):
        grade = Grade.objects.create(
            student=self.student,
            subject=self.subject,
            grade=Decimal("8.00"),
            absence=3,
        )
        self.assertEqual(grade.absence, 3)

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


class GradePolicyAbsenceTests(TestCase):
    def setUp(self):
        self.course = Course.objects.create(name="Curso de Políticas")
        user = User.objects.create_user(username="absence-student")
        student = StudentProfile.objects.create(
            user=user,
            registration="ABS-001",
            course=self.course,
            semester=1,
        )
        subject = Subject.objects.create(
            name="Políticas Acadêmicas",
            code="PA-001",
            workload=60,
        )
        self.grade = Grade.objects.create(
            student=student,
            subject=subject,
            grade=Decimal("8.00"),
            absence=3,
        )

    def test_absence_limit_fails_only_above_the_configured_limit(self):
        GradePolicy.objects.create(
            passing_score="7.00",
            attention_score="5.00",
            maximum_absences=3,
        )

        self.grade.refresh_from_db()
        self.assertEqual(self.grade.status, "approved")

        self.grade.absence = 4
        self.grade.save()
        self.assertEqual(self.grade.status, "failed")

        self.grade.grade = None
        self.grade.save()
        self.assertEqual(self.grade.status, "failed")

    def test_policy_changes_recalculate_existing_grade_statuses(self):
        policy = GradePolicy.objects.create(
            passing_score="7.00",
            attention_score="5.00",
            maximum_absences=3,
        )
        self.grade.grade = Decimal("6.00")
        self.grade.absence = 2
        self.grade.save()
        self.assertEqual(self.grade.status, "attention")

        policy.maximum_absences = 1
        policy.save()
        self.grade.refresh_from_db()
        self.assertEqual(self.grade.status, "failed")

        policy.maximum_absences = None
        policy.save()
        self.grade.refresh_from_db()
        self.assertEqual(self.grade.status, "attention")

        policy.attention_score = "6.50"
        policy.save()
        self.grade.refresh_from_db()
        self.assertEqual(self.grade.status, "failed")

        policy.delete()
        self.grade.refresh_from_db()
        self.assertEqual(self.grade.status, "attention")
