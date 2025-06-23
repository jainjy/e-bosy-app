import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getData } from '../../services/ApiFetch';
import { useAuth } from '../../contexts/AuthContext';
import {
  AcademicCapIcon,
  ClipboardDocumentCheckIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
  QuestionMarkCircleIcon,
  ChevronRightIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import Navbar from '../../Components/Navbar';

const StudentAssessmentsPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const [enrollmentsData, enrollmentsError] = await getData(`enrollments/student/${user.userId}`);
            
            if (enrollmentsError) {
                console.error('Erreur lors de la récupération des inscriptions:', enrollmentsError);
                setError("Impossible de charger vos inscriptions");
                return;
            }

            if (!enrollmentsData || enrollmentsData.length === 0) {
                setCourses([]);
                return;
            }

            // Transformez les données pour inclure les évaluations
            const coursesWithAssessments = enrollmentsData.map(enrollment => ({
                ...enrollment.course,
                assessments: enrollment.course.assessments || []
            }));

            console.log('Cours avec évaluations:', coursesWithAssessments);
            
            setCourses(coursesWithAssessments);

            if (coursesWithAssessments.length > 0) {
                setSelectedCourse(coursesWithAssessments[0]);
                const firstCourseAssessments = coursesWithAssessments[0].assessments || [];
                console.log('Évaluations du premier cours:', firstCourseAssessments);
                setAssessments(firstCourseAssessments);
            }

        } catch (err) {
            console.error('Erreur:', err);
            setError("Une erreur est survenue lors du chargement des données");
        } finally {
            setLoading(false);
        }
    };

    if (user?.userId) {
        fetchData();
    }
}, [user?.userId]);

const handleCourseChange = async (courseId) => {
    try {
        setLoading(true);
        const selectedCourse = courses.find(c => c.courseId === courseId);
        setSelectedCourse(selectedCourse);
        setAssessments(selectedCourse?.assessments || []);
    } catch (error) {
        console.error('Error changing course:', error);
    } finally {
        setLoading(false);
    }
};

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mes Évaluations</h1>
          <p className="mt-2 text-gray-600">Gérez vos exercices et examens par cours</p>
        </div>

        {/* Sélecteur de cours */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sélectionner un cours
          </label>
          <select
            className="w-full md:w-1/2 rounded-lg border-gray-300 shadow-sm focus:border-e-bosy-purple focus:ring-e-bosy-purple"
            onChange={(e) => handleCourseChange(Number(e.target.value))}
            value={selectedCourse?.courseId || ''}
          >
            {courses.map(course => (
              <option key={course.courseId} value={course.courseId}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-e-bosy-purple"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assessments.map((assessment) => {
              const submission = submissions[assessment.assessmentId];
              return (
                <motion.div
                  key={assessment.assessmentId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border-l-4 ${
                    assessment.type === 'exam' 
                      ? 'border-l-e-bosy-purple' 
                      : 'border-l-yellow-500'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
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
                      {submission && (
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          submission.score >= (assessment.totalScore * 0.7)
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          <CheckCircleIcon className="h-4 w-4 mr-1.5" />
                          {Math.round((submission.score / assessment.totalScore) * 100)}%
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                      {assessment.title}
                    </h3>

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
                      {submission && (
                        <div className="flex items-center text-gray-600">
                          <ChartBarIcon className="h-5 w-5 mr-2 text-green-500" />
                          <span>{submission.score} / {assessment.totalScore}</span>
                        </div>
                      )}
                    </div>

                    <Link
                      to={`/course/${selectedCourse.courseId}/exercise/${assessment.assessmentId}`}
                      className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors ${
                        assessment.type === 'exam'
                          ? 'bg-e-bosy-purple text-white hover:bg-purple-700'
                          : 'bg-yellow-500 text-white hover:bg-yellow-600'
                      }`}
                    >
                      <span>{submission ? 'Réessayer' : 'Commencer'}</span>
                      <ChevronRightIcon className="h-5 w-5" />
                    </Link>

                    {submission && (
                      <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
                        Dernière tentative le {new Date(submission.submittedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {assessments.length === 0 && (
              <div className="col-span-full text-center py-12">
                <ClipboardDocumentCheckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Aucune évaluation disponible</h3>
                <p className="mt-2 text-gray-500">Ce cours n'a pas encore d'évaluations.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAssessmentsPage;