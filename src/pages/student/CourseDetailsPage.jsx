import React, { useState, useEffect } from "react";
import CourseComments from "../../components/CourseComments"; // Make sure the path is correct

import { useParams, Link } from "react-router-dom";
import {
  PlayCircleIcon,
  DocumentTextIcon,
  PlayIcon,
  ArrowDownTrayIcon,
  LockClosedIcon,
  AcademicCapIcon,
  ClipboardDocumentCheckIcon,
  ChevronRightIcon,
  PhotoIcon,
  ChatBubbleLeftRightIcon, // Icon for comments button
} from "@heroicons/react/24/solid";
import { ClockIcon, UserIcon } from "@heroicons/react/24/outline";
import { API_BASE_URL, getData } from "../../services/ApiFetch";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-hot-toast";
import Navbar from "../../Components/Navbar";
import { LoadingSpinner } from "../../components/LoadingSpinner";
const DEFAULT_COURSE_IMAGE = "/images/default-course.jpg";

const CourseDetailsPage = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showCourseContent, setShowCourseContent] = useState(true);
  const [showCommentsModal, setShowCommentsModal] = useState(false); // New state for modal visibility

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [courseData, courseError] = await getData(`courses/${courseId}`);
        if (courseError) throw courseError;
        setCourse(courseData);
        setLessons(courseData.lessons || []);

        if (user?.userId) {
          const [enrollmentsData, enrollmentsError] = await getData(
            `enrollments`
          );
          if (enrollmentsError) throw enrollmentsError;

          const userEnrollment = enrollmentsData.find(
            (e) => e.courseId === parseInt(courseId) && e.userId === user.userId
          );
          setIsEnrolled(!!userEnrollment);
        }
      } catch (err) {
        console.error("Error fetching course details:", err);
        setError(err.message);
        toast.error("Erreur lors du chargement du cours.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, user?.userId]);

  const getContentTypeIcon = (contentType) => {
    switch (contentType.toLowerCase()) {
      case "pdfs":
      case "document":
        return <DocumentTextIcon className="h-5 w-5 text-red-500 mr-2" />;
      case "video":
      case "external_video_url":
        return <PlayIcon className="h-5 w-5 text-e-bosy-purple mr-2" />;
      case "image":
      case "images":
        return <PhotoIcon className="h-5 w-5 text-blue-500 mr-2" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-500 mr-2" />;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-600">Erreur : {error}</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Le cours n'a pas été trouvé.</p>
      </div>
    );
  }

  const sectionsWithLessons =
    course.sections?.filter((section) =>
      lessons.some((lesson) => lesson.sectionTitle === section.title)
    ) || [];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-e-bosy-purple to-purple-800 text-white py-12 px-6 md:px-12 mt-6 animate-fade-in">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8">
          {/* Left Column with information */}
          <div className="md:w-2/3">
            <p className="text-sm opacity-80 mb-2">
              Formation &gt; {course.category?.name}
            </p>
            <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
            <p className="text-lg opacity-90 mb-6">{course.description}</p>
            <div className="flex items-center space-x-4 text-sm opacity-90 mb-4">
              <span className="flex items-center">
                <UserIcon className="h-4 w-4 mr-1" />
                Par {course.teacher?.firstName} {course.teacher?.lastName}
              </span>
              <span className="flex items-center">
                <ClockIcon className="h-4 w-4 mr-1" />
                {course.lessonsCount} leçons
              </span>
            </div>
            {!isEnrolled ? (
              <Link
                to={`/courses/${course.courseId}/enroll`}
                className="bg-white text-e-bosy-purple px-6 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition duration-300 inline-flex items-center animate-bounce-once"
              >
                <PlayCircleIcon className="h-6 w-6 mr-2" /> S'inscrire au cours
              </Link>
            ) : (
              <Link
                to={`/course/${course.courseId}/lesson/${lessons[0]?.lessonId}`}
                className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold text-lg hover:bg-green-600 transition duration-300 inline-flex items-center animate-bounce-once"
              >
                <PlayCircleIcon className="h-6 w-6 mr-2" /> Continuer le cours
              </Link>
            )}
          </div>

          {/* Right Column with image */}
          <div className="md:w-1/3">
            <div className="relative transform transition-transform duration-300 hover:scale-105">
              <img
                src={
                  course.thumbnailUrl
                    ? `${API_BASE_URL}${course.thumbnailUrl}`
                    : DEFAULT_COURSE_IMAGE
                }
                alt={course.title}
                className="w-full h-64 object-cover rounded-lg shadow-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = DEFAULT_COURSE_IMAGE;
                }}
              />
              {course.isSubscriberOnly && (
                <div className="absolute top-4 right-4 animate-pulse-once">
                  <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                    <LockClosedIcon className="h-4 w-4 mr-1" />
                    Premium
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto p-6 md:p-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Course Content */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6 animate-slide-in-left">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Contenu du Cours
            </h2>
            <button
              onClick={() => setShowCourseContent(!showCourseContent)}
              className="bg-e-bosy-purple text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700 transition"
            >
              {showCourseContent ? "Masquer" : "Afficher"}
            </button>
          </div>
          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              showCourseContent
                ? "max-h-[5000px] opacity-100 py-4"
                : "max-h-0 opacity-0 py-0"
            }`}
          >
            {sectionsWithLessons.map((section, index) => {
              let lessonsInSection = lessons.filter(
                (lesson) => lesson.sectionTitle === section.title
              );

              lessonsInSection.sort((a, b) => {
                const typeA = a.contentType.toLowerCase();
                const typeB = b.contentType.toLowerCase();

                if (typeA === "video" && typeB !== "video") {
                  return -1;
                }
                if (typeA !== "video" && typeB === "video") {
                  return 1;
                }

                if (typeA === "pdfs" && typeB !== "pdfs") {
                  return -1;
                }
                if (typeA !== "pdfs" && typeB === "pdfs") {
                  return 1;
                }

                return a.title.localeCompare(b.title);
              });

              return (
                <div
                  key={index}
                  className="mb-6 border border-gray-200 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg"
                >
                  <div className="bg-gray-100 p-4 font-semibold text-lg">
                    <span>{section.title}</span>
                  </div>
                  <ul className="divide-y divide-gray-200">
                    {lessonsInSection.map((lesson, i) => {
                      const isLessonAccessible =
                        isEnrolled &&
                        (!lesson.isSubscriberOnly || user?.IsSubscribed);
                      const canDownload =
                        isLessonAccessible &&
                        lesson.content &&
                        (lesson.contentType.toLowerCase() === "video" ||
                          lesson.contentType.toLowerCase() === "pdfs");

                      const isPdf = lesson.contentType.toLowerCase() === "pdfs";

                      const shouldShowPdfTitle =
                        isPdf &&
                        (i === 0 ||
                          lessonsInSection[i - 1].contentType.toLowerCase() !==
                            "pdfs");

                      return (
                        <React.Fragment key={lesson.lessonId}>
                          {shouldShowPdfTitle && (
                            <li className="p-2 bg-gray-200 text-sm font-semibold text-gray-700 rounded-t-md">
                              📄 Resources PDF
                            </li>
                          )}

                          <li className="p-4 flex items-center justify-between group transition-colors duration-200 hover:bg-gray-50">
                            {isPdf ? (
                              <span
                                className={`flex items-center flex-grow text-gray-700 ${
                                  !isLessonAccessible
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                                }`}
                              >
                                {getContentTypeIcon(lesson.contentType)}
                                <span>{lesson.title}</span>
                                {lesson.isSubscriberOnly &&
                                  !user?.IsSubscribed && (
                                    <LockClosedIcon className="h-4 w-4 text-yellow-500 ml-2" />
                                  )}
                              </span>
                            ) : (
                              <Link
                                to={
                                  isLessonAccessible
                                    ? `/course/${course.courseId}/lesson/${lesson.lessonId}`
                                    : "#"
                                }
                                className={`flex items-center flex-grow text-gray-700 hover:text-e-bosy-purple transition duration-200 ${
                                  !isLessonAccessible
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                                }`}
                                onClick={(e) => {
                                  if (!isLessonAccessible) {
                                    e.preventDefault();
                                    toast.error(
                                      lesson.isSubscriberOnly &&
                                        !user?.IsSubscribed
                                        ? "Ce contenu est réservé aux abonnés Premium"
                                        : "Veuillez vous inscrire au cours pour accéder à cette leçon"
                                    );
                                  }
                                }}
                              >
                                {getContentTypeIcon(lesson.contentType)}
                                <span>{lesson.title}</span>
                                {lesson.isSubscriberOnly &&
                                  !user?.IsSubscribed && (
                                    <LockClosedIcon className="h-4 w-4 text-yellow-500 ml-2" />
                                  )}
                              </Link>
                            )}

                            {canDownload && (
                              <a
                                href={`${API_BASE_URL}${lesson.content}`}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-4 flex-shrink-0 bg-e-bosy-purple text-white px-3 py-1 rounded-md text-xs hover:bg-purple-700 flex items-center transition duration-300 transform hover:scale-105"
                                title="Télécharger cette leçon"
                                onClick={(e) => {
                                  if (!isLessonAccessible) {
                                    e.preventDefault();
                                    toast.error(
                                      "Vous n'êtes pas autorisé à télécharger ce contenu."
                                    );
                                  }
                                }}
                              >
                                <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                                Télécharger
                              </a>
                            )}
                          </li>
                        </React.Fragment>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 space-y-8 animate-slide-in-right">
          {/* Overview Section */}
          <div className="bg-white rounded-lg shadow-md p-6 transform transition-transform duration-300 hover:scale-[1.02]">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Aperçu du cours
            </h2>
            <div className="text-gray-700 space-y-3">
              <p className="flex items-center">
                <ClockIcon className="h-5 w-5 mr-2 text-gray-500" />
                Dernière mise à jour:{" "}
                {new Date(course.updatedAt).toLocaleDateString("fr-FR")}
              </p>
              <p className="flex items-center">
                <span className="font-semibold mr-2">Niveau:</span>{" "}
                {course.level}
              </p>
              <p className="flex items-center">
                <span className="font-semibold mr-2">Langue:</span>{" "}
                {course.language}
              </p>
              {course.averageRating !== undefined &&
                course.totalReviews !== undefined && (
                  <p className="flex items-center">
                    <span className="font-semibold mr-2">Évaluation:</span>{" "}
                    {course.averageRating} ({course.totalReviews} avis)
                  </p>
                )}
              {course.isSubscriberOnly && (
                <p className="flex items-center text-blue-600 font-medium">
                  <LockClosedIcon className="h-5 w-5 mr-2" /> Réservé aux
                  abonnés
                </p>
              )}
            </div>
          </div>

          {/* Assessments Section */}
          <div className="bg-white rounded-lg shadow-md p-6 transform transition-transform duration-300 hover:scale-[1.02]">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Exercices et Évaluations
            </h2>

            <Link
              to={`/course/${courseId}/assessments`}
              className="group relative flex items-center justify-between p-4 bg-gradient-to-r from-e-bosy-purple to-purple-100 rounded-lg border border-purple-200 hover:border-purple-300 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-md"
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <AcademicCapIcon className="h-8 w-8 text-e-bosy-purple" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Accéder aux évaluations
                  </h3>
                  <p className="text-sm text-gray-600">
                    Exercices pratiques et examens pour valider vos
                    connaissances
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <span className="px-3 py-1 bg-e-bosy-purple text-white text-sm font-medium rounded-full">
                  Commencer
                </span>
                <ChevronRightIcon className="h-5 w-5 text-e-bosy-purple ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <div className="mt-4 grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-purple-50 rounded-lg transition-transform duration-200 hover:scale-105">
                <ClipboardDocumentCheckIcon className="h-6 w-6 text-e-bosy-purple mx-auto mb-1" />
                <span className="text-sm text-gray-600">
                  Exercices disponibles
                </span>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg transition-transform duration-200 hover:scale-105">
                <AcademicCapIcon className="h-6 w-6 text-yellow-500 mx-auto mb-1" />
                <span className="text-sm text-gray-600">Examens finaux</span>
              </div>
            </div>
          </div>
          {/* New Comments Section Button */}
          <div className="bg-white rounded-lg shadow-md p-6 transform transition-transform duration-300 hover:scale-[1.02]">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Discuter du cours
            </h2>
            <button
              onClick={() => setShowCommentsModal(true)}
              className="w-full bg-e-bosy-purple text-white px-6 py-3 rounded-lg font-semibold text-lg hover:bg-purple-700 transition duration-300 inline-flex items-center justify-center animate-pulse-once"
            >
              <ChatBubbleLeftRightIcon className="h-6 w-6 mr-2" /> Ouvrir le
              Forum
            </button>
          </div>
        </div>
      </div>

      {/* Course Comments Modal */}
      <CourseComments
        courseId={courseId}
        user={user}
        isOpen={showCommentsModal}
        onClose={() => setShowCommentsModal(false)}
      />
    </div>
  );
};

export default CourseDetailsPage;