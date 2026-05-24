import { useEffect, useState } from "react";
import api from "../api/axios";
import Alert from "../components/feedback/Alert";
import Loading from "../components/feedback/Loading";
import MainLayout from "../layouts/MainLayout";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadNotifications() {
    try {
      const response = await api.get("/notifications/");
      setNotifications(response.data);
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(id) {
    try {
      const response = await api.patch(`/notifications/${id}/mark_as_read/`);
      setFeedback(response.data.detail);
      loadNotifications();
    } catch (error) {
      console.error("Erro ao marcar notificação:", error);
      setFeedback("Erro ao marcar notificação.");
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  return (
    <MainLayout>
      <h1>Notificações</h1>

      <Alert message={feedback} />

      {loading ? (
        <Loading text="Carregando notificações..." />
      ) : notifications.length === 0 ? (
        <p>Nenhuma notificação encontrada.</p>
      ) : (
        <ul>
          {notifications.map((notification) => (
            <li key={notification.id}>
              <strong>{notification.title}</strong>
              <p>{notification.message}</p>
              <p>Status: {notification.is_read ? "Lida" : "Não lida"}</p>

              {!notification.is_read && (
                <button type="button" onClick={() => markAsRead(notification.id)}>
                  Marcar como lida
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </MainLayout>
  );
}

export default Notifications;