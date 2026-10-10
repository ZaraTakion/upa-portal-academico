import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import api from "../../api/axios";
import Alert from "../../components/feedback/Alert";
import Loading from "../../components/feedback/Loading";
import MainLayout from "../../components/layout/MainLayout";
import Button from "../../components/ui/Button";
import { collectPages } from "../../utils/collectPages";
import { adminPayload } from "../../utils/adminPayload";
import PageHeader from "../../components/ui/PageHeader";

const select = (endpoint, labelField) => ({ endpoint, labelField });
const sections = {
  users: {
    title: "Usuários", endpoint: "/accounts/users/", disableDelete: true,
    fields: [
      { name: "username", label: "Usuário", required: true },
      { name: "first_name", label: "Nome" }, { name: "last_name", label: "Sobrenome" },
      { name: "email", label: "E-mail", type: "email" },
      { name: "role", label: "Perfil de acesso", type: "select", required: true, options: [["student", "Estudante"], ["professor", "Professor"], ["admin", "Administrador"]] },
      { name: "password", label: "Senha (obrigatória ao criar; vazia mantém a atual)", type: "password" },
      { name: "is_active", label: "Conta ativa", type: "checkbox", default: true },
    ],
  },
  students: {
    title: "Estudantes", endpoint: "/academic/students/", disableDelete: true,
    fields: [
      { name: "user", label: "Conta de estudante", immutable: true, type: "relation", source: select("/accounts/users/", "username"), required: true },
      { name: "registration", label: "Matrícula", required: true },
      { name: "course_id", label: "Curso", type: "relation", source: select("/academic/courses/", "name"), required: true },
      { name: "semester", label: "Semestre", type: "number", min: 1, required: true },
      { name: "phone", label: "Telefone" }, { name: "address", label: "Endereço" },
      { name: "guardian_name", label: "Responsável" },
    ],
  },
  teachers: {
    title: "Professores", endpoint: "/academic/teachers/", disableDelete: true,
    fields: [
      { name: "user", label: "Conta docente", immutable: true, type: "relation", source: select("/accounts/users/", "username"), required: true },
      { name: "employee_code", label: "Código funcional", required: true },
      { name: "department", label: "Departamento", required: true },
      { name: "title", label: "Titulação", default: "Professor", required: true },
      { name: "phone", label: "Telefone" },
    ],
  },
  invoices: {
    title: "Financeiro", endpoint: "/financial/", disableDelete: true,
    fields: [
      { name: "user", label: "Titular", type: "relation", source: select("/accounts/users/", "username"), required: true },
      { name: "description", label: "Descrição", required: true },
      { name: "amount", label: "Valor (R$)", type: "number", min: 0.01, step: 0.01, required: true },
      { name: "due_date", label: "Vencimento", type: "date", required: true },
      { name: "status", label: "Situação", type: "select", default: "pending", required: true, options: [["pending", "Pendente"], ["paid", "Pago"], ["overdue", "Vencido"]] },
      { name: "payment_method", label: "Forma de pagamento", type: "select", nullable: true, options: [["pix", "Pix"], ["boleto", "Boleto"], ["credit_card", "Cartão de crédito"], ["debit_card", "Cartão de débito"]] },
    ],
  },
  notifications: {
    title: "Comunicados", endpoint: "/notifications/",
    fields: [
      { name: "user", label: "Destinatário", type: "relation", source: select("/accounts/users/", "username"), required: true },
      { name: "title", label: "Título", required: true },
      { name: "message", label: "Mensagem", type: "textarea", required: true },
      { name: "notification_type", label: "Tipo", type: "select", default: "academic", required: true, options: [["academic", "Acadêmico"], ["internship", "Estágio"], ["notice", "Comunicado"]] },
      { name: "expires_at", label: "Visível até", type: "date", nullable: true },
    ],
  },
  schedule: {
    title: "Horários", endpoint: "/academic/weekly-schedule/",
    fields: [
      { name: "class_group", label: "Turma", type: "relation", source: select("/academic/class-groups/", "name"), required: true },
      { name: "subject", label: "Disciplina", type: "relation", source: select("/academic/subjects/", "name"), required: true },
      { name: "teacher", label: "Professor", type: "relation", source: select("/academic/teachers/", "full_name"), required: true },
      { name: "weekday", label: "Dia da semana", type: "select", required: true, options: [["monday", "Segunda"], ["tuesday", "Terça"], ["wednesday", "Quarta"], ["thursday", "Quinta"], ["friday", "Sexta"], ["saturday", "Sábado"]] },
      { name: "start_time", label: "Início", type: "time", required: true },
      { name: "end_time", label: "Fim", type: "time", required: true },
      { name: "location", label: "Local" },
    ],
  },
  courses: {
    title: "Cursos",
    endpoint: "/academic/courses/",
    fields: [
      { name: "name", label: "Nome do curso", required: true },
      { name: "duration_semesters", label: "Duração (semestres)", type: "number", min: 1, required: true },
    ],
  },
  terms: {
    title: "Períodos letivos",
    endpoint: "/academic/terms/",
    fields: [
      { name: "code", label: "Código (ex.: 2026.1)", required: true },
      { name: "starts_on", label: "Data inicial", type: "date", nullable: true },
      { name: "ends_on", label: "Data final", type: "date", nullable: true },
      { name: "is_current", label: "Período atual", type: "checkbox" },
    ],
  },
  subjects: {
    title: "Disciplinas",
    endpoint: "/academic/subjects/",
    fields: [
      { name: "name", label: "Nome", required: true },
      { name: "code", label: "Código", required: true },
      { name: "workload", label: "Carga horária", type: "number", min: 1, required: true },
      { name: "period", label: "Semestre", type: "number", min: 1, required: true },
      { name: "status", label: "Disponibilidade no catálogo", type: "select", default: "available", options: [["available", "Disponível"], ["locked", "Bloqueada"]] },
    ],
  },
  classes: {
    title: "Turmas",
    endpoint: "/academic/class-groups/",
    fields: [
      { name: "name", label: "Identificação", required: true },
      { name: "subject", label: "Disciplina", type: "relation", source: select("/academic/subjects/", "name"), required: true },
      { name: "teacher", label: "Professor", type: "relation", source: select("/academic/teachers/", "full_name"), required: true },
      { name: "term", label: "Período letivo", type: "relation", source: select("/academic/terms/", "code"), required: true },
      { name: "semester", label: "Semestre", required: true },
      { name: "year", label: "Ano", type: "number", min: 2000, required: true },
    ],
  },
  enrollments: {
    title: "Matrículas",
    endpoint: "/academic/class-enrollments/",
    fields: [
      { name: "class_group", label: "Turma", type: "relation", source: select("/academic/class-groups/", "name"), required: true },
      { name: "student", label: "Estudante", type: "relation", source: select("/academic/students/", "full_name"), required: true },
      { name: "status", label: "Situação", type: "select", default: "active", options: [["active", "Ativa"], ["completed", "Concluída"], ["failed", "Reprovada"], ["withdrawn", "Cancelada"]] },
    ],
  },
  calendar: {
    title: "Calendário",
    endpoint: "/academic/calendar/",
    fields: [
      { name: "title", label: "Título", required: true },
      { name: "description", label: "Descrição", type: "textarea", required: true },
      { name: "event_type", label: "Tipo", type: "select", default: "event", options: [["class", "Aula"], ["holiday", "Feriado"], ["exam", "Prova"], ["final_exam", "Prova final"], ["enrollment", "Matrícula"], ["event", "Evento"], ["notice", "Comunicado"]] },
      { name: "start_date", label: "Início", type: "date", required: true },
      { name: "end_date", label: "Fim", type: "date", nullable: true },
      { name: "visible_until", label: "Visível até", type: "date", nullable: true },
    ],
  },
  gradePolicy: {
    title: "Regra de notas",
    endpoint: "/academic/grade-policy/",
    single: true,
    fields: [
      { name: "passing_score", label: "Nota para aprovação", type: "number", min: 0, max: 10, step: 0.01, required: true },
      { name: "attention_score", label: "Limite de atenção", type: "number", min: 0, max: 10, step: 0.01, required: true },
      { name: "maximum_absences", label: "Máximo de faltas (opcional)", type: "number", min: 0, nullable: true },
    ],
  },
};

