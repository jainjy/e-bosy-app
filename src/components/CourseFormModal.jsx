import React, { useState, useEffect, useRef } from "react";
import { toast } from 'react-toastify';
import { getData } from "../services/ApiFetch";

const CourseFormModal = ({ onClose, onSubmit, course }) => {
  const [courseData, setCourseData] = useState({
    course_id: "",
    title: "",
    description: "",
    category_id: "",
    level: "",
    language: "",
    is_subscriber_only: false,
    status: "draft",
  });

  const [categories, setCategories] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState(null);

  const modalRef = useRef(null);
  const fileInputRef = useRef(null);

  const fetchCategories = async () => {
    try {
      const [data, err] = await getData("courses/categories");
      if (err) {
        throw new Error(err.message || "Failed to fetch categories");
      }
      setCategories(data || []);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

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

  useEffect(() => {
    if (course) {
      setCourseData({
        course_id: course.course_id,
        title: course.title,
        description: course.description,
        category_id: course.category_id || "",
        level: course.level,
        language: course.language,
        is_subscriber_only: course.is_subscriber_only,
        status: course.status,
      });
      setPreviewUrl(course.thumbnail_url || "");
      setSelectedFile(null);
    } else {
      setCourseData({
        course_id: "",
        title: "",
        description: "",
        category_id: "",
        level: "",
        language: "",
        is_subscriber_only: false,
        status: "draft",
      });
      setSelectedFile(null);
      setPreviewUrl("");
    }
  }, [course]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCourseData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setPreviewUrl(course?.thumbnail_url || "");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...courseData,
      thumbnailFile: selectedFile,
      categoryId: parseInt(courseData.category_id),
    });
  };

  const levels = ["Beginner", "Intermediate", "Advanced", "All Levels"];
  const languages = ["Français", "English", "Español", "Deutsch"];

  const modalTitle = course ? "Modifier le Cours" : "Créer un Nouveau Cours";
  const submitButtonText = course ? "Mettre à jour le Cours" : "Créer le Cours";

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div ref={modalRef} className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md md:max-w-lg lg:max-w-xl overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{modalTitle}</h2>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">
              Titre du Cours:
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={courseData.title}
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
              value={courseData.description}
              onChange={handleChange}
              rows="4"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-e-bosy-purple"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="category_id" className="block text-gray-700 text-sm font-bold mb-2">
              Catégorie:
            </label>
            <select
              id="category_id"
              name="category_id"
              value={courseData.category_id}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-e-bosy-purple"
              required
            >
              <option value="">Sélectionnez une catégorie</option>
              {categories.map((cat) => (
                <option key={cat.categoryId} value={cat.categoryId}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="level" className="block text-gray-700 text-sm font-bold mb-2">
              Niveau:
            </label>
            <select
              id="level"
              name="level"
              value={courseData.level}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-e-bosy-purple"
              required
            >
              <option value="">Sélectionnez un niveau</option>
              {levels.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="language" className="block text-gray-700 text-sm font-bold mb-2">
              Langue:
            </label>
            <select
              id="language"
              name="language"
              value={courseData.language}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-e-bosy-purple"
              required
            >
              <option value="">Sélectionnez une langue</option>
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label htmlFor="thumbnail_file" className="block text-gray-700 text-sm font-bold mb-2">
              Miniature du Cours:
            </label>
            <input
              type="file"
              id="thumbnail_file"
              name="thumbnail_file"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-e-bosy-purple file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-e-bosy-purple file:text-white hover:file:bg-purple-700"
            />
            {previewUrl && (
              <div className="mt-4">
                <p className="text-gray-700 text-sm mb-2">Aperçu de l'image:</p>
                <img
                  src={previewUrl}
                  alt="Aperçu de la miniature"
                  className="max-w-full h-auto rounded-lg shadow-md max-h-48 object-contain"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPreviewUrl("");
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="mt-2 text-sm text-red-600 hover:text-red-800"
                >
                  Supprimer l'image
                </button>
              </div>
            )}
          </div>

          <div className="mb-6 flex items-center">
            <input
              type="checkbox"
              id="is_subscriber_only"
              name="is_subscriber_only"
              checked={courseData.is_subscriber_only}
              onChange={handleChange}
              className="mr-2 h-4 w-4 text-e-bosy-purple border-gray-300 rounded focus:ring-e-bosy-purple"
            />
            <label htmlFor="is_subscriber_only" className="text-gray-700 text-sm font-bold">
              Réservé aux abonnés seulement
            </label>
          </div>
          <div className="flex items-center justify-end gap-4">
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

export default CourseFormModal;
