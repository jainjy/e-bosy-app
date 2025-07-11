import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  AcademicCapIcon,
  ClockIcon,
  FireIcon,
  ChartBarIcon,
  CogIcon,
  UsersIcon,
  VideoCameraIcon,
  StarIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { getData, API_BASE_URL } from '../services/ApiFetch';
import { useAuth } from '../contexts/AuthContext';

const DEFAULT_PROFILE_IMAGE = '/images/default-profile.jpg';
const DEFAULT_COURSE_IMAGE = '/images/default-course.jpg';

const ProfilePage = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Récupérer les informations de l'utilisateur
        const [userData, userError] = await getData(`users/${id}`);
        if (userError) throw new Error(userError.message);
        setProfileData(userData);

        // Charger les données spécifiques au rôle
        if (userData.role === 'enseignant') {
          const [coursesData] = await getData(`courses/teacher/${id}`);
          setCourses(coursesData || []);
        } else if (userData.role === 'etudiant') {
          const [enrollmentsData] = await getData(`enrollments/student/${id}`);
          setEnrollments(enrollmentsData || []);
        }
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!profileData) return <div className="p-6 text-red-600">Utilisateur non trouvé.</div>;

  const isTeacher = profileData.role === 'enseignant';
  const isStudent = profileData.role === 'etudiant';

  // Statistiques selon le rôle
  const stats = isTeacher ? {
    totalCourses: courses.length,
    totalStudents: courses.reduce((acc, course) => acc + (course.studentsEnrolled || 0), 0),
    averageRating: courses.length ? Math.round(courses.reduce((acc, course) => acc + (course.courseRate || 0), 0) / courses.filter(c=>c.courseRate>0).length) : 0,
    totalLessons: courses.reduce((acc, course) => acc + (course.lessons?.length || 0), 0)
  } : {
    coursesEnrolled: enrollments.length,
    completedCourses: enrollments.filter(e => e.completionRate === 100).length,
    averageProgress: enrollments.reduce((acc, curr) => acc + curr.completionRate, 0) / enrollments.length || 0,
    streak: 7 // À implémenter avec la vraie logique de streak
  };

  // Rendu des statistiques selon le rôle
  const renderStats = () => {
    if (isTeacher) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<VideoCameraIcon className="h-6 w-6 text-e-bosy-purple" />} 
                   label="Cours créés" value={stats.totalCourses} />
          <StatCard icon={<UsersIcon className="h-6 w-6 text-e-bosy-purple" />}
                   label="Étudiants inscrits" value={stats.totalStudents} />
          <StatCard icon={<StarIcon className="h-6 w-6 text-e-bosy-purple" />}
                   label="Note moyenne" value={`${stats.averageRating.toFixed(1)} / 5`} />
          <StatCard icon={<BookOpenIcon className="h-6 w-6 text-e-bosy-purple" />}
                   label="Leçons totales" value={stats.totalLessons} />
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard icon={<AcademicCapIcon className="h-12 w-12 text-blue-500" />}
                 label="Cours inscrits" value={stats.coursesEnrolled} />
        <StatCard icon={<ChartBarIcon className="h-12 w-12 text-green-500" />}
                 label="Cours complétés" value={stats.completedCourses} />
        <StatCard icon={<FireIcon className="h-12 w-12 text-orange-500" />}
                 label="Progrès moyen" value={`${Math.round(stats.averageProgress)}%`} />
        <StatCard icon={<ClockIcon className="h-12 w-12 text-purple-500" />}
                 label="Streak actuel" value={`${stats.streak} jours`} />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête du profil */}
      <div className={`bg-gradient-to-r ${isTeacher ? 'from-e-bosy-purple to-indigo-600' : 'from-blue-600 to-purple-600'} text-white`}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center space-x-8">
            <img
              src={profileData.profilePictureUrl ? `${API_BASE_URL}/${profileData.profilePictureUrl}` : DEFAULT_PROFILE_IMAGE}
              alt={`${profileData.firstName} ${profileData.lastName}`}
              className="h-32 w-32 rounded-full border-4 border-white shadow-lg"
              onError={(e) => { e.target.src = DEFAULT_PROFILE_IMAGE; }}
            />
            <div className="flex-1">
              <h1 className="text-4xl font-bold">{`${profileData.firstName} ${profileData.lastName}`}</h1>
              <p className="text-lg opacity-90">
                {isTeacher ? 'Enseignant' : 'Membre'} depuis {new Date(profileData.createdAt).toLocaleDateString('fr-FR')}
              </p>
              {profileData.Bio && <p className="mt-2 text-lg">{profileData.Bio}</p>}
            </div>
            {user?.userId === parseInt(id) && (
              <Link
                to="/dashboard/settings"
                className="inline-flex items-center px-6 py-3 bg-white text-purple-600 rounded-full font-semibold shadow-md hover:bg-gray-50 transition-colors"
              >
                <CogIcon className="h-5 w-5 mr-2" />
                Modifier mon profile
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 -mt-8">
        {/* Statistiques */}
        {renderStats()}

        {/* Liste des cours */}
        <div className="mt-8 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">
            {isTeacher ? 'Cours enseignés' : 'Mes cours en cours'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isTeacher ? (
              courses.map(course => (
                course.status === "publier" && (
                  <TeacherCourseCard key={course.courseId} course={course} />
                )
              ))
            ) : (
              enrollments.map(enrollment => (
                <StudentCourseCard key={enrollment.enrollmentId} enrollment={enrollment} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Composants utilitaires
const StatCard = ({ icon, label, value }) => (
  <div className="bg-white rounded-xl shadow-md p-6 transform hover:scale-105 transition-transform">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500">{label}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
      {icon}
    </div>
  </div>
);

const TeacherCourseCard = ({ course }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
    <img
      src={course.thumbnailUrl ? `${API_BASE_URL}/${course.thumbnailUrl}` : DEFAULT_COURSE_IMAGE}
      alt={course.title}
      className="w-full h-40 object-cover rounded-t-lg"
      onError={(e) => { e.target.src = DEFAULT_COURSE_IMAGE; }}
    />
    <div className="p-4">
      <h3 className="text-lg font-semibold text-gray-800 truncate">{course.title}</h3>
      <p className="text-sm text-gray-600">{course.category?.name || 'Sans catégorie'}</p>
      <div className="flex items-center justify-between mt-2">
        <span className="text-sm text-gray-600">
          {course.studentsEnrolled || 0} étudiants
        </span>
      </div>
      <Link
        to={`/dashboard/courses/${course.courseId}/lessons`}
        className="mt-4 inline-flex items-center px-3 py-2 bg-e-bosy-purple text-white rounded-md hover:bg-purple-700 transition-colors duration-200"
      >
        Voir le cours
      </Link>
    </div>
  </div>
);

const StudentCourseCard = ({ enrollment }) => (
  <div className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
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
);

export default ProfilePage;
