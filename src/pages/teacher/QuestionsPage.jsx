import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  AcademicCapIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CheckCircleIcon,
  QuestionMarkCircleIcon,
  ExclamationCircleIcon,
  DocumentTextIcon,
  ClockIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { getData, postData, putData, deleteData } from '../../services/ApiFetch';
import { toast } from 'react-hot-toast';
import QuestionFormModal from '../../components/QuestionFormModal';

const QuestionsPage = () => {
  const { courseId, assessmentId } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState({
    questionText: '',
    questionType: 'multiple_choice',
    points: 1,
    explanation: '',
    answers: [
      { answerText: '', isCorrect: false },
      { answerText: '', isCorrect: false },
    ]
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [expandedQuestions, setExpandedQuestions] = useState({});

  const resetForm = () => {
    setCurrentQuestion({
      questionText: '',
      questionType: 'multiple_choice',
      points: 1,
      explanation: '',
      answers: [
        { answerText: '', isCorrect: false },
        { answerText: '', isCorrect: false },
      ]
    });
    setIsEditing(false);
    setEditingQuestionId(null);
  };

  const handleEditQuestion = (question) => {
    setCurrentQuestion({
      questionText: question.questionText,
      questionType: question.questionType || 'multiple_choice',
      points: question.points || 1,
      explanation: question.explanation || '',
      answers: question.answers?.map(answer => ({
        answerId: answer.answerId,
        answerText: answer.answerText || '',
        isCorrect: answer.isCorrect || false
      })) || []
    });
    setIsEditing(true);
    setEditingQuestionId(question.questionId);
    setShowQuestionForm(true);
  };

  const toggleQuestionExpand = (questionId) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assessmentData] = await getData(`assessments/${assessmentId}`);
        const [questionsData] = await getData(`assessments/${assessmentId}/questions`);
        
        // Calculer le score total à partir des questions
        const totalScore = questionsData?.reduce((acc, q) => acc + q.points, 0) || 0;
        
        setAssessment({
          ...assessmentData,
          totalScore: totalScore
        });
        setQuestions(questionsData || []);
      } catch (error) {
        toast.error("Erreur lors du chargement des données");
      }
    };

    fetchData();
  }, [assessmentId]);

  const reloadQuestionData = async () => {
    try {
      const [questionsData] = await getData(`assessments/${assessmentId}/questions`);
      if (questionsData) {
        setQuestions(questionsData);
      }
    } catch (error) {
      console.error('Error reloading questions:', error);
    }
  };

  const validateQuestion = (question) => {
    if (!question.questionText.trim()) {
      toast.error("Le texte de la question est requis");
      return false;
    }

    if (question.answers.length < 2) {
      toast.error("Au moins deux réponses sont requises");
      return false;
    }

    const hasCorrectAnswer = question.answers.some(answer => answer.isCorrect);
    if (!hasCorrectAnswer) {
      toast.error("Au moins une réponse correcte est requise");
      return false;
    }

    const emptyAnswers = question.answers.some(answer => !answer.answerText.trim());
    if (emptyAnswers) {
      toast.error("Toutes les réponses doivent avoir un texte");
      return false;
    }

    return true;
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!validateQuestion(currentQuestion)) {
      return;
    }
    try {
      if (isEditing) {
        // Mise à jour de la question
        const questionData = {
          questionId: editingQuestionId,
          questionText: currentQuestion.questionText,
          questionType: currentQuestion.questionType,
          points: parseInt(currentQuestion.points),
          explanation: currentQuestion.explanation,
          assessmentId: parseInt(assessmentId)
        };

        const [updatedQuestion, questionError] = await putData(
          `assessments/questions/${editingQuestionId}`, 
          questionData
        );

        if (questionError) throw questionError;

        // Mise à jour des réponses existantes et ajout des nouvelles
        const updatedAnswers = await Promise.all(
          currentQuestion.answers.map(async (answer) => {
            if (answer.answerId) {
              // Mise à jour d'une réponse existante
              const [updatedAnswer] = await putData(`assessments/answers/${answer.answerId}`, {
                answerText: answer.answerText,
                isCorrect: answer.isCorrect,
                questionId: editingQuestionId
              });
              return updatedAnswer;
            } else {
              // Création d'une nouvelle réponse
              const [newAnswer] = await postData('assessments/answers', {
                answerText: answer.answerText,
                isCorrect: answer.isCorrect,
                questionId: editingQuestionId
              });
              return newAnswer;
            }
          })
        );

        // Mise à jour de l'état local
        setQuestions(questions.map(q => 
          q.questionId === editingQuestionId 
            ? { ...updatedQuestion, answers: updatedAnswers }
            : q
        ));

        toast.success("Question mise à jour avec succès");
      } else {
        // Création d'une nouvelle question
        const [data, error] = await postData(`assessments/questions`, {
          ...currentQuestion,
          assessmentId: parseInt(assessmentId)
        });

        if (error) throw error;

        // Ajout des réponses pour la nouvelle question
        const answersWithResults = await Promise.all(
          currentQuestion.answers.map(answer =>
            postData('assessments/answers', {
              answerText: answer.answerText,
              isCorrect: answer.isCorrect,
              questionId: data.questionId
            })
          )
        );

        const newQuestion = {
          ...data,
          answers: answersWithResults.map(([answer]) => answer)
        };

        setQuestions([...questions, newQuestion]);
        toast.success("Question ajoutée avec succès");
      }

      resetForm();
      setShowQuestionForm(false);
      await reloadQuestionData();
    } catch (err) {
      console.error('Error:', err);
      toast.error(isEditing ? "Erreur lors de la modification" : "Erreur lors de l'ajout");
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette question ?")) return;

    try {
      await deleteData(`assessments/questions/${questionId}`);
      setQuestions(questions.filter(q => q.questionId !== questionId));
      toast.success("Question supprimée avec succès");
    } catch (err) {
      toast.error("Erreur lors de la suppression de la question");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <nav className="flex items-center space-x-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-e-bosy-purple hover:text-purple-700 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          <span className="font-medium">Retour aux évaluations</span>
        </button>
        <div className="h-6 w-px bg-gray-300"></div>
        <div className="text-gray-600">{assessment?.title}</div>
      </nav>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Questions
              </h1>
              <div className="flex items-center space-x-6 text-gray-600">
                <div className="flex items-center">
                  <DocumentTextIcon className="h-5 w-5 text-e-bosy-purple mr-2" />
                  <span>{questions.length} questions</span>
                </div>
                <div className="flex items-center">
                  <StarIcon className="h-5 w-5 text-yellow-500 mr-2" />
                  <span>Total : {questions.reduce((acc, q) => acc + q.points, 0)} points</span>
                </div>
                <div className="flex items-center">
                  <ClockIcon className="h-5 w-5 text-blue-500 mr-2" />
                  <span>{assessment?.timeLimit || 'Durée non limitée'}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowQuestionForm(true)}
              className="flex items-center px-5 py-2.5 bg-e-bosy-purple text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Ajouter une question
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {questions.map((question, index) => (
            <div
              key={question.questionId}
              className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:border-e-bosy-purple transition-colors"
            >
              <div 
                className="flex justify-between items-start p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleQuestionExpand(question.questionId)}
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="flex items-center bg-e-bosy-purple bg-opacity-10 text-e-bosy-purple text-sm font-medium px-3 py-1 rounded-full">
                      <QuestionMarkCircleIcon className="h-4 w-4 mr-1" />
                      Question {index + 1}
                    </span>
                    <span className="flex items-center bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full">
                      <StarIcon className="h-4 w-4 mr-1" />
                      {question.points} pts
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {question.questionText}
                  </h3>
                </div>
                <div className="flex items-center ml-4 space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditQuestion(question);
                    }}
                    className="p-2 text-gray-400 hover:text-e-bosy-purple rounded-full hover:bg-purple-50 transition-colors"
                    title="Modifier la question"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteQuestion(question.questionId);
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                    title="Supprimer la question"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                  {expandedQuestions[question.questionId] ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>

              {expandedQuestions[question.questionId] && (
                <div className="border-t border-gray-100 p-6 bg-gray-50">
                  <div className="space-y-3">
                    {question.answers.map((answer, aIndex) => (
                      <div
                        key={`${question.questionId}-answer-${answer.answerId || aIndex}`}
                        className={`flex items-center p-4 rounded-lg ${
                          answer.isCorrect 
                            ? 'bg-green-50 border border-green-200' 
                            : 'bg-white border border-gray-200'
                        }`}
                      >
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-4 ${
                          answer.isCorrect 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {String.fromCharCode(65 + aIndex)}
                        </div>
                        <span className={`flex-1 ${answer.isCorrect ? 'text-green-700' : 'text-gray-700'}`}>
                          {answer.answerText}
                        </span>
                        {answer.isCorrect && (
                          <CheckCircleIcon className="h-5 w-5 text-green-500 ml-2" />
                        )}
                      </div>
                    ))}
                  </div>

                  {question.explanation && (
                    <div className="mt-6 flex items-start p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <ExclamationCircleIcon className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                      <div>
                        <span className="font-medium text-yellow-800">Explication : </span>
                        <span className="text-yellow-700">{question.explanation}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {questions.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <QuestionMarkCircleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune question</h3>
              <p className="text-gray-500">
                Commencez par ajouter une question à cette évaluation
              </p>
            </div>
          )}
        </div>

        <QuestionFormModal 
          isOpen={showQuestionForm}
          onClose={() => {
            setShowQuestionForm(false);
            resetForm();
          }}
          currentQuestion={currentQuestion}
          setCurrentQuestion={setCurrentQuestion}
          onSubmit={handleQuestionSubmit}
          isEditing={isEditing}
        />
      </div>
    </div>
  );
};

export default QuestionsPage;