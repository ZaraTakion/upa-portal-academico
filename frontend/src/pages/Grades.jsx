import { useEffect, useState } from "react";
import api from "../api/axios";
import Loading from "../components/feedback/Loading";
import MainLayout from "../layouts/MainLayout";

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

  useEffect(() => {
    loadGrades();
  }, []);

  return (
    <MainLayout>
      <h1>Notas</h1>

      {loading ? (
        <Loading text="Carregando notas..." />
      ) : grades.length === 0 ? (
        <p>Nenhuma nota encontrada.</p>
      ) : (
        <table border="1">
          <thead>
            <tr>
              <th>Disciplina</th>
              <th>Nota</th>
              <th>Faltas</th>
            </tr>
          </thead>

          <tbody>
            {grades.map((grade) => (
              <tr key={grade.id}>
                <td>{grade.subject_name}</td>
                <td>{grade.grade}</td>
                <td>{grade.absence}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </MainLayout>
  );
}

export default Grades;