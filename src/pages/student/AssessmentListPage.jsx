import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getData } from '../../services/ApiFetch';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { ArrowLeftIcon, AcademicCapIcon } from '@heroicons/react/24/outline'; // Keep necessary icons
import Navbar from '../../Components/Navbar';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import AssessmentGrid from '../../components/AssessmentGrid'; // Import the new component

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
        // Fetch course details
        const [courseData, courseError] = await getData(`courses/${courseId}`);
        if (courseError) throw courseError;
        setCourse(courseData);

        // Filter for exercises only from the course's assessments
        const exercisesOnly = Array.isArray(courseData.assessments)
          ? courseData.assessments.filter(assessment => assessment.type !== 'exam')
          : [];
        setAssessments(exercisesOnly);

        // Fetch user submissions if logged in
        if (user?.userId) {
          const [submissionsData, submissionsError] = await getData(`assessments/users/${user.userId}/submissions`);
          if (submissionsError) throw submissionsError;

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
        console.error("Error loading exercises:", error); // Added console.error for debugging
        toast.error("Erreur lors du chargement des exercices.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, user?.userId]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 mt-10 sm:px-6 lg:px-8 py-8">
        {/* Header with certification button */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <button
              onClick={() => navigate(`/course/${courseId}`)}
              className="flex items-center text-gray-600 hover:text-e-bosy-purple transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              <span>Retour au cours</span>
            </button>

            <Link
              to={`/course/${courseId}/certification`}
              className="inline-flex items-center px-6 py-3 bg-e-bosy-purple text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <AcademicCapIcon className="h-5 w-5 mr-2" />
              Passer l'examen de certification
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">{course?.title}</h1>
          <p className="text-gray-600">Exercices disponibles</p>
        </div>

        {/* Grid of exercises - now using the new component */}
        <AssessmentGrid
          assessments={assessments}
          userProgress={userProgress}
          courseId={courseId}
          type="exercise" // Explicitly pass the type
        />
      </div>
    </div>
  );
};

export default AssessmentListPage;