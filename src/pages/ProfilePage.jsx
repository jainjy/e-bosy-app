import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Link, useParams, useNavigate } from "react-router-dom";
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
  BookOpenIcon,
  UserIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { getData, API_BASE_URL } from "../services/ApiFetch";
import { useAuth } from "../contexts/AuthContext";
import dayjs from "dayjs";

const DEFAULT_PROFILE_IMAGE = "/images/default-profile.jpg";
const DEFAULT_COURSE_IMAGE = "/images/default-course.jpg";

const ProfilePage = () => {
  const { user } = useAuth();
  const { id: ids } = useParams();
  const navigate = useNavigate();
  const [id, setId] = useState(ids || null);
  const [profileData, setProfileData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const [userData, userError] = await getData(`users/${id}`);
        if (userError) throw new Error(userError.message);

        // Vérification des autorisations d'accès
        if (userData.role === "etudiant") {
          if (
            !user ||
            (user.userId !== parseInt(id) && user.role !== "admin")
          ) {
            toast.error("Vous n'avez pas accès à ce profil");
            navigate("/");
            return;
          }
        }

        setProfileData(userData);

        // Charger les données spécifiques au rôle
        if (userData.role === "enseignant") {
          const [coursesData] = await getData(`courses/teacher/${id}`);
          setCourses(coursesData || []);
        } else if (userData.role === "etudiant") {
          const [enrollmentsData] = await getData(`enrollments/student/${id}`);
          setEnrollments(enrollmentsData || []);
        }
      } catch (error) {
        toast.error("Utilisateur non trouvé");
        setProfileData(null);
      } finally {
        setLoading(false);
      }
    };

    if (ids) {
      setId(ids);
    } else if (user?.userId) {
      setId(user.userId.toString());
    }

    if (id) {
      fetchProfileData();
    }
  }, [ids, user?.userId, id, navigate, user]);

  if (loading) return <LoadingSpinner />;
  if (!profileData)
    return <div className="p-6 text-red-600">Utilisateur non trouvé.</div>;

  const isTeacher = profileData.role === "enseignant";
  const isStudent = profileData.role === "etudiant";

  // Statistiques selon le rôle
  const stats = isTeacher
    ? {
        totalCourses: courses.length,
        totalStudents: courses.reduce(
          (acc, course) => acc + (course.studentsEnrolled || 0),
          0
        ),
        averageRating:
          courses.courseRate ?? courses.length
            ? Math.round(
                courses.reduce(
                  (acc, course) => acc + (course.courseRate || 0),
                  0
                ) / courses.filter((c) => c.courseRate > 0).length
              )
            : 0,
        totalLessons: courses.reduce(
          (acc, course) => acc + (course.lessons?.length || 0),
          0
        ),
      }
    : {
        coursesEnrolled: enrollments.length,
        completedCourses: enrollments.filter((e) => e.completionRate === 100)
          .length,
        averageProgress:
          enrollments.reduce((acc, curr) => acc + curr.completionRate, 0) /
            enrollments.length || 0,
        streak: 7, // À implémenter avec la vraie logique de streak
      };

  // Rendu des statistiques selon le rôle
  const renderStats = () => {
    if (isTeacher) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<VideoCameraIcon className="h-6 w-6 text-e-bosy-purple" />}
            label="Cours créés"
            value={stats.totalCourses}
          />
          <StatCard
            icon={<UsersIcon className="h-6 w-6 text-e-bosy-purple" />}
            label="Étudiants inscrits"
            value={stats.totalStudents}
          />
          <StatCard
            icon={<StarIcon className="h-6 w-6 text-e-bosy-purple" />}
            label="Note moyenne"
            value={`${stats.averageRating.toFixed(1)} / 5`}
          />
          <StatCard
            icon={<BookOpenIcon className="h-6 w-6 text-e-bosy-purple" />}
            label="Leçons totales"
            value={stats.totalLessons}
          />
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          icon={<AcademicCapIcon className="h-12 w-12 text-blue-500" />}
          label="Cours inscrits"
          value={stats.coursesEnrolled}
        />
        <StatCard
          icon={<ChartBarIcon className="h-12 w-12 text-green-500" />}
          label="Cours complétés"
          value={stats.completedCourses}
        />
        <StatCard
          icon={<FireIcon className="h-12 w-12 text-orange-500" />}
          label="Progrès moyen"
          value={`${Math.round(stats.averageProgress)}%`}
        />
        <StatCard
          icon={<ClockIcon className="h-12 w-12 text-purple-500" />}
          label="Streak actuel"
          value={`${stats.streak} jours`}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête du profil */}
      <div
        className={`bg-gradient-to-r ${
          isTeacher
            ? "from-e-bosy-purple to-indigo-600"
            : "from-blue-600 to-purple-600"
        } text-white`}
      >
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center space-x-8">
            <img
              src={
                profileData.profilePictureUrl
                  ? `${API_BASE_URL}/${profileData.profilePictureUrl}`
                  : DEFAULT_PROFILE_IMAGE
              }
              alt={`${profileData.firstName} ${profileData.lastName}`}
              className="h-32 w-32 rounded-full border-4 border-white shadow-lg"
              onError={(e) => {
                e.target.src = DEFAULT_PROFILE_IMAGE;
              }}
            />
            <div className="flex-1">
              <h1 className="text-4xl font-bold">{`${profileData.firstName} ${profileData.lastName}`}</h1>
              <p className="text-lg opacity-90">
                {isTeacher ? "Enseignant" : "Membre"} depuis{" "}
                {new Date(profileData.createdAt).toLocaleDateString("fr-FR")}
              </p>
              {profileData.Bio && (
                <p className="mt-2 text-lg">{profileData.Bio}</p>
              )}
            </div>
            {user?.userId === parseInt(id) && (
              <Link
                to="/settings"
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
            {isTeacher ? "Cours enseignés" : "Mes cours en cours"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto">
            {isTeacher
              ? courses.map(
                  (course) =>
                    course.status === "publier" && (
                      <TeacherCourseCard
                        key={course.courseId}
                        course={course}
                      />
                    )
                )
              : enrollments.map((enrollment) => (
                  <StudentCourseCard
                    key={enrollment.enrollmentId}
                    enrollment={enrollment}
                  />
                ))}
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
      src={
        course.thumbnailUrl
          ? `${API_BASE_URL}/${course.thumbnailUrl}`
          : DEFAULT_COURSE_IMAGE
      }
      alt={course.title}
      className="w-full h-40 object-cover rounded-t-lg"
      onError={(e) => {
        e.target.src = DEFAULT_COURSE_IMAGE;
      }}
    />
    <div className="p-4">
      <div className="flex justify-between items-start mb-2">
        <span className="px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-sm">
          {course.category?.name || "Sans catégorie"}
        </span>
        <span
          className={`px-2 py-1 rounded-full text-sm ${
            course.isSubscriberOnly
              ? "bg-yellow-100 text-yellow-600"
              : "bg-green-100 text-green-600"
          }`}
        >
          {course.isSubscriberOnly ? "Premium" : "Gratuit"}
        </span>
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate">
        {course.title}
      </h3>
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {course.description}
      </p>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Niveau: {course.level}</span>
          <span>Langue: {course.language}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-1">
            <UsersIcon className="h-4 w-4 text-gray-500" />
            <span>{course.studentsEnrolled || 0} étudiants</span>
          </div>
          <div className="flex items-center space-x-1">
            <StarIcon className="h-4 w-4 text-yellow-400" />
            <span>{course.courseRate?.toFixed(1) || "0.0"}</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-1">
            <BookOpenIcon className="h-4 w-4 text-gray-500" />
            <span>{course.lessonsCount || 0} leçons</span>
          </div>
          <span
            className={`${
              course.status === "publier" ? "text-green-600" : "text-gray-600"
            }`}
          >
            {course.status === "publier" ? "Publié" : "Brouillon"}
          </span>
        </div>
      </div>
      <Link
        to={`/course/${course.courseId}`}
        className="mt-4 inline-flex items-center px-3 py-2 w-full justify-center bg-e-bosy-purple text-white rounded-md hover:bg-purple-700 transition-colors duration-200"
      >
        Voir le cours
      </Link>
    </div>
  </div>
);

const StudentCourseCard = ({ enrollment }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
    <div className="relative">
      <img
        src={
          enrollment.course?.thumbnailUrl
            ? `${API_BASE_URL}/${enrollment.course.thumbnailUrl}`
            : DEFAULT_COURSE_IMAGE
        }
        alt={enrollment.course?.title}
        className="w-full h-40 object-cover rounded-t-lg"
        onError={(e) => {
          e.target.src = DEFAULT_COURSE_IMAGE;
        }}
      />
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
        <div
          className="h-full bg-e-bosy-purple transition-all duration-300"
          style={{ width: `${enrollment.completionRate}%` }}
        />
      </div>
    </div>
    <div className="p-4">
      <div className="flex justify-between items-start mb-2">
        <span className="px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-sm">
          {enrollment.course?.category?.name || "Sans catégorie"}
        </span>
        <span
          className={`px-2 py-1 rounded-full text-sm ${
            enrollment.course?.isSubscriberOnly
              ? "bg-yellow-100 text-yellow-600"
              : "bg-green-100 text-green-600"
          }`}
        >
          {enrollment.course?.isSubscriberOnly ? "Premium" : "Gratuit"}
        </span>
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        {enrollment.course?.title}
      </h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <Link
            to={`/users/${enrollment.course?.teacherId}/profile`}
            className="flex items-center text-gray-600 hover:text-purple-600"
          >
            <UserIcon className="h-4 w-4 mr-1" />
            <span>
              {enrollment.course?.teacher?.firstName}{" "}
              {enrollment.course?.teacher?.lastName}
            </span>
          </Link>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-1">
            <CalendarIcon className="h-4 w-4 text-gray-500" />
            <span>Inscrit le: {dayjs(enrollment.enrolledAt).format("DD/MM/YYYY")}</span>
          </div>
          <div className="flex items-center space-x-1">
            <BookOpenIcon className="h-4 w-4 text-gray-500" />
            <span>{enrollment.course?.lessonsCount || 0} leçons</span>
          </div>
        </div>
        <div className="pt-2 border-t border-gray-100">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-700">
              Progression
            </span>
            <span className="text-sm font-medium text-purple-600">
              {enrollment.completionRate}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-e-bosy-purple h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${enrollment.completionRate}%` }}
            />
          </div>
        </div>
        <Link
          to={`/course/${enrollment.course?.courseId}`}
          className="mt-2 inline-flex items-center justify-center w-full px-4 py-2 bg-e-bosy-purple text-white rounded-md hover:bg-purple-700 transition-colors duration-200"
        >
          {enrollment.completionRate > 0
            ? "Continuer le cours"
            : "Commencer le cours"}
        </Link>
      </div>
    </div>
  </div>
);

export default ProfilePage;
