import React from 'react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';

const QuestionFormModal = ({ 
  isOpen, 
  onClose, 
  currentQuestion, 
  setCurrentQuestion, 
  onSubmit, 
  isEditing 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25 transition-opacity"></div>
        
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-3xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {isEditing ? "Modifier la question" : "Nouvelle question"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XMarkIcon className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            {/* Question Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question
              </label>
              <textarea
                required
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-e-bosy-purple"
                value={currentQuestion.questionText}
                onChange={(e) => setCurrentQuestion({
                  ...currentQuestion,
                  questionText: e.target.value
                })}
                placeholder="Saisissez votre question..."
              />
            </div>

            {/* Question Type & Points */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de question
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-e-bosy-purple"
                  value={currentQuestion.questionType}
                  onChange={(e) => setCurrentQuestion({
                    ...currentQuestion,
                    questionType: e.target.value
                  })}
                >
                  <option value="multiple_choice">Choix multiple</option>
                  <option value="single_choice">Choix unique</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Points
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-e-bosy-purple"
                  value={currentQuestion.points}
                  onChange={(e) => setCurrentQuestion({
                    ...currentQuestion,
                    points: parseInt(e.target.value)
                  })}
                />
              </div>
            </div>

            {/* Answers */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  Réponses
                </label>
                <button
                  type="button"
                  onClick={() => setCurrentQuestion({
                    ...currentQuestion,
                    answers: [...currentQuestion.answers, { answerText: '', isCorrect: false }]
                  })}
                  className="flex items-center text-e-bosy-purple hover:text-purple-700"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Ajouter une réponse
                </button>
              </div>

              {currentQuestion.answers.map((answer, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="text"
                    required
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-e-bosy-purple bg-white"
                    value={answer.answerText}
                    onChange={(e) => {
                      const newAnswers = [...currentQuestion.answers];
                      newAnswers[index].answerText = e.target.value;
                      setCurrentQuestion({
                        ...currentQuestion,
                        answers: newAnswers
                      });
                    }}
                    placeholder={`Réponse ${index + 1}`}
                  />
                  <div className="flex items-center">
                    <input
                      type={currentQuestion.questionType === 'multiple_choice' ? 'checkbox' : 'radio'}
                      name="correct_answer"
                      checked={answer.isCorrect}
                      onChange={(e) => {
                        const newAnswers = [...currentQuestion.answers];
                        if (currentQuestion.questionType !== 'multiple_choice') {
                          newAnswers.forEach(a => a.isCorrect = false);
                        }
                        newAnswers[index].isCorrect = e.target.checked;
                        setCurrentQuestion({
                          ...currentQuestion,
                          answers: newAnswers
                        });
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-600">Correcte</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Explanation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Explication (optionnelle)
              </label>
              <textarea
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-e-bosy-purple"
                value={currentQuestion.explanation}
                onChange={(e) => setCurrentQuestion({
                  ...currentQuestion,
                  explanation: e.target.value
                })}
                placeholder="Ajoutez une explication pour la réponse correcte..."
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-e-bosy-purple text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                {isEditing ? "Mettre à jour" : "Ajouter"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuestionFormModal;