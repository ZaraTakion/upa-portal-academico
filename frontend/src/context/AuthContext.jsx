import { createContext, useContext, useEffect, useState } from "react";
import api, { refreshAccessToken } from "../api/axios";
import { clearSession, saveUser } from "../utils/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(() =>
    Boolean(localStorage.getItem("accessToken") || localStorage.getItem("sessionStarted"))
  );

  async function loadUser() {
    const token = localStorage.getItem("accessToken");

    if (!token && !localStorage.getItem("sessionStarted")) {
      setUser(null);
      setLoadingUser(false);
      return null;
    }

    setLoadingUser(true);

    try {
      if (!token) await refreshAccessToken();
      const response = await api.get("/accounts/me/");
      saveUser(response.data);
      setUser(response.data);
      return response.data;
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
      setUser(null);
      clearSession();
      return null;
    } finally {
      setLoadingUser(false);
    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loadingUser,
        loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
