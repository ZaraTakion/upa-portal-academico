import { CalendarDays, Filter } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import api from "../../api/axios";
import EmptyState from "../../components/feedback/EmptyState";
import Loading from "../../components/feedback/Loading";
import MainLayout from "../../components/layout/MainLayout";
import Badge from "../../components/ui/Badge";
import BaseCard from "../../components/ui/BaseCard";
import PageHeader from "../../components/ui/PageHeader";

function Calendar() {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState("all");
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

  const filteredEvents = useMemo(() => {
    if (filter === "all") return events;

    return events.filter((event) => event.event_type === filter);
  }, [events, filter]);

  useEffect(() => {
    loadEvents();
  }, []);

  return (
    <MainLayout>
      <PageHeader
        eyebrow="Agenda institucional"
        title="Calendário Acadêmico"
        description="Acompanhe aulas, provas, feriados, eventos e comunicados."
      />

      <div className="toolbar">
        <div className="toolbar-input">
          <Filter size={18} />

          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            <option value="all">Todos</option>
            <option value="class">Aulas</option>
            <option value="holiday">Feriados</option>
            <option value="exam">Provas</option>
            <option value="final_exam">Provas finais</option>
            <option value="enrollment">Matrícula</option>
            <option value="event">Eventos</option>
            <option value="notice">Comunicados</option>
          </select>
        </div>
      </div>

      {loading ? (
        <Loading text="Carregando calendário..." />
      ) : filteredEvents.length === 0 ? (
        <EmptyState
          title="Nenhum evento encontrado"
          message="Não há eventos cadastrados para este filtro."
        />
      ) : (
        <section className="calendar-grid">
          {filteredEvents.map((event) => (
            <BaseCard
              key={event.id}
              className={`calendar-card event-${event.event_type}`}
            >
              <div className="calendar-date">
                <CalendarDays size={20} />
                <span>{event.start_date}</span>
              </div>

              <Badge type={event.event_type}>
                {event.event_type_display}
              </Badge>

              <h2>{event.title}</h2>
              <p>{event.description}</p>

              {event.end_date && <small>Até {event.end_date}</small>}
            </BaseCard>
          ))}
        </section>
      )}
    </MainLayout>
  );
}

export default Calendar;