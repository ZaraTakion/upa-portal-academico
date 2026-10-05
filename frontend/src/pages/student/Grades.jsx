import { useEffect, useState } from "react";

import api from "../../api/axios";
import { formatDate } from "../../utils/dateFormat";
import Alert from "../../components/feedback/Alert";
import EmptyState from "../../components/feedback/EmptyState";
import Loading from "../../components/feedback/Loading";
import MainLayout from "../../components/layout/MainLayout";
import Badge from "../../components/ui/Badge";
import BaseCard from "../../components/ui/BaseCard";
import PageHeader from "../../components/ui/PageHeader";

function Grades() {
  const [grades, setGrades] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadGrades() {
    setLoading(true);
    setError("");
    try {
      const [gradesResponse, assessmentsResponse, resultsResponse] = await Promise.all([
        api.get("/academic/grades/"),
        api.get("/academic/assessments/"),
        api.get("/academic/assessment-results/"),
      ]);
      setGrades(gradesResponse.data);
      setAssessments(assessmentsResponse.data);
      setResults(resultsResponse.data);
    } catch {
      setError("Não foi possível carregar todas as informações acadêmicas.");
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

  const resultByAssessment = new Map(results.map((result) => [result.assessment, result]));

  return (
    <MainLayout>
      <PageHeader
        eyebrow="Desempenho"
        title="Notas e avaliações"
        description="Acompanhe suas notas consolidadas, avaliações e devolutivas por turma."
      />

      {error && <Alert type="error" message={error} />}
      {loading ? (
        <Loading text="Carregando notas..." />
      ) : (
        <>
          <h2>Notas por disciplina</h2>
          {grades.length === 0 ? (
            <EmptyState title="Nenhuma nota" message="Ainda não há notas consolidadas." />
          ) : (
            <section className="grade-grid">
              {grades.map((grade) => (
                <BaseCard key={grade.id} className="grade-card">
                  <div className="card-between">
                    <h2>{grade.subject_name}</h2>
                    <Badge type={grade.status}>{grade.status_display}</Badge>
                  </div>
                  <div className="grade-value">{grade.grade ?? "Sem nota"}</div>
                  <div className="progress-bar">
                    <div
                      className={`progress-fill progress-${grade.status}`}
                      style={{ width: `${getProgress(grade.grade)}%` }}
                    />
                  </div>
                  <p><strong>Faltas:</strong> {grade.absence}</p>
                  {grade.class_group && <p><strong>Turma:</strong> {grade.class_group}</p>}
                </BaseCard>
              ))}
            </section>
          )}

          <section className="assessment-list">
            <h2>Avaliações e devolutivas</h2>
            {assessments.length === 0 ? (
              <EmptyState title="Sem avaliações" message="As avaliações publicadas pelas suas turmas aparecerão aqui." />
            ) : (
              <div className="cards-grid">
                {assessments.map((assessment) => {
                  const result = resultByAssessment.get(assessment.id);
                  return (
                    <BaseCard key={assessment.id} className="assessment-card">
                      <div className="card-between">
                        <Badge type="primary">{assessment.category.toUpperCase()}</Badge>
                        <span>Peso {assessment.weight}</span>
                      </div>
                      <h3>{assessment.title}</h3>
                      <p>{assessment.subject_name} · {assessment.class_group_name}</p>
                      <p>Nota máxima: {assessment.maximum_score}</p>
                      <p>Prazo: {assessment.due_date ? formatDate(assessment.due_date) : "A definir"}</p>
                      <p><strong>Nota:</strong> {result?.score ?? "Aguardando correção"}</p>
                      {result?.feedback && <p><strong>Devolutiva:</strong> {result.feedback}</p>}
                    </BaseCard>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </MainLayout>
  );
}

export default Grades;
