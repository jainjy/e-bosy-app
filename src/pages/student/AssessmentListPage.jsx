// AssessmentListPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getData } from '../../services/ApiFetch';
import { toast } from 'react-hot-toast';
import { ArrowLeftIcon, AcademicCapIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import Navbar from '../../Components/Navbar';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import AssessmentGrid from '../../components/AssessmentGrid';

const AssessmentListPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [course, setCourse] = useState(null);
  const [completionRate, setCompletionRate] = useState(0);
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState({});
  const [canTakeExam, setCanTakeExam] = useState(true);
  const [nextExamTime, setNextExamTime] = useState(null);

  useEffect(() => {
    const checkExamAvailability = async () => {
      try {
        const [examsData] = await getData(`assessments/course/${courseId}/exams`);
        if (!examsData || examsData.length === 0) return;

        const examIds = examsData.map(exam => exam.assessmentId);
        const checks = await Promise.all(examIds.map(async (examId) => {
          const [canRetake] = await getData(`assessments/can-retake/${examId}/${user.userId}`);
          return canRetake;
        }));

        if (checks.some(canRetake => !canRetake)) {
          setCanTakeExam(false);

          const [submissions] = await getData(`assessments/users/${user.userId}/submissions`);
          const examSubmissions = submissions.filter(s => examIds.includes(s.assessmentId));

          if (examSubmissions.length > 0) {
            const lastSubmission = examSubmissions.reduce((latest, current) => {
              return new Date(current.submittedAt) > new Date(latest.submittedAt) ? current : latest;
            });

            const lastAttemptTime = new Date(lastSubmission.submittedAt);
            const nextAvailableTime = new Date(lastAttemptTime.getTime() + 24 * 60 * 60 * 1000);
            setNextExamTime(nextAvailableTime);
          }
        } else {
          setCanTakeExam(true);
        }
      } catch (error) {
        console.error("Error checking exam availability:", error);
        toast.error("Erreur lors de la vérification de l'accès à l'examen");
      }
    };

    if (user?.userId && courseId) {
      checkExamAvailability();
    }
  }, [user?.userId, courseId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch course details
        const [courseData] = await getData(`courses/${courseId}`);
        setCourse(courseData);

        // Fetch enrollment to get completionRate
        if (user?.userId) {
          const [enrollmentData] = await getData(`enrollments/course/${courseId}/${user.userId}`);
          setCompletionRate(enrollmentData?.completionRate || 0);

          // Fetch certificate data
          const [certificateData] = await getData(`enrollments/certificates/course/${courseId}/${user.userId}`);
          setCertificate(certificateData);
        }

        // Filter for exercises only from the course's assessments
        const exercisesOnly = Array.isArray(courseData.assessments)
          ? courseData.assessments.filter(assessment => assessment.type !== 'exam')
          : [];
        setAssessments(exercisesOnly);

        // Fetch user submissions if logged in
        if (user?.userId) {
          const [submissionsData] = await getData(`assessments/users/${user.userId}/submissions`);
          const progress = {};
          submissionsData.forEach(submission => {
            progress[submission.assessmentId] = {
              score: submission.score,
              totalScore: submission.assessment.totalScore,
              submittedAt: new Date(submission.submittedAt)
            };
          });
          setUserProgress(progress);
        }
      } catch (error) {
        console.error("Error loading exercises:", error);
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
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <button
              onClick={() => navigate(`/course/${courseId}`)}
              className="flex items-center text-gray-600 hover:text-e-bosy-purple transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              <span>Retour au cours</span>
            </button>
            {certificate ? (
              <Link
                to={`/certificates/${certificate.certificateId}`}
                className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors shadow-sm"
              >
                <AcademicCapIcon className="h-5 w-5 mr-2" />
                Voir la certification
              </Link>
            ) : (
              <div className="relative">
                <Link
                  to={canTakeExam ? `/course/${courseId}/certification` : '#'}
                  className={`inline-flex items-center px-6 py-3 rounded-lg text-white font-medium transition-colors shadow-sm
                    ${completionRate >= 80 && canTakeExam
                      ? 'bg-e-bosy-purple hover:bg-purple-700'
                      : 'bg-gray-300 cursor-not-allowed'
                    }`}
                  onClick={(e) => {
                    if (completionRate < 80) {
                      e.preventDefault();
                      toast.error("Vous devez compléter au moins 80% du cours pour passer l'examen.");
                    } else if (!canTakeExam) {
                      e.preventDefault();
                      toast.error(
                        `Vous devez attendre jusqu'à ${nextExamTime?.toLocaleString()} pour repasser l'examen.`
                      );
                    }
                  }}
                >
                  <AcademicCapIcon className="h-5 w-5 mr-2" />
                  Passer l'examen de certification
                </Link>
                {!canTakeExam && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                    <LockClosedIcon className="h-4 w-4" />
                  </div>
                )}
              </div>
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{course?.title}</h1>
          <p className="text-gray-600">Exercices disponibles</p>
        </div>
        <AssessmentGrid
          assessments={assessments}
          userProgress={userProgress}
          courseId={courseId}
          courseTitle={course?.title}
          type="exercise"
        />
      </div>
    </div>
  );
};

export default AssessmentListPage;
