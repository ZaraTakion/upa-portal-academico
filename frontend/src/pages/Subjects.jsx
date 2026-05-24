import { useEffect, useState } from "react";
import api from "../api/axios";
import Loading from "../components/feedback/Loading";
import MainLayout from "../layouts/MainLayout";

function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadSubjects() {
    setLoading(true);

    try {
      const response = await api.get("/academic/subjects/", {
        params: { search },
      });

      setSubjects(response.data);
    } catch (error) {
      console.error("Erro ao carregar disciplinas:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSubjects();
  }, []);

  function handleSubmit(event) {
    event.preventDefault();
    loadSubjects();
  }

  return (
    <MainLayout>
      <h1>Disciplinas</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Buscar disciplina"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <button type="submit">Buscar</button>
      </form>

      {loading ? (
        <Loading text="Carregando disciplinas..." />
      ) : subjects.length === 0 ? (
        <p>Nenhuma disciplina encontrada.</p>
      ) : (
        <ul>
          {subjects.map((subject) => (
            <li key={subject.id}>
              <strong>{subject.name}</strong>
              <p>Código: {subject.code}</p>
              <p>Professor: {subject.professor}</p>
              <p>Carga horária: {subject.workload}h</p>
            </li>
          ))}
        </ul>
      )}
    </MainLayout>
  );
}

export default Subjects;