import { Send } from "lucide-react";
import { useEffect, useState } from "react";

import { useAuth } from "../../context/AuthContext";
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

function Contact() {
  const { user } = useAuth();
  const [responses, setResponses] = useState({});
  const [responding, setResponding] = useState(null);
  const [destination, setDestination] = useState("Secretaria Acadêmica");
  const [contactType, setContactType] = useState("academic");
  const [returnChannel, setReturnChannel] = useState("email");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [tickets, setTickets] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [alertType, setAlertType] = useState("info");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  async function loadTickets() {
    try {
      const response = await api.get("/contact/");
      setTickets(response.data);
    } catch {
      setAlertType("error");
      setFeedback("Não foi possível carregar suas solicitações.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSending(true);
    setFeedback("");

    try {
      const response = await api.post("/contact/", {
        destination,
        contact_type: contactType,
        return_channel: returnChannel,
        subject,
        message,
      });
      setAlertType("success");
      setFeedback(`Solicitação registrada. Protocolo: ${response.data.protocol}`);
      setSubject("");
      setMessage("");
      await loadTickets();
    } catch {
      setAlertType("error");
      setFeedback("Não foi possível enviar a solicitação. Tente novamente.");
    } finally {
      setSending(false);
    }
  }

  async function respond(event, ticket) {
    event.preventDefault();
    setResponding(ticket.id);
    try {
      await api.patch(`/contact/${ticket.id}/`, { response: responses[ticket.id] ?? ticket.response ?? "", status: "answered" });
      setAlertType("success");
      setFeedback("Resposta enviada ao solicitante.");
      await loadTickets();
    } catch {
      setAlertType("error");
      setFeedback("Não foi possível responder à solicitação.");
    } finally { setResponding(null); }
  }

  useEffect(() => {
    loadTickets();
  }, []);

  return (
    <MainLayout>
      <Alert type={alertType} message={feedback} />
      <PageHeader
        eyebrow="Atendimento"
        title="Atendimento"
        description="Registre uma solicitação e acompanhe seu protocolo e as respostas recebidas."
      />

      <section className="split-grid">
        <article className="base-card form-card">
          <h2>Nova solicitação</h2>
          <form className="form-stack" onSubmit={handleSubmit}>
            <TextInput label="Destino" value={destination} onChange={(event) => setDestination(event.target.value)} required />
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
            <TextInput label="Assunto" value={subject} onChange={(event) => setSubject(event.target.value)} required maxLength={200} />
            <TextareaInput label="Mensagem" value={message} onChange={(event) => setMessage(event.target.value)} rows={6} required />
            <Button type="submit" disabled={sending}>
              {sending ? "Enviando..." : "Enviar solicitação"}
              {!sending && <Send size={16} />}
            </Button>
          </form>
        </article>

        <article className="base-card">
          <h2>{user?.is_staff ? "Solicitações recebidas" : "Minhas solicitações"}</h2>
          {loading ? (
            <Loading text="Carregando solicitações..." />
          ) : tickets.length === 0 ? (
            <EmptyState title="Nenhuma solicitação" message="Quando você entrar em contato, o histórico aparecerá aqui." />
          ) : (
            <ul className="simple-list">
              {tickets.map((ticket) => (
                <li key={ticket.id} className="ticket-item">
                  <div>
                    <strong>{ticket.subject}</strong>
                    <p>Protocolo {ticket.protocol}</p>
                    <small>{new Date(ticket.created_at).toLocaleString("pt-BR")}</small>
                    <p>{ticket.message}</p>
                    {ticket.response && <p><strong>Resposta:</strong> {ticket.response}</p>}
                    {user?.is_staff && <form className="form-stack" onSubmit={(event) => respond(event, ticket)}>
                      <p>Solicitante: {ticket.username}</p>
                      <TextareaInput label={`Resposta para ${ticket.subject}`} value={responses[ticket.id] ?? ticket.response ?? ""} onChange={(event) => setResponses((current) => ({ ...current, [ticket.id]: event.target.value }))} required rows={3} />
                      <Button type="submit" disabled={responding !== null}>Responder solicitação</Button>
                    </form>}
                  </div>
                  <Badge type={ticket.status}>{ticket.status_display}</Badge>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>
    </MainLayout>
  );
}

export default Contact;
