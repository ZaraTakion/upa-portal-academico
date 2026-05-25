import { ArrowLeft, KeyRound, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import api from "../api/axios";
import Alert from "../components/feedback/Alert";
import Button from "../components/ui/Button";
import TextInput from "../components/ui/TextInput";

function ForgotPassword() {
  const [registration, setRegistration] = useState("");
  const [cpf, setCpf] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [feedback, setFeedback] = useState("");
  const [alertType, setAlertType] = useState("info");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setFeedback("");

    if (newPassword !== confirmPassword) {
      setAlertType("error");
      setFeedback("As senhas não coincidem.");
      return;
    }

    if (newPassword.length < 6) {
      setAlertType("error");
      setFeedback("A nova senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/accounts/reset-password/", {
        registration,
        cpf,
        new_password: newPassword,
      });

      setAlertType("success");
      setFeedback("Senha atualizada com sucesso. Volte para o login.");

      setRegistration("");
      setCpf("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Erro ao recuperar senha:", error);

      setAlertType("error");
      setFeedback(
        error.response?.data?.detail ||
          "Não foi possível atualizar a senha. Confira matrícula e CPF."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page auth-page-simple">
      <section className="auth-panel">
        <div className="auth-brand">
          <div className="auth-logo">
            <KeyRound size={28} />
          </div>

          <div>
            <strong>Recuperação de Senha</strong>
            <span>UPA Portal Acadêmico</span>
          </div>
        </div>

        <div className="auth-copy">
          <h1>Redefina seu acesso</h1>
          <p>
            Informe seus dados acadêmicos para validar sua identidade e criar uma
            nova senha.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <TextInput
            label="Matrícula"
            value={registration}
            onChange={(event) => setRegistration(event.target.value)}
            placeholder="Ex: 2026001"
            required
          />

          <TextInput
            label="CPF"
            value={cpf}
            onChange={(event) => setCpf(event.target.value)}
            placeholder="000.000.000-00"
            required
          />

          <TextInput
            label="Nova senha"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="Digite a nova senha"
            required
          />

          <TextInput
            label="Confirmar nova senha"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Confirme a nova senha"
            required
          />

          <Alert type={alertType} message={feedback} />

          <Button type="submit" disabled={loading}>
            {loading ? "Atualizando..." : "Atualizar senha"}
            {!loading && <ShieldCheck size={16} />}
          </Button>
        </form>

        <Link to="/" className="auth-link">
          <ArrowLeft size={16} />
          Voltar para login
        </Link>
      </section>
    </main>
  );
}

export default ForgotPassword;