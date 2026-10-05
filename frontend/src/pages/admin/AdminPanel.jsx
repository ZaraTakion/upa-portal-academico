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

function AdminPanel() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard/summary/")
      .then((response) => setSummary(response.data))
      .catch((error) => console.error("Erro ao carregar gestão:", error))
      .finally(() => setLoading(false));
  }, []);

  return (
    <MainLayout>
      <PageHeader eyebrow="Administração" title="Painel de Gestão" description="Resumo institucional e acesso às ferramentas administrativas." />
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
            <AdminCard icon={<Users />} title="Usuários" text="Gerencie contas, alunos, professores e permissões." to={import.meta.env.VITE_DJANGO_ADMIN_URL || "http://localhost:8000/admin/"} external />
            <AdminCard icon={<GraduationCap />} title="Gestão acadêmica" text="Cursos, períodos, disciplinas, turmas e regra de notas." to="/admin/management?section=courses" />
            <AdminCard icon={<CalendarDays />} title="Calendário" text="Cadastre feriados, provas, eventos e comunicados." to="/admin/management?section=calendar" />
            <AdminCard icon={<Bell />} title="Comunicados" text="Consulte comunicados e notificações institucionais." to="/notifications" />
            <AdminCard icon={<Receipt />} title="Financeiro" text="Acompanhe mensalidades, vencimentos e pendências." to="/financial" />
          </section>
        </>
      )}
    </MainLayout>
  );
}

function AdminCard({ icon, title, text, to, external = false }) {
  return (
    <BaseCard className="admin-card">
      <div className="admin-card-icon">{icon}</div>
      <h2>{title}</h2>
      <p>{text}</p>
      {external
        ? <a href={to} target="_blank" rel="noreferrer">Abrir gestão <span aria-hidden="true">↗</span></a>
        : <Link to={to}>Abrir gestão</Link>}
    </BaseCard>
  );
}

export default AdminPanel;
