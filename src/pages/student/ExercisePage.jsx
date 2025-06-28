import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getData, postData } from '../../services/ApiFetch';
import { toast } from 'react-hot-toast';
import {
  ArrowLeftIcon,
  ClockIcon,
  DocumentTextIcon,
  QuestionMarkCircleIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FlagIcon,
  AcademicCapIcon,
  ClipboardDocumentCheckIcon,
  StarIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

const ExercisePage = () => {
  const { courseId, assessmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [isConfirmSubmitOpen, setIsConfirmSubmitOpen] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState(new Set());
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assessmentData] = await getData(`assessments/${assessmentId}`);
        const [questionsData] = await getData(`assessments/${assessmentId}/questions`);

        setAssessment(assessmentData);
        setQuestions(questionsData || []);

        if (assessmentData.timeLimit) {
          setTimeLeft(assessmentData.timeLimit * 60); // Convertir en secondes
        }
      } catch (error) {
        toast.error("Erreur lors du chargement de l'exercice");
      }
    };

    fetchData();
  }, [assessmentId]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleAnswerSelect = (questionId, answerId) => {
    setSelectedAnswers(prev => {
      const newAnswers = {
        ...prev,
        [questionId]: prev[questionId]?.includes(answerId)
          ? prev[questionId].filter(id => id !== answerId)
          : [...(prev[questionId] || []), answerId]
      };
      
      const updatedAnsweredQuestions = new Set(answeredQuestions);
      if (newAnswers[questionId]?.length > 0) {
        updatedAnsweredQuestions.add(questionId);
      } else {
        updatedAnsweredQuestions.delete(questionId);
      }
      setAnsweredQuestions(updatedAnsweredQuestions);
      
      return newAnswers;
    });
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      // Convertir l'objet selectedAnswers en tableau plat de IDs de réponses
      const answersProvided = Object.values(selectedAnswers).flat().map(Number);

      const submission = {
        userId: user.userId,
        assessmentId: parseInt(assessmentId),
        answersProvided: answersProvided
      };

      const [response, error] = await postData('assessments/submissions', submission);

      if (error) throw error;

      setResults(response);
      setShowResults(true);
      toast.success("Exercice soumis avec succès");
    } catch (error) {
      console.error('Error submitting:', error); // Pour le débogage
      toast.error("Erreur lors de la soumission de l'exercice");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentQuestionIndex];

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          {/* Header avec retour */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-e-bosy-purple transition-colors mb-6"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            <span>Retour au cours</span>
          </button>

          {/* Carte d'instructions */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-800">{assessment?.title}</h1>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                assessment?.type === 'exam'
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {assessment?.type === 'exam' ? (
                  <>
                    <AcademicCapIcon className="h-4 w-4 mr-1.5" />
                    Examen
                  </>
                ) : (
                  <>
                    <ClipboardDocumentCheckIcon className="h-4 w-4 mr-1.5" />
                    Exercice
                  </>
                )}
              </span>
            </div>
            
            <div className="space-y-6">
              {/* Informations sur l'évaluation */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <ClockIcon className="h-5 w-5 text-gray-500 mr-2" />
                  <span>Durée : {assessment?.timeLimit || 'Non limitée'}</span>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <QuestionMarkCircleIcon className="h-5 w-5 text-gray-500 mr-2" />
                  <span>{questions.length} questions</span>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <StarIcon className="h-5 w-5 text-yellow-500 mr-2" />
                  <span>{assessment?.totalScore} points</span>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Instructions importantes
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    Assurez-vous d'avoir une connexion internet stable
                  </li>
                  <li className="flex items-start">
                    <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                    Ne quittez pas la page pendant l'évaluation
                  </li>
                  <li className="flex items-start">
                    <ClockIcon className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                    Le temps commence à s'écouler dès que vous démarrez
                  </li>
                  <li className="flex items-start">
                    <DocumentTextIcon className="h-5 w-5 text-purple-500 mr-2 mt-0.5" />
                    Répondez à toutes les questions avant de soumettre
                  </li>
                </ul>
              </div>

              {/* Bouton de démarrage */}
              <button
                onClick={() => setHasStarted(true)}
                className="w-full bg-e-bosy-purple text-white py-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
              >
                <PlayIcon className="h-5 w-5" />
                <span>Commencer {assessment?.type === 'exam' ? "l'examen" : "l'exercice"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!assessment || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-e-bosy-purple"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <nav className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-e-bosy-purple transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            <span>Retour au cours</span>
          </button>

          {timeLeft !== null && (
            <div className={`flex items-center px-4 py-2 rounded-full ${
              timeLeft < 300 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
            }`}>
              <ClockIcon className="h-5 w-5 mr-2" />
              <span className="font-medium">{formatTime(timeLeft)}</span>
            </div>
          )}
        </nav>

        {/* Progress Indicator */}
        <div className="max-w-4xl mx-auto mb-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">
                Progression : {answeredQuestions.size} / {questions.length} questions répondues
              </span>
              <span className="text-sm text-gray-600">
                {Math.round((answeredQuestions.size / questions.length) * 100)}%
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-e-bosy-purple transition-all duration-500"
                style={{ width: `${(answeredQuestions.size / questions.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">{assessment.title}</h1>
            <div className="flex items-center text-sm text-gray-500">
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Question {currentQuestionIndex + 1} sur {questions.length}
            </div>
          </div>

          {showResults ? (
            <div className="space-y-6 bg-white p-8 rounded-xl shadow-lg">
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
                  results.score >= assessment.totalScore * 0.7 
                    ? 'bg-green-100' 
                    : results.score >= assessment.totalScore * 0.5 
                      ? 'bg-yellow-100'
                      : 'bg-red-100'
                }`}>
                  <span className="text-2xl font-bold">
                    {Math.round((results.score / assessment.totalScore) * 100)}%
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {results.score >= assessment.totalScore * 0.7 
                    ? '🎉 Excellent travail !' 
                    : results.score >= assessment.totalScore * 0.5 
                      ? '👍 Bon effort !'
                      : '📚 Continue d\'apprendre !'}
                </h2>
                <p className="text-gray-600 text-lg">
                  Score : {results.score} / {assessment.totalScore} points
                </p>
              </div>
              
              <div className="border-t border-gray-200 pt-6 text-center">
                <button
                  onClick={() => navigate(`/course/${courseId}`)}
                  className="bg-e-bosy-purple text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Retourner au cours
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <div className="flex items-start mb-4">
                  <QuestionMarkCircleIcon className="h-6 w-6 text-e-bosy-purple mt-1 mr-3 flex-shrink-0" />
                  <h3 className="text-xl font-medium text-gray-800">
                    {currentQuestion.questionText}
                  </h3>
                </div>

                <div className="space-y-3 ml-9">
                  {currentQuestion.answers.map((answer) => (
                    <button
                      key={answer.answerId}
                      onClick={() => handleAnswerSelect(currentQuestion.questionId, answer.answerId)}
                      className={`w-full text-left p-4 rounded-lg border transition-colors ${
                        selectedAnswers[currentQuestion.questionId]?.includes(answer.answerId)
                          ? 'border-e-bosy-purple bg-purple-50 text-e-bosy-purple'
                          : 'border-gray-200 hover:border-e-bosy-purple hover:bg-purple-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                          selectedAnswers[currentQuestion.questionId]?.includes(answer.answerId)
                            ? 'border-e-bosy-purple bg-e-bosy-purple'
                            : 'border-gray-300'
                        }`}>
                          {selectedAnswers[currentQuestion.questionId]?.includes(answer.answerId) && (
                            <CheckCircleIcon className="h-4 w-4 text-white" />
                          )}
                        </div>
                        {answer.answerText}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <button
                  onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                  disabled={currentQuestionIndex === 0}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                    currentQuestionIndex === 0
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:text-e-bosy-purple hover:bg-purple-50'
                  }`}
                >
                  <ChevronLeftIcon className="h-5 w-5 mr-2" />
                  Question précédente
                </button>

                {currentQuestionIndex === questions.length - 1 ? (
                  <button
                    onClick={() => setIsConfirmSubmitOpen(true)}
                    disabled={answeredQuestions.size < questions.length}
                    className={`flex items-center px-6 py-3 rounded-lg transition-colors ${
                      answeredQuestions.size < questions.length
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : 'bg-e-bosy-purple text-white hover:bg-purple-700'
                    }`}
                  >
                    <FlagIcon className="h-5 w-5 mr-2" />
                    Terminer l'exercice
                    {answeredQuestions.size < questions.length && (
                      <span className="text-sm ml-2">
                        ({questions.length - answeredQuestions.size} questions restantes)
                      </span>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                    className="flex items-center px-4 py-2 text-e-bosy-purple hover:bg-purple-50 rounded-lg transition-colors"
                  >
                    Question suivante
                    <ChevronRightIcon className="h-5 w-5 ml-2" />
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Confirmation Modal */}
        {isConfirmSubmitOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold mb-4">Confirmer la soumission</h3>
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir soumettre votre exercice ? 
                Cette action ne peut pas être annulée.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsConfirmSubmitOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    setIsConfirmSubmitOpen(false);
                    handleSubmit();
                  }}
                  className="px-4 py-2 bg-e-bosy-purple text-white rounded-lg hover:bg-purple-700"
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExercisePage;