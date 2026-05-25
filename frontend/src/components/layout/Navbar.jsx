import { Bell, LogOut, Moon, Search, Sun, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { logout } from "../../utils/auth";

function Navbar() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="navbar">
      <div className="search-box">
        <Search size={18} />
        <input type="text" placeholder="Buscar no portal..." />
      </div>

      <div className="navbar-actions">
        <button type="button" className="icon-button" aria-label="Notificações">
          <Bell size={20} />
        </button>

        <button
          type="button"
          className="icon-button"
          onClick={toggleTheme}
          aria-label="Alternar tema"
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <button type="button" className="profile-button">
          <User size={18} />
          <span>{user?.full_name || user?.username || "Usuário"}</span>
        </button>

        <button type="button" className="logout-button" onClick={logout}>
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </header>
  );
}

export default Navbar;