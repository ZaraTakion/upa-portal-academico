import { Download, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import api from "../../api/axios";
import Alert from "../../components/feedback/Alert";
import EmptyState from "../../components/feedback/EmptyState";
import Loading from "../../components/feedback/Loading";
import MainLayout from "../../components/layout/MainLayout";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import PageHeader from "../../components/ui/PageHeader";
import SelectInput from "../../components/ui/SelectInput";
import TextInput from "../../components/ui/TextInput";
import TextareaInput from "../../components/ui/TextareaInput";
import { useAuth } from "../../context/AuthContext";

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ".pdf,.png,.jpg,.jpeg,.txt,.docx,.xlsx,.pptx";
const STATUS_LABELS = {
  submitted: "Entregue",
  reviewed: "Corrigida",
  late: "Entregue após o prazo",
};

function Files() {
  const { user } = useAuth();
  const fileInput = useRef(null);
  const isStaff = Boolean(user?.is_staff || user?.is_superuser);
  const isProfessor = user?.groups?.includes("Professor") && !isStaff;
  const isStudent = !isStaff && !isProfessor;

  const [files, setFiles] = useState([]);
  const [classGroups, setClassGroups] = useState([]);
  const [title, setTitle] = useState("");
  const [classGroup, setClassGroup] = useState("");
  const [assignment, setAssignment] = useState("");
  const [fileType, setFileType] = useState(isProfessor ? "material" : "submission");
  const [dueAt, setDueAt] = useState("");
  const [file, setFile] = useState(null);
  const [reviewId, setReviewId] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const [feedback, setFeedback] = useState("");
  const [alertType, setAlertType] = useState("info");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  async function loadData() {
    try {
      const [filesResponse, groupsResponse] = await Promise.all([
        api.get("/files/"),
        api.get("/academic/class-groups/"),
      ]);
      setFiles(filesResponse.data);
      setClassGroups(groupsResponse.data);
    } catch {
      setAlertType("error");
      setFeedback("Não foi possível carregar os arquivos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!file) {
      setAlertType("error");
      setFeedback("Selecione um arquivo.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setAlertType("error");
      setFeedback("O arquivo deve ter no máximo 25 MB.");
      return;
    }
    if ((isProfessor || isStaff) && !classGroup) {
      setAlertType("error");
      setFeedback("Selecione a turma.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    if (classGroup) formData.append("class_group", classGroup);
    if (isStaff || isProfessor) formData.append("file_type", fileType);
    if (isStudent && assignment) formData.append("assignment", assignment);
    if (fileType === "assignment" && dueAt) {
      formData.append("due_at", new Date(dueAt).toISOString());
    }
    formData.append("file", file);

    setUploading(true);
    try {
      await api.post("/files/", formData);
      setAlertType("success");
      setFeedback("Arquivo enviado com sucesso.");
      setTitle("");
      setClassGroup("");
      setAssignment("");
      setDueAt("");
      setFileType(isProfessor ? "material" : "submission");
      setFile(null);
      if (fileInput.current) fileInput.current.value = "";
      await loadData();
    } catch (error) {
      const details = error.response?.data;
      const message = details
        ? Object.values(details).flat().join(" ")
        : "Não foi possível enviar o arquivo.";
      setAlertType("error");
      setFeedback(message);
    } finally {
      setUploading(false);
    }
  }

  async function handleDownload(item) {
    try {
      const response = await api.get(item.download_url, { responseType: "blob" });
      const objectUrl = URL.createObjectURL(response.data);
      const disposition = response.headers["content-disposition"] || "";
      const filenameMatch = disposition.match(/filename="?([^";]+)"?/i);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filenameMatch?.[1] || item.title || "arquivo";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      setAlertType("error");
      setFeedback("Não foi possível baixar este arquivo.");
    }
  }

  async function submitReview(event, item) {
    event.preventDefault();
    try {
      await api.patch(`/files/${item.id}/`, { feedback: reviewText });
      setReviewId(null);
      setReviewText("");
      setAlertType("success");
      setFeedback("Devolutiva registrada.");
      await loadData();
    } catch {
      setAlertType("error");
      setFeedback("Não foi possível salvar a devolutiva.");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const groupOptions = [
    ...(isStaff ? [{ value: "", label: "Selecione uma turma" }] : []),
    ...classGroups.map((group) => ({
      value: group.id,
      label: `${group.subject_name} — ${group.name}`,
    })),
  ];
  const assignmentOptions = [
    { value: "", label: "Entrega sem atividade vinculada" },
    ...files
      .filter((item) => item.file_type === "assignment")
      .map((item) => ({ value: item.id, label: item.title })),
  ];

  return (
    <MainLayout>
      <PageHeader
        eyebrow={isProfessor ? "Professor" : "Documentos acadêmicos"}
        title="Arquivos e atividades"
        description={
          isProfessor
            ? "Publique materiais e atividades, acompanhe entregas e envie devolutivas."
            : "Consulte materiais, acompanhe prazos e envie suas entregas."
        }
      />

      <section className="split-grid">
        <article className="base-card">
          <h2>{isProfessor ? "Publicar arquivo" : "Enviar arquivo"}</h2>
          <form className="form-stack" onSubmit={handleSubmit}>
            <TextInput label="Título" value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={200} />

            <SelectInput
              label="Turma"
              value={classGroup}
              onChange={(event) => setClassGroup(event.target.value)}
              options={groupOptions}
              required={isStaff || isProfessor}
            />

            {isStudent && (
              <SelectInput
                label="Atividade (opcional)"
                value={assignment}
                onChange={(event) => setAssignment(event.target.value)}
                options={assignmentOptions}
              />
            )}

            {(isStaff || isProfessor) && (
              <SelectInput
                label="Tipo"
                value={fileType}
                onChange={(event) => setFileType(event.target.value)}
                options={[
                  { value: "material", label: "Material" },
                  { value: "assignment", label: "Atividade para entrega" },
                  ...(isStaff ? [{ value: "document", label: "Documento acadêmico" }] : []),
                ]}
              />
            )}

            {(isStaff || isProfessor) && fileType === "assignment" && (
              <TextInput
                label="Prazo de entrega"
                type="datetime-local"
                value={dueAt}
                onChange={(event) => setDueAt(event.target.value)}
                required
              />
            )}

            <label className="field">
              <span>Arquivo (PDF, imagem, TXT, DOCX, XLSX ou PPTX; até 25 MB)</span>
              <input
                ref={fileInput}
                type="file"
                accept={ACCEPTED_FILE_TYPES}
                onChange={(event) => setFile(event.target.files?.[0] || null)}
                required
              />
            </label>
            <Alert type={alertType} message={feedback} />
            <Button type="submit" disabled={uploading}>
              {uploading ? "Enviando..." : "Enviar"}
              {!uploading && <Upload size={16} />}
            </Button>
          </form>
        </article>

        <article className="base-card">
          <h2>Materiais, atividades e entregas</h2>
          {loading ? (
            <Loading text="Carregando arquivos..." />
          ) : files.length === 0 ? (
            <EmptyState title="Nenhum arquivo" message="Ainda não há arquivos disponíveis para sua conta." />
          ) : (
            <ul className="file-list">
              {files.map((item) => (
                <li key={item.id} className="file-record">
                  <div className="file-record-content">
                    <strong>{item.title}</strong>
                    <p>{item.class_group_name || item.subject_name || "Documento"}</p>
                    <Badge type={item.file_type}>{item.file_type_display}</Badge>
                    {item.due_at && (
                      <p>Prazo: {new Date(item.due_at).toLocaleString("pt-BR")}</p>
                    )}
                    {item.submission_status && (
                      <p>Status: {STATUS_LABELS[item.submission_status] || item.submission_status}</p>
                    )}
                    {item.feedback && <p><strong>Devolutiva:</strong> {item.feedback}</p>}
                    {(isProfessor || isStaff) && item.file_type === "submission" && (
                      reviewId === item.id ? (
                        <form className="form-stack review-form" onSubmit={(event) => submitReview(event, item)}>
                          <TextareaInput label="Devolutiva" value={reviewText} onChange={(event) => setReviewText(event.target.value)} rows={3} required />
                          <Button type="submit">Salvar devolutiva</Button>
                        </form>
                      ) : (
                        <Button type="button" variant="secondary" onClick={() => { setReviewId(item.id); setReviewText(item.feedback || ""); }}>
                          {item.feedback ? "Editar devolutiva" : "Adicionar devolutiva"}
                        </Button>
                      )
                    )}
                  </div>
                  <Button type="button" variant="secondary" onClick={() => handleDownload(item)}>
                    <Download size={16} />
                    Baixar
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>
    </MainLayout>
  );
}

export default Files;
