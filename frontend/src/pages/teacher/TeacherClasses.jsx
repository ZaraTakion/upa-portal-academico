import { CalendarCheck2, ClipboardCheck, FileText, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Alert from "../../components/feedback/Alert";
import api from "../../api/axios";
import EmptyState from "../../components/feedback/EmptyState";
import Loading from "../../components/feedback/Loading";
import MainLayout from "../../components/layout/MainLayout";
import Badge from "../../components/ui/Badge";
import BaseCard from "../../components/ui/BaseCard";
import PageHeader from "../../components/ui/PageHeader";

function TeacherClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  async function loadClasses() {
    try {
      const response = await api.get("/academic/class-groups/");
      setClasses(response.data);
    } catch {
      setLoadError("Não foi possível carregar suas turmas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClasses();
  }, []);

  return (
    <MainLayout>
      {loadError && (
        <Alert
          type="error"
          message={loadError}
          onRetry={() => window.location.reload()}
        />
      )}
      <PageHeader
        eyebrow="Professor"
        title="Minhas Turmas"
        description="Escolha uma turma para registrar frequência ou organizar avaliações."
      />

      {loading ? (
        <Loading text="Carregando turmas..." />
      ) : classes.length === 0 ? (
        <EmptyState
          title="Nenhuma turma"
          message="Nenhuma turma vinculada ao professor."
        />
      ) : (
        <>
          <div className="teacher-overview">
            <strong>{classes.length}</strong>
            <p>
              {classes.length === 1 ? "turma vinculada" : "turmas vinculadas"}
              <br />
              <small>Selecione a atividade que deseja realizar.</small>
            </p>
            <Link className="btn btn-secondary" to="/teacher/grades">
              <FileText size={16} aria-hidden="true" />
              Lançar notas
            </Link>
          </div>
          <section className="teacher-class-list">
            {classes.map((item) => (
              <BaseCard className="teacher-class-card" key={item.id}>
                <div className="teacher-class-heading">
                  <Badge type="primary">
                    {item.term_code || item.semester}
                  </Badge>

                  <h2>{item.subject_name}</h2>
                  <p className="teacher-class-name">{item.name}</p>
                </div>
                <div className="teacher-class-meta">
                  <Link
                    to={`/teacher/students?class_group=${encodeURIComponent(item.id)}`}
                    aria-label={`${item.students_count} alunos · Ver lista de ${item.name}`}
                  >
                    <Users size={16} aria-hidden="true" />
                    {item.students_count} alunos · Ver lista
                  </Link>
                  <span>{item.year}</span>
                </div>

                <div
                  className="teacher-class-actions"
                  aria-label={`Ações da turma ${item.name}`}
                >
                  <Link
                    className="btn btn-secondary"
                    to={`/teacher/assessments?class_group=${encodeURIComponent(item.id)}`}
                    aria-label={`Abrir avaliações de ${item.name}`}
                  >
                    <ClipboardCheck size={16} aria-hidden="true" />
                    Avaliações
                  </Link>
                  <Link
                    className="btn btn-secondary"
                    to={`/teacher/attendance?class_group=${encodeURIComponent(item.id)}`}
                    aria-label={`Registrar frequência de ${item.name}`}
                  >
                    <CalendarCheck2 size={16} aria-hidden="true" />
                    Frequência
                  </Link>
                </div>
              </BaseCard>
            ))}
          </section>
        </>
      )}
    </MainLayout>
  );
}

export default TeacherClasses;
