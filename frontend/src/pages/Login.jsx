import { ArrowRight, BookOpen, CalendarDays, GraduationCap, LibraryBig } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../api/axios";
import Alert from "../components/feedback/Alert";
import Button from "../components/ui/Button";
import TextInput from "../components/ui/TextInput";
import { useAuth } from "../context/AuthContext";
import { saveTokens } from "../utils/auth";
import { getLoginErrorMessage } from "../utils/loginErrors";
import { getRoleHome } from "../utils/roles";

function Login() {
  const navigate = useNavigate();
  const { loadUser } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setErrorMessage("");
    try {
      const tokenResponse = await api.post("/token/", {
        username: username.trim(),
        password,
      });
      saveTokens(tokenResponse.data.access);
      const loggedInUser = await loadUser();
      if (!loggedInUser) {
        setErrorMessage("O acesso foi autenticado, mas não foi possível carregar seu perfil acadêmico.");
        return;
      }
      navigate(getRoleHome(loggedInUser), { replace: true });
    } catch (error) {
      console.error("Erro no acesso ao portal:", error);
      setErrorMessage(getLoginErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="login-heading">
        <div className="auth-brand">
          <div className="auth-logo"><GraduationCap size={26} aria-hidden="true" /></div>
          <div><strong>takion campus</strong><span>Campus Folio</span></div>
        </div>
        <div className="auth-copy">
          <span className="auth-intro">Seu espaço de aprendizagem</span>
          <h1 id="login-heading">Um espaço para aprender.</h1>
          <p>Disciplinas, notas, calendário e atividades. O que você precisa acompanhar, em um só lugar.</p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <TextInput label="Usuário" value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" placeholder="Seu usuário acadêmico" required />
          <TextInput label="Senha" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" placeholder="Sua senha" required />
          <div aria-live="polite"><Alert type="error" message={errorMessage} /></div>
          <Button type="submit" disabled={loading}>{loading ? "Verificando acesso..." : "Entrar no campus"}{!loading && <ArrowRight size={18} aria-hidden="true" />}</Button>
        </form>
        <Link to="/forgot-password" className="auth-link">Esqueci minha senha</Link>
      </section>
      <aside className="auth-visual" aria-label="Visão do Campus Folio">
        <div className="auth-visual-card">
          <span className="folio-tagline">Takion Software / Campus Folio</span>
          <strong>Seu campus, com mais clareza.</strong>
          <p>Uma experiência acadêmica que coloca as prioridades em primeiro lugar e mantém tudo organizado.</p>
          <div className="folio-preview" aria-label="Recursos disponíveis">
            <div><BookOpen size={20} aria-hidden="true" />Disciplinas</div>
            <div><CalendarDays size={20} aria-hidden="true" />Calendário</div>
            <div><LibraryBig size={20} aria-hidden="true" />Materiais</div>
          </div>
        </div>
      </aside>
    </main>
  );
}
export default Login;
