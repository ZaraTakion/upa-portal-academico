from rest_framework import serializers

from .models import (
    AcademicCalendar,
    AcademicTerm,
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
    WeeklySchedule,
)


class GradePolicySerializer(serializers.ModelSerializer):
    class Meta:
        model = GradePolicy
        fields = ["id", "passing_score", "attention_score", "maximum_absences"]

    def validate(self, attrs):
        if self.instance is None and GradePolicy.objects.exists():
            raise serializers.ValidationError("A regra de notas já está cadastrada. Edite a regra existente.")
        passing = attrs.get("passing_score", getattr(self.instance, "passing_score", 7))
        attention = attrs.get("attention_score", getattr(self.instance, "attention_score", 5))
        if attention > passing:
            raise serializers.ValidationError({"attention_score": "A nota de atenção não pode superar a nota de aprovação."})
        if passing > 10 or attention > 10:
            raise serializers.ValidationError("As notas limite devem estar entre 0 e 10.")
        return attrs


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ["id", "name", "duration_semesters"]


class AcademicTermSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicTerm
        fields = ["id", "code", "starts_on", "ends_on", "is_current"]


class AssessmentSerializer(serializers.ModelSerializer):
    class_group_name = serializers.CharField(source="class_group.name", read_only=True)
    subject_name = serializers.CharField(source="class_group.subject.name", read_only=True)
    teacher_name = serializers.SerializerMethodField()

    class Meta:
        model = Assessment
        fields = [
            "id", "class_group", "class_group_name", "subject_name", "teacher_name",
            "title", "category", "weight", "maximum_score", "due_date", "created_at",
        ]
        read_only_fields = ["created_at"]

    def validate(self, attrs):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        class_group = attrs.get("class_group", getattr(self.instance, "class_group", None))
        if user and user.is_authenticated and not user.is_staff and not user.is_superuser:
            if not class_group or class_group.teacher.user_id != user.id:
                raise serializers.ValidationError(
                    {"class_group": "Você só pode criar avaliações para uma turma sua."}
                )
        if attrs.get("weight", getattr(self.instance, "weight", 1)) <= 0:
            raise serializers.ValidationError({"weight": "O peso deve ser maior que zero."})
        if attrs.get("maximum_score", getattr(self.instance, "maximum_score", 10)) <= 0:
            raise serializers.ValidationError(
                {"maximum_score": "A nota máxima deve ser maior que zero."}
            )
        return attrs

    def get_teacher_name(self, obj):
        user = obj.class_group.teacher.user
        return user.get_full_name() or user.username


class AssessmentResultSerializer(serializers.ModelSerializer):
    assessment_title = serializers.CharField(source="assessment.title", read_only=True)
    student_name = serializers.SerializerMethodField()
    class_group = serializers.IntegerField(source="assessment.class_group_id", read_only=True)

    class Meta:
        model = AssessmentResult
        fields = [
            "id", "assessment", "assessment_title", "class_group", "student",
            "student_name", "score", "feedback", "graded_at",
        ]
        read_only_fields = ["graded_at"]

    def validate(self, attrs):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        assessment = attrs.get("assessment", getattr(self.instance, "assessment", None))
        student = attrs.get("student", getattr(self.instance, "student", None))
        score = attrs.get("score", getattr(self.instance, "score", None))
        if assessment and student:
            if not ClassEnrollment.objects.filter(
                class_group=assessment.class_group, student=student
            ).exists():
                raise serializers.ValidationError(
                    {"student": "O aluno não está matriculado nesta turma."}
                )
            if score is not None and score < 0:
                raise serializers.ValidationError({"score": "A nota não pode ser negativa."})
            if score is not None and score > assessment.maximum_score:
                raise serializers.ValidationError(
                    {"score": "A nota não pode ultrapassar a nota máxima da avaliação."}
                )
            if (
                user
                and user.is_authenticated
                and not user.is_staff
                and not user.is_superuser
                and assessment.class_group.teacher.user_id != user.id
            ):
                raise serializers.ValidationError(
                    {"assessment": "Você só pode lançar notas em suas turmas."}
                )
        return attrs

    def get_student_name(self, obj):
        user = obj.student.user
        return user.get_full_name() or user.username


