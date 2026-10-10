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
  const [errorMessage, setErrorMessage] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({ search: "", period: "" });
  useEffect(() => {
    let active = true;
    async function loadSubjects() {
      setLoading(true);
      setErrorMessage("");
      try {
        const { data } = await api.get("/academic/subjects/", {
          params: { search: appliedFilters.search || undefined, period: appliedFilters.period || undefined },
        });
        if (active) setSubjects(Array.isArray(data) ? data : data.results || []);
      } catch (error) {
        console.error("Erro ao carregar disciplinas:", error);
        if (active) { setSubjects([]); setErrorMessage("Não foi possível consultar as disciplinas. Verifique sua conexão."); }
      } finally { if (active) setLoading(false); }
    }
    loadSubjects();
    return () => { active = false; };
  }, [appliedFilters]);

  function handleSearch(event) {
    event.preventDefault();
    setAppliedFilters({ search: search.trim(), period });
  }
  return (
    <MainLayout>
      <PageHeader eyebrow="Sua vida acadêmica" title="Disciplinas" description="Acompanhe a oferta de disciplinas, os docentes e a carga horária em uma visão organizada." />
      <form className="toolbar folio-toolbar" onSubmit={handleSearch}>
        <div className="toolbar-input"><Search size={18} aria-hidden="true" />
          <input type="search" aria-label="Buscar disciplina" placeholder="Buscar disciplina..." value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        <select aria-label="Filtrar disciplinas por período" value={period} onChange={(event) => setPeriod(event.target.value)}>
          <option value="">Todos os períodos</option>
          {[1, 2, 3, 4, 5, 6].map((value) => <option key={value} value={String(value)}>{value}º período</option>)}
        </select>
        <Button type="submit" variant="secondary">Filtrar</Button>
      </form>
      {loading ? <Loading text="Buscando disciplinas..." /> : errorMessage ? (
        <div className="folio-error" role="alert"><p>{errorMessage}</p><button className="btn btn-secondary" type="button" onClick={() => setAppliedFilters((current) => ({ ...current }))}>Tentar novamente</button></div>
      ) : subjects.length === 0 ? (
        <EmptyState title="Nenhuma disciplina" message="Nenhuma disciplina encontrada. Experimente outros filtros." />
      ) : (
        <section aria-label="Disciplinas encontradas">
          <p className="folio-date-subtitle">{subjects.length} disciplina(s) encontrada(s)</p>
          <div className="table-wrapper folio-subject-table">
            <table><thead><tr><th scope="col">Disciplina</th><th scope="col">Docente(s)</th><th scope="col">Período</th><th scope="col">Carga</th><th scope="col">Status</th></tr></thead>
              <tbody>{subjects.map((subject) => <tr key={subject.id}><td><strong>{subject.name}</strong><p className="folio-date-subtitle">{subject.code}</p></td>
                <td>{subject.professor || "A definir"}</td><td>{subject.period}º</td><td>{subject.workload}h</td><td><Badge type={subject.status}>{subject.status_display}</Badge></td></tr>)}</tbody></table>
          </div>
          <div className="folio-subject-mobile">
            {subjects.map((subject) => <BaseCard className="subject-card" key={subject.id}>
              <Badge type={subject.status}>{subject.status_display}</Badge><h2>{subject.name}</h2>
              <p><strong>Código:</strong> {subject.code}</p><p><strong>Docentes:</strong> {subject.professor || "A definir"}</p>
              <p><strong>Período:</strong> {subject.period}º · <strong>Carga:</strong> {subject.workload}h</p>
            </BaseCard>)}
          </div>
        </section>
      )}
    </MainLayout>
  );
}
export default Subjects;
