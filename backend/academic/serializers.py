from rest_framework import serializers

from .models import AcademicCalendar, Grade, StudentProfile, Subject


class StudentProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = StudentProfile
        fields = [
            "id",
            "user",
            "username",
            "email",
            "registration",
            "course",
            "semester",
        ]


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ["id", "name", "code", "workload", "professor"]


class GradeSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.user.username", read_only=True)
    subject_name = serializers.CharField(source="subject.name", read_only=True)

    class Meta:
        model = Grade
        fields = [
            "id",
            "student",
            "student_name",
            "subject",
            "subject_name",
            "grade",
            "absence",
            "created_at",
        ]


class AcademicCalendarSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicCalendar
        fields = ["id", "title", "description", "event_date"]