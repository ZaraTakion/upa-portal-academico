import {
  Bell,
  CalendarDays,
  GraduationCap,
  Receipt,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../../api/axios";
import Loading from "../../components/feedback/Loading";
import MainLayout from "../../components/layout/MainLayout";
import BaseCard from "../../components/ui/BaseCard";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import Alert from "../../components/feedback/Alert";

function AdminPanel() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/dashboard/summary/")
      .then((response) => setSummary(response.data))
      .catch(() => setError("Não foi possível carregar os indicadores administrativos."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <MainLayout>
      <PageHeader eyebrow="Administração" title="Painel de Gestão" description="Resumo institucional e acesso às ferramentas administrativas." />
      {error && <Alert type="error" message={error} />}
      {loading ? <Loading text="Carregando painel administrativo..." /> : (
        <>
          <section className="stats-grid">
            <StatCard label="Alunos" value={summary?.total_students ?? 0} />
            <StatCard label="Professores" value={summary?.total_teachers ?? 0} />
            <StatCard label="Disciplinas" value={summary?.total_subjects ?? 0} />
            <StatCard label="Turmas" value={summary?.total_class_groups ?? 0} />
            <StatCard label="Eventos" value={summary?.total_events ?? 0} />
            <StatCard label="Notificações" value={summary?.total_notifications ?? 0} />
            <StatCard label="Financeiro" value={summary?.total_invoices ?? 0} />
          </section>
          <section className="cards-grid">
            <AdminCard
              icon={<Users />}
              title="Usuários"
              text="Gerencie contas, alunos, professores e permissões."
              to="/admin/management?section=users"
            />
            <AdminCard icon={<GraduationCap />} title="Gestão acadêmica" text="Cursos, períodos, disciplinas, turmas e regra de notas." to="/admin/management?section=courses" />
            <AdminCard icon={<CalendarDays />} title="Calendário" text="Cadastre feriados, provas, eventos e comunicados." to="/admin/management?section=calendar" />
            <AdminCard icon={<Bell />} title="Comunicados" text="Consulte comunicados e notificações institucionais." to="/admin/management?section=notifications" />
            <AdminCard
              icon={<Receipt />}
              title="Financeiro"
              text="Registre cobranças, titulares, vencimentos e situação financeira."
              to="/admin/management?section=invoices"
            />
          </section>
        </>
      )}
    </MainLayout>
  );
}

function AdminCard({ icon, title, text, to, external = false, unavailableText }) {
  return (
    <BaseCard className="admin-card">
      <div className="admin-card-icon">{icon}</div>
      <h2>{title}</h2>
      <p>{text}</p>
      {to
        ? external
          ? <a href={to} target="_blank" rel="noreferrer">Abrir gestão <span aria-hidden="true">↗</span></a>
          : <Link to={to}>Abrir gestão</Link>
        : <p className="admin-card-unavailable" role="status">{unavailableText}</p>}
    </BaseCard>
  );
}

export default AdminPanel;
