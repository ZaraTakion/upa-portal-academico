import Badge from "../ui/Badge";
import Button from "../ui/Button";

function NotificationCard({
  notification,
  onRead,
}) {
  return (
    <article
      className={`notification-card ${
        notification.is_read
          ? "read"
          : "unread"
      }`}
    >
      <div>
        <Badge type={notification.notification_type}>
          {notification.type_display}
        </Badge>

        <h2>{notification.title}</h2>

        <p>{notification.message}</p>
      </div>

      {!notification.is_read && (
        <Button
          variant="secondary"
          onClick={() => onRead(notification.id)}
        >
          Marcar como lida
        </Button>
      )}
    </article>
  );
}

export default NotificationCard;