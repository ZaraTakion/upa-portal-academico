import Badge from "../ui/Badge";
import BaseCard from "../ui/BaseCard";

function CalendarCard({ event }) {
  return (
    <BaseCard
      className={`calendar-card event-${event.event_type}`}
    >
      <Badge type={event.event_type}>
        {event.event_type_display}
      </Badge>

      <h2>{event.title}</h2>

      <p>{event.description}</p>

      <small>{event.start_date}</small>
    </BaseCard>
  );
}

export default CalendarCard;