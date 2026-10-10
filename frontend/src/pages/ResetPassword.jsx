import AuthLayout from "../components/layout/AuthLayout";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import api from "../api/axios";
import Alert from "../components/feedback/Alert";
import Button from "../components/ui/Button";
import TextInput from "../components/ui/TextInput";

function ResetPassword() {
  const { uidb64, token } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [feedback, setFeedback] = useState("");
  const [alertType, setAlertType] = useState("info");
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setFeedback("");

    if (newPassword !== confirmPassword) {
      setAlertType("error");
      setFeedback("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(
        `/accounts/reset-password/${uidb64}/${token}/`,
        { new_password: newPassword },
      );
      setAlertType("success");
      setFeedback(response.data.detail);
      setComplete(true);
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setAlertType("error");
      const detail = error.response?.data?.detail;
      setFeedback(
        Array.isArray(detail)
          ? detail.join(" ")
          : detail || "Link inválido ou expirado.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Segurança da conta"
      title="Crie uma nova senha"
      description="Este link é temporário e só pode ser usado uma vez."
    >
      {!complete && (
        <form className="auth-form" onSubmit={handleSubmit}>
          <TextInput
            label="Nova senha"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            autoComplete="new-password"
            required
          />
          <TextInput
            label="Confirme a nova senha"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            required
          />
          <Alert type={alertType} message={feedback} />
          <Button type="submit" disabled={loading}>
            {loading ? "Atualizando..." : "Salvar nova senha"}
          </Button>
        </form>
      )}

      {complete && <Alert type={alertType} message={feedback} />}
      <Link to="/" className="auth-link">
        <ArrowLeft size={16} /> Voltar para login
      </Link>
    </AuthLayout>
  );
}

export default ResetPassword;
