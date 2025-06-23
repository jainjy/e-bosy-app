import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ClockIcon, 
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  FlagIcon
} from '@heroicons/react/24/outline';
import { getData, postData } from '../../services/ApiFetch';
import { toast } from 'react-hot-toast';

const StudentAssessmentPage = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const [assessmentData] = await getData(`assessments/${assessmentId}`);
        const [questionsData] = await getData(`assessments/${assessmentId}/questions`);
        
        setAssessment(assessmentData);
        setQuestions(questionsData);
        
        if (assessmentData.timeLimit) {
          setTimeLeft(assessmentData.timeLimit * 60); // Convertir en secondes
        }
      } catch (error) {
        toast.error("Erreur lors du chargement de l'évaluation");
      }
    };

    fetchAssessment();
  }, [assessmentId]);

  useEffect(() => {
    if (hasStarted && timeLeft !== null) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [hasStarted, timeLeft]);

  const handleAnswer = (questionId, selectedAnswers) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: selectedAnswers
    }));
  };

  const handleStart = () => {
    setHasStarted(true);
  };

  const handleSubmit = async (isAutoSubmit = false) => {
    if (!isAutoSubmit) {
      const confirmed = window.confirm("Êtes-vous sûr de vouloir soumettre cette évaluation ?");
      if (!confirmed) return;
    }

    setIsSubmitting(true);
    try {
      const [result] = await postData('assessments/submissions', {
        assessmentId: parseInt(assessmentId),
        answers: Object.entries(answers).map(([questionId, selectedAnswers]) => ({
          questionId: parseInt(questionId),
          selectedAnswers
        }))
      });

      navigate(`/assessment/${assessmentId}/result/${result.submissionId}`);
    } catch (error) {
      toast.error("Erreur lors de la soumission de l'évaluation");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!assessment || !questions.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-e-bosy-purple"></div>
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">{assessment.title}</h1>
          
          <div className="space-y-6">
            <div className="flex items-center text-gray-600">
              <ClockIcon className="h-5 w-5 mr-2" />
              <span>Durée : {assessment.timeLimit} minutes</span>
            </div>
            
            <div className="flex items-start space-x-3 bg-yellow-50 p-4 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 flex-shrink-0" />
              <div className="text-sm text-yellow-700">
                <p className="font-medium">Important :</p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Assurez-vous d'avoir une connexion internet stable</li>
                  <li>Ne quittez pas la page pendant l'évaluation</li>
                  <li>Le temps commence à s'écouler dès que vous démarrez</li>
                  <li>Répondez à toutes les questions avant de soumettre</li>
                </ul>
              </div>
            </div>

            <button
              onClick={handleStart}
              className="w-full bg-e-bosy-purple text-white py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Commencer l'évaluation
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Barre de progression fixe en haut */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-md px-6 py-4 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-600">
              Question {currentQuestionIndex + 1} sur {questions.length}
            </span>
            <div className="w-64 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-e-bosy-purple rounded-full h-2 transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>
          {timeLeft !== null && (
            <div className={`flex items-center space-x-2 ${
              timeLeft < 300 ? 'text-red-600' : 'text-gray-600'
            }`}>
              <ClockIcon className="h-5 w-5" />
              <span className="font-mono text-lg">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-24">
        {/* Question courante */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            {currentQuestion.questionText}
          </h2>

          <div className="space-y-4">
            {currentQuestion.answers.map((answer) => (
              <label
                key={answer.answerId}
                className={`flex items-center p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                  answers[currentQuestion.questionId]?.includes(answer.answerId)
                    ? 'border-e-bosy-purple bg-purple-50'
                    : 'border-gray-200 hover:border-purple-200'
                }`}
              >
                <input
                  type="checkbox"
                  className="h-5 w-5 text-e-bosy-purple rounded border-gray-300 focus:ring-e-bosy-purple"
                  checked={answers[currentQuestion.questionId]?.includes(answer.answerId) || false}
                  onChange={() => {
                    const currentAnswers = answers[currentQuestion.questionId] || [];
                    if (currentAnswers.includes(answer.answerId)) {
                      handleAnswer(
                        currentQuestion.questionId,
                        currentAnswers.filter(id => id !== answer.answerId)
                      );
                    } else {
                      handleAnswer(
                        currentQuestion.questionId,
                        [...currentAnswers, answer.answerId]
                      );
                    }
                  }}
                />
                <span className="ml-3 text-gray-700">{answer.answerText}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Navigation entre questions */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
            disabled={currentQuestionIndex === 0}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              currentQuestionIndex === 0
                ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Question précédente
          </button>

          {currentQuestionIndex === questions.length - 1 ? (
            <button
              onClick={() => handleSubmit()}
              disabled={isSubmitting}
              className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              {isSubmitting ? "Soumission..." : "Terminer l'évaluation"}
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Question suivante
              <ArrowRightIcon className="h-5 w-5 ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentAssessmentPage;