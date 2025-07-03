import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getData } from '../../services/ApiFetch';
import { useAuth } from '../../contexts/AuthContext';
import { AcademicCapIcon, BookOpenIcon } from '@heroicons/react/24/outline'; // Add BookOpenIcon for courses
import Navbar from '../../Components/Navbar';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import AssessmentGrid from '../../components/AssessmentGrid';

const StudentAssessmentsPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [enrollmentsData, enrollmentsError] = await getData(`enrollments/student/${user.userId}`);
        const [submissionsData, submissionsError] = await getData(`assessments/users/${user.userId}/submissions`);

        if (enrollmentsError) {
          console.error('Erreur lors de la récupération des inscriptions:', enrollmentsError);
          setError("Impossible de charger vos inscriptions.");
          return;
        }
        if (submissionsError) {
          console.error('Erreur lors de la récupération des soumission:', submissionsError);
          setError("Impossible de charger vos soumissions.");
          return;
        }

        const progressMap = {};
        if (Array.isArray(submissionsData)) {
          submissionsData.forEach(submission => {
            progressMap[submission.assessmentId] = {
              score: submission.score,
              totalScore: submission.assessment.totalScore,
              submittedAt: new Date(submission.submittedAt)
            };
          });
        }
        setUserProgress(progressMap);

        if (!enrollmentsData || enrollmentsData.length === 0) {
          setCourses([]);
          setAssessments([]);
          return;
        }

        const coursesWithExercises = enrollmentsData.map(enrollment => ({
          ...enrollment.course,
          assessments: (enrollment.course.assessments || []).filter(a => a.type !== 'exam')
        })).filter(course => course.assessments.length > 0);

        setCourses(coursesWithExercises);

        if (coursesWithExercises.length > 0) {
          setSelectedCourse(coursesWithExercises[0]);
          setAssessments(coursesWithExercises[0].assessments || []);
        } else {
          setSelectedCourse(null);
          setAssessments([]);
        }

      } catch (err) {
        console.error('Erreur:', err);
        setError("Une erreur est survenue lors du chargement des données.");
      } finally {
        setLoading(false);
      }
    };

    if (user?.userId) {
      fetchData();
    }
  }, [user?.userId]);

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setAssessments(course.assessments || []);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mes Exercices</h1>
          <p className="mt-2 text-gray-600">Pratiquez et testez vos connaissances.</p>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="text-center text-red-500 py-12">{error}</div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpenIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Aucun cours avec exercices</h3>
            <p className="mt-2 text-gray-500">
              Vous n'êtes pas encore inscrit(e) à des cours contenant des exercices, ou les exercices ne sont pas encore disponibles.
            </p>
            {/* Optional: Link to courses page */}
            <Link to="/courses" className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-e-bosy-purple hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-e-bosy-purple">
                Découvrir les cours
            </Link>
          </div>
        ) : (
          <>
            {/* Course Selection Tabs/Buttons */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Sélectionner un cours</h2>
              <div className="flex flex-nowrap overflow-x-auto gap-3 pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
                {courses.map(course => (
                  <button
                    key={course.courseId}
                    onClick={() => handleCourseSelect(course)}
                    className={`flex-shrink-0 px-5 py-3 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out
                      ${selectedCourse?.courseId === course.courseId
                        ? 'bg-e-bosy-purple text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                  >
                    {course.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Certification Button and Exercises Grid */}
            <div className="flex justify-end mb-8">
              {selectedCourse && (
                <Link
                  to={`/course/${selectedCourse.courseId}/certification`}
                  className="inline-flex items-center px-6 py-3 bg-e-bosy-purple text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
                >
                  <AcademicCapIcon className="h-5 w-5 mr-2" />
                  Passer l'examen de certification
                </Link>
              )}
            </div>

            <AssessmentGrid
              assessments={assessments}
              userProgress={userProgress}
              courseId={selectedCourse?.courseId}
              type="exercise"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default StudentAssessmentsPage;