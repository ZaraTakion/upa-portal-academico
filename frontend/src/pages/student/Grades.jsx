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
  const [classGroups, setClassGroups] = useState([]);
  const [selectedClassGroup, setSelectedClassGroup] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadGrades() {
    setLoading(true);
    setError("");
    try {
      const [
        gradesResponse,
        assessmentsResponse,
        resultsResponse,
        classGroupsResponse,
      ] = await Promise.all([
        api.get("/academic/grades/"),
        api.get("/academic/assessments/"),
        api.get("/academic/assessment-results/"),
        api.get("/academic/class-groups/"),
      ]);
      setGrades(gradesResponse.data);
      setAssessments(assessmentsResponse.data);
      setResults(resultsResponse.data);
      setClassGroups(classGroupsResponse.data);
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

  const matchesSelectedClassGroup = (item) => {
    if (selectedClassGroup === "all") return true;
    if (selectedClassGroup === "legacy") return !item.class_group;
    return String(item.class_group) === selectedClassGroup;
  };
  const filteredGrades = grades.filter(matchesSelectedClassGroup);
  const filteredAssessments = assessments.filter(matchesSelectedClassGroup);
  const showClassFilter =
    classGroups.length > 0 ||
    grades.some((grade) => !grade.class_group) ||
    assessments.some((assessment) => !assessment.class_group);

  const resultByAssessment = new Map(results.map((result) => [result.assessment, result]));

  return (
    <MainLayout>
      <PageHeader
        eyebrow="Desempenho"
        title="Notas e avaliações"
        description="Acompanhe suas notas consolidadas, avaliações e devolutivas por turma."
      />

      {error && <Alert type="error" message={error} />}
      {showClassFilter && !loading && (
        <div className="grade-filter">
          <label htmlFor="grade-class-filter">Filtrar notas por turma</label>
          <select
            id="grade-class-filter"
            value={selectedClassGroup}
            onChange={(event) => setSelectedClassGroup(event.target.value)}
          >
            <option value="all">Todas as turmas</option>
            {classGroups.map((classGroup) => (
              <option key={classGroup.id} value={String(classGroup.id)}>
                {classGroup.name} · {classGroup.subject_name}
              </option>
            ))}
            {(grades.some((grade) => !grade.class_group) ||
              assessments.some((assessment) => !assessment.class_group)) && (
              <option value="legacy">Histórico sem turma</option>
            )}
          </select>
        </div>
      )}
      {loading ? (
        <Loading text="Carregando notas..." />
      ) : (
        <>
          <h2>Notas por disciplina</h2>
          {filteredGrades.length === 0 ? (
            <EmptyState
              title={grades.length === 0 ? "Nenhuma nota" : "Nenhuma nota nesta turma"}
              message={
                grades.length === 0
                  ? "Ainda não há notas consolidadas."
                  : "Escolha outra turma ou consulte o histórico sem turma."
              }
            />
          ) : (
            <section className="grade-grid">
              {filteredGrades.map((grade) => (
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
                  <p>
                    <strong>Tentativa:</strong>{" "}
                    {grade.attempt === 2
                      ? "Recuperação"
                      : `Tentativa ${grade.attempt}`}
                  </p>
                  <p>
                    <strong>Turma:</strong>{" "}
                    {grade.class_group_name || "Histórico sem turma"}
                  </p>
                </BaseCard>
              ))}
            </section>
          )}

          <section className="assessment-list">
            <h2>Avaliações e devolutivas</h2>
            {filteredAssessments.length === 0 ? (
              <EmptyState
                title={assessments.length === 0 ? "Sem avaliações" : "Sem avaliações nesta turma"}
                message="As avaliações publicadas pelas turmas selecionadas aparecerão aqui."
              />
            ) : (
              <div className="cards-grid">
                {filteredAssessments.map((assessment) => {
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
