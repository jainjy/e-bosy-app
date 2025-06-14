import React, { useState, useEffect, useRef } from "react";

const CourseFormModal = ({ onClose, onSubmit, course }) => {
  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    category: "",
    level: "",
    language: "",
    thumbnail_url: "",
  });

  const modalRef = useRef(null);

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
      setCourseData(course);
    } else {
      setCourseData({
        title: "",
        description: "",
        category: "",
        level: "",
        language: "",
        thumbnail_url: "",
      });
    }
  }, [course]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourseData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(courseData);
    onClose();
  };

  const categories = [
    "Development",
    "Design",
    "Marketing",
    "Business",
    "Data Science",
    "Other",
  ];
  const levels = ["Beginner", "Intermediate", "Advanced", "All Levels"];
  const languages = ["Français", "English", "Español", "Deutsch"];

  const modalTitle = course ? "Modifier le Cours" : "Creer un Nouveau Cours";
  const submitButtonText = course ? "Mettre à jour le Cours" : "Creer le Cours";

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div ref={modalRef} className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md md:max-w-lg lg:max-w-xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{modalTitle}</h2>
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
              required
            ></textarea>
          </div>
          <div className="mb-4">
            <label htmlFor="category" className="block text-gray-700 text-sm font-bold mb-2">
              Categorie:
            </label>
            <select
              id="category"
              name="category"
              value={courseData.category}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-e-bosy-purple"
              required
            >
              <option value="">Selectionnez une categorie</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
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
              <option value="">Selectionnez un niveau</option>
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
              <option value="">Selectionnez une langue</option>
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-6">
            <label htmlFor="thumbnail_url" className="block text-gray-700 text-sm font-bold mb-2">
              URL de la miniature:
            </label>
            <input
              type="url"
              id="thumbnail_url"
              name="thumbnail_url"
              value={courseData.thumbnail_url}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-e-bosy-purple"
              placeholder="https://example.com/image.jpg"
            />
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