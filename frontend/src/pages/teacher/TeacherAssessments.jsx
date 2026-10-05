import { Plus, Save } from "lucide-react";
import { useEffect, useState } from "react";

import api from "../../api/axios";
import { formatDate } from "../../utils/dateFormat";
import Alert from "../../components/feedback/Alert";
import EmptyState from "../../components/feedback/EmptyState";
import Loading from "../../components/feedback/Loading";
import MainLayout from "../../components/layout/MainLayout";
import Button from "../../components/ui/Button";
import PageHeader from "../../components/ui/PageHeader";
import SelectInput from "../../components/ui/SelectInput";
import TextInput from "../../components/ui/TextInput";

function TeacherAssessments() {
  const [groups, setGroups] = useState([]);
  const [groupId, setGroupId] = useState("");
  const [assessments, setAssessments] = useState([]);
  const [roster, setRoster] = useState([]);
  const [results, setResults] = useState([]);
  const [scores, setScores] = useState({});
  const [draft, setDraft] = useState({ title: "", category: "n1", weight: "1", maximum_score: "10", due_date: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadAssessments() {
    if (!groupId) return;
    setLoading(true);
    try {
      const [assessmentResponse, rosterResponse, resultResponse] = await Promise.all([
        api.get(`/academic/assessments/?class_group=${groupId}`),
        api.get(`/academic/class-enrollments/?class_group=${groupId}&status=active`),
        api.get(`/academic/assessment-results/?class_group=${groupId}`),
      ]);
      setAssessments(assessmentResponse.data);
      setRoster(rosterResponse.data);
      setResults(resultResponse.data);
      const initial = {};
      resultResponse.data.forEach((result) => {
        initial[`${result.assessment}:${result.student}`] = result.score ?? "";
      });
      setScores(initial);
    } catch {
      setMessage("Não foi possível carregar as avaliações desta turma.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    api.get("/academic/class-groups/")
      .then((response) => {
        setGroups(response.data);
        if (response.data.length) setGroupId(String(response.data[0].id));
      })
      .catch(() => setMessage("Não foi possível carregar suas turmas."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadAssessments();
  }, [groupId]);

  async function createAssessment(event) {
    event.preventDefault();
    if (!groupId) return;
    setSaving(true);
    setMessage("");
    try {
      await api.post("/academic/assessments/", {
        ...draft,
        class_group: Number(groupId),
        weight: Number(draft.weight),
        maximum_score: Number(draft.maximum_score),
        due_date: draft.due_date || null,
      });
      setDraft({ title: "", category: "n1", weight: "1", maximum_score: "10", due_date: "" });
      setMessage("Avaliação criada.");
      await loadAssessments();
    } catch (error) {
      const details = error.response?.data;
      setMessage(details ? Object.values(details).flat().join(" ") : "Não foi possível criar a avaliação.");
    } finally {
      setSaving(false);
    }
  }

  async function saveResult(assessment, studentId) {
    const key = `${assessment.id}:${studentId}`;
    const existing = results.find((item) => item.assessment === assessment.id && item.student === studentId);
    const score = scores[key] === "" ? null : Number(scores[key]);
    setSaving(true);
    try {
      const payload = { score };
      if (existing) {
        await api.patch(`/academic/assessment-results/${existing.id}/`, payload);
      } else {
        await api.post("/academic/assessment-results/", {
          assessment: assessment.id,
          student: studentId,
          ...payload,
        });
      }
      setMessage("Nota salva.");
      await loadAssessments();
    } catch (error) {
      const details = error.response?.data;
      setMessage(details ? Object.values(details).flat().join(" ") : "Não foi possível salvar a nota.");
    } finally {
      setSaving(false);
    }
  }

  const groupOptions = groups.map((group) => ({
    value: group.id,
    label: `${group.subject_name} — ${group.name}`,
  }));

  return (
    <MainLayout>
      <PageHeader eyebrow="Professor" title="Avaliações e notas" description="Crie avaliações com peso e prazo e registre as notas de cada estudante." />
      <section className="base-card form-card">
        <SelectInput label="Turma" value={groupId} onChange={(event) => setGroupId(event.target.value)} options={groupOptions} required />
        <form className="form-stack assessment-create" onSubmit={createAssessment}>
          <h2>Nova avaliação</h2>
          <TextInput label="Título" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} required maxLength={200} />
          <div className="toolbar">
            <SelectInput
              label="Categoria"
              value={draft.category}
              onChange={(event) => setDraft({ ...draft, category: event.target.value })}
              options={[
                { value: "n1", label: "N1" },
                { value: "n2", label: "N2" },
                { value: "project", label: "Projeto" },
                { value: "recovery", label: "Recuperação" },
                { value: "other", label: "Outra" },
              ]}
            />
            <TextInput label="Peso" type="number" min="0.01" step="0.01" value={draft.weight} onChange={(event) => setDraft({ ...draft, weight: event.target.value })} required />
            <TextInput label="Nota máxima" type="number" min="0.01" step="0.01" value={draft.maximum_score} onChange={(event) => setDraft({ ...draft, maximum_score: event.target.value })} required />
            <TextInput label="Prazo" type="date" value={draft.due_date} onChange={(event) => setDraft({ ...draft, due_date: event.target.value })} />
          </div>
          <Button type="submit" disabled={saving || !groupId}><Plus size={16} /> Criar avaliação</Button>
        </form>
      </section>

      {message && <Alert type={message.includes("não foi") ? "error" : "success"} message={message} />}
      {loading ? <Loading text="Carregando avaliações..." /> : assessments.length === 0 ? (
        <EmptyState title="Nenhuma avaliação" message="Crie a primeira avaliação para esta turma." />
      ) : (
        <section className="assessment-list">
          {assessments.map((assessment) => (
            <article className="base-card" key={assessment.id}>
              <h2>{assessment.title}</h2>
              <p>{assessment.category.toUpperCase()} · Peso {assessment.weight} · Máximo {assessment.maximum_score}{assessment.due_date ? ` · Prazo ${formatDate(assessment.due_date)}` : ""}</p>
              {roster.length === 0 ? <p>Sem estudantes ativos nesta turma.</p> : (
                <div className="table-wrapper">
                  <table>
                    <thead><tr><th>Estudante</th><th>Nota</th><th>Devolutiva</th><th>Ação</th></tr></thead>
                    <tbody>
                      {roster.map((enrollment) => {
                        const result = results.find((item) => item.assessment === assessment.id && item.student === enrollment.student);
                        const key = `${assessment.id}:${enrollment.student}`;
                        return (
                          <tr key={enrollment.id}>
                            <td>{enrollment.student_name}</td>
                            <td>
                              <input
                                type="number"
                                min="0"
                                max={assessment.maximum_score}
                                step="0.01"
                                value={scores[key] ?? ""}
                                aria-label={`Nota de ${enrollment.student_name}`}
                                onChange={(event) => setScores((current) => ({ ...current, [key]: event.target.value }))}
                              />
                            </td>
                            <td>{result?.feedback || "—"}</td>
                            <td><Button type="button" variant="secondary" disabled={saving} onClick={() => saveResult(assessment, enrollment.student)}><Save size={16} /> Salvar</Button></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </article>
          ))}
        </section>
      )}
    </MainLayout>
  );
}

export default TeacherAssessments;
