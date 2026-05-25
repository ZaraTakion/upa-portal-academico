import {
  Bell,
  CalendarDays,
  GraduationCap,
  Receipt,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

import api from "../../api/axios";
import Loading from "../../components/feedback/Loading";
import MainLayout from "../../components/layout/MainLayout";
import BaseCard from "../../components/ui/BaseCard";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";

function AdminPanel() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadAdminData() {
    try {
      const response = await api.get("/dashboard/summary/");
      setSummary(response.data);
    } catch (error) {
      console.error("Erro ao carregar gestão:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  return (
    <MainLayout>
      <PageHeader
        eyebrow="Administração"
        title="Painel de Gestão"
        description="Resumo institucional do sistema acadêmico."
      />

      {loading ? (
        <Loading text="Carregando painel administrativo..." />
      ) : (
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
              text="Gerencie alunos, professores e permissões pelo Django Admin."
            />

            <AdminCard
              icon={<GraduationCap />}
              title="Acadêmico"
              text="Controle disciplinas, turmas, matrículas e notas."
            />

            <AdminCard
              icon={<CalendarDays />}
              title="Calendário"
              text="Cadastre feriados, provas, eventos e comunicados."
            />

            <AdminCard
              icon={<Bell />}
              title="Comunicados"
              text="Envie avisos acadêmicos, eventos, estágios e oportunidades."
            />

            <AdminCard
              icon={<Receipt />}
              title="Financeiro"
              text="Acompanhe mensalidades, vencimentos e pendências."
            />
          </section>
        </>
      )}
    </MainLayout>
  );
}

function AdminCard({ icon, title, text }) {
  return (
    <BaseCard className="admin-card">
      <div className="admin-card-icon">{icon}</div>
      <h2>{title}</h2>
      <p>{text}</p>
    </BaseCard>
  );
}

export default AdminPanel;