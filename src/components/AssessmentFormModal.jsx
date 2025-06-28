import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { postData, putData } from '../services/ApiFetch';
import { toast } from 'react-hot-toast';

const AssessmentFormModal = ({ onClose, onSubmit, courseId, type = 'exercise', assessment = null }) => {
  const modalRef = useRef(null);
  const [formData, setFormData] = useState({
    title: '',
    type: type,
    timeLimit: 30,
    courseId: parseInt(courseId)
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    if (assessment) {

      setFormData({
        title: assessment.title || '',
        type: assessment.type || type,
        timeLimit: assessment.timeLimit || 30,
        courseId: parseInt(courseId)
      });
    }
  }, [assessment, courseId, type]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.title.trim()) {
        toast.error("Le titre est requis");
        return;
      }

      const endpoint = assessment
        ? `assessments/${assessment.assessmentId}`
        : 'assessments';

      const method = assessment ? 'PUT' : 'POST';

      const [data, error] = await (method === 'PUT'
        ? putData(endpoint, { ...formData, timeLimit: parseInt(formData.timeLimit) })
        : postData(endpoint, { ...formData, timeLimit: parseInt(formData.timeLimit) })
      );
      if (error) throw error;
      toast.success(`Évaluation ${assessment ? 'modifiée' : 'créée'} avec succès`);
      onSubmit(data);
    } catch (err) {
      console.error('Erreur:', err);
      toast.error(`Erreur lors de la ${assessment ? 'modification' : 'création'} de l'évaluation`);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div ref={modalRef} className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-y-auto max-h-[90vh]">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {assessment ? 'Modifier' : 'Nouveau'} {formData.type === 'exam' ? "Examen" : "Exercice"}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-e-bosy-purple"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temps limite (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="300"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-e-bosy-purple"
                  value={formData.timeLimit}
                  onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-e-bosy-purple text-white rounded-md hover:bg-purple-700"
              >
                {assessment ? 'Enregistrer les modifications' : 'Créer et ajouter des questions'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssessmentFormModal;
