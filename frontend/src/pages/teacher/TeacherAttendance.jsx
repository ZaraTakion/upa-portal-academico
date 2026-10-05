import { Save } from "lucide-react";
import { useEffect, useState } from "react";

import api from "../../api/axios";
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
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [date, setDate] = useState(todayInBrazil());
  const [roster, setRoster] = useState([]);
  const [records, setRecords] = useState([]);
  const [present, setPresent] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get("/academic/class-groups/")
      .then((response) => {
        setGroups(response.data);
        if (response.data.length) setSelectedGroup(String(response.data[0].id));
      })
      .catch(() => setMessage("Não foi possível carregar suas turmas."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedGroup || !date) return;
    setLoading(true);
    Promise.all([
      api.get(`/academic/class-enrollments/?class_group=${selectedGroup}&status=active`),
      api.get(`/academic/attendance/?class_group=${selectedGroup}&date=${date}`),
    ])
      .then(([studentsResponse, recordsResponse]) => {
        setRoster(studentsResponse.data);
        setRecords(recordsResponse.data);
        const checked = Object.fromEntries(
          studentsResponse.data.map((enrollment) => {
            const record = recordsResponse.data.find((item) => item.student === enrollment.student);
            return [enrollment.student, record ? record.present : true];
          })
        );
        setPresent(checked);
      })
      .catch(() => setMessage("Não foi possível carregar a lista de presença."))
      .finally(() => setLoading(false));
  }, [selectedGroup, date]);

  async function saveAttendance(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const heldAt = new Date(`${date}T12:00:00`).toISOString();
    try {
      await Promise.all(roster.map((enrollment) => {
        const existing = records.find((record) => record.student === enrollment.student);
        const payload = {
          class_group: Number(selectedGroup),
          student: enrollment.student,
          held_at: existing?.held_at || heldAt,
          present: Boolean(present[enrollment.student]),
        };
        return existing
          ? api.patch(`/academic/attendance/${existing.id}/`, { present: payload.present })
          : api.post("/academic/attendance/", payload);
      }));
      setMessage("Frequência salva.");
      const response = await api.get(`/academic/attendance/?class_group=${selectedGroup}&date=${date}`);
      setRecords(response.data);
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
          <SelectInput label="Turma" value={selectedGroup} onChange={(event) => setSelectedGroup(event.target.value)} options={groupOptions} required />
          <label className="field">
            <span>Data da aula</span>
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
          </label>
        </div>
        {message && <Alert type={message.includes("não foi") ? "error" : "success"} message={message} />}
        {loading ? (
          <Loading text="Carregando lista..." />
        ) : roster.length === 0 ? (
          <EmptyState title="Turma sem alunos ativos" message="Não há matrículas ativas para registrar." />
        ) : (
          <form onSubmit={saveAttendance}>
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Estudante</th><th>Matrícula</th><th>Presença</th></tr></thead>
                <tbody>
                  {roster.map((enrollment) => (
                    <tr key={enrollment.id}>
                      <td>{enrollment.student_name}</td>
                      <td>{enrollment.student}</td>
                      <td>
                        <label className="checkbox-filter">
                          <input
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
            <Button type="submit" disabled={saving}>
              <Save size={16} /> {saving ? "Salvando..." : "Salvar frequência"}
            </Button>
          </form>
        )}
      </section>
    </MainLayout>
  );
}

export default TeacherAttendance;
