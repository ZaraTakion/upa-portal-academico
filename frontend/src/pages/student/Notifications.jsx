import { CheckCircle, Filter } from "lucide-react";
import { useEffect, useState } from "react";

import api from "../../api/axios";
import Alert from "../../components/feedback/Alert";
import EmptyState from "../../components/feedback/EmptyState";
import Loading from "../../components/feedback/Loading";
import MainLayout from "../../components/layout/MainLayout";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import PageHeader from "../../components/ui/PageHeader";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [type, setType] = useState("");
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [alertType, setAlertType] = useState("success");

  async function loadNotifications() {
    setLoading(true);

    try {
      const response = await api.get("/notifications/", {
        params: {
          type: type || undefined,
          unread: onlyUnread ? "true" : undefined,
          active_only: "true",
        },
      });

      setNotifications(response.data);
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
      setAlertType("error");
      setFeedback("Não foi possível carregar as notificações.");
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(id) {
    try {
      await api.patch(`/notifications/${id}/mark_as_read/`);

      setAlertType("success");
      setFeedback("Notificação marcada como lida.");

      loadNotifications();
    } catch (error) {
      console.error("Erro ao marcar notificação:", error);
      setAlertType("error");
      setFeedback("Erro ao atualizar notificação.");
    }
  }

  useEffect(() => {
    loadNotifications();
  }, [type, onlyUnread]);

  return (
    <MainLayout>
      <PageHeader
        eyebrow="Comunicados"
        title="Notificações"
        description="Veja avisos acadêmicos, eventos, estágios e oportunidades."
      />

      <div className="toolbar">
        <div className="toolbar-input">
          <Filter size={18} />

          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
          >
            <option value="">Todas</option>
            <option value="notice">Comunicados</option>
            <option value="academic">Acadêmico</option>
            <option value="event">Eventos</option>
            <option value="internship">Estágios</option>
            <option value="job">Vagas de emprego</option>
          </select>
        </div>

        <label className="checkbox-filter">
          <input
            type="checkbox"
            checked={onlyUnread}
            onChange={(event) => setOnlyUnread(event.target.checked)}
          />
          Apenas não lidas
        </label>
      </div>

      <Alert type={alertType} message={feedback} />

      {loading ? (
        <Loading text="Carregando notificações..." />
      ) : notifications.length === 0 ? (
        <EmptyState
          title="Nenhuma notificação"
          message="Não há avisos ativos para este filtro."
        />
      ) : (
        <section className="notification-list">
          {notifications.map((notification) => (
            <article
              className={`notification-card ${
                notification.is_read ? "read" : "unread"
              }`}
              key={notification.id}
            >
              <div>
                <Badge type={notification.notification_type}>
                  {notification.type_display}
                </Badge>

                <h2>{notification.title}</h2>
                <p>{notification.message}</p>

                {notification.expires_at && (
                  <small>Expira em: {notification.expires_at}</small>
                )}
              </div>

              {!notification.is_read && (
                <Button
                  variant="secondary"
                  onClick={() => markAsRead(notification.id)}
                >
                  <CheckCircle size={16} />
                  Marcar como lida
                </Button>
              )}
            </article>
          ))}
        </section>
      )}
    </MainLayout>
  );
}

export default Notifications;