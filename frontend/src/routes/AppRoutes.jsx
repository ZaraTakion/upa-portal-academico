import { BrowserRouter, Route, Routes } from "react-router-dom";

import ProtectedRoute from "../components/navigation/ProtectedRoute";

import Login from "../pages/Login";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";

import StudentDashboard from "../pages/student/StudentDashboard";
import Profile from "../pages/student/Profile";
import Subjects from "../pages/student/Subjects";
import Grades from "../pages/student/Grades";
import Calendar from "../pages/student/Calendar";
import Notifications from "../pages/student/Notifications";
import Files from "../pages/student/Files";
import Financial from "../pages/student/Financial";
import Contact from "../pages/student/Contact";

import TeacherClasses from "../pages/teacher/TeacherClasses";
import TeacherStudents from "../pages/teacher/TeacherStudents";
import TeacherGrades from "../pages/teacher/TeacherGrades";

import AdminPanel from "../pages/admin/AdminPanel";
import NotFound from "../pages/NotFound";

function AppRoutes() {
  return (
    <BrowserRouter>
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
        <Route path="/admin-panel" element={<ProtectedRoute roles={["admin"]}><AdminPanel /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
