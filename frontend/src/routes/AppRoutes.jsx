import { lazy, Suspense } from "react";
import Loading from "../components/feedback/Loading";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import ProtectedRoute from "../components/navigation/ProtectedRoute";

const Login = lazy(() => import("../pages/Login"));
const ForgotPassword = lazy(() => import("../pages/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/ResetPassword"));

const StudentDashboard = lazy(() => import("../pages/student/StudentDashboard"));
const Profile = lazy(() => import("../pages/student/Profile"));
const Subjects = lazy(() => import("../pages/student/Subjects"));
const Grades = lazy(() => import("../pages/student/Grades"));
const Calendar = lazy(() => import("../pages/student/Calendar"));
const Notifications = lazy(() => import("../pages/student/Notifications"));
const Files = lazy(() => import("../pages/student/Files"));
const Financial = lazy(() => import("../pages/student/Financial"));
const Contact = lazy(() => import("../pages/student/Contact"));

const TeacherClasses = lazy(() => import("../pages/teacher/TeacherClasses"));
const TeacherStudents = lazy(() => import("../pages/teacher/TeacherStudents"));
const TeacherGrades = lazy(() => import("../pages/teacher/TeacherGrades"));
const TeacherAttendance = lazy(() => import("../pages/teacher/TeacherAttendance"));
const TeacherAssessments = lazy(() => import("../pages/teacher/TeacherAssessments"));

const AdminPanel = lazy(() => import("../pages/admin/AdminPanel"));
const AdminManagement = lazy(() => import("../pages/admin/AdminManagement"));
const NotFound = lazy(() => import("../pages/NotFound"));

function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading text="Carregando página..." />}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:uidb64/:token" element={<ResetPassword />} />

        <Route path="/dashboard" element={<ProtectedRoute roles={["student"]}><StudentDashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute roles={["student"]}><Profile /></ProtectedRoute>} />
        <Route path="/subjects" element={<ProtectedRoute roles={["student"]}><Subjects /></ProtectedRoute>} />
        <Route path="/grades" element={<ProtectedRoute roles={["student"]}><Grades /></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute roles={["student"]}><Calendar /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/files" element={<ProtectedRoute><Files /></ProtectedRoute>} />
        <Route path="/financial" element={<ProtectedRoute roles={["student"]}><Financial /></ProtectedRoute>} />
        <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
        <Route path="/teacher/classes" element={<ProtectedRoute roles={["professor"]}><TeacherClasses /></ProtectedRoute>} />
        <Route path="/teacher/students" element={<ProtectedRoute roles={["professor"]}><TeacherStudents /></ProtectedRoute>} />
        <Route path="/teacher/grades" element={<ProtectedRoute roles={["professor"]}><TeacherGrades /></ProtectedRoute>} />
        <Route path="/teacher/attendance" element={<ProtectedRoute roles={["professor"]}><TeacherAttendance /></ProtectedRoute>} />
        <Route path="/teacher/assessments" element={<ProtectedRoute roles={["professor"]}><TeacherAssessments /></ProtectedRoute>} />
        <Route path="/admin-panel" element={<ProtectedRoute roles={["admin"]}><AdminPanel /></ProtectedRoute>} />
        <Route path="/admin/management" element={<ProtectedRoute roles={["admin"]}><AdminManagement /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default AppRoutes;
