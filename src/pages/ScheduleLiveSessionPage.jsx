import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { liveSessionService } from "../services/liveSessionService";
import {
  CalendarDaysIcon,
  ClockIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";

const ScheduleLiveSessionPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    courseId: "",
    startTime: "",
    endTime: "",
    description: ""
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = "Title is required";
    if (!formData.courseId) newErrors.courseId = "Course is required";
    if (!formData.startTime) newErrors.startTime = "Start time is required";
    if (!formData.endTime) newErrors.endTime = "End time is required";
    
    if (formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      if (start >= end) newErrors.endTime = "End time must be after start time";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const session = await liveSessionService.createLiveSession({
        ...formData,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString()
      });
      navigate(`/live-session/${session.id}`);
    } catch (error) {
      console.error("Error scheduling session:", error);
      setErrors({ submit: "Failed to schedule session" });
    } finally {
      setSubmitting(false);
    }
  };

  // Mock courses - replace with actual API call
  const courses = [
    { id: 1, title: "Advanced JavaScript" },
    { id: 2, title: "React Fundamentals" },
    { id: 3, title: "Node.js Backend" }
  ];

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Schedule Live Session</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 mb-2">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Course</label>
          <select
            name="courseId"
            value={formData.courseId}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="">Select a course</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.title}</option>
            ))}
          </select>
          {errors.courseId && <p className="text-red-500 text-sm mt-1">{errors.courseId}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-2 flex items-center">
              <CalendarDaysIcon className="h-4 w-4 mr-2" />
              Start Time
            </label>
            <input
              type="datetime-local"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
            {errors.startTime && <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>}
          </div>

          <div>
            <label className="block text-gray-700 mb-2 flex items-center">
              <ClockIcon className="h-4 w-4 mr-2" />
              End Time
            </label>
            <input
              type="datetime-local"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
            {errors.endTime && <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>}
          </div>
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Description (Optional)</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows="3"
          />
        </div>

        {errors.submit && (
          <p className="text-red-500 text-sm">{errors.submit}</p>
        )}

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-blue-500 text-white rounded flex items-center disabled:bg-blue-300"
          >
            {submitting ? (
              "Scheduling..."
            ) : (
              <>
                <VideoCameraIcon className="h-4 w-4 mr-2" />
                Schedule Session
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScheduleLiveSessionPage;