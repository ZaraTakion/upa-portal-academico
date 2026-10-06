import { Bell, LogOut, Menu, Moon, Sun, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { logout } from "../../utils/auth";
import { getUserRole } from "../../utils/roles";

function Navbar({ onOpenMenu, sidebarOpen = false }) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const role = getUserRole(user);
  const profilePath = role === "student"
    ? "/profile"
    : role === "professor"
      ? "/teacher/classes"
      : "/admin-panel";

  return (
    <header className="navbar">
      <button type="button" className="icon-button menu-button" onClick={onOpenMenu} aria-label="Abrir menu de navegação" aria-expanded={sidebarOpen} aria-controls="primary-navigation">
        <Menu size={20} />
      </button>
      <span className="navbar-title">Portal Acadêmico UPA</span>
      <div className="navbar-actions">
        <Link to="/notifications" className="icon-button" aria-label="Abrir notificações" title="Notificações">
          <Bell size={20} />
        </Link>
        <button type="button" className="icon-button" onClick={toggleTheme} aria-label={theme === "light" ? "Ativar tema escuro" : "Ativar tema claro"}>
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        <Link to={profilePath} className="profile-button">
          <User size={18} />
          <span>{user?.full_name || user?.username || "Usuário"}</span>
        </Link>
        <button type="button" className="logout-button" onClick={logout}>
          <LogOut size={18} />
          <span>Sair</span>
        </button>
      </div>
    </header>
  );
}

export default Navbar;
