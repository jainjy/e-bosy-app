import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeftIcon, UsersIcon, VideoCameraIcon, StarIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { getData, API_BASE_URL } from '../services/ApiFetch';
import { useAuth } from '../contexts/AuthContext';

const DEFAULT_PROFILE_IMAGE = '/images/default-profile.jpg';
const DEFAULT_COURSE_IMAGE = '/images/default-course.jpg';

const TeacherProfilePage = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const [teacher, setTeacher] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        // Récupérer les informations de l'utilisateur
        const [userData, userError] = await getData(`users/${id}`);
        if (userError) throw new Error(userError.message);
        if (userData.role.toLowerCase() !== 'enseignant') {
          throw new Error('Cet utilisateur n\'est pas un enseignant.');
        }
        console.log(userData)
        setTeacher(userData);

        // Récupérer les cours de l'enseignant
        const [coursesData, coursesError] = await getData(`courses/teacher/${id}`);
        if (coursesError) throw new Error(coursesError.message);
        setCourses(coursesData);
        console.log(coursesData);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'administrateur') {
      fetchTeacherData();
    } else {
      toast.error('Accès refusé. Vous devez être administrateur.');
      setLoading(false);
    }
  }, [id, user]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!teacher) {
    return <div className="p-6 text-red-600">Utilisateur non trouvé ou accès non autorisé.</div>;
  }

  // Calcul des statistiques
  const stats = {
    totalCourses: courses.length,
    totalStudents: courses.reduce((acc, course) => acc + (course.studentsEnrolled || 0), 0),
    averageRating: courses.length
      ? Math.round(
          courses.reduce((acc, course) => acc + (course.LastReviewScore || 0), 0) / courses.length
        ) / 10
      : 0,
    totalLessons: courses.reduce((acc, course) => acc + (course.lessons.length || 0), 0),
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* En-tête */}
      <div className="max-w-7xl mx-auto">
        <Link
          to="/dashboard/users"
          className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-200"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Retour à la gestion des utilisateurs
        </Link>
        <div className="mt-6 bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Section Profil */}
          <div className="relative bg-gradient-to-r from-e-bosy-purple to-indigo-600 p-8 text-white">
            <div className="flex items-center space-x-6">
              <img
                src={teacher.profilePictureUrl ? `${API_BASE_URL}/${teacher.profilePictureUrl}` : DEFAULT_PROFILE_IMAGE}
                alt={`${teacher.firstName} ${teacher.lastName}`}
                className="h-24 w-24 rounded-full object-cover border-4 border-white"
                onError={(e) => { e.target.src = DEFAULT_PROFILE_IMAGE; }}
              />
              <div>
                <h1 className="text-3xl font-bold">{`${teacher.firstName} ${teacher.lastName}`}</h1>
                <p className="text-sm opacity-80">Enseignant depuis {new Date(teacher.CreatedAt).toLocaleDateString('fr-FR')}</p>
                {teacher.Bio && (
                  <p className="mt-2 text-sm max-w-2xl">{teacher.Bio}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section Statistiques */}
          <div className="p-6 border-t border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Statistiques</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-2">
                  <VideoCameraIcon className="h-6 w-6 text-e-bosy-purple" />
                  <span className="text-sm font-medium text-gray-600">Cours créés</span>
                </div>
                <p className="text-2xl font-bold text-gray-800">{stats.totalCourses}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-2">
                  <UsersIcon className="h-6 w-6 text-e-bosy-purple" />
                  <span className="text-sm font-medium text-gray-600">Étudiants inscrits</span>
                </div>
                <p className="text-2xl font-bold text-gray-800">{stats.totalStudents}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-2">
                  <StarIcon className="h-6 w-6 text-e-bosy-purple" />
                  <span className="text-sm font-medium text-gray-600">Note moyenne</span>
                </div>
                <p className="text-2xl font-bold text-gray-800">{stats.averageRating.toFixed(1)} / 5</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-2">
                  <BookOpenIcon className="h-6 w-6 text-e-bosy-purple" />
                  <span className="text-sm font-medium text-gray-600">Leçons totales</span>
                </div>
                <p className="text-2xl font-bold text-gray-800">{stats.totalLessons}</p>
              </div>
            </div>
          </div>

          {/* Section Informations Additionnelles */}
          {(teacher.LearningStyle || teacher.ExperienceLevel || teacher.Badges?.length > 0) && (
            <div className="p-6 border-t border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Informations Additionnelles</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {teacher.LearningStyle && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Style d'apprentissage</p>
                    <p className="text-gray-800">{teacher.LearningStyle}</p>
                  </div>
                )}
                {teacher.ExperienceLevel && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Niveau d'expérience</p>
                    <p className="text-gray-800">{teacher.ExperienceLevel}</p>
                  </div>
                )}
                {teacher.Badges?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Badges</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {teacher.Badges.map((badge, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-e-bosy-purple text-white"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section Cours */}
          <div className="p-6 border-t border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Cours Enseignés</h2>
            {courses.length == 0 ? (
              <p className="text-gray-600">Aucun cours créé par cet enseignant.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => (
                 course.status=="publier"  &&
                 <div
                 key={course.courseId}
                 className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
               > 
                 <img
                   src={course.thumbnailUrl ? `${API_BASE_URL}/${course.thumbnailUrl}` : DEFAULT_COURSE_IMAGE}
                   alt={course.title}
                   className="w-full h-40 object-cover rounded-t-lg"
                   onError={(e) => { e.target.src = DEFAULT_COURSE_IMAGE; }}
                 />
                 <div className="p-4">
                   <h3 className="text-lg font-semibold text-gray-800 truncate">{course.Title}</h3>
                   <p className="text-sm text-gray-600">{course.category?.name || 'Sans catégorie'}</p>
                   <div className="flex items-center justify-between mt-2">
                     <span className="text-sm text-gray-600">
                       {course.studentsEnrolled || 0} étudiants
                     </span>
                   </div>
                   <div className="flex items-center mt-2 text-sm text-gray-600">
                     <BookOpenIcon className="h-4 w-4 mr-1" />
                     <span>{course.lessons.length || 0} leçons</span>
                   </div>
                   <Link
                     to={`/dashboard/courses/${course.courseId}/lessons`}
                     className="mt-4 inline-flex items-center px-3 py-2 bg-e-bosy-purple text-white rounded-md hover:bg-purple-700 transition-colors duration-200"
                   >
                     Voir le cours
                   </Link>
                 </div>
               </div> 
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfilePage;