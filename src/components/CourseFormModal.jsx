// CourseFormModal.js
import React, { useState, useEffect, useRef } from "react";
import { toast } from 'react-toastify';
import { API_BASE_URL, getData } from "../services/ApiFetch";

const CourseFormModal = ({ onClose, onSubmit, course }) => {
  const [courseData, setCourseData] = useState({
    courseId: "",
    title: "",
    description: "",
    categoryId: "",
    level: "",
    language: "",
    isSubscriberOnly: false,
    status: "brouillon", // Changé de "draft" à "brouillon"
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
    if (course && categories.length > 0) {
      setCourseData({
        courseId: course.courseId,
        title: course.title,
        description: course.description,
        categoryId: course.category?.categoryId?.toString() || "", // Utilisez categoryId ici
        level: course.level?.toLowerCase(),
        language: course.language?.toLowerCase(),
        isSubscriberOnly: course.isSubscriberOnly || false,
        status: course.status || 'brouillon',
      });
  
      if (course.thumbnailUrl) {
        setPreviewUrl(course.thumbnailUrl);
      }
    }
  }, [course, categories]);
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
      // Créer une URL locale pour la prévisualisation
      const objectUrl = URL.createObjectURL(file);
      setSelectedFile(file);
      setPreviewUrl(objectUrl);
    } else {
      setSelectedFile(null);
      setPreviewUrl("");
    }
  };

  useEffect(() => {
    // Nettoyage des URLs créées lors du démontage du composant
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...courseData,
      thumbnailFile: selectedFile,
      categoryId: parseInt(courseData.categoryId, 10),
    });
  };

  const levels = ["debutant", "intermediaire", "avance", "tous les niveaux"];
  const languages = ["francais", "anglais", "espagnol", "allemand"];

  const modalTitle = course ? "Modifier le cours" : "Creer un nouveau cours";
  const submitButtonText = course ? "Mettre à jour le cours" : "Creer le cours";

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
            <label htmlFor="categoryId" className="block text-gray-700 text-sm font-bold mb-2">
              Catégorie:
            </label>
            <select
              id="categoryId"
              name="categoryId"
              value={courseData.categoryId || ""}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-e-bosy-purple"
              required
            >
              <option value="">Sélectionnez une catégorie</option>
              {categories.map((cat) => (
                <option 
                  key={cat.categoryId} 
                  value={cat.categoryId.toString()}>
                  {cat.name}
                  {cat.categoryId === courseData.categoryId && "selected"}
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
              value={courseData.level || ""}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-e-bosy-purple"
              required
            >
              <option value="">Selectionnez un niveau</option>
              {levels.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
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
              value={courseData.language || ""}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-e-bosy-purple"
              required
            >
              <option value="">Selectionnez une langue</option>
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label htmlFor="thumbnailFile" className="block text-gray-700 text-sm font-bold mb-2">
              Miniature du Cours:
            </label>
            <input
              type="file"
              id="thumbnailFile"
              name="thumbnailFile"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-e-bosy-purple file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-e-bosy-purple file:text-white hover:file:bg-purple-700"
            />
            {previewUrl && (
              <div className="mt-4">
                <p className="text-gray-700 text-sm mb-2">Aperçu de l'image:</p>
                <img
                  src={previewUrl.startsWith('blob:') ? previewUrl : `${API_BASE_URL}/${previewUrl}`}
                  alt="Aperçu de la miniature"
                  className="max-w-full h-auto rounded-lg shadow-md max-h-48 object-contain"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (previewUrl.startsWith('blob:')) {
                      URL.revokeObjectURL(previewUrl);
                    }
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
              id="isSubscriberOnly"
              name="isSubscriberOnly"
              checked={courseData.isSubscriberOnly}
              onChange={handleChange}
              className="mr-2 h-4 w-4 text-e-bosy-purple border-gray-300 rounded focus:ring-e-bosy-purple"
            />
            <label htmlFor="isSubscriberOnly" className="text-gray-700 text-sm font-bold">
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
