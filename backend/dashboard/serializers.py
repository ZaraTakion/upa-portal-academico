from rest_framework import serializers


class SummaryUserSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    username = serializers.CharField()
    full_name = serializers.CharField()
    email = serializers.EmailField(allow_blank=True)
    groups = serializers.ListField(child=serializers.CharField())


class StudentSummarySerializer(serializers.Serializer):
    id = serializers.IntegerField()
    full_name = serializers.CharField()
    registration = serializers.CharField()
    course = serializers.CharField()
    semester = serializers.IntegerField()
    phone = serializers.CharField(allow_blank=True)
    address = serializers.CharField(allow_blank=True)


class EventSummarySerializer(serializers.Serializer):
    id = serializers.IntegerField()
    title = serializers.CharField()
    description = serializers.CharField()
    event_type = serializers.CharField()
    event_type_display = serializers.CharField()
    start_date = serializers.DateField()
    end_date = serializers.DateField(allow_null=True)


class ScheduleSummarySerializer(serializers.Serializer):
    id = serializers.IntegerField()
    subject = serializers.CharField()
    weekday = serializers.CharField()
    start_time = serializers.TimeField()
    end_time = serializers.TimeField()
    location = serializers.CharField(allow_blank=True)


class StudentDashboardSerializer(serializers.Serializer):
    role = serializers.CharField()
    user = SummaryUserSerializer()
    student = StudentSummarySerializer()
    total_subjects = serializers.IntegerField()
    average_grade = serializers.FloatField()
    total_absences = serializers.IntegerField()
    unread_notifications = serializers.IntegerField()
    pending_invoices = serializers.IntegerField()
    next_events = EventSummarySerializer(many=True)
    weekly_schedule = ScheduleSummarySerializer(many=True)


class TeacherSummarySerializer(serializers.Serializer):
    id = serializers.IntegerField()
    full_name = serializers.CharField()
    employee_code = serializers.CharField()
    department = serializers.CharField()
    title = serializers.CharField()


class ClassSummarySerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    subject = serializers.CharField()
    semester = serializers.CharField()
    year = serializers.IntegerField()
    students_count = serializers.IntegerField()


class TeacherDashboardSerializer(serializers.Serializer):
    role = serializers.CharField()
    user = SummaryUserSerializer()
    teacher = TeacherSummarySerializer()
    total_classes = serializers.IntegerField()
    total_students = serializers.IntegerField()
    total_grades = serializers.IntegerField()
    unread_notifications = serializers.IntegerField()
    class_groups = ClassSummarySerializer(many=True)


class AdminDashboardSerializer(serializers.Serializer):
    role = serializers.CharField()
    user = SummaryUserSerializer()
    total_students = serializers.IntegerField()
    total_teachers = serializers.IntegerField()
    total_subjects = serializers.IntegerField()
    total_class_groups = serializers.IntegerField()
    total_enrollments = serializers.IntegerField()
    total_notifications = serializers.IntegerField()
    total_events = serializers.IntegerField()
    total_invoices = serializers.IntegerField()
