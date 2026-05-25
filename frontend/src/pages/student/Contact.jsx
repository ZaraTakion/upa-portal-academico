import { Send } from "lucide-react";
import { useState } from "react";

import api from "../../api/axios";
import Alert from "../../components/feedback/Alert";
import MainLayout from "../../components/layout/MainLayout";
import Button from "../../components/ui/Button";
import PageHeader from "../../components/ui/PageHeader";
import SelectInput from "../../components/ui/SelectInput";
import TextInput from "../../components/ui/TextInput";
import TextareaInput from "../../components/ui/TextareaInput";

function Contact() {
  const [destination, setDestination] = useState("Secretaria Acadêmica");
  const [contactType, setContactType] = useState("academic");
  const [returnChannel, setReturnChannel] = useState("email");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [feedback, setFeedback] = useState("");
  const [alertType, setAlertType] = useState("info");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setFeedback("");

    try {
      await api.post("/contact/", {
        destination,
        contact_type: contactType,
        return_channel: returnChannel,
        subject,
        message,
      });

      setAlertType("success");
      setFeedback("Mensagem enviada com sucesso.");

      setSubject("");
      setMessage("");
    } catch (error) {
      console.error("Erro ao enviar contato:", error);
      setAlertType("error");
      setFeedback("Erro ao enviar mensagem.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <MainLayout>
      <PageHeader
        eyebrow="Atendimento"
        title="Contato"
        description="Envie solicitações para setores acadêmicos e administrativos."
      />

      <section className="base-card form-card">
        <form className="form-stack" onSubmit={handleSubmit}>
          <TextInput
            label="Destino"
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
            required
          />

          <SelectInput
            label="Tipo de contato"
            value={contactType}
            onChange={(event) => setContactType(event.target.value)}
            options={[
              { value: "academic", label: "Acadêmico" },
              { value: "financial", label: "Financeiro" },
              { value: "technical", label: "Suporte técnico" },
              { value: "secretary", label: "Secretaria" },
              { value: "other", label: "Outro" },
            ]}
          />

          <SelectInput
            label="Canal de retorno"
            value={returnChannel}
            onChange={(event) => setReturnChannel(event.target.value)}
            options={[
              { value: "email", label: "E-mail" },
              { value: "phone", label: "Telefone" },
              { value: "whatsapp", label: "WhatsApp" },
              { value: "portal", label: "Portal" },
            ]}
          />

          <TextInput
            label="Assunto"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            required
          />

          <TextareaInput
            label="Mensagem"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={6}
            required
          />

          <Alert type={alertType} message={feedback} />

          <Button type="submit" disabled={loading}>
            {loading ? "Enviando..." : "Enviar solicitação"}
            {!loading && <Send size={16} />}
          </Button>
        </form>
      </section>
    </MainLayout>
  );
}

export default Contact;