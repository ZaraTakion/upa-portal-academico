import {
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FileText,
  FolderOpen,
  GraduationCap,
  Home,
  Mail,
  Receipt,
  User,
  Users,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Sidebar({ isOpen, isCollapsed, onClose, onToggleCollapse }) {
  const { user } = useAuth();

  const isProfessor = user?.groups?.includes("Professor");
  const isAdmin = user?.is_staff || user?.is_superuser;

  return (
    <aside
      className={`sidebar ${isOpen ? "sidebar-open" : ""} ${
        isCollapsed ? "is-collapsed" : ""
      }`}
    >
      <div className="sidebar-brand">
        <div className="sidebar-logo">U</div>

        <div className="sidebar-brand-text">
          <strong>UPA</strong>
          <span>Portal Acadêmico</span>
        </div>
      </div>

      <button
        type="button"
        className="sidebar-collapse-button"
        onClick={onToggleCollapse}
        aria-label="Recolher menu"
      >
        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" onClick={onClose} title="Dashboard">
          <Home size={20} />
          <span>Dashboard</span>
        </NavLink>

        {!isProfessor && !isAdmin && (
          <>
            <NavLink to="/profile" onClick={onClose} title="Perfil">
              <User size={20} />
              <span>Perfil</span>
            </NavLink>

            <NavLink to="/subjects" onClick={onClose} title="Disciplinas">
              <GraduationCap size={20} />
              <span>Disciplinas</span>
            </NavLink>

            <NavLink to="/grades" onClick={onClose} title="Notas">
              <FileText size={20} />
              <span>Notas</span>
            </NavLink>

            <NavLink to="/calendar" onClick={onClose} title="Calendário">
              <CalendarDays size={20} />
              <span>Calendário</span>
            </NavLink>

            <NavLink to="/files" onClick={onClose} title="Arquivos">
              <FolderOpen size={20} />
              <span>Arquivos</span>
            </NavLink>

            <NavLink to="/financial" onClick={onClose} title="Financeiro">
              <Receipt size={20} />
              <span>Financeiro</span>
            </NavLink>
          </>
        )}

        {isProfessor && (
          <>
            <NavLink to="/teacher/classes" onClick={onClose} title="Minhas Turmas">
              <Users size={20} />
              <span>Minhas Turmas</span>
            </NavLink>

            <NavLink to="/teacher/students" onClick={onClose} title="Alunos">
              <User size={20} />
              <span>Alunos</span>
            </NavLink>

            <NavLink to="/teacher/grades" onClick={onClose} title="Lançar Notas">
              <FileText size={20} />
              <span>Lançar Notas</span>
            </NavLink>

            <NavLink to="/files" onClick={onClose} title="Materiais">
              <FolderOpen size={20} />
              <span>Materiais</span>
            </NavLink>
          </>
        )}

        {isAdmin && (
          <>
            <NavLink to="/admin-panel" onClick={onClose} title="Painel de Gestão">
              <Users size={20} />
              <span>Painel de Gestão</span>
            </NavLink>

            <NavLink to="/calendar" onClick={onClose} title="Calendário">
              <CalendarDays size={20} />
              <span>Calendário</span>
            </NavLink>

            <NavLink to="/financial" onClick={onClose} title="Financeiro">
              <Receipt size={20} />
              <span>Financeiro</span>
            </NavLink>
          </>
        )}

        <NavLink to="/notifications" onClick={onClose} title="Notificações">
          <Bell size={20} />
          <span>Notificações</span>
        </NavLink>

        <NavLink to="/contact" onClick={onClose} title="Contato">
          <Mail size={20} />
          <span>Contato</span>
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;