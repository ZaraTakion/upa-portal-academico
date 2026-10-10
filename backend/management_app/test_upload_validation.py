from io import BytesIO
from zipfile import ZipFile

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import SimpleTestCase, override_settings
from rest_framework.exceptions import ValidationError

from .serializers import AcademicFileSerializer


class UploadContentTests(SimpleTestCase):
    def office(self, files):
        stream = BytesIO()
        with ZipFile(stream, 'w') as archive:
            for name, content in files.items():
                archive.writestr(name, content)
        return SimpleUploadedFile('document.docx', stream.getvalue(), content_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document')

    def test_arbitrary_zip_cannot_be_disguised_as_docx(self):
        with self.assertRaises(ValidationError):
            AcademicFileSerializer().validate_file(self.office({'data.txt': 'unrelated'}))

    def test_office_path_traversal_macros_and_expansion_are_rejected(self):
        base = {'[Content_Types].xml': '<Types/>', 'word/document.xml': '<document/>'}
        for path in ['../outside', '/absolute', 'word/vbaProject.bin', 'word\\outside']:
            with self.subTest(path=path), self.assertRaises(ValidationError):
                AcademicFileSerializer().validate_file(self.office({**base, path: 'unsafe'}))
        uploaded = self.office({**base, 'large.txt': 'x' * 3000})
        with override_settings(ACADEMIC_FILE_MAX_SIZE=1000), self.assertRaises(ValidationError):
            AcademicFileSerializer().validate_file(uploaded)

    def test_valid_office_is_rewound_for_storage(self):
        uploaded = self.office({'[Content_Types].xml': '<Types/>', 'word/document.xml': '<document/>'})
        self.assertIs(AcademicFileSerializer().validate_file(uploaded), uploaded)
        self.assertEqual(uploaded.tell(), 0)

    def test_binary_data_after_initial_sample_is_rejected(self):
        uploaded = SimpleUploadedFile('text.txt', b'a' * 9000 + b'\x00', content_type='text/plain')
        with self.assertRaises(ValidationError):
            AcademicFileSerializer().validate_file(uploaded)
