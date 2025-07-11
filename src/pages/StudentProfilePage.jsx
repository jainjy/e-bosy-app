import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  AcademicCapIcon,
  ClockIcon,
  FireIcon,
  ChartBarIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { getData, API_BASE_URL } from '../services/ApiFetch';
import { useAuth } from '../contexts/AuthContext';

const DEFAULT_PROFILE_IMAGE = '/images/default-profile.jpg';
const DEFAULT_COURSE_IMAGE = '/images/default-course.jpg';

const StudentProfilePage = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        // Récupérer les informations de l'étudiant
        const [userData, userError] = await getData(`users/${id}`);
        if (userError) throw new Error(userError.message);
        if (userData.role.toLowerCase() !== 'etudiant') {
          throw new Error('Cet utilisateur n\'est pas un étudiant.');
        }
        setStudent(userData);

        // Récupérer les inscriptions de l'étudiant
        const [enrollmentsData, enrollmentsError] = await getData(`enrollments/student/${id}`);
        if (enrollmentsError) throw new Error(enrollmentsError.message);
        setEnrollments(enrollmentsData);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!student) return <div className="p-6 text-red-600">Utilisateur non trouvé.</div>;

  const stats = {
    coursesEnrolled: enrollments.length,
    completedCourses: enrollments.filter(e => e.completionRate === 100).length,
    averageProgress: enrollments.reduce((acc, curr) => acc + curr.completionRate, 0) / enrollments.length || 0,
    streak: 7, // À implémenter avec la vraie logique de streak
    totalCertificates: enrollments.filter(e => e.completionRate === 100).length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête du profil */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center space-x-8">
            <img
              src={student.profilePictureUrl ? `${API_BASE_URL}/${student.profilePictureUrl}` : DEFAULT_PROFILE_IMAGE}
              alt={`${student.firstName} ${student.lastName}`}
              className="h-32 w-32 rounded-full border-4 border-white shadow-lg"
              onError={(e) => { e.target.src = DEFAULT_PROFILE_IMAGE; }}
            />
            <div className="flex-1">
              <h1 className="text-4xl font-bold">{`${student.firstName} ${student.lastName}`}</h1>
              <p className="text-lg opacity-90">Membre depuis {new Date(student.CreatedAt).toLocaleDateString('fr-FR')}</p>
              {student.Bio && <p className="mt-2 text-lg">{student.Bio}</p>}
            </div>
            <Link
              to="/dashboard/settings"
              className="inline-flex items-center px-6 py-3 bg-white text-purple-600 rounded-full font-semibold shadow-md hover:bg-gray-50 transition-colors"
            >
              <CogIcon className="h-5 w-5 mr-2" />
              Modifier mon profile
            </Link>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="max-w-7xl mx-auto px-4 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Cours inscrits</p>
                <p className="text-3xl font-bold">{stats.coursesEnrolled}</p>
              </div>
              <AcademicCapIcon className="h-12 w-12 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Cours complétés</p>
                <p className="text-3xl font-bold">{stats.completedCourses}</p>
              </div>
              <ChartBarIcon className="h-12 w-12 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Progrès moyen</p>
                <p className="text-3xl font-bold">{Math.round(stats.averageProgress)}%</p>
              </div>
              <FireIcon className="h-12 w-12 text-orange-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Streak actuel</p>
                <p className="text-3xl font-bold">{stats.streak} jours</p>
              </div>
              <ClockIcon className="h-12 w-12 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Liste des cours */}
        <div className="mt-8 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">Mes cours en cours</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map(enrollment => (
              <div key={enrollment.enrollmentId} className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <img
                  src={enrollment.course?.thumbnailUrl ? `${API_BASE_URL}/${enrollment.course.thumbnailUrl}` : DEFAULT_COURSE_IMAGE}
                  alt={enrollment.course?.title}
                  className="w-full h-40 object-cover"
                  onError={(e) => { e.target.src = DEFAULT_COURSE_IMAGE; }}
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{enrollment.course?.title}</h3>
                  <div className="mt-2">
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-purple-600 bg-purple-200">
                            Progression
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold inline-block text-purple-600">
                            {enrollment.completionRate}%
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-purple-200">
                        <div
                          style={{ width: `${enrollment.completionRate}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500"
                        />
                      </div>
                    </div>
                  </div>
                  <Link
                    to={`/course/${enrollment.course?.courseId}`}
                    className="mt-3 inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Continuer
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;
