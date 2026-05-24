from rest_framework import serializers

from .models import (
    AcademicCalendar,
    ClassEnrollment,
    ClassGroup,
    Grade,
    StudentProfile,
    Subject,
    TeacherProfile,
)


class StudentProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = StudentProfile
        fields = [
            "id",
            "user",
            "username",
            "email",
            "full_name",
            "registration",
            "course",
            "semester",
        ]

    def get_full_name(self, obj):
        return obj.user.get_full_name() or obj.user.username


class TeacherProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = TeacherProfile
        fields = [
            "id",
            "user",
            "username",
            "email",
            "full_name",
            "employee_code",
            "department",
            "title",
        ]

    def get_full_name(self, obj):
        return obj.user.get_full_name() or obj.user.username


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ["id", "name", "code", "workload", "professor"]


class ClassGroupSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    teacher_name = serializers.SerializerMethodField()
    students_count = serializers.SerializerMethodField()

    class Meta:
        model = ClassGroup
        fields = [
            "id",
            "name",
            "subject",
            "subject_name",
            "teacher",
            "teacher_name",
            "semester",
            "year",
            "students_count",
        ]

    def get_teacher_name(self, obj):
        return obj.teacher.user.get_full_name() or obj.teacher.user.username

    def get_students_count(self, obj):
        return obj.classenrollment_set.count()


class ClassEnrollmentSerializer(serializers.ModelSerializer):
    class_group_name = serializers.CharField(source="class_group.name", read_only=True)
    student_name = serializers.SerializerMethodField()
    subject_name = serializers.CharField(source="class_group.subject.name", read_only=True)

    class Meta:
        model = ClassEnrollment
        fields = [
            "id",
            "class_group",
            "class_group_name",
            "student",
            "student_name",
            "subject_name",
        ]

    def get_student_name(self, obj):
        return obj.student.user.get_full_name() or obj.student.user.username


class GradeSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.user.username", read_only=True)
    student_full_name = serializers.SerializerMethodField()
    subject_name = serializers.CharField(source="subject.name", read_only=True)

    class Meta:
        model = Grade
        fields = [
            "id",
            "student",
            "student_name",
            "student_full_name",
            "subject",
            "subject_name",
            "grade",
            "absence",
            "created_at",
        ]

    def get_student_full_name(self, obj):
        return obj.student.user.get_full_name() or obj.student.user.username


class AcademicCalendarSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicCalendar
        fields = ["id", "title", "description", "event_date"]