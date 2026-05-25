import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";
import { getUser, logout, saveUser } from "../utils/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getUser());
  const [loadingUser, setLoadingUser] = useState(false);

  async function loadUser() {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setUser(null);
      return;
    }

    setLoadingUser(true);

    try {
      const response = await api.get("/accounts/me/");
      saveUser(response.data);
      setUser(response.data);
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
      logout();
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