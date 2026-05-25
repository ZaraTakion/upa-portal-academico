import { ArrowRight, GraduationCap } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../api/axios";
import Alert from "../components/feedback/Alert";
import Button from "../components/ui/Button";
import TextInput from "../components/ui/TextInput";
import { saveTokens } from "../utils/auth";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { loadUser } = useAuth();

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

      saveTokens(tokenResponse.data.access, tokenResponse.data.refresh);

      if (loadUser) {
        await loadUser();
      }

      navigate("/dashboard");
    } catch (error) {
      console.error("Erro no login:", error);
      setErrorMessage("Usuário ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-brand">
          <div className="auth-logo">
            <GraduationCap size={32} />
          </div>

          <div>
            <strong>UPA</strong>
            <span>Upgrade Portal Acadêmico</span>
          </div>
        </div>

        <div className="auth-copy">
          <h1>Bem-vindo de volta</h1>
          <p>
            Acesse seu ambiente acadêmico para acompanhar notas, disciplinas,
            calendário, arquivos e comunicados.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <TextInput
            label="Usuário"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Digite seu usuário"
            required
          />

          <TextInput
            label="Senha"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Digite sua senha"
            required
          />

          <Alert type="error" message={errorMessage} />

          <Button type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar no Portal"}
            {!loading && <ArrowRight size={18} />}
          </Button>
        </form>

        <Link to="/forgot-password" className="auth-link">
          Esqueci minha senha
        </Link>
      </section>

      <aside className="auth-visual">
        <div className="auth-visual-card">
          <span>Mural Acadêmico</span>
          <strong>Organize sua vida universitária em um só lugar.</strong>
          <p>
            Dashboard moderno, notificações, calendário e desempenho acadêmico
            com acesso simples e responsivo.
          </p>
        </div>
      </aside>
    </main>
  );
}

export default Login;