import { createContext, useContext, useEffect, useState } from "react";
import api, { refreshSession } from "../api/axios";
import { getAccessToken, setAccessToken } from "../api/session";
import { saveUser } from "../utils/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [sessionError, setSessionError] = useState("");

  async function loadUser() {
    setLoadingUser(true);
    setSessionError("");
    try {
      if (!getAccessToken()) await refreshSession();
      const { data } = await api.get("/accounts/me/");
      saveUser(data);
      setUser(data);
      return data;
    } catch (error) {
      if ([401, 403].includes(error.response?.status)) {
        setAccessToken(null);
        setUser(null);
        localStorage.removeItem("currentUser");
      } else {
        setSessionError("Não foi possível verificar sua sessão. Tente novamente.");
      }
      return null;
    } finally {
      setLoadingUser(false);
    }
  }

  useEffect(() => {
    loadUser();
    function expired() {
      setUser(null);
      setSessionError("Sua sessão expirou. Entre novamente.");
    }
    function logoutFailed() {
      setSessionError("Não foi possível encerrar a sessão no servidor. Verifique a conexão e tente sair novamente.");
    }
    window.addEventListener("upa:session-expired", expired);
    window.addEventListener("upa:logout-failed", logoutFailed);
    return () => {
      window.removeEventListener("upa:session-expired", expired);
      window.removeEventListener("upa:logout-failed", logoutFailed);
    };
  }, []);

  return <AuthContext.Provider value={{ user, setUser, loadingUser, loadUser, sessionError }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
