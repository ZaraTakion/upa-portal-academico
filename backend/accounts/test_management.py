from django.contrib.auth.models import User
from django.core.cache import cache
from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken


class AccountManagementTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.admin = User.objects.create_superuser("manager", "manager@example.test", "Strong-admin-password-538!")
        cls.staff = User.objects.create_user("staff", is_staff=True)
        cls.student = User.objects.create_user("student", password="Original-password-927!")

    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.client.force_authenticate(self.admin)

    def test_admin_creates_password_and_managed_role_without_exposing_hash(self):
        response = self.client.post('/api/accounts/users/', {"username": "new-teacher", "password": "Strong-new-password-529!", "role": "professor", "email": "teacher@example.test"}, format="json")
        self.assertEqual(response.status_code, 201, response.data)
        self.assertNotIn("password", response.data)
        user = User.objects.get(pk=response.data["id"])
        self.assertTrue(user.check_password("Strong-new-password-529!"))
        self.assertTrue(user.groups.filter(name="Professor").exists())
        self.assertFalse(user.is_staff)
        self.assertEqual(self.client.get('/api/accounts/users/').status_code, 200)

    def test_weak_password_does_not_create_account(self):
        response = self.client.post('/api/accounts/users/', {"username": "weak", "password": "123", "role": "student"}, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertFalse(User.objects.filter(username="weak").exists())

    def test_student_cannot_list_create_or_change_accounts(self):
        self.client.force_authenticate(self.student)
        for method, path, payload in [("get", '/api/accounts/users/', {}), ("post", '/api/accounts/users/', {"username": "intruder"}), ("patch", f'/api/accounts/users/{self.admin.pk}/', {"role": "student"})]:
            with self.subTest(method=method):
                response = getattr(self.client, method)(path, payload, format="json")
                self.assertEqual(response.status_code, 403)

    def test_staff_cannot_grant_administration_or_edit_superuser(self):
        self.client.force_authenticate(self.staff)
        create = self.client.post('/api/accounts/users/', {"username": "escalation", "password": "Strong-new-password-529!", "role": "admin"}, format="json")
        self.assertEqual(create.status_code, 400)
        edit = self.client.patch(f'/api/accounts/users/{self.admin.pk}/', {"email": "attacker@example.test"}, format="json")
        self.assertEqual(edit.status_code, 400)
        self.admin.refresh_from_db()
        self.assertEqual(self.admin.email, "manager@example.test")

    def test_self_deactivation_and_deletion_are_blocked(self):
        response = self.client.patch(f'/api/accounts/users/{self.admin.pk}/', {"is_active": False}, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(self.client.delete(f'/api/accounts/users/{self.student.pk}/').status_code, 405)

    def test_deactivation_denies_existing_access_token(self):
        access = str(RefreshToken.for_user(self.student).access_token)
        response = self.client.patch(f'/api/accounts/users/{self.student.pk}/', {"is_active": False}, format="json")
        self.assertEqual(response.status_code, 200)
        self.client.force_authenticate(user=None)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access}')
        self.assertEqual(self.client.get(reverse('current-user')).status_code, 401)


@override_settings(JWT_REFRESH_COOKIE_SECURE=False)
class SessionSecurityTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user("session-user", password="Original-password-927!")

    def setUp(self):
        cache.clear()
        self.client = APIClient(enforce_csrf_checks=True)

    def login(self):
        csrf = self.client.get(reverse('csrf-token')).data['csrfToken']
        return self.client.post(reverse('token_obtain_pair'), {"username": "session-user", "password": "Original-password-927!"}, format='json', HTTP_X_CSRFTOKEN=csrf)

    def test_login_refresh_logout_require_csrf(self):
        denied = self.client.post(reverse('token_obtain_pair'), {"username": "session-user", "password": "Original-password-927!"}, format='json')
        self.assertEqual(denied.status_code, 403)
        login = self.login()
        self.assertEqual(login.status_code, 200)
        for endpoint in ['token_refresh', 'token_logout']:
            self.assertEqual(self.client.post(reverse(endpoint), {}, format='json').status_code, 403)
        csrf = self.client.get(reverse('csrf-token')).data['csrfToken']
        refresh = self.client.post(reverse('token_refresh'), {}, format='json', HTTP_X_CSRFTOKEN=csrf)
        self.assertEqual(refresh.status_code, 200)
        self.assertNotIn('refresh', refresh.data)
        logout = self.client.post(reverse('token_logout'), {}, format='json', HTTP_X_CSRFTOKEN=csrf)
        self.assertEqual(logout.status_code, 205)

    def test_password_change_revokes_access_and_refresh(self):
        login = self.login()
        access = login.data['access']
        self.user.set_password('Changed-password-932!')
        self.user.save(update_fields=['password'])
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access}')
        self.assertEqual(self.client.get(reverse('current-user')).status_code, 401)
        self.client.credentials()
        csrf = self.client.get(reverse('csrf-token')).data['csrfToken']
        response = self.client.post(reverse('token_refresh'), {}, format='json', HTTP_X_CSRFTOKEN=csrf)
        self.assertEqual(response.status_code, 401)

    def test_csrf_token_can_be_read_by_allowed_frontend_origin(self):
        response = self.client.get(reverse('csrf-token'), HTTP_ORIGIN='http://localhost:5173')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Access-Control-Allow-Origin'], 'http://localhost:5173')
        self.assertEqual(response['Cache-Control'], 'private, no-store')
        self.assertIn('csrfToken', response.data)


class HealthAndSchemaTests(TestCase):
    def test_liveness_and_readiness(self):
        from unittest.mock import patch

        from django.db import DatabaseError
        self.assertEqual(self.client.get('/health/').json(), {'status': 'ok'})
        self.assertEqual(self.client.get('/health/ready/').json(), {'status': 'ready'})
        with patch('core.urls.connections') as connections:
            connections.__getitem__.return_value.cursor.side_effect = DatabaseError('private-connection-detail')
            response = self.client.get('/health/ready/')
        self.assertEqual(response.status_code, 503)
        self.assertNotIn('private-connection-detail', response.content.decode())

    @override_settings(STORAGES={"default": {"BACKEND": "django.core.files.storage.FileSystemStorage"}, "staticfiles": {"BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"}})
    def test_docs_require_staff_and_accept_admin_session(self):
        self.assertEqual(self.client.get('/api/schema/').status_code, 401)
        admin = User.objects.create_superuser('schema-admin', 'schema@example.test', 'Strong-schema-password-932!')
        self.client.force_login(admin)
        self.assertEqual(self.client.get('/api/schema/').status_code, 200)
        self.assertEqual(self.client.get('/api/docs/').status_code, 200)
