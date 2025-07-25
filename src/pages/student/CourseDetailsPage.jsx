import React, { useState, useEffect } from "react";
import CourseComments from "../../components/CourseComments";
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
  ChatBubbleLeftRightIcon,
  TicketIcon,
  StarIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/solid";
import { ClockIcon, UserIcon } from "@heroicons/react/24/outline";
import { API_BASE_URL, getData, putData } from "../../services/ApiFetch";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-hot-toast";

import { LoadingSpinner } from "../../components/LoadingSpinner";
import RatingModal from "../../components/RatingModal";
import ReviewsModal from "../../components/ReviewsModal";
import { CogIcon } from "lucide-react";
import Navbar from "../../components/Navbar";

const DEFAULT_COURSE_IMAGE = "/images/default-course.jpg";

const CourseDetailsPage = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [hasCertificate, setHasCertificate] = useState(false);
  const [certificate, setCertificate] = useState(null);
  const [showCourseContent, setShowCourseContent] = useState(true);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [userEnrollment, setUserEnrollment] = useState({});
  const [userRating, setUserRating] = useState(null);
  const [userComment, setUserComment] = useState(null);
  const [isRatingSubmitting, setIsRatingSubmitting] = useState(false);
  const [totalRatings, setTotalRatings] = useState(0);
  const [averageRating, setAverageRating] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [courseData, courseError] = await getData(`courses/${courseId}`);
        if (courseError) throw courseError;
        setCourse(courseData);
        setLessons(courseData.lessons || []);
        setAverageRating(courseData.courseRate ?? null);
        setTotalRatings(courseData.totalReviews ?? 0);

        if (user?.userId) {
          const [enrollmentsData, enrollmentsError] = await getData(
            `enrollments/student/${user.userId}/${courseId}`
          );
          setUserEnrollment(enrollmentsData);
          setIsEnrolled(!!enrollmentsData);

          if (enrollmentsData && enrollmentsData.rate) {
            setUserRating(enrollmentsData.rate);
            setUserComment(enrollmentsData.comment || null);
          } else {
            setUserRating(null);
          }

          const [certificateData, certificateError] = await getData(
            `enrollments/certificates/course/${courseId}/user/${user.userId}`
          );
          if (!certificateError) {
            setHasCertificate(!!certificateData);
            setCertificate(certificateData);
          }
        } else {
          // If no user, ensure enrollment states are reset for display purposes
          setIsEnrolled(false);
          setHasCertificate(false);
          setUserEnrollment({});
          setUserRating(null);
          setCertificate(null);
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

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const [reviewsData, reviewsError] = await getData(
          `enrollments/reviews/${courseId}`
        );
        if (reviewsError) throw reviewsError;
        setReviews(reviewsData);
      } catch (err) {
        console.error("Erreur lors du chargement des avis:", err);
        toast.error("Impossible de charger les avis");
      }
    };

    if (courseId) {
      fetchReviews();
    }
  }, [courseId]);

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

  const handleRateCourse = async (rating) => {
    if (!userEnrollment?.enrollmentId) return;
    setIsRatingSubmitting(true);
    try {
      const response = await putData(
        `enrollments/${userEnrollment.enrollmentId}`,
        { rate: rating }
      );
      if (!response.ok) throw new Error("Erreur lors de l'envoi de la note");
      setUserRating(rating);
      toast.success("Merci pour votre note !");
      const [courseData] = await getData(`courses/${courseId}`);
      setAverageRating(courseData.courseRate ?? null);
      setTotalRatings(courseData.totalReviews ?? 0);
    } catch (err) {
      toast.error("Impossible d'enregistrer la note.");
    } finally {
      setIsRatingSubmitting(false);
    }
  };

  const handleRatingSubmit = async ({ rating, comment }) => {
    setIsRatingSubmitting(true);
    try {
      const response = await putData(
        `enrollments/${userEnrollment.enrollmentId}`,
        {
          rate: rating,
          comment: comment,
        }
      );
      if (!response.ok) throw new Error("Erreur lors de l'envoi de l'avis");

      setUserRating(rating);
      toast.success("Merci pour votre avis !");

      const [courseData] = await getData(`courses/${courseId}`);
      setAverageRating(courseData.averageRating ?? null);
      setTotalRatings(courseData.totalReviews ?? 0);
    } catch (err) {
      toast.error("Impossible d'enregistrer l'avis.");
    } finally {
      setIsRatingSubmitting(false);
    }
  };

  const StarRating = ({ value, onChange, disabled }) => (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onChange(star)}
          className={`focus:outline-none ${
            disabled ? "cursor-not-allowed" : "hover:scale-110"
          }`}
          aria-label={`Donner ${star} étoile${star > 1 ? "s" : ""}`}
        >
          <StarIcon
            className={`h-7 w-7 ${
              value >= star ? "text-yellow-400" : "text-gray-300"
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );

  if (loading) return <LoadingSpinner />;
  if (error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-600">Erreur : {error}</p>
      </div>
    );
  if (!course)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Le cours n'a pas été trouvé.</p>
      </div>
    );

  const sectionsWithLessons =
    course.sections?.filter((section) =>
      lessons.some((lesson) => lesson.sectionTitle === section.title)
    ) || [];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {!user && <Navbar/>}
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-e-bosy-purple to-purple-800 text-white p-6 md:px-8 animate-fade-in">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-2/3">
            <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
            <p className="text-lg opacity-90 mb-6">{course.description}</p>
            <div className="flex items-center space-x-4 text-sm opacity-90 mb-4">
              <Link
                to={`/users/${course.teacherId}/profile`}
                className="flex items-center"
              >
                {course.teacher?.profilePictureUrl ? (
                  <img
                    src={API_BASE_URL + course.teacher?.profilePictureUrl}
                    className="h-12 w-12 mr-1 rounded-full"
                  />
                ) : (
                  <UserIcon className="h-6 w-6 mr-1" />
                )}
                Par {course.teacher?.firstName} {course.teacher?.lastName}
              </Link>
              <span className="flex items-center">
                <ClockIcon className="h-4 w-4 mr-1" />
                {course.lessonsCount} leçons
              </span>
            </div>

            {/* Boutons pour admin/enseignant */}
            {user?.role === "administrateur" ||
            user?.userId === course.teacherId ? (
              <div className="mt-4 flex space-x-4">
                <Link
                  to={`/courses/${course.courseId}/lessons`}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold text-lg hover:bg-green-700 transition duration-300 inline-flex items-center"
                >
                  <CogIcon className="h-6 w-6 mr-2" />
                  {user?.userId === course.teacherId
                    ? "Gérer les leçons"
                    : "voir les lessons"}
                </Link>
              </div>
            ) : (
              <>
                {" "}
                {/* Boutons principaux */}
                {!user?.userId || !isEnrolled ? ( // Changed condition here
                  <Link
                    to={user?.userId ? `/courses/${course.courseId}/enroll` : "/login"} // Redirect to /login if no user
                    className="bg-white text-e-bosy-purple px-6 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition duration-300 inline-flex items-center animate-bounce-once"
                  >
                    <PlayCircleIcon className="h-6 w-6 mr-2" />{" "}
                    {user?.userId ? "S'inscrire au cours" : "Commencer le cours (Connexion requise)"}{" "}
                    {/* Updated button text */}
                  </Link>
                ) : (
                  <div className="flex space-x-4">
                    <Link
                      to={
                        "/course/" +
                        course.courseId +
                        "/lesson/" +
                        (userEnrollment?.completedLessons[
                          userEnrollment.completedLessons.length - 1
                        ] || lessons[0]?.lessonId)
                      }
                      className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold text-lg hover:bg-green-600 transition duration-300 inline-flex items-center animate-bounce-once"
                    >
                      <PlayCircleIcon className="h-6 w-6 mr-2" /> Continuer le
                      cours
                    </Link>
                    {hasCertificate ? (
                      <Link
                        to={`/certificates/${certificate?.verificationCode}`}
                        className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold text-lg hover:bg-blue-600 transition duration-300 inline-flex items-center animate-bounce-once"
                      >
                        <TicketIcon className="h-6 w-6 mr-2" /> Voir la
                        certification
                      </Link>
                    ) : userEnrollment?.completionRate >= 80 ? (
                      <Link
                        to={`/course/${course.courseId}/assessments`}
                        className="bg-yellow-500 text-white px-6 py-3 rounded-lg font-semibold text-lg hover:bg-yellow-600 transition duration-300 inline-flex items-center animate-bounce-once"
                      >
                        <AcademicCapIcon className="h-6 w-6 mr-2" /> Obtenir la
                        certification
                      </Link>
                    ) : null}
                  </div>
                )}
              </>
            )}

            <div className="my-4">
              <div className="bg-purple-900/10 backdrop-blur-sm rounded-xl p-6 space-y-4">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <StarIcon className="h-6 w-6 text-yellow-400" />
                  Évaluations et Avis
                </h3>

                <div className="flex items-center justify-between p-4 bg-white/10 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white">
                        {averageRating !== null
                          ? averageRating.toFixed(1)
                          : "0.0"}
                      </div>
                      <div className="text-sm text-gray-300">sur 5</div>
                    </div>
                    <div>
                      <StarRating
                        value={averageRating || 0}
                        disabled={true}
                      />
                      <div className="text-sm text-gray-300 mt-1">
                        Basé sur {totalRatings} avis
                      </div>
                    </div>
                  </div>

                  <div className="hidden md:block w-1/2">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div
                        key={rating}
                        className="flex items-center gap-2 text-sm text-gray-300"
                      >
                        <div className="w-8">{rating} ★</div>
                        <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-400"
                            style={{
                              width: `${
                                (reviews.filter(
                                  (r) => Math.round(r.rating) === rating
                                ).length /
                                  totalRatings) *
                                  100 || 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {isEnrolled && (
                    <button
                      onClick={() => setShowRatingModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-white text-purple-700 rounded-lg font-medium hover:bg-purple-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <StarIcon className="h-5 w-5 text-yellow-400" />
                      {userEnrollment?.rate
                        ? "Modifier mon avis"
                        : "Donner mon avis"}
                    </button>
                  )}
                  {(isEnrolled ||
                    user?.role === "administrateur" ||
                    user?.userId === course.teacherId) && (
                    <button
                      onClick={() => setShowReviewsModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-700 text-white rounded-lg font-medium hover:bg-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <ChatBubbleLeftRightIcon className="h-5 w-5" />
                      Voir tous les avis ({totalRatings})
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
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

                if (typeA === "video" && typeB !== "video") return -1;
                if (typeA !== "video" && typeB === "video") return 1;
                if (typeA === "pdfs" && typeB !== "pdfs") return -1;
                if (typeA !== "pdfs" && typeB === "pdfs") return 1;
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
                        user?.userId && // Lesson is accessible only if user is logged in
                        isEnrolled &&
                        (!lesson.isSubscriberOnly || user?.isSubscribed);
                      const canDownload =
                        (isLessonAccessible &&
                          lesson.content &&
                          (lesson.contentType.toLowerCase() === "pdfs" ||
                            (lesson.contentType
                              .toLowerCase()
                              .includes("video") &&
                              user?.isSubscribed))) ||
                        user?.role == "administrateur";

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
                                  !user?.isSubscribed && (
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
                                        !user?.isSubscribed
                                        ? "Ce contenu est réservé aux abonnés Premium"
                                        : "Veuillez vous connecter et vous inscrire au cours pour accéder à cette leçon"
                                    );
                                  }
                                }}
                              >
                                {getContentTypeIcon(lesson.contentType)}
                                <span>{lesson.title}</span>
                                {lesson.isSubscriberOnly &&
                                  !user?.isSubscribed && (
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

        <div className="lg:col-span-1 space-y-8 animate-slide-in-right">
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
              {averageRating !== undefined && totalRatings !== undefined && (
                <p className="flex items-center">
                  <span className="font-semibold mr-2">Évaluation:</span>{" "}
                  {averageRating !== null ? averageRating.toFixed(1) : "0.0"} (
                  {totalRatings} avis)
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

          {user?.role == "etudiant" && (
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
          )}

{user &&          <div className="bg-white rounded-lg shadow-md p-6 transform transition-transform duration-300 hover:scale-[1.02]">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Discussion du cours
            </h2>
            <button
              onClick={() => setShowCommentsModal(true)}
              className="w-full bg-e-bosy-purple text-white px-6 py-3 rounded-lg font-semibold text-lg hover:bg-purple-700 transition duration-300 inline-flex items-center justify-center animate-pulse-once"
            >
              <ChatBubbleLeftRightIcon className="h-6 w-6 mr-2" /> Ouvrir le
              Forum
            </button>
          </div>}
        </div>
      </div>

      <CourseComments
        courseId={courseId}
        user={user}
        isOpen={showCommentsModal}
        onClose={() => setShowCommentsModal(false)}
      />

      <RatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onSubmit={handleRatingSubmit}
        initialRating={userRating}
        initialComment={userComment}
      />

      <ReviewsModal
        isOpen={showReviewsModal}
        onClose={() => setShowReviewsModal(false)}
        reviews={reviews}
        currentUserId={user?.userId}
        onReviewUpdate={(updatedReview, deletedId) => {
          if (deletedId) {
            setReviews(reviews.filter((r) => r.enrollmentId !== deletedId));
          } else {
            setReviews(
              reviews.map((r) =>
                r.enrollmentId === updatedReview.enrollmentId
                  ? updatedReview
                  : r
              )
            );
          }
        }}
      />
    </div>
  );
};

export default CourseDetailsPage;