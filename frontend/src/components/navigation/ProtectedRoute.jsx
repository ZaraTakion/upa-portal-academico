import { Navigate } from "react-router-dom";

import Loading from "../feedback/Loading";
import { useAuth } from "../../context/AuthContext";
import { getRoleHome, getUserRole } from "../../utils/roles";

function ProtectedRoute({ children, roles }) {
  const { user, loadingUser } = useAuth();

  if (loadingUser) {
    return <Loading text="Verificando sua sessão..." />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const role = getUserRole(user);
  if (roles?.length && !roles.includes(role)) {
    return <Navigate to={getRoleHome(user)} replace />;
  }

  return children;
}

export default ProtectedRoute;
