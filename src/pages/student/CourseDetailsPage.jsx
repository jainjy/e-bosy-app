import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  PlayCircleIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  PhotoIcon,
  PlayIcon,
  ArrowDownTrayIcon,
  LockClosedIcon,
  AcademicCapIcon,
  ClipboardDocumentCheckIcon,
  ChevronRightIcon
} from '@heroicons/react/24/solid';
import { ClockIcon, FolderIcon, UserIcon } from '@heroicons/react/24/outline';
import { getData } from '../../services/ApiFetch';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import Navbar from '../../Components/Navbar';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const API_BASE_URL = "http://localhost:5196";
const DEFAULT_COURSE_IMAGE = "/images/default-course.jpg";

const CourseDetailsPage = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollment, setEnrollment] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Récupérer les détails du cours
        const [courseData, courseError] = await getData(`courses/${courseId}`);
        if (courseError) throw courseError;
        setCourse(courseData);

        // Vérifier si l'utilisateur est inscrit
        if (user?.userId) {
          const [enrollmentsData, enrollmentsError] = await getData(`enrollments`);
          if (enrollmentsError) throw enrollmentsError;

          const userEnrollment = enrollmentsData.find(
            e => e.courseId === parseInt(courseId) && e.userId === user.userId
          );
          
          setIsEnrolled(!!userEnrollment);
          setEnrollment(userEnrollment);
        }

        // Récupérer les leçons du cours
        const [lessonsData, lessonsError] = await getData(`courses/${courseId}/lessons`);
        if (lessonsError) throw lessonsError;
        
        setLessons(lessonsData.lessons);

      } catch (err) {
        setError(err.message);
        toast.error("Erreur lors du chargement du cours");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, user?.userId]);

  // Grouper les leçons par type de contenu pour les ressources téléchargeables
  const downloadableLessons = lessons
    .filter(lesson => 
      lesson.content_type !== 'video' && 
      (!lesson.is_subscriber_only || user?.isPremium)
    )
    .reduce((acc, lesson) => {
      const type = lesson.content_type;
      if (!acc[type]) acc[type] = [];
      acc[type].push(lesson);
      return acc;
    }, {});

  const getContentTypeIcon = (contentType) => {
    switch (contentType) {
      case 'text':
        return <DocumentTextIcon className="h-5 w-5 text-gray-500 mr-2" />;
      case 'pdf':
        return <DocumentTextIcon className="h-5 w-5 text-red-500 mr-2" />;
      case 'image':
        return <PhotoIcon className="h-5 w-5 text-blue-500 mr-2" />;
      case 'video':
        return <PlayIcon className="h-5 w-5 text-e-bosy-purple mr-2" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-500 mr-2" />;
    }
  };

  if (loading) {
    return (
      <LoadingSpinner/>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-600">Erreur : {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-e-bosy-purple to-purple-800 text-white py-12 px-6 md:px-12 mt-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8">
          {/* Colonne de gauche avec les informations */}
          <div className="md:w-2/3">
            <p className="text-sm opacity-80 mb-2">Formation &gt; {course.category?.name}</p>
            <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
            <p className="text-lg opacity-90 mb-6">{course.description}</p>
            <div className="flex items-center space-x-4 text-sm opacity-90 mb-4">
              <span className="flex items-center">
                <UserIcon className="h-4 w-4 mr-1" /> 
                Par {course.teacher?.firstName} {course.teacher?.lastName}
              </span>
              <span className="flex items-center">
                <ClockIcon className="h-4 w-4 mr-1" /> 
                {lessons.length} leçons
              </span>
            </div>
            {!isEnrolled ? (
              <Link
                to={`/courses/${course.courseId}/enroll`}
                className="bg-white text-e-bosy-purple px-6 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition duration-300 inline-flex items-center"
              >
                <PlayCircleIcon className="h-6 w-6 mr-2" /> S'inscrire au cours
              </Link>
            ) : (
              <Link
                to={`/course/${course.courseId}/lesson/${lessons[0]?.lessonId}`}
                className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold text-lg hover:bg-green-600 transition duration-300 inline-flex items-center"
              >
                <PlayCircleIcon className="h-6 w-6 mr-2" /> Continuer le cours
              </Link>
            )}
          </div>

          {/* Colonne de droite avec l'image */}
          <div className="md:w-1/3">
            <div className="relative">
              <img 
                src={course.thumbnailUrl ? `${API_BASE_URL}/${course.thumbnailUrl}` : DEFAULT_COURSE_IMAGE}
                alt={course.title}
                className="w-full h-64 object-cover rounded-lg shadow-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = DEFAULT_COURSE_IMAGE;
                }}
              />
              {course.isSubscriberOnly && (
                <div className="absolute top-4 right-4">
                  <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                    <LockClosedIcon className="h-4 w-4 mr-1" />
                    Premium
                  </span>
                </div>
              )}
              <div className="absolute bottom-4 right-4">
                <span className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {lessons.length} leçons
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto p-6 md:p-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Course Content */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Contenu du Cours</h2>

          {course.sections?.map((section, index) => (
            <div key={index} className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-100 p-4 font-semibold text-lg">
                <span>{section.title}</span>
              </div>
              <ul className="divide-y divide-gray-200">
                {lessons
                  .filter(lesson => lesson.sectionTitle === section.title)
                  .map(lesson => (
                    <li key={lesson.lessonId} className="p-4 flex items-center justify-between group">
                      <Link
                        to={isEnrolled ? `/course/${course.courseId}/lesson/${lesson.lessonId}` : '#'}
                        className={`flex items-center flex-grow text-gray-700 hover:text-e-bosy-purple transition duration-200 ${
                          (!isEnrolled || (lesson.isSubscriberOnly && !user?.isPremium)) 
                            ? 'opacity-50 cursor-not-allowed' 
                            : ''
                        }`}
                        onClick={(e) => {
                          if (!isEnrolled || (lesson.isSubscriberOnly && !user?.isPremium)) {
                            e.preventDefault();
                            toast.error(
                              lesson.isSubscriberOnly 
                                ? "Ce contenu est réservé aux abonnés Premium" 
                                : "Veuillez vous inscrire au cours pour accéder à cette leçon"
                            );
                          }
                        }}
                      >
                        {getContentTypeIcon(lesson.contentType)}
                        <span>{lesson.title}</span>
                        {lesson.isSubscriberOnly && !user?.isPremium && (
                          <LockClosedIcon className="h-4 w-4 text-yellow-500 ml-2" />
                        )}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 space-y-8">
          {/* Overview Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Aperçu du cours</h2>
            <div className="text-gray-700 space-y-3">
              <p className="flex items-center">
                <ClockIcon className="h-5 w-5 mr-2 text-gray-500" /> 
                Dernière mise à jour: {new Date(course.lastUpdatedAt).toLocaleDateString('fr-FR')}
              </p>
              <p className="flex items-center">
                <span className="font-semibold mr-2">Niveau:</span> {course.level}
              </p>
              <p className="flex items-center">
                <span className="font-semibold mr-2">Langue:</span> {course.language}
              </p>
              <p className="flex items-center">
                <span className="font-semibold mr-2">Évaluation:</span> {course.averageRating} ({course.totalReviews} avis)
              </p>
              {course.isSubscriberOnly && (
                <p className="flex items-center text-blue-600 font-medium">
                  <LockClosedIcon className="h-5 w-5 mr-2" /> Réservé aux abonnés
                </p>
              )}
            </div>
          </div>

          {/* Downloadable Resources Section */}
          {Object.keys(downloadableLessons).length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Ressources Téléchargeables</h2>
              {Object.entries(downloadableLessons).map(([type, lessonsOfType]) => (
                <div key={type} className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2 capitalize flex items-center">
                    {getContentTypeIcon(type)}
                    {type === 'text' ? 'Fichiers Texte' : type === 'pdf' ? 'Documents PDF' : type === 'image' ? 'Images' : `Autres (${type})`}
                  </h3>
                  <ul className="space-y-2">
                    {lessonsOfType.map(lesson => (
                      <li key={`dl-${lesson.lessonId}`} className="flex items-center justify-between">
                        <span className="text-gray-700 text-sm">{lesson.title}</span>
                        <a
                          href={lesson.contentUrl}
                          download
                          className="bg-e-bosy-purple text-white px-3 py-1 rounded-md text-xs hover:bg-purple-700 flex items-center transition duration-300"
                        >
                          <ArrowDownTrayIcon className="h-4 w-4 mr-1" /> Télécharger
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Assessments Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Exercices et Évaluations</h2>
            
            <Link
              to={`/course/${courseId}/assessments`}
              className="group relative flex items-center justify-between p-4 bg-gradient-to-r from-e-bosy-purple to-purple-100 rounded-lg border border-purple-200 hover:border-purple-300 transition-all duration-200"
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <AcademicCapIcon className="h-8 w-8 text-e-bosy-purple" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Accéder aux évaluations</h3>
                  <p className="text-sm text-gray-600">
                    Exercices pratiques et examens pour valider vos connaissances
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

            {/* Ajout d'informations sur les évaluations disponibles */}
            <div className="mt-4 grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-purple-50 rounded-lg">
                <ClipboardDocumentCheckIcon className="h-6 w-6 text-e-bosy-purple mx-auto mb-1" />
                <span className="text-sm text-gray-600">Exercices disponibles</span>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <AcademicCapIcon className="h-6 w-6 text-yellow-500 mx-auto mb-1" />
                <span className="text-sm text-gray-600">Examens finaux</span>
              </div>
            </div>
          </div>

          {/* Useful Links Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Liens utiles</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li><a href="#" className="text-e-bosy-purple hover:underline">OWasp Cheat Sheet</a></li>
              <li><a href="#" className="text-e-bosy-purple hover:underline">Listes des attaques connues</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsPage;