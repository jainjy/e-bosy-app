import React, { useState, useEffect, useRef } from "react";

const SectionFormModal = ({ onClose, onSubmit, sectionToEdit, courseSections }) => {
  const [sectionTitle, setSectionTitle] = useState("");
  const [error, setError] = useState("");

  const modalRef = useRef(null);

  useEffect(() => {
    // Populate form if editing
    if (sectionToEdit) {
      setSectionTitle(sectionToEdit.title);
    } else {
      setSectionTitle("");
    }
    setError(""); // Clear error on open/edit
  }, [sectionToEdit]);

  useEffect(() => {
    // Handle clicks outside the modal to close it
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!sectionTitle.trim()) {
      setError("Le titre de la section ne peut pas être vide.");
      return;
    }

    // Check for duplicate title (case-insensitive and trimmed)
    const isDuplicate = courseSections.some(
      (s) =>
        s.title.trim().toLowerCase() === sectionTitle.trim().toLowerCase() &&
        (sectionToEdit ? s.id !== sectionToEdit.id : true) // Allow existing title if it's the same section being edited
    );

    if (isDuplicate) {
      setError("Une section avec ce titre existe déjà.");
      return;
    }

    setError(""); // Clear error if validation passes
    onSubmit(sectionTitle);
  };

  const modalTitle = sectionToEdit ? "Modifier la Section" : "Ajouter une Nouvelle Section";
  const submitButtonText = sectionToEdit ? "Mettre à jour" : "Ajouter";

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div ref={modalRef} className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">{modalTitle}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="sectionTitle" className="block text-gray-700 text-sm font-bold mb-2">
              Titre de la Section:
            </label>
            <input
              type="text"
              id="sectionTitle"
              name="sectionTitle"
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-e-bosy-purple"
              required
            />
            {error && <p className="text-red-500 text-xs italic mt-2">{error}</p>}
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

export default SectionFormModal;