// CertificationExamPage.jsx
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
  UserCircleIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';

const CertificationExamPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [questionsBySection, setQuestionsBySection] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [allSelectedAnswers, setAllSelectedAnswers] = useState(() => {
    const savedAnswers = localStorage.getItem(`examAnswers_${courseId}_${user?.userId}`);
    return savedAnswers ? JSON.parse(savedAnswers) : {};
  });
  const [totalTimeLeft, setTotalTimeLeft] = useState(() => {
    const savedTime = localStorage.getItem(`examTimeLeft_${courseId}_${user?.userId}`);
    return savedTime ? parseInt(savedTime) : null;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasLoadedExams, setHasLoadedExams] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isConfirmSubmitOpen, setIsConfirmSubmitOpen] = useState(false);
  const [canRetakeExam, setCanRetakeExam] = useState(true);
  const [nextRetakeTime, setNextRetakeTime] = useState(null);
  const globalTimerRef = useRef(null);

  const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const slideIn = {
    initial: { x: 20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 }
  };

  useEffect(() => {
    const checkExamRetake = async () => {
      try {
        const examIds = exams.map(exam => exam.assessmentId);
        const checks = await Promise.all(examIds.map(async (examId) => {
          const [canRetake] = await getData(`assessments/can-retake/${examId}/${user.userId}`);
          return { examId, canRetake };
        }));

        const cannotRetake = checks.some(check => !check.canRetake);
        if (cannotRetake) {
          const submissions = await Promise.all(examIds.map(async (examId) => {
            const [submissionData] = await getData(`assessments/users/${user.userId}/submissions`);
            return submissionData
              .filter(s => s.assessmentId === examId)
              .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0];
          }));

          const latestSubmission = submissions.reduce((latest, current) => {
            return (!latest || new Date(current.submittedAt) > new Date(latest.submittedAt)) ? current : latest;
          }, null);

          if (latestSubmission) {
            const lastAttemptTime = new Date(latestSubmission.submittedAt);
            const nextAvailableTime = new Date(lastAttemptTime.getTime() + 24 * 60 * 60 * 1000);
            setNextRetakeTime(nextAvailableTime);
          }
          setCanRetakeExam(false);
          return;
        }
        setCanRetakeExam(true);
        console.log("check an fetch")
      } catch (error) {
        console.error("Error checking exam retake:", error);
        toast.error("Erreur lors de la vérification des tentatives d'examen");
      }
    };

    if (exams.length > 0 && user?.userId) {
      checkExamRetake();
    }
  }, [exams, user?.userId]);

  useEffect(() => {
    const handleCopy = (e) => {
      e.preventDefault();
      toast.error('La copie des questions est désactivée pendant l\'examen');
    };
    const handleContextMenu = (e) => {
      e.preventDefault();
    };
    document.addEventListener('copy', handleCopy);
    document.addEventListener('contextmenu', handleContextMenu);
    console.log("copy")
    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  useEffect(() => {
    if (Object.keys(allSelectedAnswers).length > 0) {
      localStorage.setItem(`examAnswers_${courseId}_${user?.userId}`, JSON.stringify(allSelectedAnswers));
    }
  }, [allSelectedAnswers, courseId, user?.userId]);

  useEffect(() => {
    if (totalTimeLeft !== null) {
      localStorage.setItem(`examTimeLeft_${courseId}_${user?.userId}`, totalTimeLeft.toString());
      console.log("examTimeLeft_")
    }
  }, [totalTimeLeft, courseId, user?.userId]);

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
    // Ajout d'une vérification pour éviter les appels inutiles
    if (hasLoadedExams) return;

    try {
      if (!localStorage.getItem(`examInProgress_${courseId}_${user?.userId}`)) {
        localStorage.removeItem(`examAnswers_${courseId}_${user?.userId}`);
        localStorage.removeItem(`examTimeLeft_${courseId}_${user?.userId}`);
        setAllSelectedAnswers({});
      }
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
      const initialAllSelectedAnswers = allSelectedAnswers;
      for (let i = 0; i < selectedExams.length; i++) {
        const exam = selectedExams[i];
        initialTotalTime += exam.timeLimit ? exam.timeLimit * 60 : 0;
        const [questionsData] = await getData(`assessments/${exam.assessmentId}/questions`);
        initialQuestionsBySection[i] = questionsData || [];
        if (!initialAllSelectedAnswers[i]) {
          initialAllSelectedAnswers[i] = {};
        }
      }
      if (initialTotalTime === 0) {
        initialTotalTime = 90 * 60;
      }
      const savedTime = localStorage.getItem(`examTimeLeft_${courseId}_${user?.userId}`);
      const finalTime = savedTime ? parseInt(savedTime) : initialTotalTime;
      setQuestionsBySection(initialQuestionsBySection);
      setAllSelectedAnswers(initialAllSelectedAnswers);
      setTotalTimeLeft(finalTime);
      setHasLoadedExams(true);

      localStorage.setItem(`examInProgress_${courseId}_${user?.userId}`, 'true');

      startGlobalTimer();
      console.log("fetch")
      toast.success("Examens chargés !");
    } catch (error) {
      console.error("Error loading exams and questions:", error);
      toast.error("Erreur lors du chargement des examens et des questions.");
      navigate(-1);
    }
  }, [courseId, navigate, user?.userId, hasLoadedExams, allSelectedAnswers]);

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
    return () => {
      if (globalTimerRef.current) {
        clearInterval(globalTimerRef.current);
        console.log("interval")
        globalTimerRef.current = null;
      }
    };
  }, []);

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

  const handleOverallSubmission = useCallback(async () => {
    if (isSubmitting) return;
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
          return { ...response, totalScore: exam.totalScore };
        })
      );

      // Vérifier si tous les examens sont réussis (score >= 70%)
      const allPassed = submissions.every((result, idx) => {
        const exam = exams[idx];
        return result && exam && result.score >= exam.totalScore * 0.7;
      });

      // Créer le certificat si tous les examens sont réussis
      if (allPassed) {
        const certificateData = {
          userId: user.userId,
          courseId: parseInt(courseId),
          certificateUrl: `http://localhost:5173/certificates/${uuidv4()}.pdf`,
          verificationCode: `EBoSy-CERT-${uuidv4().slice(0, 8).toUpperCase()}`
        };
        await postData('enrollments/certificates', certificateData);
      }

      localStorage.removeItem(`examAnswers_${courseId}_${user?.userId}`);
      localStorage.removeItem(`examTimeLeft_${courseId}_${user?.userId}`);
      localStorage.removeItem(`examInProgress_${courseId}_${user?.userId}`);

      navigate(`/course/${courseId}/results`, { state: { overallResults: submissions, exams, courseId } });
      toast.success("Examens soumis avec succès !");
    } catch (error) {
      console.error("Error during overall submission:", error);
      toast.error("Erreur lors de la soumission des examens.");
    } finally {
      setIsSubmitting(false);
      setIsConfirmSubmitOpen(false);
    }
  }, [isSubmitting, exams, allSelectedAnswers, user, navigate, courseId]);

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
    return sectionQuestions.every(q => isQuestionAnswered(index, q.questionId));
  });

  const isCurrentSectionCompleted = useCallback(() => {
    const currentSectionQuestions = questionsBySection[currentSectionIndex] || [];
    return currentSectionQuestions.every(q => isQuestionAnswered(currentSectionIndex, q.questionId));
  }, [currentSectionIndex, questionsBySection, isQuestionAnswered]);

  const currentQuestions = questionsBySection[currentSectionIndex] || [];
  const currentQuestion = currentQuestions[currentQuestionIndex];
  const currentExamSelectedAnswers = allSelectedAnswers[currentSectionIndex] || {};

  if (!canRetakeExam) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="min-h-screen bg-gray-50 flex items-center justify-center p-8"
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-2xl bg-white rounded-xl shadow-lg p-8 text-center"
        >
          <div className="flex justify-center mb-6">
            <LockClosedIcon className="h-16 w-16 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Tentative d'examen non autorisée</h2>
          <p className="text-gray-600 mb-6">
            Vous avez échoué à un examen récemment. Vous devez attendre 24 heures avant de pouvoir repasser l'examen.
          </p>
          {nextRetakeTime && (
            <p className="text-lg font-medium text-gray-700 mb-6">
              Prochaine tentative possible: {nextRetakeTime.toLocaleString()}
            </p>
          )}
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-e-bosy-purple text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            Retour
          </button>
        </motion.div>
      </motion.div>
    );
  }

  if (!hasLoadedExams) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="min-h-screen flex items-center justify-center bg-gray-50"
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-e-bosy-purple"></div>
        <p className="text-gray-700 ml-4">Chargement des examens...</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 text-gray-800 flex flex-col font-sans select-none"
    >
      <motion.header 
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        className="flex items-center justify-between bg-white/90 backdrop-blur-sm p-4 shadow-lg z-10 border-b border-gray-100"
      >
        <div className="flex items-center">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="mr-4 text-gray-600 hover:text-e-bosy-purple">
            <Bars3Icon className="h-6 w-6" />
          </button>
          <span className="text-xl font-bold text-gray-900">e-BoSy Certification</span>
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center text-gray-600">
            <span className="mr-2">Répondu:</span>
            <span className="font-semibold text-gray-900">{totalQuestionsAnswered()}</span>
            <span className="mx-1">/</span>
            <span className="font-semibold text-gray-900">{totalQuestions()}</span>
          </div>
          <div className={`flex items-center px-3 py-1 rounded-full ${
            totalTimeLeft !== null && totalTimeLeft < 300 ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 border border-gray-200'
          }`}>
            <ClockIcon className="h-5 w-5 mr-2" />
            <span className="font-mono text-lg">{formatTime(totalTimeLeft)}</span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-700 mr-2">{user?.firstName} {user?.lastName}</span>
            {user?.profilePictureUrl ? (
              <img src={API_BASE_URL + user?.profilePictureUrl} className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold" alt="User Profile" />
            ) : (
              <div className="h-8 w-8 bg-e-bosy-purple rounded-full flex items-center justify-center text-white font-bold text-sm">
                {user?.firstName?.charAt(0) || <UserCircleIcon className="h-6 w-6" />}
              </div>
            )}
          </div>
        </div>
      </motion.header>
      <div className="flex flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {isSidebarOpen && (
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white/90 backdrop-blur-sm border-r border-gray-100 p-6 flex flex-col w-80 shadow-lg"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Questions</h2>
              <motion.div 
                variants={fadeIn}
                initial="initial"
                animate="animate"
                className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar"
              >
                {exams.map((exam, examIdx) => (
                  <motion.div
                    key={exam.assessmentId}
                    variants={slideIn}
                    className="mb-6"
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full text-left p-4 rounded-xl flex items-center justify-between text-lg font-medium transition-all ${
                        currentSectionIndex === examIdx
                          ? 'bg-gradient-to-r from-e-bosy-purple to-purple-600 text-white shadow-lg'
                          : 'text-gray-700 hover:bg-gray-50 border border-gray-200'
                      }`}
                      onClick={() => {
                        setCurrentSectionIndex(examIdx);
                        setCurrentQuestionIndex(0);
                      }}
                    >
                      <span>Section {examIdx + 1}: {exam.title}</span>
                      <span className="text-sm font-normal">
                        {Object.keys(allSelectedAnswers[examIdx] || {}).filter(qId => (allSelectedAnswers[examIdx][qId] || []).length > 0).length}
                        /
                        {questionsBySection[examIdx]?.length || 0}
                      </span>
                    </motion.button>
                    {currentSectionIndex === examIdx && (
                      <div className="grid grid-cols-5 gap-2 mt-4">
                        {questionsBySection[examIdx]?.map((q, qIdx) => (
                          <button
                            key={q.questionId}
                            onClick={() => setCurrentQuestionIndex(qIdx)}
                            className={`w-10 h-10 rounded-md flex items-center justify-center text-sm font-medium transition-colors border ${
                              currentQuestionIndex === qIdx
                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                : isQuestionAnswered(examIdx, q.questionId)
                                  ? 'bg-green-500 text-white border-green-500 shadow-sm'
                                  : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                            }`}
                          >
                            {qIdx + 1}
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
              <div className="mt-6 pt-6 border-t border-gray-100">
                <button
                  onClick={() => setIsConfirmSubmitOpen(true)}
                  disabled={!allExamsCompleted || isSubmitting}
                  className={`w-full flex items-center justify-center px-6 py-3 rounded-lg font-bold text-lg transition-colors shadow-md ${
                    allExamsCompleted && !isSubmitting
                      ? 'bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <FlagIcon className="h-5 w-5 mr-2" />
                  Soumettre le Test
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
        <motion.main 
          layout
          className="flex-1 flex flex-col bg-transparent p-8"
        >
          <motion.div 
            layout
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 flex-1 overflow-y-auto custom-scrollbar border border-gray-100"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {currentQuestion && (
                  <>
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-start">
                      <QuestionMarkCircleIcon className="h-7 w-7 text-e-bosy-purple mr-3 flex-shrink-0" />
                      <div className="leading-tight">
                        Question {currentQuestionIndex + 1}: <br className="sm:hidden" />
                        <span onCopy={(e) => e.preventDefault()}>{currentQuestion.questionText}</span>
                      </div>
                    </h2>
                    
                    {/* Ajout de l'explication de la question */}
                    {currentQuestion.explanation && (
                      <motion.div 
                        className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-6"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <h3 className="text-blue-800 font-semibold mb-2">Explication :</h3>
                        <p className="text-blue-700" onCopy={(e) => e.preventDefault()}>
                          {currentQuestion.explanation}
                        </p>
                      </motion.div>
                    )}
                    
                    <motion.div 
                      className="bg-purple-50 border border-purple-100 rounded-xl p-6 mb-8"
                      whileHover={{ scale: 1.01 }}
                    >
                      <p className="text-gray-600 text-sm italic" onCopy={(e) => e.preventDefault()}>
                        {currentQuestion.questionType === "multiple_choice"
                          ? "Sélectionnez la ou les bonnes réponses."
                          : "Sélectionnez la bonne réponse."}
                      </p>
                    </motion.div>
                    <motion.div className="space-y-4">
                      {currentQuestion.answers?.map((answer) => (
                        <motion.label
                          key={answer.answerId}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className={`flex items-center p-5 rounded-xl cursor-pointer transition-all border-2 ${
                            currentExamSelectedAnswers[currentQuestion.questionId]?.includes(answer.answerId)
                              ? 'border-e-bosy-purple bg-purple-50/50 text-e-bosy-purple shadow-purple-100'
                              : 'border-gray-200 hover:border-purple-200 bg-white/50 text-gray-800'
                          }`}
                        >
                          <input
                            type={currentQuestion.questionType === "multiple_choice" ? "checkbox" : "radio"}
                            name={`question-${currentQuestion.questionId}`}
                            value={answer.answerId}
                            checked={currentExamSelectedAnswers[currentQuestion.questionId]?.includes(answer.answerId) || false}
                            onChange={() => handleAnswerSelect(currentQuestion.questionId, answer.answerId)}
                            className="form-checkbox h-5 w-5 text-e-bosy-purple rounded border-gray-300 bg-white focus:ring-e-bosy-purple focus:ring-offset-1"
                          />
                          <span className="ml-3 font-medium" onCopy={(e) => e.preventDefault()}>{answer.answerText}</span>
                        </motion.label>
                      ))}
                    </motion.div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
          <motion.div 
            layout
            className="flex justify-between mt-6 p-4 bg-white rounded-xl shadow-lg border border-gray-100"
          >
            <button
              onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
              disabled={currentQuestionIndex === 0}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                currentQuestionIndex === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200 hover:transform hover:scale-105 shadow-md'
              }`}
            >
              <ChevronLeftIcon className="h-5 w-5 mr-2" />
              Précédent
            </button>

            {currentQuestionIndex === currentQuestions.length - 1 ? (
              <button
                onClick={() => {
                  if (currentSectionIndex < exams.length - 1) {
                    setCurrentSectionIndex(prev => prev + 1);
                    setCurrentQuestionIndex(0);
                  } else if (isCurrentSectionCompleted() && allExamsCompleted) {
                    setIsConfirmSubmitOpen(true);
                  }
                }}
                disabled={!isCurrentSectionCompleted()}
                className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isCurrentSectionCompleted()
                    ? currentSectionIndex < exams.length - 1
                      ? 'bg-green-600 text-white hover:bg-green-700 hover:transform hover:scale-105 shadow-md'
                      : 'bg-blue-600 text-white hover:bg-blue-700 hover:transform hover:scale-105 shadow-md'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {currentSectionIndex < exams.length - 1 ? (
                  <>
                    Section suivante
                    <ChevronRightIcon className="h-5 w-5 ml-2" />
                  </>
                ) : (
                  <>
                    Valider l'examen
                    <CheckCircleIcon className="h-5 w-5 ml-2" />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                className="flex items-center px-6 py-3 rounded-lg font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 transition-all duration-200 hover:transform hover:scale-105 shadow-md"
              >
                Suivant
                <ChevronRightIcon className="h-5 w-5 ml-2" />
              </button>
            )}
          </motion.div>
        </motion.main>
      </div>
      <AnimatePresence>
        {isConfirmSubmitOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-lg w-full mx-auto shadow-2xl border border-gray-100"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Confirmer la Soumission</h3>
              <p className="text-gray-700 mb-6 text-center">
                Êtes-vous sûr de vouloir soumettre <span className="font-semibold text-gray-900">tous</span> les examens maintenant ?
                Vous ne pourrez plus modifier vos réponses après cette action.
                <br /><br />
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CertificationExamPage;
