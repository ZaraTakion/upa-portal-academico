import { useEffect, useState } from "react";

import api from "../../api/axios";
import EmptyState from "../../components/feedback/EmptyState";
import Loading from "../../components/feedback/Loading";
import MainLayout from "../../components/layout/MainLayout";
import Badge from "../../components/ui/Badge";
import BaseCard from "../../components/ui/BaseCard";
import PageHeader from "../../components/ui/PageHeader";

function Grades() {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadGrades() {
    try {
      const response = await api.get("/academic/grades/");
      setGrades(response.data);
    } catch (error) {
      console.error("Erro ao carregar notas:", error);
    } finally {
      setLoading(false);
    }
  }

  function getProgress(grade) {
    if (grade === null || grade === undefined) return 0;
    return Math.min(Number(grade) * 10, 100);
  }

  useEffect(() => {
    loadGrades();
  }, []);

  return (
    <MainLayout>
      <PageHeader
        eyebrow="Desempenho"
        title="Notas e Faltas"
        description="Acompanhe seu desempenho acadêmico por disciplina."
      />

      {loading ? (
        <Loading text="Carregando notas..." />
      ) : grades.length === 0 ? (
        <EmptyState
          title="Nenhuma nota"
          message="Nenhuma nota cadastrada até o momento."
        />
      ) : (
        <section className="grade-grid">
          {grades.map((grade) => (
            <BaseCard key={grade.id} className="grade-card">
              <div className="card-between">
                <h2>{grade.subject_name}</h2>
                <Badge type={grade.status}>{grade.status_display}</Badge>
              </div>

              <div className="grade-value">
                {grade.grade ?? "Sem nota"}
              </div>

              <div className="progress-bar">
                <div
                  className={`progress-fill progress-${grade.status}`}
                  style={{ width: `${getProgress(grade.grade)}%` }}
                />
              </div>

              <p><strong>Faltas:</strong> {grade.absence}</p>
            </BaseCard>
          ))}
        </section>
      )}
    </MainLayout>
  );
}

export default Grades;