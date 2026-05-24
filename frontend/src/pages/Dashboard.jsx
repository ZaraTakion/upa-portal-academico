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
      localStorage.setItem("role", response.data.role);
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
        <Loading text="Carregando painel..." />
      </MainLayout>
    );
  }

  if (!summary) {
    return (
      <MainLayout>
        <p>Painel não encontrado.</p>
      </MainLayout>
    );
  }

  if (summary.role === "Professor") {
    return (
      <MainLayout>
        <h1>Painel do Professor</h1>

        <section>
          <h2>Professor</h2>
          <p>Nome: {summary.teacher.full_name}</p>
          <p>Email: {summary.teacher.email}</p>
          <p>Departamento: {summary.teacher.department}</p>
          <p>Código: {summary.teacher.employee_code}</p>
        </section>

        <section>
          <h2>Resumo</h2>
          <p>Total de turmas: {summary.total_classes}</p>
          <p>Total de alunos: {summary.total_students}</p>
          <p>Notas lançadas: {summary.total_grades}</p>
          <p>Notificações não lidas: {summary.unread_notifications}</p>
        </section>

        <section>
          <h2>Minhas Turmas</h2>

          {summary.class_groups.length === 0 ? (
            <p>Nenhuma turma encontrada.</p>
          ) : (
            <ul>
              {summary.class_groups.map((group) => (
                <li key={group.id}>
                  <strong>{group.name}</strong>
                  <p>Disciplina: {group.subject}</p>
                  <p>Período: {group.semester}</p>
                  <p>Ano: {group.year}</p>
                  <p>Alunos: {group.students_count}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2>Próximos Eventos</h2>

          <ul>
            {summary.next_events.map((event) => (
              <li key={event.id}>
                <strong>{event.title}</strong> — {event.event_date}
                <p>{event.description}</p>
              </li>
            ))}
          </ul>
        </section>
      </MainLayout>
    );
  }

  if (summary.role === "Administrador") {
    return (
      <MainLayout>
        <h1>Painel Administrativo</h1>

        <section>
          <h2>Resumo do Sistema</h2>
          <p>Total de alunos: {summary.total_students}</p>
          <p>Total de professores: {summary.total_teachers}</p>
          <p>Total de disciplinas: {summary.total_subjects}</p>
          <p>Total de turmas: {summary.total_class_groups}</p>
          <p>Total de matrículas: {summary.total_enrollments}</p>
          <p>Total de notificações: {summary.total_notifications}</p>
          <p>Total de eventos: {summary.total_events}</p>
        </section>

        <p>
          Para gerenciamento completo, acesse o painel Django Admin em:
          http://127.0.0.1:8000/admin
        </p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <h1>Mural do Aluno</h1>

      <section>
        <h2>Aluno</h2>
        <p>Nome: {summary.student.full_name}</p>
        <p>Email: {summary.student.email || "Não informado"}</p>
        <p>Matrícula: {summary.student.registration}</p>
        <p>Curso: {summary.student.course}</p>
        <p>Semestre: {summary.student.semester}</p>
      </section>

      <section>
        <h2>Resumo Acadêmico</h2>
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