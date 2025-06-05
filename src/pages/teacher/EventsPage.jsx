// src/pages/TeacherDashboard/EventsPage.jsx
import React, { useState, useCallback } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "moment/locale/fr";

import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import EventFormModal from "../../components/EventFormModal";

moment.locale("fr");
const localizer = momentLocalizer(moment);

const EventsPage = () => {
  const [events, setEvents] = useState([
    {
      id: "event-1",
      title: "Réunion d'équipe hebdomadaire",
      description: "Discussion des progrès du projet et planification future.",
      start_time: new Date(2025, 5, 10, 9, 0),
      end_time: new Date(2025, 5, 10, 10, 0),
      created_by: 101,
      participants_ids: [101, 201, 301],
      location_type: "online",
      address: "Google Meet Link",
    },
    {
      id: "event-2",
      title: "Webinaire: Tendances du développement web 2025",
      description: "Exploration des dernières technologies et frameworks.",
      start_time: new Date(2025, 5, 15, 14, 0),
      end_time: new Date(2025, 5, 15, 15, 30),
      created_by: 101,
      participants_ids: [101, 501, 601],
      location_type: "online",
      address: "Zoom Link",
    },
    {
      id: "event-3",
      title: "Atelier de Design UX/UI",
      description: "Session pratique sur les principes de design.",
      start_time: new Date(2025, 6, 1, 10, 0),
      end_time: new Date(2025, 6, 1, 12, 0),
      created_by: 201,
      participants_ids: [101, 201, 301, 401],
      location_type: "physical",
      address: "123 Rue de la Créativité, Anytown",
    },
  ]);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [calendarView, setCalendarView] = useState(Views.MONTH);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });

  const openCreateEventForm = (start = null, end = null) => {
    setEventToEdit(null);
    setSelectedSlot({ start, end });
    setIsFormModalOpen(true);
  };

  const openEditEventForm = (event) => {
    setEventToEdit(event);
    setSelectedSlot(null);
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setEventToEdit(null);
    setSelectedSlot(null);
  };

  const handleFormSubmit = (submittedEventData) => {
    if (submittedEventData.id) {
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === submittedEventData.id
            ? { ...event, ...submittedEventData }
            : event
        )
      );
    } else {
      const newId = `event-${events.length + 1}-${Date.now()}`;
      setEvents((prevEvents) => [
        ...prevEvents,
        {
          id: newId,
          created_by: 101,
          participants_ids: [],
          ...submittedEventData,
        },
      ]);
    }
    closeFormModal();
  };

  const handleDeleteEvent = (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet événement ?")) {
      setEvents((prevEvents) => prevEvents.filter((event) => event.id !== id));
    }
  };

  const calendarEvents = events.map((event) => ({
    id: event.id,
    title: event.title,
    start: event.start_time,
    end: event.end_time,
    resource: event,
  }));

  const Event = ({ event }) => (
    <div className="flex flex-col h-full">
      <strong className="text-sm font-semibold">{event.title}</strong>
      <p className="text-xs text-gray-600 truncate">
        {moment(event.start).format("LT")} - {moment(event.end).format("LT")}
      </p>
      <div className="flex gap-1 mt-auto pt-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            openEditEventForm(event.resource);
          }}
          className="p-1 rounded-full hover:bg-blue-100 text-blue-600"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteEvent(event.id);
          }}
          className="p-1 rounded-full hover:bg-red-100 text-red-600"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  const handleSelectSlot = useCallback(({ start, end, action }) => {
    if (action === "click") {
      openCreateEventForm(start, end);
    }
  }, []);

  const handleContextMenu = (e, slotInfo) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    openCreateEventForm(slotInfo.start, slotInfo.end);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        <CalendarDaysIcon className="h-8 w-8 inline-block mr-2 text-e-bosy-purple" />
        Mes Événements
      </h1>
      <p className="text-gray-600 mb-8">
        Gérez vos sessions live, réunions et autres événements importants.
      </p>

      <div className="flex justify-end mb-6">
        <button
          onClick={() => openCreateEventForm()}
          className="flex items-center px-4 py-2 bg-e-bosy-purple text-white rounded-lg hover:bg-purple-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Créer Nouvel Événement
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Calendrier des Événements
          </h2>
        </div>

        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          messages={{
            next: "Suivant",
            previous: "Précédent",
            today: "Aujourd'hui",
            month: "Mois",
            week: "Semaine",
            day: "Jour",
            agenda: "Agenda",
            noEventsInRange: "Aucun événement dans cette plage.",
          }}
          components={{
            event: Event,
          }}
          onSelectEvent={(event) => openEditEventForm(event.resource)}
          selectable
          onSelectSlot={handleSelectSlot}
          onDoubleClickEvent={(event) => openEditEventForm(event.resource)}
          view={calendarView}
          onView={setCalendarView}
          date={calendarDate}
          onNavigate={setCalendarDate}
          culture="fr"
          onSlotContextMenu={handleContextMenu}
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Liste des Événements
        </h2>
        {events.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {events.map((event) => (
              <li
                key={event.id}
                className="py-4 flex items-center justify-between"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {event.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {moment(event.start_time).format("DD/MM/YYYY HH:mm")} -{" "}
                    {moment(event.end_time).format("DD/MM/YYYY HH:mm")}
                  </p>
                  <p className="text-sm text-gray-500">{event.description}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditEventForm(event)}
                    className="p-2 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="p-2 rounded-md bg-red-100 text-red-700 hover:bg-red-200"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">Aucun événement à afficher.</p>
        )}
      </div>

      {isFormModalOpen && (
        <EventFormModal
          onClose={closeFormModal}
          onSubmit={handleFormSubmit}
          event={
            eventToEdit ||
            (selectedSlot
              ? { start_time: selectedSlot.start, end_time: selectedSlot.end }
              : null)
          }
        />
      )}
    </div>
  );
};

export default EventsPage;