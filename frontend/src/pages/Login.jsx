import AuthLayout from "../components/layout/AuthLayout";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../api/axios";
import Alert from "../components/feedback/Alert";
import Button from "../components/ui/Button";
import TextInput from "../components/ui/TextInput";
import { getRoleHome } from "../utils/roles";
import { saveTokens } from "../utils/auth";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { loadUser, sessionError } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setErrorMessage("");

    try {
      const tokenResponse = await api.post("/token/", {
        username,
        password,
      });

      saveTokens(tokenResponse.data.access);

      const user = await loadUser();
      if (!user) throw new Error("Não foi possível carregar a sessão.");
      navigate(getRoleHome(user));
    } catch (error) {
      setErrorMessage(
        error.response?.status === 429
          ? "Muitas tentativas. Aguarde antes de tentar novamente."
          : error.response?.status === 401
            ? "Usuário ou senha inválidos."
            : "Não foi possível entrar. Verifique sua conexão e tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Acesso ao Campus"
      title="Seu próximo capítulo."
      description="Acesse suas disciplinas, acompanhe seu percurso e organize a vida acadêmica."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <TextInput
          label="Usuário"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="Digite seu usuário"
          autoComplete="username"
          required
        />

        <TextInput
          label="Senha"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Digite sua senha"
          autoComplete="current-password"
          required
        />

        <Alert type="error" message={errorMessage || sessionError} />

        <Button type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar no Portal"}
          {!loading && <ArrowRight size={18} />}
        </Button>
      </form>

      <Link to="/forgot-password" className="auth-link">
        Esqueci minha senha
      </Link>
    </AuthLayout>
  );
}

export default Login;
