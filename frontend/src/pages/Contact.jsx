import { useState } from "react";
import api from "../api/axios";
import Alert from "../components/feedback/Alert";
import MainLayout from "../layouts/MainLayout";

function Contact() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setFeedback("");

    try {
      await api.post("/contact/", {
        subject,
        message,
      });

      setSubject("");
      setMessage("");
      setFeedback("Mensagem enviada com sucesso.");
    } catch (error) {
      console.error("Erro ao enviar contato:", error);
      setFeedback("Erro ao enviar mensagem.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <MainLayout>
      <h1>Contato</h1>

      <form onSubmit={handleSubmit}>
        <label>Assunto</label>
        <input
          type="text"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          required
        />

        <label>Mensagem</label>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          required
        />

        <Alert message={feedback} />

        <button type="submit" disabled={loading}>
          {loading ? "Enviando..." : "Enviar"}
        </button>
      </form>
    </MainLayout>
  );
}

export default Contact;