const navItems = Object.entries(sections);

function AdminManagement() {
  const [params, setParams] = useSearchParams();
  const sectionKey = sections[params.get("section")] ? params.get("section") : "courses";
  const section = sections[sectionKey];
  const [rows, setRows] = useState([]);
  const [references, setReferences] = useState({});
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(null);
  const [page, setPage] = useState(1);
  const [pageInfo, setPageInfo] = useState({ count: 0, next: null, previous: null });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [alertType, setAlertType] = useState("error");

  const loadRows = useCallback(async (targetPage = 1) => {
    setLoading(true);
    try {
      const response = await api.get(section.endpoint, { params: { page: targetPage, page_size: 50 } });
      const data = response.data;
      const results = Array.isArray(data) ? data : data.results || [];
      const visibleRows = section.single ? results.slice(0, 1) : results;
      setRows(visibleRows);
      if (section.single) {
        const policy = visibleRows[0];
        setEditing(policy?.id ?? null);
        setForm(policy ? Object.fromEntries(section.fields.map(({ name, type }) => [
          name,
          type === "checkbox" ? Boolean(policy[name]) : policy[name] ?? "",
        ])) : {});
      }
      setPageInfo(Array.isArray(data) ? { count: results.length, next: null, previous: null } : data);
      setPage(targetPage);
      setMessage("");
    } catch {
      setAlertType("error");
      setRows([]);
      setMessage("Não foi possível carregar os registros. Verifique sua sessão e as permissões.");
    } finally {
      setLoading(false);
    }
  }, [section]);

  useEffect(() => {
    setEditing(null);
    setForm({});
    loadRows(1);
  }, [loadRows]);

  useEffect(() => {
    const endpoints = new Set(
      section.fields.filter((field) => field.type === "relation").map((field) => field.source.endpoint),
    );
    if (!endpoints.size) return;
    Promise.all([...endpoints].map(async (endpoint) => {
      return [endpoint, await collectPages(api, endpoint)];
    }))
      .then((entries) => setReferences(Object.fromEntries(entries)))
      .catch(() => setMessage("Não foi possível carregar as opções dos campos relacionados."));
  }, [section]);

  const heading = useMemo(() => editing ? `Editar ${section.title.toLowerCase()}` : `Novo registro`, [editing, section]);

  function startEdit(row) {
    setEditing(row.id);
    const initial = {};
    section.fields.forEach(({ name, type }) => {
      initial[name] = type === "checkbox" ? Boolean(row[name]) : row[name] ?? "";
    });
    setForm(initial);
  }

  function resetForm() {
    setEditing(null);
    setForm({});
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setAlertType("error");
    const payload = adminPayload(section.fields, form);
    try {
      if (editing) await api.patch(`${section.endpoint}${editing}/`, payload);
      else await api.post(section.endpoint, payload);
      resetForm();
      await loadRows(page);
      setAlertType("success");
      setMessage("Registro salvo com sucesso.");
    } catch (error) {
      const details = error.response?.data;
      setMessage(details ? Object.entries(details).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(" ") : value}`).join(" · ") : "Não foi possível salvar o registro.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(row) {
    if (!window.confirm("Excluir este registro? Esta ação não pode ser desfeita.")) return;
    setMessage("");
    try {
      await api.delete(`${section.endpoint}${row.id}/`);
      await loadRows(page);
      setAlertType("success");
      setMessage("Registro excluído.");
    } catch {
      setMessage("Não foi possível excluir. Este registro pode estar vinculado a outros dados.");
    }
  }

  function renderField(field) {
    const value = form[field.name] ?? field.default ?? "";
    const common = {
      id: field.name,
      name: field.name,
      required: field.required,
      disabled: Boolean(editing && field.immutable),
      autoComplete: field.type === "password" ? "new-password" : undefined,
      maxLength: field.name === "registration" || field.name === "employee_code" ? 20 : undefined,
      value: field.type === "checkbox" ? undefined : value,
      checked: field.type === "checkbox" ? Boolean(value) : undefined,
      min: field.min,
      max: field.max,
      step: field.step,
      onChange: (event) => setForm((current) => ({
        ...current,
        [field.name]: field.type === "checkbox" ? event.target.checked : event.target.value,
      })),
    };
    return (
      <div className="form-field" key={field.name}>
        <label htmlFor={field.name}>{field.label}</label>
        {field.type === "textarea" ? <textarea {...common} rows={3} />
          : field.type === "select" || field.type === "relation" ? (
            <select {...common}>
              <option value="">Selecione</option>
              {(field.options || (references[field.source.endpoint] || []).map((row) => [
                row.id,
                row[field.source.labelField] || row.name || row.code || `#${row.id}`,
              ])).map(([valueOption, label]) => <option key={valueOption} value={valueOption}>{label}</option>)}
            </select>
          ) : <input {...common} type={field.type || "text"} />}
      </div>
    );
  }

  return (
    <MainLayout>
      <PageHeader eyebrow="Administração" title="Gestão acadêmica" description="Cadastre e atualize os principais dados do portal." />
      <nav className="toolbar management-nav" aria-label="Seções de gestão">
        {navItems.map(([key, item]) => (
          <Button key={key} aria-pressed={key === sectionKey} type="button" variant={key === sectionKey ? "primary" : "secondary"} onClick={() => setParams({ section: key })}>{item.title}</Button>
        ))}
      </nav>
      {message && <Alert type={alertType} message={message} />}
      <section className="dashboard-grid">
        <form className="base-card form-stack" onSubmit={save}>
          <h2>{heading}</h2>
          {section.fields.map(renderField)}
          <div className="toolbar">
            <Button type="submit" disabled={saving}>{saving ? "Salvando..." : editing ? "Salvar alterações" : "Criar registro"}</Button>
            {editing && <Button type="button" variant="secondary" onClick={resetForm}>Cancelar</Button>}
          </div>
          {sectionKey === "users" && <p>Após criar a conta, cadastre o perfil em Estudantes ou Professores. Desative contas para preservar o histórico.</p>}
          {sectionKey === "invoices" && <p>Registro administrativo de cobranças. O portal não processa pagamentos.</p>}
          {sectionKey === "gradePolicy" && <p>Esta regra é aplicada ao cálculo de situação das notas. A nota de atenção deve ser menor ou igual à nota de aprovação.</p>}
        </form>
        <section className="base-card">
          <h2>{section.title}</h2>
          {loading ? <Loading text="Carregando registros..." /> : rows.length === 0 ? <p>Nenhum registro cadastrado.</p> : (
            <div className="table-wrapper" tabIndex={0} role="region" aria-label="Registros administrativos">
              <table>
                <thead><tr><th>Registro</th><th>Detalhes</th><th>Ações</th></tr></thead>
                <tbody>{rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.full_name || row.username || row.name || row.code || row.title || (sectionKey === "gradePolicy" ? `Regra #${row.id}` : `#${row.id}`)}</td>
                    <td>{section.fields.slice(1).map(({ name, label }) => row[name] !== null && row[name] !== undefined && row[name] !== "" ? `${label}: ${String(row[name])}` : null).filter(Boolean).join(" · ") || "—"}</td>
                    <td><div className="toolbar"><Button type="button" variant="secondary" onClick={() => startEdit(row)}>Editar</Button>{!section.disableDelete && <Button type="button" variant="secondary" onClick={() => remove(row)}>Excluir</Button>}</div></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
          <div className="toolbar">
            <span>{pageInfo.count ?? rows.length} registro(s) · página {page}</span>
            <Button type="button" variant="secondary" disabled={!pageInfo.previous || loading} onClick={() => loadRows(page - 1)}>Anterior</Button>
            <Button type="button" variant="secondary" disabled={!pageInfo.next || loading} onClick={() => loadRows(page + 1)}>Próxima</Button>
          </div>
        </section>
      </section>
    </MainLayout>
  );
}

export default AdminManagement;
