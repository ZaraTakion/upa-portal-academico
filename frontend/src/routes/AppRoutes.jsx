import { BrowserRouter, Route, Routes } from "react-router-dom";

import ProtectedRoute from "../components/route/ProtectedRoute";

import Calendar from "../pages/Calendar";
import Contact from "../pages/Contact";
import Dashboard from "../pages/Dashboard";
import Files from "../pages/Files";
import ForgotPassword from "../pages/ForgotPassword";
import Grades from "../pages/Grades";
import Login from "../pages/Login";
import Notifications from "../pages/Notifications";
import Profile from "../pages/Profile";
import Subjects from "../pages/Subjects";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/subjects" element={<ProtectedRoute><Subjects /></ProtectedRoute>} />
        <Route path="/grades" element={<ProtectedRoute><Grades /></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
        <Route path="/files" element={<ProtectedRoute><Files /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;