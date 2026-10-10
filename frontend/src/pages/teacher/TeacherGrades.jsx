import { Save } from "lucide-react";
import { useEffect, useState } from "react";

import api from "../../api/axios";
import Alert from "../../components/feedback/Alert";
import EmptyState from "../../components/feedback/EmptyState";
import Loading from "../../components/feedback/Loading";
import MainLayout from "../../components/layout/MainLayout";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import PageHeader from "../../components/ui/PageHeader";

function TeacherGrades() {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [alertType, setAlertType] = useState("info");

  async function loadGrades() {
    try {
      const response = await api.get("/academic/grades/");
      setGrades(response.data);
    } catch {
      setLoadError("Não foi possível carregar as notas.");
    } finally {
      setLoading(false);
    }
  }

  function updateLocalGrade(id, field, value) {
    setGrades((currentGrades) =>
      currentGrades.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  }

  async function saveGrade(grade) {
    setFeedback("");

    try {
      const payload = {
        grade: grade.grade === "" ? null : grade.grade,
      };
      if (!grade.absence_is_tracked) {
        payload.absence = grade.absence;
      }

      await api.patch(`/academic/grades/${grade.id}/`, payload);

      setAlertType("success");
      setFeedback("Nota atualizada com sucesso.");

      loadGrades();
    } catch {
      setAlertType("error");
      setFeedback("Erro ao atualizar nota.");
    }
  }

  useEffect(() => {
    loadGrades();
  }, []);

  return (
    <MainLayout>
      {loadError && <Alert type="error" message={loadError} onRetry={() => window.location.reload()} />}
      <PageHeader
        eyebrow="Professor"
        title="Lançamento de Notas"
        description="Atualize as notas. Nas turmas com frequência registrada, as faltas são calculadas automaticamente."
      />

      <Alert type={alertType} message={feedback} />

      {loading ? (
        <Loading text="Carregando notas..." />
      ) : grades.length === 0 ? (
        <EmptyState title="Nenhuma nota" message="Nenhuma nota encontrada." />
      ) : (
        <div className="table-wrapper" tabIndex={0} role="region" aria-label="Notas dos estudantes">
          <table>
            <thead>
              <tr>
                <th>Aluno</th>
                <th>Disciplina</th>
                <th>Nota</th>
                <th>Faltas</th>
                <th>Status</th>
                <th>Ação</th>
              </tr>
            </thead>

            <tbody>
              {grades.map((grade) => (
                <tr key={grade.id}>
                  <td>{grade.student_name}</td>
                  <td>{grade.subject_name}</td>

                  <td>
                    {grade.grade_is_calculated ? (
                      <span>
                        {grade.grade ?? "—"}
                        <small style={{ display: "block" }}>Calculada pelas avaliações</small>
                      </span>
                    ) : (
                      <input
                        type="number"
                        aria-label={`Nota de ${grade.student_name} em ${grade.subject_name}`}
                        min="0"
                        max="10"
                        step="0.1"
                        value={grade.grade ?? ""}
                        onChange={(event) =>
                          updateLocalGrade(grade.id, "grade", event.target.value)
                        }
                      />
                    )}
                  </td>

                  <td>
                    {grade.absence_is_tracked ? (
                      <span>
                        {grade.absence ?? 0}
                        <small style={{ display: "block" }}>Calculadas pela frequência</small>
                      </span>
                    ) : (
                      <input
                        type="number"
                        aria-label={`Faltas de ${grade.student_name} em ${grade.subject_name}`}
                        min="0"
                        value={grade.absence ?? 0}
                        onChange={(event) =>
                          updateLocalGrade(grade.id, "absence", event.target.value)
                        }
                      />
                    )}
                  </td>

                  <td>
                    <Badge type={grade.status}>{grade.status_display}</Badge>
                  </td>

                  <td>
                    {grade.grade_is_calculated ? (
                      <span>Atualização automática</span>
                    ) : (
                      <Button variant="secondary" onClick={() => saveGrade(grade)}>
                        <Save size={16} />
                        Salvar
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </MainLayout>
  );
}

export default TeacherGrades;