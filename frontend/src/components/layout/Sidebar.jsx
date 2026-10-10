import {
  Bell, BookOpen, CalendarCheck2, CalendarDays, ChevronLeft, ChevronRight,
  ClipboardCheck, FileText, FolderOpen, Home, Mail, Receipt, User, Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { buildAdminUrl } from "../../utils/adminUrl";
import { getUserRole } from "../../utils/roles";

function Sidebar({ isOpen, isCollapsed, onClose, onToggleCollapse }) {
  const { user } = useAuth();
  const role = getUserRole(user);
  const invoiceAdminUrl = buildAdminUrl(
    import.meta.env.VITE_DJANGO_ADMIN_URL,
    "management_app/financialinvoice/",
    { allowLocalhost: import.meta.env.DEV },
  );
  const link = (to, label, Icon) => (
    <NavLink key={to} to={to} onClick={onClose} title={label}>
      <Icon size={19} aria-hidden="true" /><span>{label}</span>
    </NavLink>
  );
  return (
    <aside id="primary-navigation" aria-label="Navegação principal"
      className={\`sidebar \${isOpen ? "sidebar-open" : ""} \${isCollapsed ? "is-collapsed" : ""}\`}>
      <div className="sidebar-brand">
        <div className="sidebar-logo" aria-hidden="true">T</div>
        <div className="sidebar-brand-text"><strong>takion campus</strong><span>Campus Folio</span></div>
      </div>
      <button type="button" className="sidebar-collapse-button" onClick={onToggleCollapse}
        aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"} aria-expanded={!isCollapsed} aria-controls="sidebar-nav">
        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
      <nav id="sidebar-nav" className="sidebar-nav">
        <div className="sidebar-nav-group">Workspace</div>
        {role === "student" && (
          <>
            {link("/dashboard", "Visão geral", Home)}
            {link("/subjects", "Disciplinas", BookOpen)}
            {link("/calendar", "Calendário", CalendarDays)}
            {link("/grades", "Notas", FileText)}
            {link("/files", "Materiais", FolderOpen)}
          </>
        )}
        {role === "professor" && (
          <>
            {link("/teacher/classes", "Minhas turmas", Users)}
            {link("/teacher/students", "Estudantes", User)}
            {link("/teacher/assessments", "Avaliações", ClipboardCheck)}
            {link("/teacher/attendance", "Frequência", CalendarCheck2)}
            {link("/teacher/grades", "Lançar notas", FileText)}
            {link("/files", "Materiais", FolderOpen)}
          </>
        )}
        {role === "admin" && (
          <>
            {link("/admin-panel", "Visão operacional", Home)}
            {link("/admin/management?section=calendar", "Calendário", CalendarDays)}
            {invoiceAdminUrl && (
              <a href={invoiceAdminUrl} target="_blank" rel="noreferrer" title="Financeiro">
                <Receipt size={19} aria-hidden="true" /><span>Financeiro</span>
              </a>
            )}
          </>
        )}
        <div className="sidebar-nav-group">Minha conta</div>
        {role === "student" && (
          <>
            {link("/profile", "Meu perfil", User)}
            {link("/financial", "Financeiro", Receipt)}
          </>
        )}
        {link("/notifications", "Notificações", Bell)}
        {link("/contact", "Atendimento", Mail)}
      </nav>
    </aside>
  );
}
export default Sidebar;
