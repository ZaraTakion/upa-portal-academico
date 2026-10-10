from io import StringIO

from django.contrib.auth.models import User
from django.core.cache import cache
from django.core.management import call_command
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from academic.models import AcademicCalendar, StudentProfile, TeacherProfile


@override_settings(DEBUG=True)
class StandaloneDemoProfilesTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        call_command("seed_demo", stdout=StringIO())

    def setUp(self):
        cache.clear()
        self.client = APIClient()

    def login(self, username, password):
        result = self.client.post("/api/token/", {"username": username, "password": password}, format="json")
        self.assertEqual(result.status_code, 200, result.data)
        token = result.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        return result

    def test_three_roles_authenticate_and_load_their_own_dashboard(self):
        for username, password, expected_role in [
            ("rodrigo", "aluno123", "Aluno"),
            ("leandro", "prof123", "Professor"),
            ("admin", "admin123", "Administrador"),
        ]:
            with self.subTest(username=username):
                self.client.credentials()
                self.login(username, password)
                me = self.client.get("/api/accounts/me/")
                self.assertEqual(me.status_code, 200)
                self.assertEqual(me.data["username"], username)
                summary = self.client.get("/api/dashboard/summary/")
                self.assertEqual(summary.status_code, 200)
                self.assertEqual(summary.data["role"], expected_role)

    def test_student_cannot_change_catalog_and_only_sees_own_profile(self):
        self.login("rodrigo", "aluno123")
        response = self.client.get("/api/academic/students/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        blocked = self.client.post("/api/academic/courses/", {"name": "Blocked", "duration_semesters": 6}, format="json")
        self.assertEqual(blocked.status_code, 403)

    def test_teacher_cannot_administer_courses_but_sees_own_classes(self):
        self.login("leandro", "prof123")
        response = self.client.get("/api/academic/class-groups/")
        self.assertEqual(response.status_code, 200)
        self.assertGreater(len(response.data), 0)
        blocked = self.client.post("/api/academic/courses/", {"name": "Blocked", "duration_semesters": 6}, format="json")
        self.assertEqual(blocked.status_code, 403)

    def test_admin_can_create_course(self):
        self.login("admin", "admin123")
        created = self.client.post("/api/academic/courses/", {"name": "Campus QA", "duration_semesters": 6}, format="json")
        self.assertEqual(created.status_code, 201, created.data)

    def test_demo_seed_can_run_twice_without_duplicate_users(self):
        original = (User.objects.count(), StudentProfile.objects.count(), TeacherProfile.objects.count(), AcademicCalendar.objects.count())
        call_command("seed_demo", stdout=StringIO())
        after = (User.objects.count(), StudentProfile.objects.count(), TeacherProfile.objects.count(), AcademicCalendar.objects.count())
        self.assertEqual(after, original)
        self.assertTrue(User.objects.get(username="rodrigo").check_password("aluno123"))
