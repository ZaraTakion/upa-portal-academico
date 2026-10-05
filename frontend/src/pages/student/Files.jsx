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
import { useAuth } from "../../context/AuthContext";

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const ACCEPTED_FILE_TYPES =
  ".pdf,.png,.jpg,.jpeg,.txt,.docx,.xlsx,.pptx";

function Files() {
  const { user } = useAuth();
  const fileInput = useRef(null);
  const isStaff = Boolean(user?.is_staff);
  const isProfessor = user?.groups?.includes("Professor") && !isStaff;

  const [files, setFiles] = useState([]);
  const [classGroups, setClassGroups] = useState([]);
  const [title, setTitle] = useState("");
  const [classGroup, setClassGroup] = useState("");
  const [fileType, setFileType] = useState(isProfessor ? "material" : "submission");
  const [file, setFile] = useState(null);
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
    } catch (error) {
      console.error("Erro ao carregar arquivos:", error);
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

    const formData = new FormData();
    formData.append("title", title);
    formData.append("class_group", classGroup);
    formData.append("file", file);
    if (isStaff) formData.append("file_type", fileType);

    setUploading(true);
    try {
      await api.post("/files/", formData);
      setAlertType("success");
      setFeedback("Arquivo enviado com sucesso.");
      setTitle("");
      setClassGroup("");
      setFileType(isProfessor ? "material" : "submission");
      setFile(null);
      if (fileInput.current) fileInput.current.value = "";
      await loadData();
    } catch (error) {
      const detail = error.response?.data;
      const message = detail
        ? Object.values(detail).flat().join(" ")
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
      const filename = filenameMatch?.[1] || item.title || "arquivo";
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      setAlertType("error");
      setFeedback("Não foi possível baixar este arquivo.");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const groupOptions = [
    ...(isStaff ? [{ value: "", label: "Sem associação" }] : []),
    ...classGroups.map((group) => ({
      value: group.id,
      label: `${group.subject_name} — ${group.name}`,
    })),
  ];
  const requiresClassGroup = !isStaff || fileType !== "document";

  return (
    <MainLayout>
      <PageHeader
        eyebrow={isProfessor ? "Professor" : "Documentos acadêmicos"}
        title="Arquivos"
        description={
          isProfessor
            ? "Compartilhe materiais com as turmas que você leciona."
            : "Envie suas entregas e consulte materiais das suas turmas."
        }
      />

      <section className="split-grid">
        <article className="base-card">
          <h2>{isProfessor ? "Enviar material" : "Enviar arquivo"}</h2>
          <form className="form-stack" onSubmit={handleSubmit}>
            <TextInput
              label="Título"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />

            <SelectInput
              label="Turma"
              value={classGroup}
              onChange={(event) => setClassGroup(event.target.value)}
              options={groupOptions}
              required={requiresClassGroup}
            />

            {isStaff ? (
              <SelectInput
                label="Tipo"
                value={fileType}
                onChange={(event) => setFileType(event.target.value)}
                options={[
                  { value: "material", label: "Material do professor" },
                  { value: "submission", label: "Entrega do aluno" },
                  { value: "document", label: "Documento acadêmico" },
                ]}
              />
            ) : (
              <p className="field-hint">
                {isProfessor ? "O arquivo será publicado como material da turma." : "O arquivo será registrado como sua entrega."}
              </p>
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
          <h2>Arquivos disponíveis</h2>
          {loading ? (
            <Loading text="Carregando arquivos..." />
          ) : files.length === 0 ? (
            <EmptyState
              title="Nenhum arquivo"
              message="Não há arquivos disponíveis para sua conta."
            />
          ) : (
            <ul className="file-list">
              {files.map((item) => (
                <li key={item.id}>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.class_group_name || item.subject_name || "Documento"}</p>
                    <Badge type={item.file_type}>{item.file_type_display}</Badge>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => handleDownload(item)}
                  >
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
