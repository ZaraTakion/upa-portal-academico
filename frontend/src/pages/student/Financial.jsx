import {
  AlertTriangle,
  CheckCircle,
  CreditCard,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import api from "../../api/axios";
import Alert from "../../components/feedback/Alert";
import EmptyState from "../../components/feedback/EmptyState";
import Loading from "../../components/feedback/Loading";
import MainLayout from "../../components/layout/MainLayout";
import Badge from "../../components/ui/Badge";
import BaseCard from "../../components/ui/BaseCard";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";

function Financial() {
  const [invoices, setInvoices] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [alertType, setAlertType] = useState("info");

  async function loadInvoices() {
    setLoading(true);

    try {
      const response = await api.get("/financial/", {
        params: {
          status: status || undefined,
        },
      });

      setInvoices(response.data);
    } catch (error) {
      console.error("Erro ao carregar financeiro:", error);
      setAlertType("error");
      setFeedback("Erro ao carregar informações financeiras.");
    } finally {
      setLoading(false);
    }
  }

  function toNumber(value) {
    return Number(String(value).replace(",", ".")) || 0;
  }

  function formatMoney(value) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(toNumber(value));
  }

  const summary = useMemo(() => {
    const paid = invoices
      .filter((item) => item.status === "paid")
      .reduce((total, item) => total + toNumber(item.amount), 0);

    const pending = invoices
      .filter((item) => item.status === "pending")
      .reduce((total, item) => total + toNumber(item.amount), 0);

    const overdue = invoices
      .filter((item) => item.status === "overdue")
      .reduce((total, item) => total + toNumber(item.amount), 0);

    const nextInvoice = invoices
      .filter((item) => item.status !== "paid")
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0];

    return {
      paid,
      pending,
      overdue,
      nextInvoice,
    };
  }, [invoices]);

  useEffect(() => {
    loadInvoices();
  }, [status]);

  return (
    <MainLayout>
      <PageHeader
        eyebrow="Financeiro"
        title="Mensalidades e Pendências"
        description="Consulte suas faturas e vencimentos registrados pela administração."
      />

      <div className="alert alert-info" role="status">
        Este portal não processa pagamentos. Use as instruções de pagamento
        fornecidas pela administração da instituição.
      </div>

      <Alert type={alertType} message={feedback} />

      <section className="stats-grid">
        <StatCard
          icon={<CheckCircle size={22} />}
          label="Total pago"
          value={formatMoney(summary.paid)}
        />

        <StatCard
          icon={<Wallet size={22} />}
          label="Pendente"
          value={formatMoney(summary.pending)}
        />

        <StatCard
          icon={<AlertTriangle size={22} />}
          label="Vencido"
          value={formatMoney(summary.overdue)}
        />

        <StatCard
          icon={<CreditCard size={22} />}
          label="Próximo vencimento"
          value={summary.nextInvoice?.due_date || "-"}
          helper={summary.nextInvoice?.description}
        />
      </section>

      <div className="toolbar">
        <select
          aria-label="Filtrar faturas por situação"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="">Todos</option>
          <option value="paid">Pagos</option>
          <option value="pending">Pendentes</option>
          <option value="overdue">Vencidos</option>
        </select>
      </div>

      {loading ? (
        <Loading text="Carregando financeiro..." />
      ) : invoices.length === 0 ? (
        <EmptyState
          title="Nenhuma cobrança"
          message="Nenhuma mensalidade encontrada para este filtro."
        />
      ) : (
        <section className="cards-grid">
          {invoices.map((invoice) => (
            <BaseCard key={invoice.id} className="finance-card">
              <div className="card-between">
                <Badge type={invoice.status}>{invoice.status_display}</Badge>
                <small>{invoice.payment_method_display}</small>
              </div>

              <h2>{invoice.description}</h2>

              <strong className="money-value">
                {formatMoney(invoice.amount)}
              </strong>

              <p>
                <strong>Vencimento:</strong> {invoice.due_date}
              </p>

              <p>
                <strong>Status:</strong> {invoice.status_display}
              </p>

              {invoice.payment_method_display && (
                <p>
                  <strong>Forma informada:</strong> {invoice.payment_method_display}
                </p>
              )}
            </BaseCard>
          ))}
        </section>
      )}
    </MainLayout>
  );
}

export default Financial;