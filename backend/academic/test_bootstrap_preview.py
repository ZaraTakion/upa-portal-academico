"""Regression tests for safe preview-account provisioning."""
import os
from unittest.mock import patch

from django.contrib.auth import authenticate, get_user_model
from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import TestCase, override_settings

from academic.models import ClassEnrollment, StudentProfile, TeacherProfile


ENV = {
    "CAMPUS_PREVIEW_BOOTSTRAP": "True",
    "CAMPUS_PREVIEW_STUDENT_PASSWORD": "Student!Private#2026-X54",
    "CAMPUS_PREVIEW_TEACHER_PASSWORD": "Teacher!Private#2026-X54",
    "CAMPUS_PREVIEW_ADMIN_PASSWORD": "Admin!Private#2026-X54",
}


class PreviewBootstrapTests(TestCase):
    @override_settings(DEBUG=False)
    def test_disabled_by_default_does_nothing(self):
        with patch.dict(os.environ, {"CAMPUS_PREVIEW_BOOTSTRAP": "False"}):
            call_command("bootstrap_preview")
        self.assertEqual(get_user_model().objects.count(), 0)

    @override_settings(DEBUG=True)
    def test_refuses_insecure_debug_mode(self):
        with patch.dict(os.environ, ENV):
            with self.assertRaises(CommandError):
                call_command("bootstrap_preview")

    @override_settings(DEBUG=False)
    def test_refuses_missing_or_weak_passwords_without_creating_users(self):
        with patch.dict(os.environ, {**ENV, "CAMPUS_PREVIEW_ADMIN_PASSWORD": "weak"}):
            with self.assertRaises(CommandError):
                call_command("bootstrap_preview")
        self.assertEqual(get_user_model().objects.count(), 0)

    @override_settings(DEBUG=False)
    def test_three_roles_and_repeat_without_changing_password(self):
        with patch.dict(os.environ, ENV):
            call_command("bootstrap_preview")
            self.assertIsNotNone(authenticate(username="campus-student", password=ENV["CAMPUS_PREVIEW_STUDENT_PASSWORD"]))
            self.assertIsNotNone(authenticate(username="campus-teacher", password=ENV["CAMPUS_PREVIEW_TEACHER_PASSWORD"]))
            self.assertIsNotNone(authenticate(username="campus-admin", password=ENV["CAMPUS_PREVIEW_ADMIN_PASSWORD"]))
            self.assertEqual(StudentProfile.objects.count(), 1)
            self.assertEqual(TeacherProfile.objects.count(), 1)
            self.assertEqual(ClassEnrollment.objects.count(), 1)
            self.assertTrue(get_user_model().objects.get(username="campus-admin").is_superuser)
            get_user_model().objects.filter(username="campus-teacher").update(first_name="Keep")
            first_id = get_user_model().objects.get(username="campus-student").id
            # Repeated startup cannot overwrite a password changed by the account holder.
            student = get_user_model().objects.get(username="campus-student")
            student.set_password("Changed#Preview#Password-2026")
            student.save(update_fields=["password"])
            call_command("bootstrap_preview")
            self.assertEqual(get_user_model().objects.count(), 3)
            self.assertEqual(get_user_model().objects.get(username="campus-student").id, first_id)
            self.assertIsNone(authenticate(username="campus-student", password=ENV["CAMPUS_PREVIEW_STUDENT_PASSWORD"]))
            self.assertIsNotNone(authenticate(username="campus-student", password="Changed#Preview#Password-2026"))

    @override_settings(DEBUG=False)
    def test_existing_wrong_role_never_becomes_administrator(self):
        User = get_user_model()
        user = User.objects.create_user(username="campus-admin", password="Existing!Safe#Password-2026")
        with patch.dict(os.environ, ENV):
            with self.assertRaises(CommandError):
                call_command("bootstrap_preview")
        user.refresh_from_db()
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
        self.assertEqual(User.objects.count(), 1)
