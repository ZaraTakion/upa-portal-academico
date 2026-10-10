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
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getUserRole } from "../../utils/roles";
import Brand from "../brand/Brand";

const menus = {
  student: [
    ["/dashboard", "Dashboard", Home],
    ["/profile", "Perfil", User],
    ["/subjects", "Disciplinas", GraduationCap],
    ["/grades", "Notas", FileText],
    ["/calendar", "Calendário", CalendarDays],
    ["/files", "Arquivos", FolderOpen],
    ["/financial", "Financeiro", Receipt],
  ],
  professor: [
    ["/teacher/classes", "Minhas Turmas", Users],
    ["/teacher/students", "Alunos", User],
    ["/teacher/assessments", "Avaliações", ClipboardCheck],
    ["/teacher/attendance", "Frequência", CalendarCheck2],
    ["/teacher/grades", "Lançar Notas", FileText],
    ["/files", "Materiais", FolderOpen],
  ],
  admin: [
    ["/admin-panel", "Painel de Gestão", Home],
    ["/admin/management?section=users", "Gestão acadêmica", GraduationCap],
    ["/admin/management?section=calendar", "Calendário", CalendarDays],
    ["/admin/management?section=invoices", "Financeiro", Receipt],
  ],
};
export default function Sidebar({
  isOpen,
  isCollapsed,
  onClose,
  onToggleCollapse,
  hidden = false,
}) {
  const { user } = useAuth();
  const role = getUserRole(user);
  const location = useLocation();
  function active(to) {
    const [path, query] = to.split("?");
    if (location.pathname !== path) return false;
    if (!query) return true;
    const section =
      new URLSearchParams(location.search).get("section") || "courses";
    const target = new URLSearchParams(query).get("section");
    return target === "users"
      ? !["calendar", "invoices"].includes(section)
      : section === target;
  }
  function item([to, label, Icon]) {
    const current = active(to);
    return (
      <Link
        key={to}
        to={to}
        onClick={onClose}
        title={label}
        aria-label={label}
        aria-current={current ? "page" : undefined}
        className={current ? "active" : undefined}
      >
        <Icon size={19} aria-hidden="true" />
        <span>{label}</span>
      </Link>
    );
  }
  return (
    <aside
      inert={hidden}
      id="primary-navigation"
      aria-label="Navegação principal"
      className={`sidebar ${isOpen ? "sidebar-open" : ""} ${isCollapsed ? "is-collapsed" : ""}`}
    >
      <button
        type="button"
        className="icon-button sidebar-close"
        onClick={onClose}
        aria-label="Fechar menu de navegação"
      >
        <X size={20} />
      </button>
      <div className="sidebar-brand">
        <Brand />
      </div>
      <nav id="sidebar-nav" className="sidebar-nav">
        <div className="sidebar-section-label">
          {role === "professor"
            ? "Espaço docente"
            : role === "admin"
              ? "Administração"
              : "Vida acadêmica"}
        </div>
        {(menus[role] || menus.student).map(item)}
        <div className="sidebar-section-label">Comunicação</div>
        {[
          ["/notifications", "Notificações", Bell],
          ["/contact", "Atendimento", Mail],
        ].map(item)}
      </nav>
      <div className="sidebar-footer">
        {user && (
          <div className="sidebar-user">
            <strong>{user.full_name || user.username}</strong>
            <span>
              {role === "professor"
                ? "Professor"
                : role === "admin"
                  ? "Administrador"
                  : "Estudante"}
            </span>
          </div>
        )}
        <button
          type="button"
          className="sidebar-collapse-button"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
          aria-expanded={!isCollapsed}
          aria-controls="sidebar-nav"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          <span>Recolher menu</span>
        </button>
        <p>
          Sistema acadêmico independente.
          <br />
          Portfólio · Takion Software
        </p>
      </div>
    </aside>
  );
}
