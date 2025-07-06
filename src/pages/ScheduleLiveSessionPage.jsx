import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  CalendarDaysIcon,
  ClockIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";
import { getData, postData } from "../services/ApiFetch";
import { API_BASE_URL } from "../services/ApiFetch";
import { toast } from "react-toastify";

const ScheduleLiveSessionPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    courseId: "",
    startTime: "",
    endTime: "",
    description: "",
    hostId: user.userId,
  });
  const baseUrl = `${API_BASE_URL}/api/livesessions`;

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
    fetchCourses();
  }, [user.userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = "Le titre est requis";
    if (!formData.courseId) newErrors.courseId = "Le cours est requis";
    if (!formData.startTime) newErrors.startTime = "L'heure de début est requise";
    if (!formData.endTime) newErrors.endTime = "L'heure de fin est requise";

    if (formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      if (start >= end) newErrors.endTime = "L'heure de fin doit être après l'heure de début";
      const now = new Date();
      if (start <= now) newErrors.startTime = "L'heure de début doit être dans le futur";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const sessionData = {
        ...formData,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        attendeesIds: [],
      };
      const [data, error] = await postData(baseUrl, sessionData);
      if (error) throw error;
      toast.success("Session planifiée avec succès");
      navigate(`/live-session/${data.id}`);
    } catch (error) {
      console.error("Error scheduling session:", error);
      toast.error("Échec de la planification de la session");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Planifier une session en direct</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 mb-2">Titre</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${
              errors.title ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Cours</label>
          <select
            name="courseId"
            value={formData.courseId}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${
              errors.courseId ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Sélectionnez un cours</option>
            {courses.map((course) => (
              <option key={course.courseId} value={course.courseId}>
                {course.title}
              </option>
            ))}
          </select>
          {errors.courseId && <p className="text-red-500 text-sm mt-1">{errors.courseId}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-2 flex items-center">
              <CalendarDaysIcon className="h-4 w-4 mr-2" />
              Date et heure de début
            </label>
            <input
              type="datetime-local"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${
                errors.startTime ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.startTime && <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>}
          </div>

          <div>
            <label className="block text-gray-700 mb-2 flex items-center">
              <ClockIcon className="h-4 w-4 mr-2" />
              Date et heure de fin
            </label>
            <input
              type="datetime-local"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${
                errors.endTime ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.endTime && <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>}
          </div>
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Description (Optionnel)</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows="3"
          />
        </div>

        {errors.submit && <p className="text-red-500 text-sm">{errors.submit}</p>}

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 border rounded"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-blue-500 text-white rounded flex items-center disabled:bg-blue-300"
          >
            {submitting ? (
              "Planification..."
            ) : (
              <>
                <VideoCameraIcon className="h-4 w-4 mr-2" />
                Planifier la session
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScheduleLiveSessionPage;