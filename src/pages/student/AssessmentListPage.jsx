import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getData } from '../../services/ApiFetch';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import {
  ArrowLeftIcon,
  AcademicCapIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  DocumentTextIcon,
  StarIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ChartBarIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import Navbar from '../../Components/Navbar';

const AssessmentListPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Récupérer les détails du cours
        const [courseData] = await getData(`courses/${courseId}`);
        setCourse(courseData);

        // Récupérer les évaluations
        const [assessmentsData] = await getData(`assessments/course/${courseId}`);
        // S'assurer que assessmentsData est un tableau
        setAssessments(Array.isArray(assessmentsData) ? assessmentsData : []);

        // Récupérer les soumissions de l'utilisateur si connecté
        if (user?.userId) {
          const [submissionsData] = await getData(`assessments/users/${user.userId}/submissions`);
          const progress = {};
          if (Array.isArray(submissionsData)) {
            submissionsData.forEach(submission => {
              progress[submission.assessmentId] = {
                score: submission.score,
                totalScore: submission.assessment.totalScore,
                submittedAt: new Date(submission.submittedAt)
              };
            });
          }
          setUserProgress(progress);
        }
      } catch (error) {
        toast.error("Erreur lors du chargement des évaluations");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, user?.userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-80px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-e-bosy-purple"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/course/${courseId}`)}
            className="flex items-center text-gray-600 hover:text-e-bosy-purple mb-4 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            <span>Retour au cours</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{course?.title}</h1>
          <p className="text-gray-600">Évaluations et exercices disponibles</p>
        </div>

        {/* Grid des évaluations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assessments.map((assessment) => {
            const progress = userProgress[assessment.assessmentId];
            const isCompleted = !!progress;

            return (
              <div
                key={assessment.assessmentId}
                className={`bg-white rounded-xl shadow-sm border-l-4 ${
                  assessment.type === 'exam'
                    ? 'border-l-e-bosy-purple hover:border-l-purple-600'
                    : 'border-l-yellow-500 hover:border-l-yellow-600'
                } transition-all duration-200 hover:shadow-md`}
              >
                <div className="p-6">
                  {/* Badge Type + Status */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      assessment.type === 'exam'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {assessment.type === 'exam' ? (
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
                    {isCompleted && (
                      <span className="inline-flex items-center text-green-600 text-sm">
                        <CheckCircleIcon className="h-5 w-5 mr-1.5" />
                        Complété
                      </span>
                    )}
                  </div>

                  {/* Titre */}
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    {assessment.title}
                  </h3>

                  {/* Informations */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="flex items-center text-gray-600">
                      <StarIcon className="h-5 w-5 mr-2 text-yellow-500" />
                      <span>{assessment.totalScore} points</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <ClockIcon className="h-5 w-5 mr-2 text-blue-500" />
                      <span>{assessment.timeLimit || '∞'} min</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <QuestionMarkCircleIcon className="h-5 w-5 mr-2 text-e-bosy-purple" />
                      <span>{assessment.questionCount || '?'} questions</span>
                    </div>
                    {isCompleted && (
                      <div className="flex items-center text-gray-600">
                        <ChartBarIcon className="h-5 w-5 mr-2 text-green-500" />
                        <span>{Math.round((progress.score / progress.totalScore) * 100)}%</span>
                      </div>
                    )}
                  </div>

                  {/* Bouton d'action */}
                  <Link
                    to={`/course/${courseId}/exercise/${assessment.assessmentId}`}
                    className={`flex items-center justify-between w-full px-4 py-3 rounded-lg text-white transition-colors ${
                      assessment.type === 'exam'
                        ? 'bg-e-bosy-purple hover:bg-purple-700'
                        : 'bg-yellow-500 hover:bg-yellow-600'
                    }`}
                  >
                    <span className="font-medium">
                      {isCompleted ? 'Réessayer' : 'Commencer'}
                    </span>
                    <ChevronRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                {isCompleted && (
                  <div className="px-6 py-4 bg-gray-50 rounded-b-xl border-t text-sm text-gray-500">
                    Dernier essai : {progress.submittedAt.toLocaleDateString()}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Message si aucune évaluation */}
        {assessments.length === 0 && (
          <div className="text-center py-12">
            <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune évaluation disponible
            </h3>
            <p className="text-gray-500">
              Les évaluations pour ce cours seront disponibles prochainement.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentListPage;