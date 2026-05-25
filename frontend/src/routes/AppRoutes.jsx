import { BrowserRouter, Route, Routes } from "react-router-dom";

import ProtectedRoute from "../components/navigation/ProtectedRoute";

import Login from "../pages/Login";
import ForgotPassword from "../pages/ForgotPassword";

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

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/subjects"
          element={
            <ProtectedRoute>
              <Subjects />
            </ProtectedRoute>
          }
        />

        <Route
          path="/grades"
          element={
            <ProtectedRoute>
              <Grades />
            </ProtectedRoute>
          }
        />

        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <Calendar />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />

        <Route
          path="/files"
          element={
            <ProtectedRoute>
              <Files />
            </ProtectedRoute>
          }
        />

        <Route
          path="/financial"
          element={
            <ProtectedRoute>
              <Financial />
            </ProtectedRoute>
          }
        />

        <Route
          path="/contact"
          element={
            <ProtectedRoute>
              <Contact />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/classes"
          element={
            <ProtectedRoute>
              <TeacherClasses />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/students"
          element={
            <ProtectedRoute>
              <TeacherStudents />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/grades"
          element={
            <ProtectedRoute>
              <TeacherGrades />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-panel"
          element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;