import { Upload } from "lucide-react";
import { useEffect, useState } from "react";

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

function Files() {
  const [files, setFiles] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [fileType, setFileType] = useState("submission");
  const [file, setFile] = useState(null);

  const [feedback, setFeedback] = useState("");
  const [alertType, setAlertType] = useState("info");
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      const [filesResponse, subjectsResponse] = await Promise.all([
        api.get("/files/"),
        api.get("/academic/subjects/"),
      ]);

      setFiles(filesResponse.data);
      setSubjects(subjectsResponse.data);
    } catch (error) {
      console.error("Erro ao carregar arquivos:", error);
      setAlertType("error");
      setFeedback("Erro ao carregar arquivos.");
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

    const formData = new FormData();

    formData.append("title", title);
    formData.append("file_type", fileType);
    formData.append("file", file);

    if (subject) {
      formData.append("subject", subject);
    }

    try {
      await api.post("/files/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setAlertType("success");
      setFeedback("Arquivo enviado com sucesso.");

      setTitle("");
      setSubject("");
      setFileType("submission");
      setFile(null);

      loadData();
    } catch (error) {
      console.error("Erro ao enviar arquivo:", error);
      setAlertType("error");
      setFeedback("Erro ao enviar arquivo.");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <MainLayout>
      <PageHeader
        eyebrow="Documentos acadêmicos"
        title="Arquivos"
        description="Envie entregas e consulte materiais vinculados às disciplinas."
      />

      <section className="split-grid">
        <article className="base-card">
          <h2>Enviar arquivo</h2>

          <form className="form-stack" onSubmit={handleSubmit}>
            <TextInput
              label="Título"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />

            <SelectInput
              label="Disciplina"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              options={[
                { value: "", label: "Sem disciplina" },
                ...subjects.map((item) => ({
                  value: item.id,
                  label: item.name,
                })),
              ]}
            />

            <SelectInput
              label="Tipo"
              value={fileType}
              onChange={(event) => setFileType(event.target.value)}
              options={[
                { value: "submission", label: "Entrega do aluno" },
                { value: "material", label: "Material do professor" },
                { value: "document", label: "Documento acadêmico" },
              ]}
            />

            <label className="field">
              <span>Arquivo</span>
              <input
                type="file"
                onChange={(event) => setFile(event.target.files[0])}
                required
              />
            </label>

            <Alert type={alertType} message={feedback} />

            <Button type="submit">
              Enviar
              <Upload size={16} />
            </Button>
          </form>
        </article>

        <article className="base-card">
          <h2>Arquivos enviados</h2>

          {loading ? (
            <Loading text="Carregando arquivos..." />
          ) : files.length === 0 ? (
            <EmptyState
              title="Nenhum arquivo"
              message="Nenhum arquivo foi enviado ainda."
            />
          ) : (
            <ul className="file-list">
              {files.map((item) => (
                <li key={item.id}>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.subject_name || "Sem disciplina"}</p>
                    <Badge type={item.file_type}>{item.file_type_display}</Badge>
                  </div>

                  <a href={item.file} target="_blank" rel="noreferrer">
                    Abrir
                  </a>
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