class AttendanceRecordSerializer(serializers.ModelSerializer):
    class_group_name = serializers.CharField(source="class_group.name", read_only=True)
    student_name = serializers.SerializerMethodField()
    recorded_by = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = AttendanceRecord
        fields = [
            "id", "class_group", "class_group_name", "student", "student_name",
            "held_at", "present", "notes", "recorded_by",
        ]

    def get_student_name(self, obj):
        user = obj.student.user
        return user.get_full_name() or user.username

    def validate(self, attrs):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        class_group = attrs.get("class_group", getattr(self.instance, "class_group", None))
        student = attrs.get("student", getattr(self.instance, "student", None))
        if class_group and student:
            if not ClassEnrollment.objects.filter(
                class_group=class_group, student=student
            ).exists():
                raise serializers.ValidationError(
                    {"student": "O aluno não está matriculado nesta turma."}
                )
            if (
                user
                and user.is_authenticated
                and not user.is_staff
                and not user.is_superuser
                and class_group.teacher.user_id != user.id
            ):
                raise serializers.ValidationError(
                    {"class_group": "Você só pode registrar frequência em suas turmas."}
                )
        return attrs


class StudentProfileSerializer(serializers.ModelSerializer):
    course = serializers.CharField(source="course.name", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = StudentProfile
        fields = [
            "id",
            "user",
            "username",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "registration",
            "course",
            "semester",
            "cpf",
            "phone",
            "address",
            "mother_name",
            "father_name",
            "guardian_name",
        ]
        read_only_fields = [
            "user",
            "username",
            "registration",
            "course",
            "semester",
            "cpf",
        ]

    def get_fields(self):
        fields = super().get_fields()
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if not user or not user.is_authenticated or user.is_staff:
            return fields

        if user.groups.filter(name="Professor").exists():
            for name in (
                "email",
                "cpf",
                "phone",
                "address",
                "mother_name",
                "father_name",
                "guardian_name",
            ):
                fields.pop(name, None)
        else:
            for name in ("user", "username", "email", "first_name", "last_name",
                         "registration", "course", "semester", "cpf",
                         "mother_name", "father_name"):
                if name in fields:
                    fields[name].read_only = True
        return fields

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
            "phone",
        ]

    def get_full_name(self, obj):
        return obj.user.get_full_name() or obj.user.username


class SubjectSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Subject
        fields = [
            "id",
            "name",
            "code",
            "workload",
            "professor",
            "period",
            "status",
            "status_display",
        ]


class ClassGroupSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    teacher_name = serializers.SerializerMethodField()
    students_count = serializers.SerializerMethodField()
    term_code = serializers.CharField(source="term.code", read_only=True)

    class Meta:
        model = ClassGroup
        fields = [
            "id",
            "name",
            "subject",
            "subject_name",
            "teacher",
            "teacher_name",
            "term",
            "term_code",
            "semester",
            "year",
            "students_count",
        ]

    def get_teacher_name(self, obj):
        return obj.teacher.user.get_full_name() or obj.teacher.user.username

    def get_students_count(self, obj):
        return getattr(obj, "students_count", obj.classenrollment_set.count())


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
            "status",
            "enrolled_at",
        ]

    def get_student_name(self, obj):
        return obj.student.user.get_full_name() or obj.student.user.username


class GradeSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.user.username", read_only=True)
    student_full_name = serializers.SerializerMethodField()
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

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
            "status",
            "status_display",
            "created_at",
        ]

    def get_fields(self):
        fields = super().get_fields()
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if (
            user
            and user.is_authenticated
            and not user.is_staff
            and user.groups.filter(name="Professor").exists()
        ):
            for name in ("student", "subject", "status", "created_at"):
                fields[name].read_only = True
        return fields

    def get_student_full_name(self, obj):
        return obj.student.user.get_full_name() or obj.student.user.username


class AcademicCalendarSerializer(serializers.ModelSerializer):
    event_type_display = serializers.CharField(source="get_event_type_display", read_only=True)

    class Meta:
        model = AcademicCalendar
        fields = [
            "id",
            "title",
            "description",
            "event_type",
            "event_type_display",
            "start_date",
            "end_date",
            "visible_until",
        ]


class WeeklyScheduleSerializer(serializers.ModelSerializer):
    class_group_name = serializers.CharField(source="class_group.name", read_only=True, allow_null=True)
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    teacher_name = serializers.SerializerMethodField()
    weekday_display = serializers.CharField(source="get_weekday_display", read_only=True)

    class Meta:
        model = WeeklySchedule
        fields = [
            "id",
            "class_group",
            "class_group_name",
            "subject",
            "subject_name",
            "teacher",
            "teacher_name",
            "weekday",
            "weekday_display",
            "start_time",
            "end_time",
            "location",
        ]

    def get_teacher_name(self, obj):
        if not obj.teacher:
            return ""

        return obj.teacher.user.get_full_name() or obj.teacher.user.username