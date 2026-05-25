import {
  Bell,
  CalendarDays,
  Clock,
  CreditCard,
  Target,
  UserCheck,
} from "lucide-react";
import { useEffect, useState } from "react";

import api from "../../api/axios";
import Alert from "../../components/feedback/Alert";
import Loading from "../../components/feedback/Loading";
import MainLayout from "../../components/layout/MainLayout";
import BaseCard from "../../components/ui/BaseCard";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";

function StudentDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadDashboard() {
    try {
      const response = await api.get("/dashboard/summary/");
      setSummary(response.data);
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
      setErrorMessage("Não foi possível carregar o dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <Loading text="Carregando mural acadêmico..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <section className="dashboard-hero">
        <div>
          <span className="eyebrow">{summary?.role || "Aluno"}</span>
          <h1>Olá, {summary?.user?.full_name || "aluno"}</h1>
          <p>
            Seu mural acadêmico está pronto. Veja notas, eventos, agenda e
            pendências em um só lugar.
          </p>
        </div>

        <div className="hero-pill">
          {summary?.student?.course || "Curso"} •{" "}
          {summary?.student?.semester || "-"}º período
        </div>
      </section>

      <Alert type="error" message={errorMessage} />

      {summary && (
        <>
          <section className="stats-grid premium-stats">
            <StatCard
              icon={<Target size={22} />}
              label="Média geral"
              value={summary.average_grade ?? "-"}
              helper="Desempenho atual"
            />

            <StatCard
              icon={<UserCheck size={22} />}
              label="Faltas"
              value={summary.total_absences ?? 0}
              helper="Total registrado"
            />

            <StatCard
              icon={<Bell size={22} />}
              label="Avisos"
              value={summary.unread_notifications ?? 0}
              helper="Não lidos"
            />

            <StatCard
              icon={<CreditCard size={22} />}
              label="Pendências"
              value={summary.pending_invoices ?? 0}
              helper="Financeiro"
            />
          </section>

          <section className="dashboard-grid premium-dashboard-grid">
            <BaseCard className="premium-panel">
              <div className="panel-header">
                <div>
                  <span className="mini-eyebrow">Agenda</span>
                  <h2>Próximos eventos</h2>
                </div>
                <CalendarDays size={20} />
              </div>

              {summary.next_events?.length === 0 ? (
                <p className="empty-text">Nenhum evento próximo.</p>
              ) : (
                <ul className="simple-list">
                  {summary.next_events?.map((event) => (
                    <li key={event.id}>
                      <div>
                        <strong>{event.title}</strong>
                        <p>{event.description}</p>
                      </div>
                      <span>{event.start_date}</span>
                    </li>
                  ))}
                </ul>
              )}
            </BaseCard>

            <BaseCard className="premium-panel accent-panel">
              <div className="panel-header">
                <div>
                  <span className="mini-eyebrow">Semana</span>
                  <h2>Agenda da semana</h2>
                </div>
                <Clock size={20} />
              </div>

              {summary.weekly_schedule?.length === 0 ? (
                <p className="empty-text">Nenhuma aula cadastrada.</p>
              ) : (
                <ul className="simple-list">
                  {summary.weekly_schedule?.map((item) => (
                    <li key={item.id}>
                      <div>
                        <strong>{item.subject}</strong>
                        <p>{item.weekday}</p>
                      </div>
                      <span>
                        {item.start_time} - {item.end_time}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </BaseCard>
          </section>
        </>
      )}
    </MainLayout>
  );
}

export default StudentDashboard;