import { ArrowLeft, Mail } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import api from "../api/axios";
import Alert from "../components/feedback/Alert";
import Button from "../components/ui/Button";
import TextInput from "../components/ui/TextInput";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState("");
  const [alertType, setAlertType] = useState("info");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setFeedback("");
    setLoading(true);

    try {
      const response = await api.post("/accounts/reset-password/", { email });
      setAlertType("success");
      setFeedback(response.data.detail);
    } catch {
      setAlertType("error");
      setFeedback("Não foi possível processar a solicitação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page auth-page-simple">
      <section className="auth-panel">
        <div className="auth-brand">
          <div className="auth-logo"><Mail size={28} /></div>
          <div><strong>Recuperação de senha</strong><span>UPA Portal Acadêmico</span></div>
        </div>

        <div className="auth-copy">
          <h1>Redefina seu acesso</h1>
          <p>Informe o e-mail cadastrado. Se houver uma conta ativa, enviaremos um link temporário para criar uma nova senha.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <TextInput
            label="E-mail cadastrado"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="voce@exemplo.com"
            autoComplete="email"
            required
          />
          <Alert type={alertType} message={feedback} />
          <Button type="submit" disabled={loading}>
            {loading ? "Enviando..." : "Enviar link de redefinição"}
          </Button>
        </form>

        <Link to="/" className="auth-link">
          <ArrowLeft size={16} /> Voltar para login
        </Link>
      </section>
    </main>
  );
}

export default ForgotPassword;
