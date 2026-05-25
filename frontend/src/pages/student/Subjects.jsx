import { Search } from "lucide-react";
import { useEffect, useState } from "react";

import api from "../../api/axios";
import EmptyState from "../../components/feedback/EmptyState";
import Loading from "../../components/feedback/Loading";
import MainLayout from "../../components/layout/MainLayout";
import Badge from "../../components/ui/Badge";
import BaseCard from "../../components/ui/BaseCard";
import Button from "../../components/ui/Button";
import PageHeader from "../../components/ui/PageHeader";

function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadSubjects() {
    setLoading(true);

    try {
      const response = await api.get("/academic/subjects/", {
        params: {
          search: search || undefined,
          period: period || undefined,
        },
      });

      setSubjects(response.data);
    } catch (error) {
      console.error("Erro ao carregar disciplinas:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(event) {
    event.preventDefault();
    loadSubjects();
  }

  useEffect(() => {
    loadSubjects();
  }, []);

  return (
    <MainLayout>
      <PageHeader
        eyebrow="Vida acadêmica"
        title="Disciplinas"
        description="Consulte disciplinas, professores, carga horária, período e situação."
      />

      <form className="toolbar" onSubmit={handleSearch}>
        <div className="toolbar-input">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar disciplina..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <select value={period} onChange={(event) => setPeriod(event.target.value)}>
          <option value="">Todos os períodos</option>
          <option value="1">1º período</option>
          <option value="2">2º período</option>
          <option value="3">3º período</option>
          <option value="4">4º período</option>
          <option value="5">5º período</option>
          <option value="6">6º período</option>
        </select>

        <Button type="submit" variant="secondary">
          Buscar
        </Button>
      </form>

      {loading ? (
        <Loading text="Carregando disciplinas..." />
      ) : subjects.length === 0 ? (
        <EmptyState
          title="Nenhuma disciplina"
          message="Nenhuma disciplina encontrada para os filtros selecionados."
        />
      ) : (
        <section className="cards-grid">
          {subjects.map((subject) => (
            <BaseCard key={subject.id} className="subject-card">
              <Badge type={subject.status}>{subject.status_display}</Badge>

              <h2>{subject.name}</h2>

              <p><strong>Código:</strong> {subject.code}</p>
              <p><strong>Professor:</strong> {subject.professor}</p>
              <p><strong>Período:</strong> {subject.period}</p>
              <p><strong>Carga horária:</strong> {subject.workload}h</p>
            </BaseCard>
          ))}
        </section>
      )}
    </MainLayout>
  );
}

export default Subjects;