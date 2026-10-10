import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import api from "../../api/axios";
import { getInitialClassGroup } from "../../utils/initialClassGroup";
import Alert from "../../components/feedback/Alert";
import EmptyState from "../../components/feedback/EmptyState";
import Loading from "../../components/feedback/Loading";
import MainLayout from "../../components/layout/MainLayout";
import Button from "../../components/ui/Button";
import PageHeader from "../../components/ui/PageHeader";
import SelectInput from "../../components/ui/SelectInput";

function todayInBrazil() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Fortaleza" }).format(new Date());
}

function TeacherAttendance() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [date, setDate] = useState(() => searchParams.get("date") || todayInBrazil());
  const [roster, setRoster] = useState([]);
  const [present, setPresent] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get("/academic/class-groups/")
      .then((response) => {
        setGroups(response.data);
        if (response.data.length) {
          const initialGroup = getInitialClassGroup(
            response.data,
            searchParams.get("class_group"),
          );
          setSelectedGroup(String(initialGroup.id));
        }
      })
      .catch(() => setMessage("Não foi possível carregar suas turmas."))
      .finally(() => setLoading(false));
  }, [searchParams]);

  useEffect(() => {
    if (!selectedGroup || !date) return;
    let active = true;
    setLoading(true);
    setRoster([]);
    setMessage("");
    Promise.all([
      api.get(`/academic/class-enrollments/?class_group=${selectedGroup}&status=active`),
      api.get(`/academic/attendance/?class_group=${selectedGroup}&date=${date}`),
    ])
      .then(([studentsResponse, recordsResponse]) => {
        if (!active) return;
        setRoster(studentsResponse.data);
        const checked = Object.fromEntries(
          studentsResponse.data.map((enrollment) => {
            const record = recordsResponse.data.find((item) => item.student === enrollment.student);
            return [enrollment.student, record ? record.present : true];
          })
        );
        setPresent(checked);
      })
      .catch(() => { if (active) setMessage("Não foi possível carregar a lista de presença."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [selectedGroup, date]);

  async function saveAttendance(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await api.post("/academic/attendance/batch/", {
        class_group: Number(selectedGroup), date,
        records: roster.map((enrollment) => ({ student: enrollment.student, present: Boolean(present[enrollment.student]) })),
      });
      setMessage("Frequência salva.");

    } catch {
      setMessage("Não foi possível salvar toda a frequência. Revise a lista e tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  const groupOptions = groups.map((group) => ({
    value: group.id,
    label: `${group.subject_name} — ${group.name} (${group.term_code || group.semester})`,
  }));

  return (
    <MainLayout>
      <PageHeader eyebrow="Professor" title="Frequência" description="Registre presença por turma e acompanhe os registros do dia." />
      <section className="base-card form-card">
        <div className="toolbar">
          <SelectInput label="Turma" value={selectedGroup} onChange={(event) => { setLoading(true); setSelectedGroup(event.target.value); setSearchParams({ class_group: event.target.value, date }); }} options={groupOptions} required />
          <label className="field">
            <span>Data da aula</span>
            <input type="date" value={date} onChange={(event) => { setLoading(true); setDate(event.target.value); setSearchParams({ class_group: selectedGroup, date: event.target.value }); }} required />
          </label>
        </div>
        {message && <Alert type={message !== "Frequência salva." ? "error" : "success"} message={message} />}
        {loading ? (
          <Loading text="Carregando lista..." />
        ) : roster.length === 0 ? (
          <EmptyState title="Turma sem alunos ativos" message="Não há matrículas ativas para registrar." />
        ) : (
          <form onSubmit={saveAttendance}>
            <div className="table-wrapper" tabIndex={0} role="region" aria-label="Lista de frequência">
              <table>
                <thead><tr><th>Estudante</th><th>Matrícula</th><th>Presença</th></tr></thead>
                <tbody>
                  {roster.map((enrollment) => (
                    <tr key={enrollment.id}>
                      <td>{enrollment.student_name}</td>
                      <td>{enrollment.student_registration}</td>
                      <td>
                        <label className="checkbox-filter">
                          <input
                            aria-label={`Presença de ${enrollment.student_name}`}
                            type="checkbox"
                            checked={Boolean(present[enrollment.student])}
                            onChange={(event) => setPresent((current) => ({ ...current, [enrollment.student]: event.target.checked }))}
                          />
                          Presente
                        </label>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button type="submit" disabled={saving || loading}>
              <Save size={16} /> {saving ? "Salvando..." : "Salvar frequência"}
            </Button>
          </form>
        )}
      </section>
    </MainLayout>
  );
}

export default TeacherAttendance;
