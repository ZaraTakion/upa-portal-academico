import { useEffect, useState } from "react";
import api from "../api/axios";
import Loading from "../components/feedback/Loading";
import MainLayout from "../layouts/MainLayout";

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadDashboard() {
    try {
      const response = await api.get("/dashboard/summary/");
      setSummary(response.data);
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
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
        <Loading text="Carregando dashboard..." />
      </MainLayout>
    );
  }

  if (!summary) {
    return (
      <MainLayout>
        <p>Dashboard não encontrado.</p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <h1>Dashboard Acadêmico</h1>

      <section>
        <h2>Aluno</h2>
        <p>Usuário: {summary.student.username}</p>
        <p>Email: {summary.student.email || "Não informado"}</p>
        <p>Matrícula: {summary.student.registration}</p>
        <p>Curso: {summary.student.course}</p>
        <p>Semestre: {summary.student.semester}</p>
      </section>

      <section>
        <h2>Resumo</h2>
        <p>Total de disciplinas: {summary.total_subjects}</p>
        <p>Média geral: {summary.average_grade}</p>
        <p>Total de faltas: {summary.total_absences}</p>
        <p>Notificações não lidas: {summary.unread_notifications}</p>
      </section>

      <section>
        <h2>Próximos Eventos</h2>

        {summary.next_events.length === 0 ? (
          <p>Nenhum evento encontrado.</p>
        ) : (
          <ul>
            {summary.next_events.map((event) => (
              <li key={event.id}>
                <strong>{event.title}</strong> — {event.event_date}
                <p>{event.description}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </MainLayout>
  );
}

export default Dashboard;