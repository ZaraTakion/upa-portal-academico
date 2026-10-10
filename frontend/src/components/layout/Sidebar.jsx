import {
  Bell,
  CalendarCheck2,
  ClipboardCheck,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FileText,
  FolderOpen,
  GraduationCap,
  Home,
  X,
  Mail,
  Receipt,
  User,
  Users,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getUserRole } from "../../utils/roles";

function Sidebar({ isOpen, isCollapsed, onClose, onToggleCollapse, hidden = false }) {
  const { user } = useAuth();

  const role = getUserRole(user);
  const isProfessor = role === "professor";
  const isAdmin = role === "admin";
  const isStudent = role === "student";

  return (
    <aside
      inert={hidden}
      id="primary-navigation"
      aria-label="Navegação principal"
      className={`sidebar ${isOpen ? "sidebar-open" : ""} ${isCollapsed ? "is-collapsed" : ""}`}
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
        aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
        aria-expanded={!isCollapsed}
        aria-controls="sidebar-nav"
      >
        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      <button type="button" className="icon-button sidebar-close" onClick={onClose} aria-label="Fechar menu de navegação"><X size={20} /></button>
      <nav id="sidebar-nav" className="sidebar-nav">
        {isStudent && (
          <NavLink to="/dashboard" onClick={onClose} title="Dashboard">
            <Home size={20} />
            <span>Dashboard</span>
          </NavLink>
        )}

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

            <NavLink to="/teacher/assessments" onClick={onClose} title="Avaliações">
              <ClipboardCheck size={20} />
              <span>Avaliações</span>
            </NavLink>

            <NavLink to="/teacher/attendance" onClick={onClose} title="Frequência">
              <CalendarCheck2 size={20} />
              <span>Frequência</span>
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

            <NavLink to="/admin/management?section=calendar" onClick={onClose} title="Calendário">
              <CalendarDays size={20} />
              <span>Calendário</span>
            </NavLink>

            <NavLink to="/admin/management?section=users" onClick={onClose} title="Gestão acadêmica">
              <GraduationCap size={20} /><span>Gestão acadêmica</span>
            </NavLink>
            <NavLink to="/admin/management?section=invoices" onClick={onClose} title="Financeiro">
              <Receipt size={20} /><span>Financeiro</span>
            </NavLink>
          </>
        )}

        <NavLink to="/notifications" onClick={onClose} title="Notificações">
          <Bell size={20} />
          <span>Notificações</span>
        </NavLink>

        <NavLink to="/contact" onClick={onClose} title="Atendimento">
          <Mail size={20} />
          <span>Atendimento</span>
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;
