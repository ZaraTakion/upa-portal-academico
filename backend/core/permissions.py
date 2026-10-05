from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsStaffOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.method in SAFE_METHODS or request.user.is_staff)
        )


class IsStaffOrTeacherGradeEditor(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if request.method in SAFE_METHODS or user.is_staff:
            return True
        return (
            view.action in {"update", "partial_update"}
            and user.groups.filter(name="Professor").exists()
        )


class IsStaffOrCreateOnly(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and (
                request.method in SAFE_METHODS
                or user.is_staff
                or request.method == "POST"
            )
        )


class IsNotificationOwnerOrStaff(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and (
                request.method in SAFE_METHODS
                or user.is_staff
                or view.action == "mark_as_read"
            )
        )


class IsStudentProfileOwnerOrStaff(BasePermission):
    editable_fields = {"phone", "address", "guardian_name"}

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if request.method in SAFE_METHODS or user.is_staff:
            return True
        return request.method == "PATCH" and view.action == "partial_update"

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS or request.user.is_staff:
            return True
        return (
            request.method == "PATCH"
            and view.action == "partial_update"
            and obj.user_id == request.user.id
            and set(request.data.keys()).issubset(self.editable_fields)
        )


class CanManageAcademicFile(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if request.method in SAFE_METHODS or user.is_staff:
            return True
        return request.method == "POST" and view.action == "create"


class IsStaffOrTeacherAcademicEditor(BasePermission):
    edit_actions = {"create", "update", "partial_update", "destroy"}

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if request.method in SAFE_METHODS or user.is_staff or user.is_superuser:
            return True
        return (
            view.action in self.edit_actions
            and user.groups.filter(name="Professor").exists()
        )
