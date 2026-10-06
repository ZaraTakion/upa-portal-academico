import {
  Bell,
  CalendarDays,
  Clock,
  CreditCard,
  Target,
  UserCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../../api/axios";
import { formatDate } from "../../utils/dateFormat";
import Loading from "../../components/feedback/Loading";
import MainLayout from "../../components/layout/MainLayout";
import BaseCard from "../../components/ui/BaseCard";
import StatCard from "../../components/ui/StatCard";

function StudentDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await api.get("/dashboard/summary/");
      setSummary(response.data);
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
      setSummary(null);
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

  if (!summary) {
    return (
      <MainLayout>
        <section className="dashboard-feedback" role="alert" aria-labelledby="dashboard-error-title">
          <span className="eyebrow">Mural acadêmico</span>
          <h1 id="dashboard-error-title">Não foi possível carregar o dashboard</h1>
          <p>{errorMessage || "Os dados do seu mural não estão disponíveis agora."}</p>
          <button className="btn btn-primary" type="button" onClick={loadDashboard}>
            Tentar novamente
          </button>
        </section>
      </MainLayout>
    );
  }

  const nextEvents = summary.next_events ?? [];
  const weeklySchedule = summary.weekly_schedule ?? [];

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
            <BaseCard className="premium-panel" aria-labelledby="dashboard-events-title">
              <div className="panel-header">
                <div>
                  <span className="mini-eyebrow">Agenda</span>
                  <h2 id="dashboard-events-title">Próximos eventos</h2>
                </div>
                <CalendarDays size={20} aria-hidden="true" />
              </div>

              {nextEvents.length === 0 ? (
                <div className="dashboard-empty-state">
                  <p className="empty-text" role="status">Nenhum evento próximo.</p>
                  <Link className="dashboard-empty-link" to="/calendar">Abrir calendário</Link>
                </div>
              ) : (
                <ul className="simple-list">
                  {nextEvents.map((event) => (
                    <li key={event.id}>
                      <div>
                        <strong>{event.title}</strong>
                        {event.description && <p>{event.description}</p>}
                      </div>
                      <time dateTime={event.start_date}>{formatDate(event.start_date)}</time>
                    </li>
                  ))}
                </ul>
              )}
            </BaseCard>

            <BaseCard className="premium-panel accent-panel" aria-labelledby="dashboard-week-title">
              <div className="panel-header">
                <div>
                  <span className="mini-eyebrow">Semana</span>
                  <h2 id="dashboard-week-title">Agenda da semana</h2>
                </div>
                <Clock size={20} aria-hidden="true" />
              </div>

              {weeklySchedule.length === 0 ? (
                <div className="dashboard-empty-state">
                  <p className="empty-text" role="status">Nenhuma aula cadastrada.</p>
                  <Link className="dashboard-empty-link" to="/subjects">Ver disciplinas</Link>
                </div>
              ) : (
                <ul className="simple-list">
                  {weeklySchedule.map((item) => (
                    <li key={item.id}>
                      <div>
                        <strong>{item.subject}</strong>
                        <p>{item.weekday}</p>
                      </div>
                      <span>
                        <time dateTime={item.start_time}>{item.start_time}</time>
                        {" - "}
                        <time dateTime={item.end_time}>{item.end_time}</time>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </BaseCard>
      </section>
    </MainLayout>
  );
}

export default StudentDashboard;