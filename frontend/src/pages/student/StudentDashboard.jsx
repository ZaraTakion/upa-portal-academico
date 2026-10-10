import {
  ArrowUpRight,
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
import { findNextClass } from "../../utils/nextClass";
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
    } catch {
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
        <section
          className="dashboard-feedback"
          role="alert"
          aria-labelledby="dashboard-error-title"
        >
          <span className="eyebrow">Mural acadêmico</span>
          <h1 id="dashboard-error-title">
            Não foi possível carregar o dashboard
          </h1>
          <p>
            {errorMessage ||
              "Os dados do seu mural não estão disponíveis agora."}
          </p>
          <button
            className="btn btn-primary"
            type="button"
            onClick={loadDashboard}
          >
            Tentar novamente
          </button>
        </section>
      </MainLayout>
    );
  }

  const nextEvents = summary.next_events ?? [];
  const weeklySchedule = summary.weekly_schedule ?? [];
  const nextClass = findNextClass(weeklySchedule);

  return (
    <MainLayout>
      <section className="dashboard-hero">
        <div>
          <span className="eyebrow">{summary.role || "Aluno"}</span>
          <h1>Olá, {summary.user?.full_name || "aluno"}</h1>
          <p>
            Seu percurso, em perspectiva. Acompanhe o desempenho e organize os
            próximos compromissos.
          </p>
        </div>

        <div className="hero-pill">
          {summary.student?.course || "Curso"} •{" "}
          {summary.student?.semester || "-"}º período
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

      <nav className="dashboard-shortcuts" aria-label="Atalhos acadêmicos">
        <Link to="/subjects">
          Explorar disciplinas <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
        <Link to="/grades">
          Consultar notas <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
        <Link to="/notifications">
          Ler avisos <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
      </nav>
      <section
        className="dashboard-grid premium-dashboard-grid"
        aria-label="Agenda acadêmica"
      >
        <BaseCard
          className="premium-panel"
          aria-labelledby="dashboard-events-title"
        >
          <div className="panel-header">
            <div>
              <span className="mini-eyebrow">Agenda</span>
              <h2 id="dashboard-events-title">Próximos eventos</h2>
            </div>
            <CalendarDays size={20} aria-hidden="true" />
          </div>

          {nextEvents.length === 0 ? (
            <div className="dashboard-empty-state">
              <p className="empty-text" role="status">
                Nenhum evento próximo.
              </p>
              <Link className="dashboard-empty-link" to="/calendar">
                Abrir calendário
              </Link>
            </div>
          ) : (
            <ul className="simple-list">
              {nextEvents.map((event) => (
                <li key={event.id}>
                  <div>
                    <strong>{event.title}</strong>
                    {event.description && <p>{event.description}</p>}
                  </div>
                  <time dateTime={event.start_date}>
                    {formatDate(event.start_date)}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </BaseCard>

        <BaseCard
          className="premium-panel accent-panel"
          aria-labelledby="dashboard-week-title"
        >
          <div className="panel-header">
            <div>
              <span className="mini-eyebrow">Semana</span>
              <h2 id="dashboard-week-title">Agenda da semana</h2>
            </div>
            <Clock size={20} aria-hidden="true" />
          </div>

          {nextClass && <p className="helper-text">Próxima aula: {nextClass.subject} · {nextClass.dayOffset === 0 ? "Hoje" : nextClass.dayOffset === 1 ? "Amanhã" : `Em ${nextClass.dayOffset} dias`} · {nextClass.start_time.slice(0, 5)}</p>}
          {weeklySchedule.length === 0 ? (
            <div className="dashboard-empty-state">
              <p className="empty-text" role="status">
                Nenhuma aula cadastrada.
              </p>
              <Link className="dashboard-empty-link" to="/subjects">
                Ver disciplinas
              </Link>
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
