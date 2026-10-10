import { Plus, Save } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import api from "../../api/axios";
import { getInitialClassGroup } from "../../utils/initialClassGroup";
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
  const [searchParams] = useSearchParams();
  const [groups, setGroups] = useState([]);
  const [groupId, setGroupId] = useState("");
  const [assessments, setAssessments] = useState([]);
  const [roster, setRoster] = useState([]);
  const [results, setResults] = useState([]);
  const [scores, setScores] = useState({});
  const [feedbacks, setFeedbacks] = useState({});
  const [editing, setEditing] = useState(null);
  const requestVersion = useRef(0);
  const [draft, setDraft] = useState({ title: "", category: "n1", weight: "1", maximum_score: "10", due_date: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [alertType, setAlertType] = useState("error");

  const loadAssessments = useCallback(async () => {
    if (!groupId) return;
    const version = ++requestVersion.current;
    setLoading(true);
    try {
      const [assessmentResponse, rosterResponse, resultResponse] = await Promise.all([
        api.get(`/academic/assessments/?class_group=${groupId}`),
        api.get(`/academic/class-enrollments/?class_group=${groupId}&status=active`),
        api.get(`/academic/assessment-results/?class_group=${groupId}`),
      ]);
      if (version !== requestVersion.current) return;
      setAssessments(assessmentResponse.data);
      setRoster(rosterResponse.data);
      setResults(resultResponse.data);
      const initial = {};
      const initialFeedback = {};
      resultResponse.data.forEach((result) => {
        initial[`${result.assessment}:${result.student}`] = result.score ?? "";
        initialFeedback[`${result.assessment}:${result.student}`] = result.feedback || "";
      });
      setScores(initial);
      setFeedbacks(initialFeedback);
    } catch {
      if (version === requestVersion.current) { setAlertType("error"); setMessage("Não foi possível carregar as avaliações desta turma."); }
    } finally {
      if (version === requestVersion.current) setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    api.get("/academic/class-groups/")
      .then((response) => {
        setGroups(response.data);
        if (response.data.length) {
          const initialGroup = getInitialClassGroup(
            response.data,
            searchParams.get("class_group"),
          );
          setGroupId(String(initialGroup.id));
        }
      })
      .catch(() => setMessage("Não foi possível carregar suas turmas."))
      .finally(() => setLoading(false));
  }, [searchParams]);

  useEffect(() => {
    setAssessments([]);
    setRoster([]);
    loadAssessments();
    return () => { requestVersion.current += 1; };
  }, [loadAssessments]);

  async function createAssessment(event) {
    event.preventDefault();
    if (!groupId) return;
    setSaving(true);
    setMessage("");
    setAlertType("error");
    try {
      const payload = {
        ...draft,
        class_group: Number(groupId),
        weight: Number(draft.weight),
        maximum_score: Number(draft.maximum_score),
        due_date: draft.due_date || null,
      };
      if (editing) await api.patch(`/academic/assessments/${editing}/`, payload);
      else await api.post("/academic/assessments/", payload);
      setEditing(null);
      setDraft({ title: "", category: "n1", weight: "1", maximum_score: "10", due_date: "" });
      setAlertType("success");
      setMessage(editing ? "Avaliação atualizada." : "Avaliação criada.");
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
    const score = (scores[key] ?? "") === "" ? null : Number(scores[key]);
    setSaving(true);
    try {
      const payload = { score, feedback: feedbacks[key] || "" };
      let response;
      if (existing) {
        response = await api.patch(`/academic/assessment-results/${existing.id}/`, payload);
      } else {
        response = await api.post("/academic/assessment-results/", {
          assessment: assessment.id,
          student: studentId,
          ...payload,
        });
      }
      setAlertType("success");
      setMessage("Nota salva.");
      setResults((current) => [...current.filter((item) => item.id !== response.data.id), response.data]);
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
        <SelectInput label="Turma" value={groupId} onChange={(event) => { setLoading(true); setGroupId(event.target.value); setEditing(null); }} options={groupOptions} required />
        <form className="form-stack assessment-create" onSubmit={createAssessment}>
          <h2>{editing ? "Editar avaliação" : "Nova avaliação"}</h2>
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
          <Button type="submit" disabled={saving || loading || !groupId}><Plus size={16} /> {editing ? "Salvar avaliação" : "Criar avaliação"}</Button>
          {editing && <Button type="button" variant="secondary" onClick={() => { setEditing(null); setDraft({ title: "", category: "n1", weight: "1", maximum_score: "10", due_date: "" }); }}>Cancelar edição</Button>}
        </form>
      </section>

      {message && <Alert type={alertType} message={message} />}
      {loading ? <Loading text="Carregando avaliações..." /> : assessments.length === 0 ? (
        <EmptyState title="Nenhuma avaliação" message="Crie a primeira avaliação para esta turma." />
      ) : (
        <section className="assessment-list">
          {assessments.map((assessment) => (
            <article className="base-card" key={assessment.id}>
              <h2>{assessment.title}</h2>
              <Button type="button" variant="secondary" disabled={saving} onClick={() => {
                setEditing(assessment.id);
                setDraft({ title: assessment.title, category: assessment.category, weight: assessment.weight, maximum_score: assessment.maximum_score, due_date: assessment.due_date || "" });
                document.querySelector(".assessment-create input")?.focus();
              }}>Editar avaliação</Button>
              <p>{assessment.category.toUpperCase()} · Peso {assessment.weight} · Máximo {assessment.maximum_score}{assessment.due_date ? ` · Prazo ${formatDate(assessment.due_date)}` : ""}</p>
              {roster.length === 0 ? <p>Sem estudantes ativos nesta turma.</p> : (
                <div className="table-wrapper" tabIndex={0} role="region" aria-label="Resultados da avaliação">
                  <table>
                    <thead><tr><th>Estudante</th><th>Nota</th><th>Devolutiva</th><th>Ação</th></tr></thead>
                    <tbody>
                      {roster.map((enrollment) => {
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
                            <td><input type="text" aria-label={`Devolutiva para ${enrollment.student_name}`} value={feedbacks[key] ?? ""} onChange={(event) => setFeedbacks((current) => ({ ...current, [key]: event.target.value }))} /></td>
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
