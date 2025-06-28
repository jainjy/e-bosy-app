import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Bars3Icon, // For sidebar toggle
} from '@heroicons/react/24/outline';
import CertificationResultsPage from './CertificationResultsPage'; // Import the new component

const API_BASE_URL = "http://localhost:5196";

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
  const [overallResults, setOverallResults] = useState([]); // Results for all submitted exams
  const [showOverallResults, setShowOverallResults] = useState(false);
  const [isConfirmSubmitOpen, setIsConfirmSubmitOpen] = useState(false);
  const [hasLoadedExams, setHasLoadedExams] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Ref for the global timer interval
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
        navigate(-1); // Go back if not enough exams
        return;
      }

      // Sort exams if needed, or take the first two, ensure consistency
      const selectedExams = examsData.slice(0, 2); // Assuming you always need exactly 2 exams for certification
      setExams(selectedExams);

      let initialTotalTime = 0;
      const initialQuestionsBySection = {};
      const initialAllSelectedAnswers = {};
      
      for (let i = 0; i < selectedExams.length; i++) {
        const exam = selectedExams[i];
        initialTotalTime += exam.timeLimit ? exam.timeLimit * 60 : 0; // Accumulate time
        const [questionsData] = await getData(`assessments/${exam.assessmentId}/questions`);
        
        // Ensure questionsData is an array, even if null/undefined
        initialQuestionsBySection[i] = questionsData || []; 
        initialAllSelectedAnswers[i] = {}; // Initialize answers for this exam
      }

      // If no time limit is specified for any exam, set a default (e.g., 90 minutes) or handle accordingly.
      if (initialTotalTime === 0) {
          initialTotalTime = 90 * 60; // Default to 90 minutes if no time limits set
      }

      setQuestionsBySection(initialQuestionsBySection);
      setAllSelectedAnswers(initialAllSelectedAnswers);
      setTotalTimeLeft(initialTotalTime);
      setHasLoadedExams(true);
      startGlobalTimer(); // Start the global timer once everything is loaded
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
    if (globalTimerRef.current) return; // Prevent multiple timers

    globalTimerRef.current = setInterval(() => {
      setTotalTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(globalTimerRef.current);
          globalTimerRef.current = null;
          handleOverallSubmission(); // Submit all exams when time runs out
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
    // Clear interval on unmount
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

      // Logic to handle single vs. multiple choice, assuming "MultipleChoice" allows multiple
      const currentQuestion = questionsBySection[currentSectionIndex]?.find(q => q.questionId === questionId);
      let newAnswers;

      if (currentQuestion?.questionType === "MultipleChoice") {
          // Allow multiple selections
          newAnswers = currentQuestionAnswers.includes(answerId)
              ? currentQuestionAnswers.filter(id => id !== answerId)
              : [...currentQuestionAnswers, answerId];
      } else {
          // For other types (e.g., "SingleChoice", implied if not MultipleChoice), allow only one
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
    clearInterval(globalTimerRef.current); // Stop timer immediately

    try {
      const submissions = await Promise.all(
        exams.map(async (exam, index) => {
          // Ensure all answers for this exam are numbers
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
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-e-bosy-purple"></div>
        <p className="text-white ml-4">Chargement des examens...</p>
      </div>
    );
  }

  // --- Render logic for the exam page ---
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col font-sans">
      {/* Top Navigation Bar (Header) */}
      <header className="flex items-center justify-between bg-gray-800 p-4 shadow-md z-10">
        <div className="flex items-center">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="mr-4 text-gray-400 hover:text-white">
            <Bars3Icon className="h-6 w-6" />
          </button>
          <span className="text-xl font-bold text-white">e-BoSy Certification</span>
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center text-gray-300">
            <span className="mr-2">Répondu:</span>
            <span className="font-semibold text-white">{totalQuestionsAnswered()}</span>
            <span className="mx-1">/</span>
            <span className="font-semibold text-white">{totalQuestions()}</span>
          </div>
          <div className={`flex items-center px-3 py-1 rounded-full ${
            totalTimeLeft !== null && totalTimeLeft < 300 ? 'bg-red-700 text-white' : 'bg-gray-700 text-gray-200'
          }`}>
            <ClockIcon className="h-5 w-5 mr-2" />
            <span className="font-mono text-lg">{formatTime(totalTimeLeft)}</span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-300 mr-2">{user?.firstName} {user?.lastName}</span>
            {/* User Avatar Placeholder */}
            {user?.profilePictureUrl ? <img src={API_BASE_URL+user?.profilePictureUrl} className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold" alt="User Profile"/>
              : <div className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
              {user?.firstName?.charAt(0) || 'U'}
            </div>}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar for Questions */}
        <aside
          className={`bg-gray-800 border-r border-gray-700 p-6 flex flex-col transition-all duration-300 ${
            isSidebarOpen ? 'w-80' : 'w-0 overflow-hidden p-0'
          }`}
        >
          {isSidebarOpen && (
            <>
              <h2 className="text-xl font-semibold text-white mb-6">Questions</h2>
              <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {exams.map((exam, examIdx) => (
                  <div key={exam.assessmentId} className="mb-6">
                    <button
                      onClick={() => {
                        setCurrentSectionIndex(examIdx);
                        setCurrentQuestionIndex(0); // Reset to first question of new section
                      }}
                      className={`w-full text-left p-3 rounded-md flex items-center justify-between text-lg font-medium transition-colors ${
                        currentSectionIndex === examIdx
                          ? 'bg-e-bosy-purple text-white'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <span>Section {examIdx + 1}: {exam.title}</span>
                      <span className="text-sm">
                        {/* Correctly calculate answered questions for this section */}
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
                                ? 'bg-blue-600 text-white border-blue-600'
                                : isQuestionAnswered(examIdx, q.questionId)
                                  ? 'bg-green-600 text-white border-green-600'
                                  : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
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
              <div className="mt-6">
                <button
                  onClick={() => setIsConfirmSubmitOpen(true)}
                  disabled={!allExamsCompleted || isSubmitting}
                  className={`w-full flex items-center justify-center px-6 py-3 rounded-lg font-bold text-lg transition-colors ${
                    allExamsCompleted && !isSubmitting
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <FlagIcon className="h-5 w-5 mr-2" />
                  Soumettre le Test
                </button>
              </div>
            </>
          )}
        </aside>

        {/* Main Question/Code Area */}
        <main className="flex-1 flex flex-col bg-gray-900 p-8">
          {showOverallResults ? (
            <CertificationResultsPage
              overallResults={overallResults}
              exams={exams}
              courseId={courseId}
            />
          ) : (
            <>
              {/* Question Description and Inputs */}
              <div className="bg-gray-800 rounded-lg shadow-lg p-6 flex-1 overflow-y-auto custom-scrollbar">
                {currentQuestion ? (
                  <>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                      <QuestionMarkCircleIcon className="h-6 w-6 text-e-bosy-purple mr-3" />
                      Question {currentQuestionIndex + 1}: {currentQuestion.questionText}
                    </h2>
                    {/* Placeholder for Code Editor Area if needed later */}
                    <div className="bg-gray-900 border border-gray-700 rounded-md p-4 mb-6">
                        <p className="text-gray-400 text-sm italic">
                            {currentQuestion.questionType === "MultipleChoice" ?
                                "Sélectionnez la ou les bonnes réponses :" :
                                "Sélectionnez la bonne réponse :"} {/* Added specific text for single choice */}
                        </p>
                    </div>

                    <div className="space-y-4">
                      {currentQuestion.answers?.map((answer) => ( // Ensure currentQuestion.answers is not null/undefined
                        <label
                          key={answer.answerId}
                          className={`flex items-center p-4 rounded-lg cursor-pointer transition-colors border ${
                            currentExamSelectedAnswers[currentQuestion.questionId]?.includes(answer.answerId)
                              ? 'border-e-bosy-purple bg-purple-900'
                              : 'border-gray-700 hover:border-gray-600 bg-gray-700'
                          }`}
                        >
                          <input
                            type={currentQuestion.questionType === "MultipleChoice" ? "checkbox" : "radio"}
                            name={`question-${currentQuestion.questionId}`}
                            value={answer.answerId}
                            checked={currentExamSelectedAnswers[currentQuestion.questionId]?.includes(answer.answerId) || false}
                            onChange={() => handleAnswerSelect(currentQuestion.questionId, answer.answerId)}
                            className="form-checkbox h-5 w-5 text-e-bosy-purple rounded border-gray-600 bg-gray-900 focus:ring-e-bosy-purple"
                          />
                          <span className="ml-3 text-gray-200">{answer.answerText}</span>
                        </label>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-center text-gray-400">Sélectionnez une question pour commencer.</p>
                )}
              </div>

              {/* Navigation Buttons for Questions */}
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                  disabled={currentQuestionIndex === 0}
                  className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                    currentQuestionIndex === 0
                      ? 'text-gray-600 cursor-not-allowed bg-gray-700'
                      : 'text-white bg-e-bosy-purple hover:bg-purple-700'
                  }`}
                >
                  <ChevronLeftIcon className="h-5 w-5 mr-2" />
                  Précédent
                </button>
                <button
                  onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                  disabled={currentQuestionIndex === currentQuestions.length - 1}
                  className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                    currentQuestionIndex === currentQuestions.length - 1
                      ? 'text-gray-600 cursor-not-allowed bg-gray-700'
                      : 'text-white bg-e-bosy-purple hover:bg-purple-700'
                  }`}
                >
                  Suivant
                  <ChevronRightIcon className="h-5 w-5 ml-2" />
                </button>
              </div>

              {/* Test Results/Custom Input Area (Bottom Panel) */}
              <div className="mt-6 bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
                <h3 className="text-lg font-bold text-white mb-4">Panneau Inférieur (Résultats des tests / Entrée personnalisée)</h3>
                <div className="flex space-x-4">
                  <button className="flex-1 py-2 text-center rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors">
                    Test Results
                  </button>
                  <button className="flex-1 py-2 text-center rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors">
                    Custom Input
                  </button>
                </div>
                {/* Content for these tabs would go here */}
                <div className="mt-4 p-4 bg-gray-900 border border-gray-700 rounded-md h-32 flex items-center justify-center">
                    <p className="text-gray-500 text-sm">
                        Ceci est un espace réservé pour les résultats des tests ou l'entrée personnalisée, si applicable.
                    </p>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Confirmation Modal for Final Submission */}
      {isConfirmSubmitOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-8 max-w-lg w-full mx-4 border border-gray-700 shadow-xl">
            <h3 className="text-2xl font-bold text-white mb-4 text-center">Confirmer la Soumission</h3>
            <p className="text-gray-300 mb-6 text-center">
              Êtes-vous sûr de vouloir soumettre <span className="font-semibold text-white">tous</span> les examens maintenant ?
              Vous ne pourrez plus modifier vos réponses après cette action.
            </p>
            <div className="flex justify-center space-x-6">
              <button
                onClick={() => setIsConfirmSubmitOpen(false)}
                className="px-6 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleOverallSubmission}
                disabled={isSubmitting}
                className={`px-8 py-3 rounded-lg font-bold text-lg transition-all duration-300 flex items-center justify-center ${
                  isSubmitting
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700 transform hover:scale-105 shadow-lg'
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