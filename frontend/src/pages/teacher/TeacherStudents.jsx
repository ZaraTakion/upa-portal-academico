import { useEffect, useState } from "react";

import api from "../../api/axios";
import EmptyState from "../../components/feedback/EmptyState";
import Loading from "../../components/feedback/Loading";
import MainLayout from "../../components/layout/MainLayout";
import PageHeader from "../../components/ui/PageHeader";

function TeacherStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadStudents() {
    try {
      const response = await api.get("/academic/class-enrollments/");
      setStudents(response.data);
    } catch (error) {
      console.error("Erro ao carregar alunos:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  return (
    <MainLayout>
      <PageHeader
        eyebrow="Professor"
        title="Alunos por Turma"
        description="Visualize os alunos vinculados às suas turmas."
      />

      {loading ? (
        <Loading text="Carregando alunos..." />
      ) : students.length === 0 ? (
        <EmptyState title="Nenhum aluno" message="Nenhum aluno encontrado nas turmas." />
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Aluno</th>
                <th>Turma</th>
                <th>Disciplina</th>
              </tr>
            </thead>

            <tbody>
              {students.map((item) => (
                <tr key={item.id}>
                  <td>{item.student_name}</td>
                  <td>{item.class_group_name}</td>
                  <td>{item.subject_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </MainLayout>
  );
}

export default TeacherStudents;