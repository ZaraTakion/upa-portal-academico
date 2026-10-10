from decimal import Decimal

from django.contrib.auth.models import Group, User
from django.db import IntegrityError, connection, transaction
from django.test import TestCase
from django.test.utils import CaptureQueriesContext
from rest_framework.test import APIClient

from .models import (
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


class AcademicIntegrityTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.admin = User.objects.create_superuser('admin', 'admin@example.test', 'Strong-test-password-937!')
        cls.teacher_user = User.objects.create_user('teacher')
        cls.teacher_user.groups.add(Group.objects.create(name='Professor'))
        cls.teacher = TeacherProfile.objects.create(user=cls.teacher_user, employee_code='T1', department='Computação')
        cls.course = Course.objects.create(name='Computação')
        cls.subject = Subject.objects.create(name='Engenharia', code='ENG', workload=60)
        cls.group = ClassGroup.objects.create(name='Turma teste', subject=cls.subject, teacher=cls.teacher, semester='1', year=2026)
        cls.student_user = User.objects.create_user('student')
        cls.student = StudentProfile.objects.create(user=cls.student_user, registration='S1', course=cls.course, semester=1)
        ClassEnrollment.objects.create(student=cls.student, class_group=cls.group)

    def setUp(self):
        self.client = APIClient()
        self.client.force_authenticate(self.admin)

    def test_invalid_typed_filters_return_400_instead_of_500(self):
        cases = [('grades', 'subject=oops'), ('subjects', 'period=-1'), ('assessment-results', 'assessment=oops'), ('attendance', 'date=2026-99-99'), ('class-enrollments', 'class_group=oops'), ('weekly-schedule', 'subject=oops')]
        for endpoint, query in cases:
            with self.subTest(endpoint=endpoint):
                self.assertEqual(self.client.get(f'/api/academic/{endpoint}/?{query}').status_code, 400)

    def test_calendar_term_and_schedule_reject_reversed_ranges(self):
        cases = [('calendar', {'title': 'Teste', 'description': 'Teste', 'start_date': '2026-10-10', 'end_date': '2026-10-01'}), ('terms', {'code': 'invalid', 'starts_on': '2026-10-10', 'ends_on': '2026-10-01'}), ('weekly-schedule', {'class_group': self.group.pk, 'subject': self.subject.pk, 'teacher': self.teacher.pk, 'weekday': 'monday', 'start_time': '15:00', 'end_time': '14:00'})]
        for endpoint, payload in cases:
            with self.subTest(endpoint=endpoint):
                self.assertEqual(self.client.post(f'/api/academic/{endpoint}/', payload, format='json').status_code, 400)

    def test_grade_bounds_and_legacy_unique_constraint(self):
        for score in [-1, 11]:
            response = self.client.post('/api/academic/grades/', {'student': self.student.pk, 'subject': self.subject.pk, 'grade': score}, format='json')
            self.assertEqual(response.status_code, 400)
        grade = Grade.objects.create(student=self.student, subject=self.subject, grade=8)
        for payload in [{'student': self.student, 'subject': self.subject, 'grade': 5}, {'student': self.student, 'subject': self.subject, 'attempt': 2, 'grade': -1}]:
            with self.assertRaises(IntegrityError), transaction.atomic():
                Grade.objects.create(**payload)
        grade.refresh_from_db()
        self.assertEqual(grade.grade, Decimal('8'))

    def test_deleting_linked_subject_returns_conflict_and_preserves_records(self):
        Grade.objects.create(student=self.student, subject=self.subject, class_group=self.group, grade=8)
        response = self.client.delete(f'/api/academic/subjects/{self.subject.pk}/')
        self.assertEqual(response.status_code, 409)
        self.assertTrue(Subject.objects.filter(pk=self.subject.pk).exists())
        self.assertEqual(Grade.objects.count(), 1)

    def test_assessment_cannot_move_or_lower_maximum_below_existing_score(self):
        assessment = Assessment.objects.create(class_group=self.group, title='Prova', maximum_score=10)
        AssessmentResult.objects.create(assessment=assessment, student=self.student, score=9)
        other = ClassGroup.objects.create(name='Outra', subject=self.subject, teacher=self.teacher, semester='1', year=2026)
        for payload in [{'maximum_score': 8}, {'class_group': other.pk}]:
            response = self.client.patch(f'/api/academic/assessments/{assessment.pk}/', payload, format='json')
            self.assertEqual(response.status_code, 400)
        self.assertEqual(Grade.objects.get(student=self.student).grade, Decimal('9'))

    def test_class_serialization_has_no_query_per_class(self):
        for index in range(8):
            ClassGroup.objects.create(name=f'Group {index}', subject=self.subject, teacher=self.teacher, semester='1', year=2026)
        with CaptureQueriesContext(connection) as queries:
            response = self.client.get('/api/academic/class-groups/')
            self.assertEqual(response.status_code, 200)
            self.assertEqual(len(response.data), 9)
        self.assertLessEqual(len(queries), 2)

    def test_staff_can_create_student_profile_with_course_id(self):
        user = User.objects.create_user('new-student')
        response = self.client.post('/api/academic/students/', {'user': user.pk, 'registration': 'NEW', 'course_id': self.course.pk, 'semester': 1}, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(response.data['course'], self.course.name)
        self.client.force_authenticate(user)
        response = self.client.get('/api/academic/students/')
        self.assertNotIn('course_id', response.data[0])

    def test_attendance_batch_is_atomic_and_idempotent(self):
        self.client.force_authenticate(self.teacher_user)
        payload = {'class_group': self.group.pk, 'date': '2026-10-10', 'records': [{'student': self.student.pk, 'present': False}]}
        response = self.client.post('/api/academic/attendance/batch/', payload, format='json')
        self.assertEqual(response.status_code, 200, response.data)
        response = self.client.post('/api/academic/attendance/batch/', payload, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(AttendanceRecord.objects.count(), 1)
        payload['records'].append({'student': 99999, 'present': False})
        payload['records'][0]['present'] = True
        self.assertEqual(self.client.post('/api/academic/attendance/batch/', payload, format='json').status_code, 400)
        self.assertFalse(AttendanceRecord.objects.get().present)

    def test_student_and_other_teacher_cannot_save_attendance_batch(self):
        other = User.objects.create_user('other-teacher')
        other.groups.add(Group.objects.get(name='Professor'))
        for user in [self.student_user, other]:
            self.client.force_authenticate(user)
            response = self.client.post('/api/academic/attendance/batch/', {'class_group': self.group.pk, 'date': '2026-10-10', 'records': [{'student': self.student.pk, 'present': False}]}, format='json')
            self.assertIn(response.status_code, [400, 403])
        self.assertFalse(AttendanceRecord.objects.exists())

    def test_bulk_deletions_recalculate_grades(self):
        assessment = Assessment.objects.create(class_group=self.group, title='Prova', maximum_score=10)
        result = AssessmentResult.objects.create(assessment=assessment, student=self.student, score=9)
        record = AttendanceRecord.objects.create(class_group=self.group, student=self.student, held_at='2026-10-10T12:00:00Z', present=False)
        grade = Grade.objects.get(student=self.student, class_group=self.group)
        self.assertEqual(grade.absence, 1)
        AttendanceRecord.objects.filter(pk=record.pk).delete()
        grade.refresh_from_db()
        self.assertEqual(grade.absence, 0)
        AssessmentResult.objects.filter(pk=result.pk).delete()
        grade.refresh_from_db()
        self.assertIsNone(grade.grade)

    def test_student_class_count_includes_all_enrolled_students(self):
        other = User.objects.create_user('another-student')
        profile = StudentProfile.objects.create(user=other, registration='S2', course=self.course, semester=1)
        ClassEnrollment.objects.create(student=profile, class_group=self.group)
        self.client.force_authenticate(self.student_user)
        response = self.client.get('/api/academic/class-groups/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data[0]['students_count'], 2)
