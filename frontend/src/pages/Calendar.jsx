import { useEffect, useState } from "react";
import api from "../api/axios";
import Loading from "../components/feedback/Loading";
import MainLayout from "../layouts/MainLayout";

function Calendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadEvents() {
    try {
      const response = await api.get("/academic/calendar/");
      setEvents(response.data);
    } catch (error) {
      console.error("Erro ao carregar calendário:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  return (
    <MainLayout>
      <h1>Calendário Acadêmico</h1>

      {loading ? (
        <Loading text="Carregando calendário..." />
      ) : events.length === 0 ? (
        <p>Nenhum evento encontrado.</p>
      ) : (
        <ul>
          {events.map((event) => (
            <li key={event.id}>
              <strong>{event.title}</strong> — {event.event_date}
              <p>{event.description}</p>
            </li>
          ))}
        </ul>
      )}
    </MainLayout>
  );
}

export default Calendar;