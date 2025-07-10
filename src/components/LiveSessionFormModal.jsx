import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { getData, postData, putData } from "../services/ApiFetch";
import { useAuth } from "../contexts/AuthContext";
import { API_BASE_URL } from "../services/ApiFetch";
import {
  CalendarDaysIcon,
  ClockIcon,
  VideoCameraIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const LiveSessionFormModal = ({ onClose, onSubmit, session }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    courseId: "",
    startTime: "",
    duration: "60", // Durée en minutes par défaut
    description: "",
    hostId: user?.userId || "",
  });
  const [courses, setCourses] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const modalRef = useRef(null);
  const baseUrl = `${API_BASE_URL}/api/livesessions`;

  // Fetch courses for the current user
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const [data, error] = await getData(`courses/teacher/${user.userId}`);
        if (error) throw error;
        setCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast.error("Failed to load courses");
      }
    };

    if (user?.userId) {
      fetchCourses();
    }
  }, [user]);

  // Set form data if editing an existing session
  useEffect(() => {
    if (session) {
      const startTime = new Date(session.startTime);
      const duration = (new Date(session.endTime) - startTime) / 60000; // Calculate duration in minutes

      // Format dates for datetime-local input
      const formatForInput = (date) => {
        const offset = date.getTimezoneOffset() * 60000; // Offset in milliseconds
        const localISOTime = new Date(date - offset).toISOString();
        return localISOTime.substring(0, 16); // YYYY-MM-DDTHH:MM
      };

      setFormData({
        title: session.title || "",
        courseId: session.courseId || "",
        startTime: formatForInput(startTime),
        duration: duration.toString(),
        description: session.description || "",
        hostId: session.hostId || user?.userId || "",
      });
    }
  }, [session, user]);

  // Handle click outside modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title) newErrors.title = "Le titre est requis";
    if (!formData.courseId) newErrors.courseId = "Le cours est requis";
    if (!formData.startTime) newErrors.startTime = "L'heure de début est requise";
    if (!formData.duration) newErrors.duration = "La durée est requise";

    if (formData.startTime && formData.duration) {
      const start = new Date(formData.startTime);
      const duration = parseInt(formData.duration);
      const end = new Date(start.getTime() + duration * 60000);

      if (start >= end) {
        newErrors.duration = "La durée doit être positive";
      }

      // Check if start time is in the future
      const now = new Date();
      if (start <= now) {
        newErrors.startTime = "L'heure de début doit être dans le futur";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const startDate = new Date(formData.startTime);
      const endDate = new Date(startDate.getTime() + parseInt(formData.duration) * 60000);

      const sessionData = {
        ...formData,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        attendeesIds: [], // Initialize with empty array, can be updated later
      };

      let result;
      if (session) {
        // Update existing session
        const [data, error] = await putData(`${baseUrl}/${session.id}`, sessionData);
        if (error) throw error;
        result = data;
        toast.success("Session mise à jour avec succès");
      } else {
        // Create new session
        const [data, error] = await postData(baseUrl, sessionData);
        if (error) throw error;
        result = data;
        toast.success("Session planifiée avec succès");
      }

      // Pass the result to parent component
      onSubmit(result);
      onClose();
    } catch (error) {
      console.error("Error saving session:", error);
      toast.error(error.message || "Une erreur est survenue lors de l'enregistrement");
    } finally {
      setSubmitting(false);
    }
  };

  const modalTitle = session ? "Modifier la session" : "Planifier une nouvelle session";
  const submitButtonText = submitting
    ? session
      ? "Mise à jour..."
      : "Planification..."
    : session
    ? "Mettre à jour"
    : "Planifier la session";

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{modalTitle}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={submitting}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Titre de la session *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title ? "border-red-500" : "border-gray-300"
              }`}
              disabled={submitting}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          <div>
            <label
              htmlFor="courseId"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Cours *
            </label>
            <select
              id="courseId"
              name="courseId"
              value={formData.courseId}
              onChange={handleChange}
              className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.courseId ? "border-red-500" : "border-gray-300"
              }`}
              disabled={submitting || courses.length === 0}
            >
              <option value="">Sélectionnez un cours</option>
              {courses.map((course) => (
                <option key={course.courseId} value={course.courseId}>
                  {course.title}
                </option>
              ))}
            </select>
            {errors.courseId && (
              <p className="text-red-500 text-sm mt-1">{errors.courseId}</p>
            )}
            {courses.length === 0 && (
              <p className="text-yellow-600 text-sm mt-1">
                Aucun cours trouvé. Vous devez d'abord créer un cours avant de planifier une session.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="startTime"
                className="block text-gray-700 text-sm font-bold mb-2 flex items-center"
              >
                <CalendarDaysIcon className="h-4 w-4 mr-2" />
                Date et heure de début *
              </label>
              <input
                type="datetime-local"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.startTime ? "border-red-500" : "border-gray-300"
                }`}
                disabled={submitting}
              />
              {errors.startTime && (
                <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="duration"
                className="block text-gray-700 text-sm font-bold mb-2 flex items-center"
              >
                <ClockIcon className="h-4 w-4 mr-2" />
                Durée (minutes) *
              </label>
              <input
                type="number"
                id="duration"
                name="duration"
                min="15"
                max="480"
                value={formData.duration}
                onChange={handleChange}
                className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.duration ? "border-red-500" : "border-gray-300"
                }`}
                disabled={submitting}
              />
              {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
            </div>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Description (optionnel)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={submitting}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting || courses.length === 0}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
            >
              <VideoCameraIcon className="h-4 w-4 mr-2" />
              {submitButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LiveSessionFormModal;