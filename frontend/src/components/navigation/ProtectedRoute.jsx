import { Navigate } from "react-router-dom";

import Loading from "../feedback/Loading";
import { useAuth } from "../../context/AuthContext";


function getRole(user) {
  if (user?.is_staff || user?.is_superuser) {
    return "admin";
  }

  if (user?.groups?.includes("Professor")) {
    return "professor";
  }

  return "student";
}

const roleHome = {
  admin: "/admin-panel",
  professor: "/teacher/classes",
  student: "/dashboard",
};

function ProtectedRoute({ children, roles }) {
  const { user, loadingUser } = useAuth();

  if (loadingUser) {
    return <Loading text="Verificando sua sessão..." />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const role = getRole(user);
  if (roles?.length && !roles.includes(role)) {
    return <Navigate to={roleHome[role]} replace />;
  }

  return children;
}

export default ProtectedRoute;
