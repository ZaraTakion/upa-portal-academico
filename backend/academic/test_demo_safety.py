from django.contrib.auth.models import User
from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import TestCase, override_settings


class DemoSafetyTests(TestCase):
    @override_settings(DEBUG=False, DEMO_MODE=False)
    def test_demo_seed_cannot_run_in_production(self):
        with self.assertRaises(CommandError):
            call_command('seed_demo', verbosity=0)
        self.assertEqual(User.objects.count(), 0)

    @override_settings(DEBUG=True)
    def test_demo_seed_never_overwrites_existing_account(self):
        user = User.objects.create_user('admin', password='Existing-strong-password-937!', email='owner@example.test')
        with self.assertRaises(CommandError):
            call_command('seed_demo', verbosity=0)
        user.refresh_from_db()
        self.assertTrue(user.check_password('Existing-strong-password-937!'))
        self.assertFalse(user.is_superuser)
        self.assertEqual(user.email, 'owner@example.test')
        self.assertEqual(User.objects.count(), 1)
