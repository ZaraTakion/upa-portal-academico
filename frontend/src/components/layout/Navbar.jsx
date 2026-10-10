import { Bell, LogOut, Menu, Moon, Sun, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { logout } from "../../utils/auth";
import { getRoleHome, getUserRole } from "../../utils/roles";

const labels = {
  "/dashboard": "Visão geral", "/profile": "Meu perfil", "/subjects": "Disciplinas",
  "/grades": "Notas", "/calendar": "Calendário", "/files": "Documentos",
  "/financial": "Financeiro", "/notifications": "Notificações", "/contact": "Atendimento",
  "/teacher/classes": "Minhas turmas", "/teacher/students": "Estudantes",
  "/teacher/assessments": "Avaliações", "/teacher/attendance": "Frequência",
  "/teacher/grades": "Lançamento de notas", "/admin-panel": "Visão operacional",
  "/admin/management": "Gestão do campus",
};

function Navbar({ onOpenMenu, sidebarOpen = false }) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { pathname } = useLocation();
  const role = getUserRole(user);
  const profilePath = role === "student" ? "/profile" : getRoleHome(user);
  return (
    <header className="navbar">
      <button type="button" className="icon-button menu-button" onClick={onOpenMenu}
        aria-label="Abrir menu de navegação" aria-expanded={sidebarOpen} aria-controls="primary-navigation">
        <Menu size={20} />
      </button>
      <span className="navbar-title">
        <span className="folio-crumb-parent">Meu espaço <em>/</em></span>
        <strong>{labels[pathname] || "Campus Folio"}</strong>
      </span>
      <div className="navbar-actions">
        <Link to="/notifications" className="icon-button" aria-label="Abrir notificações" title="Notificações"><Bell size={20} /></Link>
        <button type="button" className="icon-button" onClick={toggleTheme} aria-label={theme === "light" ? "Ativar tema escuro" : "Ativar tema claro"}>
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        <Link to={profilePath} className="profile-button" aria-label="Abrir meu perfil"><User size={18} /><span>{user?.full_name || user?.username || "Usuário"}</span></Link>
        <button type="button" className="logout-button" aria-label="Sair do campus" onClick={() => void logout()}><LogOut size={18} /><span>Sair</span></button>
      </div>
    </header>
  );
}
export default Navbar;
