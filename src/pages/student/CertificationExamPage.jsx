import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE_URL, getData, postData } from '../../services/ApiFetch';
import { toast } from 'react-hot-toast';
import {
  ArrowLeftIcon,
  ClockIcon,
  QuestionMarkCircleIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FlagIcon,
  Bars3Icon,
  UserCircleIcon, // Added for user avatar placeholder
} from '@heroicons/react/24/outline';
import CertificationResultsPage from './CertificationResultsPage';

const CertificationExamPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [exams, setExams] = useState([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0); // Corresponds to exam index
  const [questionsBySection, setQuestionsBySection] = useState({}); // {0: [q1, q2], 1: [q3, q4]}
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Index within the current section's questions
  const [allSelectedAnswers, setAllSelectedAnswers] = useState({}); // {examId: {questionId: [answerIds]}}
  const [totalTimeLeft, setTotalTimeLeft] = useState(null); // Global timer
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [overallResults, setOverallResults] = useState([]);
  const [showOverallResults, setShowOverallResults] = useState(false);
  const [isConfirmSubmitOpen, setIsConfirmSubmitOpen] = useState(false);
  const [hasLoadedExams, setHasLoadedExams] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar is open by default

  const globalTimerRef = useRef(null);

  const totalQuestionsAnswered = useCallback(() => {
    let count = 0;
    Object.values(allSelectedAnswers).forEach(examAnswers => {
      Object.values(examAnswers).forEach(qAnswers => {
        if (qAnswers && qAnswers.length > 0) {
          count++;
        }
      });
    });
    return count;
  }, [allSelectedAnswers]);

  const totalQuestions = useCallback(() => {
    let count = 0;
    Object.values(questionsBySection).forEach(qs => {
      count += qs.length;
    });
    return count;
  }, [questionsBySection]);

  const fetchExamsAndQuestions = useCallback(async () => {
    try {
      const [examsData] = await getData(`assessments/course/${courseId}/exams`);
      if (!examsData || examsData.length < 2) {
        toast.error("Ce cours ne contient pas assez d'examens pour la certification.");
        navigate(-1);
        return;
      }

      const selectedExams = examsData.slice(0, 2);
      setExams(selectedExams);

      let initialTotalTime = 0;
      const initialQuestionsBySection = {};
      const initialAllSelectedAnswers = {};

      for (let i = 0; i < selectedExams.length; i++) {
        const exam = selectedExams[i];
        initialTotalTime += exam.timeLimit ? exam.timeLimit * 60 : 0;
        const [questionsData] = await getData(`assessments/${exam.assessmentId}/questions`);

        initialQuestionsBySection[i] = questionsData || [];
        initialAllSelectedAnswers[i] = {};
      }

      if (initialTotalTime === 0) {
        initialTotalTime = 90 * 60; // Default to 90 minutes if no time limits set
      }

      setQuestionsBySection(initialQuestionsBySection);
      setAllSelectedAnswers(initialAllSelectedAnswers);
      setTotalTimeLeft(initialTotalTime);
      setHasLoadedExams(true);
      startGlobalTimer();
      toast.success("Examens chargés !");

    } catch (error) {
      console.error("Error loading exams and questions:", error);
      toast.error("Erreur lors du chargement des examens et des questions.");
      navigate(-1);
    }
  }, [courseId, navigate]);

  useEffect(() => {
    fetchExamsAndQuestions();
  }, [fetchExamsAndQuestions]);

  const startGlobalTimer = () => {
    if (globalTimerRef.current) return;

    globalTimerRef.current = setInterval(() => {
      setTotalTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(globalTimerRef.current);
          globalTimerRef.current = null;
          handleOverallSubmission();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (showOverallResults && globalTimerRef.current) {
      clearInterval(globalTimerRef.current);
      globalTimerRef.current = null;
    }
    return () => {
      if (globalTimerRef.current) {
        clearInterval(globalTimerRef.current);
        globalTimerRef.current = null;
      }
    };
  }, [showOverallResults]);

  const handleAnswerSelect = (questionId, answerId) => {
    setAllSelectedAnswers(prev => {
      const currentExamAnswers = { ...prev[currentSectionIndex] };
      const currentQuestionAnswers = currentExamAnswers[questionId] || [];

      const currentQuestion = questionsBySection[currentSectionIndex]?.find(q => q.questionId === questionId);
      let newAnswers;

      if (currentQuestion?.questionType === "multiple_choice") {
        newAnswers = currentQuestionAnswers.includes(answerId)
          ? currentQuestionAnswers.filter(id => id !== answerId)
          : [...currentQuestionAnswers, answerId];
      } else {
        newAnswers = [answerId];
      }

      currentExamAnswers[questionId] = newAnswers;

      return {
        ...prev,
        [currentSectionIndex]: currentExamAnswers
      };
    });
  };

  const currentQuestions = questionsBySection[currentSectionIndex] || [];
  const currentQuestion = currentQuestions[currentQuestionIndex];
  const currentExamSelectedAnswers = allSelectedAnswers[currentSectionIndex] || {};

  const handleOverallSubmission = useCallback(async () => {
    if (isSubmitting || showOverallResults) return;
    setIsSubmitting(true);
    clearInterval(globalTimerRef.current);

    try {
      const submissions = await Promise.all(
        exams.map(async (exam, index) => {
          const answersProvided = Object.values(allSelectedAnswers[index] || {}).flat().map(Number);
          const submissionData = {
            userId: user.userId,
            assessmentId: exam.assessmentId,
            answersProvided: answersProvided
          };
          const [response] = await postData('assessments/submissions', submissionData);
          return response;
        })
      );
      setOverallResults(submissions);
      setShowOverallResults(true);
      toast.success("Examens soumis avec succès !");
    } catch (error) {
      console.error("Error during overall submission:", error);
      toast.error("Erreur lors de la soumission des examens.");
    } finally {
      setIsSubmitting(false);
      setIsConfirmSubmitOpen(false);
    }
  }, [isSubmitting, exams, allSelectedAnswers, user, showOverallResults]);

  const formatTime = (seconds) => {
    if (seconds === null) return "Chargement...";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const isQuestionAnswered = (sectionIndex, questionId) => {
    const answers = allSelectedAnswers[sectionIndex]?.[questionId];
    return answers && answers.length > 0;
  };

  const allExamsCompleted = exams.every((exam, index) => {
    const sectionQuestions = questionsBySection[index] || [];
    // Check if every question in the section has at least one answer selected
    return sectionQuestions.every(q => isQuestionAnswered(index, q.questionId));
  });

  if (!hasLoadedExams) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50"> {/* White background for loading */}
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-e-bosy-purple"></div>
        <p className="text-gray-700 ml-4">Chargement des examens...</p> {/* Darker text for loading */}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col font-sans"> {/* Changed background to light gray */}
      {/* Top Navigation Bar (Header) */}
      <header className="flex items-center justify-between bg-white p-4 shadow-md z-10 border-b border-gray-100"> {/* White background, lighter shadow, subtle border */}
        <div className="flex items-center">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="mr-4 text-gray-600 hover:text-e-bosy-purple"> {/* Darker icon color */}
            <Bars3Icon className="h-6 w-6" />
          </button>
          <span className="text-xl font-bold text-gray-900">e-BoSy Certification</span> {/* Darker text */}
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center text-gray-600"> {/* Darker text */}
            <span className="mr-2">Répondu:</span>
            <span className="font-semibold text-gray-900">{totalQuestionsAnswered()}</span> {/* Darker text */}
            <span className="mx-1">/</span>
            <span className="font-semibold text-gray-900">{totalQuestions()}</span> {/* Darker text */}
          </div>
          <div className={`flex items-center px-3 py-1 rounded-full ${
            totalTimeLeft !== null && totalTimeLeft < 300 ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 border border-gray-200'
          }`}> {/* Brighter red, light gray background for normal state */}
            <ClockIcon className="h-5 w-5 mr-2" />
            <span className="font-mono text-lg">{formatTime(totalTimeLeft)}</span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-700 mr-2">{user?.firstName} {user?.lastName}</span> {/* Darker text */}
            {user?.profilePictureUrl ? <img src={API_BASE_URL+user?.profilePictureUrl} className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold" alt="User Profile"/>
              : <div className="h-8 w-8 bg-e-bosy-purple rounded-full flex items-center justify-center text-white font-bold text-sm"> {/* Consistent purple for avatar placeholder */}
                {user?.firstName?.charAt(0) || <UserCircleIcon className="h-6 w-6" />} {/* Fallback to icon if no initial */}
              </div>}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar for Questions */}
        <aside
          className={`bg-white border-r border-gray-100 p-6 flex flex-col transition-all duration-300 shadow-md ${ /* White background, lighter border, subtle shadow */
            isSidebarOpen ? 'w-80' : 'w-0 overflow-hidden p-0'
          }`}
        >
          {isSidebarOpen && (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Questions</h2> {/* Darker text */}
              <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {exams.map((exam, examIdx) => (
                  <div key={exam.assessmentId} className="mb-6">
                    <button
                      onClick={() => {
                        setCurrentSectionIndex(examIdx);
                        setCurrentQuestionIndex(0);
                      }}
                      className={`w-full text-left p-3 rounded-md flex items-center justify-between text-lg font-medium transition-colors ${
                        currentSectionIndex === examIdx
                          ? 'bg-e-bosy-purple text-white shadow-sm' // Consistent purple, shadow
                          : 'text-gray-700 hover:bg-gray-50 border border-gray-200' // Lighter hover, border
                      }`}
                    >
                      <span>Section {examIdx + 1}: {exam.title}</span>
                      <span className="text-sm font-normal"> {/* Adjusted font weight */}
                        {Object.keys(allSelectedAnswers[examIdx] || {}).filter(qId => (allSelectedAnswers[examIdx][qId] || []).length > 0).length}
                        /
                        {questionsBySection[examIdx]?.length || 0}
                      </span>
                    </button>
                    {currentSectionIndex === examIdx && (
                      <div className="grid grid-cols-5 gap-2 mt-4">
                        {questionsBySection[examIdx]?.map((q, qIdx) => (
                          <button
                            key={q.questionId}
                            onClick={() => setCurrentQuestionIndex(qIdx)}
                            className={`w-10 h-10 rounded-md flex items-center justify-center text-sm font-medium transition-colors border ${
                              currentQuestionIndex === qIdx
                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm' // Active question state
                                : isQuestionAnswered(examIdx, q.questionId)
                                  ? 'bg-green-500 text-white border-green-500 shadow-sm' // Answered question state
                                  : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200' // Default question state
                            }`}
                          >
                            {qIdx + 1}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-gray-100"> {/* Added top border for separation */}
                <button
                  onClick={() => setIsConfirmSubmitOpen(true)}
                  disabled={!allExamsCompleted || isSubmitting}
                  className={`w-full flex items-center justify-center px-6 py-3 rounded-lg font-bold text-lg transition-colors shadow-md ${
                    allExamsCompleted && !isSubmitting
                      ? 'bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed' // Lighter disabled state
                  }`}
                >
                  <FlagIcon className="h-5 w-5 mr-2" />
                  Soumettre le Test
                </button>
              </div>
            </>
          )}
        </aside>

        {/* Main Question/Content Area */}
        <main className="flex-1 flex flex-col bg-gray-50 p-8"> {/* Light gray background for main content */}
          {showOverallResults ? (
            <CertificationResultsPage
              overallResults={overallResults}
              exams={exams}
              courseId={courseId}
            />
          ) : (
            <>
              {/* Question Description and Inputs */}
              <div className="bg-white rounded-xl shadow-lg p-6 flex-1 overflow-y-auto custom-scrollbar border border-gray-100"> {/* White background, strong shadow */}
                {currentQuestion ? (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-start"> {/* Larger, bolder question text, items-start for multiline icon alignment */}
                      <QuestionMarkCircleIcon className="h-7 w-7 text-e-bosy-purple mr-3 flex-shrink-0" />
                      <div className="leading-tight"> {/* Adjust line height for question text */}
                        Question {currentQuestionIndex + 1}: <br className="sm:hidden"/> {currentQuestion.questionText}
                      </div>
                    </h2>
                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 mb-6"> {/* Lighter background for instructions */}
                      <p className="text-gray-600 text-sm italic">
                        {currentQuestion.questionType === "multiple_choice" ?
                          "Sélectionnez la ou les bonnes réponses." :
                          "Sélectionnez la bonne réponse."}
                      </p>
                    </div>

                    <div className="space-y-4">
                      {currentQuestion.answers?.map((answer) => (
                        <label
                          key={answer.answerId}
                          className={`flex items-center p-4 rounded-lg cursor-pointer transition-colors border shadow-sm ${ // Added shadow-sm for depth
                            currentExamSelectedAnswers[currentQuestion.questionId]?.includes(answer.answerId)
                              ? 'border-e-bosy-purple bg-purple-50 text-e-bosy-purple' // Light purple background, purple text
                              : 'border-gray-200 hover:border-gray-300 bg-white text-gray-800' // White background, gray text, lighter hover
                          }`}
                        >
                          <input
                            type={currentQuestion.questionType === "multiple_choice" ? "checkbox" : "radio"}
                            name={`question-${currentQuestion.questionId}`}
                            value={answer.answerId}
                            checked={currentExamSelectedAnswers[currentQuestion.questionId]?.includes(answer.answerId) || false}
                            onChange={() => handleAnswerSelect(currentQuestion.questionId, answer.answerId)}
                            className="form-checkbox h-5 w-5 text-e-bosy-purple rounded border-gray-300 bg-white focus:ring-e-bosy-purple focus:ring-offset-1" // Consistent purple for checkbox
                          />
                          <span className="ml-3 font-medium">{answer.answerText}</span> {/* Bolder answer text */}
                        </label>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                    <QuestionMarkCircleIcon className="h-16 w-16 mb-4 text-gray-300" />
                    <p className="text-lg font-medium">Sélectionnez une section et une question depuis la barre latérale pour commencer l'examen.</p>
                    <p className="mt-2 text-sm">Utilisez les numéros de questions pour naviguer rapidement.</p>
                  </div>
                )}
              </div>

              {/* Navigation Buttons for Questions */}
              <div className="flex justify-between mt-6 p-4 bg-white rounded-xl shadow-lg border border-gray-100"> {/* Encapsulated in a subtle card */}
                <button
                  onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                  disabled={currentQuestionIndex === 0}
                  className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors shadow-sm ${
                    currentQuestionIndex === 0
                      ? 'text-gray-500 bg-gray-100 cursor-not-allowed' // Disabled state
                      : 'text-e-bosy-purple bg-purple-50 hover:bg-purple-100' // Primary action look
                  }`}
                >
                  <ChevronLeftIcon className="h-5 w-5 mr-2" />
                  Précédent
                </button>
                <button
                  onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                  disabled={currentQuestionIndex === currentQuestions.length - 1}
                  className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors shadow-sm ${
                    currentQuestionIndex === currentQuestions.length - 1
                      ? 'text-gray-500 bg-gray-100 cursor-not-allowed' // Disabled state
                      : 'text-e-bosy-purple bg-purple-50 hover:bg-purple-100' // Primary action look
                  }`}
                >
                  Suivant
                  <ChevronRightIcon className="h-5 w-5 ml-2" />
                </button>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Confirmation Modal for Final Submission */}
      {isConfirmSubmitOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50 p-4"> {/* Darker overlay */}
          <div className="bg-white rounded-xl p-8 max-w-lg w-full mx-auto shadow-2xl border border-gray-100"> {/* White background, strong shadow */}
            <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Confirmer la Soumission</h3>
            <p className="text-gray-700 mb-6 text-center">
              Êtes-vous sûr de vouloir soumettre <span className="font-semibold text-gray-900">tous</span> les examens maintenant ?
              Vous ne pourrez plus modifier vos réponses après cette action.
              <br/><br/>
              **Temps restant : {formatTime(totalTimeLeft)}**
            </p>
            <div className="flex justify-center space-x-6">
              <button
                onClick={() => setIsConfirmSubmitOpen(false)}
                className="px-6 py-3 rounded-lg text-gray-600 border border-gray-300 hover:bg-gray-100 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Annuler
              </button>
              <button
                onClick={handleOverallSubmission}
                disabled={isSubmitting}
                className={`px-8 py-3 rounded-lg font-bold text-lg transition-all duration-300 flex items-center justify-center ${
                  isSubmitting
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700 transform hover:scale-105 shadow-md focus:outline-none focus:ring-4 focus:ring-green-300'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Soumission...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Confirmer & Soumettre
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificationExamPage;