import { useEffect, useState } from "react";
import api from "../api/axios";
import Alert from "../components/feedback/Alert";
import MainLayout from "../layouts/MainLayout";

function Files() {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadFiles() {
    try {
      const response = await api.get("/files/");
      setFiles(response.data);
    } catch (error) {
      console.error("Erro ao carregar arquivos:", error);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!file) {
      setFeedback("Selecione um arquivo.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", file);

    setLoading(true);
    setFeedback("");

    try {
      await api.post("/files/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setTitle("");
      setFile(null);
      setFeedback("Arquivo enviado com sucesso.");
      loadFiles();
    } catch (error) {
      console.error("Erro ao enviar arquivo:", error);
      setFeedback("Erro ao enviar arquivo.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFiles();
  }, []);

  return (
    <MainLayout>
      <h1>Arquivos Acadêmicos</h1>

      <form onSubmit={handleSubmit}>
        <label>Título</label>
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />

        <label>Arquivo</label>
        <input
          type="file"
          onChange={(event) => setFile(event.target.files[0])}
          required
        />

        <Alert message={feedback} />

        <button type="submit" disabled={loading}>
          {loading ? "Enviando..." : "Enviar arquivo"}
        </button>
      </form>

      <h2>Arquivos disponíveis</h2>

      {files.length === 0 ? (
        <p>Nenhum arquivo enviado.</p>
      ) : (
        <ul>
          {files.map((item) => (
            <li key={item.id}>
              <strong>{item.title}</strong>
              <p>Autor: {item.full_name || item.username}</p>
              <a href={item.file} target="_blank" rel="noreferrer">
                Abrir arquivo
              </a>
            </li>
          ))}
        </ul>
      )}
    </MainLayout>
  );
}

export default Files;