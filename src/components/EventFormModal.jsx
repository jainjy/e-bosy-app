// src/components/EventFormModal.jsx
import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Import datepicker styles

const EventFormModal = ({ onClose, onSubmit, event }) => {
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    start_time: null,
    end_time: null,
    location_type: "",
    address: "",
  });

  // Populate form with existing event data if in edit mode
  useEffect(() => {
    if (event) {
      setEventData({
        ...event,
        // Convert ISO strings back to Date objects for react-datepicker
        start_time: event.start_time ? new Date(event.start_time) : null,
        end_time: event.end_time ? new Date(event.end_time) : null,
      });
    } else {
      // Reset for new event
      setEventData({
        title: "",
        description: "",
        start_time: null,
        end_time: null,
        location_type: "",
        address: "",
      });
    }
  }, [event]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleDateChange = (date, name) => {
    setEventData((prevData) => ({
      ...prevData,
      [name]: date,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Convert Date objects back to ISO strings for submission
    const submittedData = {
      ...eventData,
      start_time: eventData.start_time ? eventData.start_time.toISOString() : null,
      end_time: eventData.end_time ? eventData.end_time.toISOString() : null,
    };
    onSubmit(submittedData);
    onClose();
  };

  const modalTitle = event ? "Modifier l'événement" : "Créer un Nouvel Événement";
  const submitButtonText = event ? "Mettre à jour" : "Créer";

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md md:max-w-lg lg:max-w-xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{modalTitle}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">
              Titre:
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={eventData.title}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-e-bosy-purple"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
              Description:
            </label>
            <textarea
              id="description"
              name="description"
              value={eventData.description}
              onChange={handleChange}
              rows="3"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-e-bosy-purple"
              required
            ></textarea>
          </div>
          <div className="mb-4 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="start_time" className="block text-gray-700 text-sm font-bold mb-2">
                Heure de début:
              </label>
              <DatePicker
                selected={eventData.start_time}
                onChange={(date) => handleDateChange(date, "start_time")}
                showTimeSelect
                dateFormat="Pp"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-e-bosy-purple"
                required
              />
            </div>
            <div className="flex-1">
              <label htmlFor="end_time" className="block text-gray-700 text-sm font-bold mb-2">
                Heure de fin:
              </label>
              <DatePicker
                selected={eventData.end_time}
                onChange={(date) => handleDateChange(date, "end_time")}
                showTimeSelect
                dateFormat="Pp"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-e-bosy-purple"
                required
              />
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="location_type" className="block text-gray-700 text-sm font-bold mb-2">
              Type de lieu:
            </label>
            <select
              id="location_type"
              name="location_type"
              value={eventData.location_type}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-e-bosy-purple"
              required
            >
              <option value="">Sélectionnez un type</option>
              <option value="online">En ligne</option>
              <option value="physical">Physique</option>
            </select>
          </div>
          {eventData.location_type === "physical" && (
            <div className="mb-4">
              <label htmlFor="address" className="block text-gray-700 text-sm font-bold mb-2">
                Adresse:
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={eventData.address}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-e-bosy-purple"
                required={eventData.location_type === "physical"}
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="bg-e-bosy-purple hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              {submitButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventFormModal;