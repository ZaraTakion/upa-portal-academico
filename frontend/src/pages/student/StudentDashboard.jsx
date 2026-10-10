import { Bell, BookOpen, CalendarDays, Clock3, Target, Wallet } from "lucide-react";
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
      const { data } = await api.get("/dashboard/summary/");
      setSummary(data);
    } catch (error) {
      console.error("Erro ao carregar o campus:", error);
      setSummary(null);
      setErrorMessage("Não foi possível carregar os dados acadêmicos. Confirme sua conexão e tente novamente.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { loadDashboard(); }, []);
  if (loading) return <MainLayout><Loading text="Carregando seu campus..." /></MainLayout>;
  if (!summary) {
    return (
      <MainLayout><section className="dashboard-feedback" role="alert" aria-labelledby="dashboard-error-title">
        <span className="eyebrow">Campus Folio</span>
        <h1 id="dashboard-error-title">Não foi possível carregar o dashboard</h1>
        <p>{errorMessage}</p>
        <button className="btn btn-primary" type="button" onClick={loadDashboard}>Tentar novamente</button>
      </section></MainLayout>
    );
  }
  const events = summary.next_events ?? [];
  const schedule = summary.weekly_schedule ?? [];
  const next = findNextClass(schedule);
  return (
    <MainLayout>
      <div className="folio-view">
        <section className="dashboard-hero" aria-labelledby="campus-greeting">
          <div>
            <span className="eyebrow">Seu espaço de aprendizagem</span>
            <h1 id="campus-greeting">Olá, {summary.user?.full_name || "estudante"}</h1>
            <p>Suas disciplinas, sua agenda e o que precisa de atenção, organizados em um só lugar.</p>
          </div>
          <span className="hero-pill">{summary.student?.course || "Curso"} · {summary.student?.semester || "-"}º período</span>
        </section>

        <section className="stats-grid folio-stats" aria-label="Resumo acadêmico">
          <StatCard icon={<BookOpen size={22} />} label="Disciplinas" value={summary.total_subjects ?? 0} helper="Matrículas vigentes" />
          <StatCard icon={<Target size={22} />} label="Média geral" value={summary.average_grade ?? "—"} helper="Desempenho registrado" />
          <StatCard icon={<Bell size={22} />} label="Avisos" value={summary.unread_notifications ?? 0} helper="Não lidos" />
          <StatCard icon={<Wallet size={22} />} label="Financeiro" value={summary.pending_invoices ?? 0} helper="Pendências" />
        </section>

        <section className="folio-priority" aria-label="Suas prioridades">
          <BaseCard className="folio-feature">
            <div className="panel-header"><div><span className="mini-eyebrow">Agenda</span><h2>Sua próxima aula</h2></div><Clock3 size={20} aria-hidden="true" /></div>
            {next ? (
              <div className="folio-feature-main">
                <div><strong>{next.subject}</strong><p>{next.weekday} · {next.start_time.slice(0, 5)}–{next.end_time.slice(0, 5)}{next.location ? ` · ${next.location}` : ""}</p></div>
                <div className="folio-day-chip">{next.dayOffset === 0 ? "Hoje" : next.dayOffset === 1 ? "Amanhã" : "Em " + next.dayOffset + " dias"}</div>
              </div>
            ) : <p className="folio-empty">Não há aulas cadastradas para sua agenda.</p>}
            <div className="folio-quick-links"><Link to="/calendar">Ver calendário</Link><Link to="/subjects">Ver disciplinas</Link></div>
          </BaseCard>
          <BaseCard className="folio-attention">
            <div className="panel-header"><div><span className="mini-eyebrow">Para acompanhar</span><h2>O que pede sua atenção</h2></div><Bell size={20} aria-hidden="true" /></div>
            <p>{summary.unread_notifications ? `${summary.unread_notifications} aviso(s) não lido(s).` : "Você não tem avisos novos."}</p>
            <p>{summary.pending_invoices ? `${summary.pending_invoices} pendência(s) financeira(s).` : "Nenhuma pendência financeira registrada."}</p>
            <div className="folio-quick-links"><Link to="/notifications">Notificações</Link><Link to="/financial">Financeiro</Link></div>
          </BaseCard>
        </section>

        <section className="folio-dashboard-grid" aria-label="Agenda e eventos">
          <BaseCard className="premium-panel">
            <div className="panel-header"><div><span className="mini-eyebrow">Minha semana</span><h2>Agenda de aulas</h2></div><CalendarDays size={20} aria-hidden="true" /></div>
            {!schedule.length ? <p className="folio-empty">Nenhuma aula cadastrada.</p> : (
              <ul className="simple-list">
                {schedule.map((item) => <li key={item.id}><div><strong>{item.subject}</strong><p>{item.weekday}{item.location ? ` · ${item.location}` : ""}</p></div>
                  <span>{item.start_time.slice(0,5)}–{item.end_time.slice(0,5)}</span></li>)}
              </ul>
            )}
            <Link className="folio-section-link" to="/calendar">Abrir calendário</Link>
          </BaseCard>
          <BaseCard className="premium-panel">
            <div className="panel-header"><div><span className="mini-eyebrow">Próximos compromissos</span><h2>Eventos acadêmicos</h2></div><CalendarDays size={20} aria-hidden="true" /></div>
            {!events.length ? <p className="folio-empty">Nenhum evento futuro cadastrado.</p> : (
              <ul className="simple-list">
                {events.map((event) => <li key={event.id}><div><strong>{event.title}</strong>{event.description && <p>{event.description}</p>}</div>
                  <time dateTime={event.start_date}>{formatDate(event.start_date)}</time></li>)}
              </ul>
            )}
            <Link className="folio-section-link" to="/calendar">Ver todos os eventos</Link>
          </BaseCard>
        </section>
      </div>
    </MainLayout>
  );
}
export default StudentDashboard;
