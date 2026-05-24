import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Alert from "../components/feedback/Alert";

function ForgotPassword() {
  const [username, setUsername] = useState("admin");
  const [newPassword, setNewPassword] = useState("admin123");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setFeedback("");

    try {
      const response = await api.post("/accounts/reset-password/", {
        username,
        new_password: newPassword,
      });

      setFeedback(response.data.detail);
    } catch (error) {
      console.error(error);
      setFeedback(error.response?.data?.detail || "Erro ao atualizar senha.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>Recuperação de Senha</h1>

      <form onSubmit={handleSubmit}>
        <label>Usuário</label>
        <input
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          required
        />

        <label>Nova senha</label>
        <input
          type="password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          required
        />

        <Alert message={feedback} />

        <button type="submit" disabled={loading}>
          {loading ? "Atualizando..." : "Atualizar senha"}
        </button>
      </form>

      <Link to="/">Voltar para login</Link>
    </main>
  );
}

export default ForgotPassword;