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
  const [feedback, setFeedback] = useState("");
  const [alertType, setAlertType] = useState("info");

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
      await api.patch(`/academic/grades/${grade.id}/`, {
        grade: grade.grade === "" ? null : grade.grade,
        absence: grade.absence,
      });

      setAlertType("success");
      setFeedback("Nota atualizada com sucesso.");

      loadGrades();
    } catch (error) {
      console.error("Erro ao salvar nota:", error);
      setAlertType("error");
      setFeedback("Erro ao atualizar nota.");
    }
  }

  useEffect(() => {
    loadGrades();
  }, []);

  return (
    <MainLayout>
      <PageHeader
        eyebrow="Professor"
        title="Lançamento de Notas"
        description="Atualize notas e faltas dos alunos."
      />

      <Alert type={alertType} message={feedback} />

      {loading ? (
        <Loading text="Carregando notas..." />
      ) : grades.length === 0 ? (
        <EmptyState title="Nenhuma nota" message="Nenhuma nota encontrada." />
      ) : (
        <div className="table-wrapper">
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
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={grade.grade ?? ""}
                      onChange={(event) =>
                        updateLocalGrade(grade.id, "grade", event.target.value)
                      }
                    />
                  </td>

                  <td>
                    <input
                      type="number"
                      min="0"
                      value={grade.absence ?? 0}
                      onChange={(event) =>
                        updateLocalGrade(grade.id, "absence", event.target.value)
                      }
                    />
                  </td>

                  <td>
                    <Badge type={grade.status}>{grade.status_display}</Badge>
                  </td>

                  <td>
                    <Button variant="secondary" onClick={() => saveGrade(grade)}>
                      <Save size={16} />
                      Salvar
                    </Button>
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