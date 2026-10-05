import os
import shutil
import tempfile

from django.contrib.auth.models import Group, User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework.test import APIClient

from academic.models import ClassEnrollment, ClassGroup, StudentProfile, Subject, TeacherProfile
from .models import AcademicFile


class AcademicFileAPITests(TestCase):
    def setUp(self):
        self.media_root = tempfile.mkdtemp(prefix="upa-file-tests-")
        self.media_override = override_settings(MEDIA_ROOT=self.media_root)
        self.media_override.enable()

        professor_group, _ = Group.objects.get_or_create(name="Professor")
        self.student_user = User.objects.create_user(
            username="student", password="student-password"
        )
        self.teacher_user = User.objects.create_user(
            username="teacher", password="teacher-password"
        )
        self.other_teacher_user = User.objects.create_user(
            username="other-teacher", password="teacher-password"
        )
        self.teacher_user.groups.add(professor_group)
        self.other_teacher_user.groups.add(professor_group)

        self.student = StudentProfile.objects.create(
            user=self.student_user,
            registration="S-101",
            course="Sistemas para Internet",
            semester=4,
        )
        self.teacher = TeacherProfile.objects.create(
            user=self.teacher_user,
            employee_code="T-101",
            department="Tecnologia",
        )
        self.other_teacher = TeacherProfile.objects.create(
            user=self.other_teacher_user,
            employee_code="T-102",
            department="Tecnologia",
        )
        self.subject = Subject.objects.create(
            name="Banco de Dados",
            code="BD-101",
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
        self.other_class_group = ClassGroup.objects.create(
            name="Turma B",
            subject=self.subject,
            teacher=self.other_teacher,
            semester="2026.2",
            year=2026,
        )
        ClassEnrollment.objects.create(
            class_group=self.class_group,
            student=self.student,
        )
        self.client = APIClient()

    def tearDown(self):
        self.media_override.disable()
        shutil.rmtree(self.media_root, ignore_errors=True)

    @staticmethod
    def pdf(name="assignment.pdf", content=b"%PDF-1.7 test", content_type="application/pdf"):
        return SimpleUploadedFile(name, content, content_type=content_type)

    def upload(self, user, class_group, **extra):
        self.client.force_authenticate(user)
        data = {
            "title": "Trabalho de banco de dados",
            "class_group": class_group.pk,
            "file": self.pdf(),
        }
        data.update(extra)
        return self.client.post(reverse("files-list"), data, format="multipart")

    def test_student_upload_is_always_saved_as_submission(self):
        response = self.upload(
            self.student_user,
            self.class_group,
            file_type="material",
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["file_type"], "submission")
        self.assertEqual(response.data["user"], self.student_user.pk)

    def test_student_cannot_upload_to_another_students_class(self):
        response = self.upload(self.student_user, self.other_class_group)
        self.assertEqual(response.status_code, 403)
        self.assertEqual(AcademicFile.objects.count(), 0)

    def test_teacher_can_only_upload_material_to_their_class(self):
        response = self.upload(
            self.teacher_user,
            self.class_group,
            file_type="submission",
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["file_type"], "material")

        denied = self.upload(self.teacher_user, self.other_class_group)
        self.assertEqual(denied.status_code, 403)

    def test_student_and_teacher_file_lists_are_scoped(self):
        own_material = AcademicFile.objects.create(
            user=self.teacher_user,
            class_group=self.class_group,
            subject=self.subject,
            title="Material da turma A",
            file_type="material",
            file=self.pdf("material-a.pdf"),
        )
        other_material = AcademicFile.objects.create(
            user=self.other_teacher_user,
            class_group=self.other_class_group,
            subject=self.subject,
            title="Material da turma B",
            file=self.pdf("material-b.pdf"),
        )
        own_submission = AcademicFile.objects.create(
            user=self.student_user,
            class_group=self.class_group,
            subject=self.subject,
            title="Entrega da aluna",
            file_type="submission",
            file=self.pdf("submission.pdf"),
        )

        self.client.force_authenticate(self.teacher_user)
        teacher_response = self.client.get(reverse("files-list"))
        self.assertEqual(teacher_response.status_code, 200)
        self.assertEqual(
            {item["id"] for item in teacher_response.data},
            {own_material.pk, own_submission.pk},
        )

        self.client.force_authenticate(self.student_user)
        student_response = self.client.get(reverse("files-list"))
        self.assertEqual(student_response.status_code, 200)
        self.assertEqual(
            {item["id"] for item in student_response.data},
            {own_material.pk, own_submission.pk},
        )
        self.assertNotIn("file", student_response.data[0])
        self.assertIn("download_url", student_response.data[0])
        self.assertNotIn(other_material.pk, {item["id"] for item in student_response.data})

    def test_download_is_private_and_scoped(self):
        own_file = AcademicFile.objects.create(
            user=self.teacher_user,
            class_group=self.class_group,
            subject=self.subject,
            title="Material",
            file_type="material",
            file=self.pdf(),
        )
        other_file = AcademicFile.objects.create(
            user=self.other_teacher_user,
            class_group=self.other_class_group,
            subject=self.subject,
            title="Outro material",
            file_type="material",
            file=self.pdf("other.pdf"),
        )

        self.client.force_authenticate(self.student_user)
        allowed = self.client.get(reverse("files-download", args=[own_file.pk]))
        denied = self.client.get(reverse("files-download", args=[other_file.pk]))
        self.assertEqual(allowed.status_code, 200)
        self.assertEqual(allowed["Content-Type"], "application/pdf")
        self.assertEqual(denied.status_code, 404)

        self.client.force_authenticate(None)
        unauthenticated = self.client.get(
            reverse("files-download", args=[own_file.pk])
        )
        self.assertEqual(unauthenticated.status_code, 401)

    def test_rejects_disallowed_extension_and_mismatched_content(self):
        self.client.force_authenticate(self.student_user)
        bad_extension = self.client.post(
            reverse("files-list"),
            {
                "title": "Arquivo suspeito",
                "class_group": self.class_group.pk,
                "file": SimpleUploadedFile(
                    "script.exe", b"MZ executable", content_type="application/octet-stream"
                ),
            },
            format="multipart",
        )
        self.assertEqual(bad_extension.status_code, 400)

        bad_signature = self.client.post(
            reverse("files-list"),
            {
                "title": "PDF inválido",
                "class_group": self.class_group.pk,
                "file": SimpleUploadedFile(
                    "fake.pdf", b"not a pdf", content_type="application/pdf"
                ),
            },
            format="multipart",
        )
        self.assertEqual(bad_signature.status_code, 400)
        self.assertEqual(AcademicFile.objects.count(), 0)

    @override_settings(ACADEMIC_FILE_MAX_SIZE=4)
    def test_rejects_file_over_configured_size(self):
        self.client.force_authenticate(self.student_user)
        response = self.client.post(
            reverse("files-list"),
            {
                "title": "Arquivo grande",
                "class_group": self.class_group.pk,
                "file": self.pdf(),
            },
            format="multipart",
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(AcademicFile.objects.count(), 0)
