import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  PlayCircleIcon,
  CheckCircleIcon,
  DocumentTextIcon, // For text/pdf
  PhotoIcon, // For image
  PlayIcon, // For video
  ArrowDownTrayIcon, // For download
  LockClosedIcon // For subscriber-only content
} from '@heroicons/react/24/solid';
import { ClockIcon, FolderIcon, UserIcon } from '@heroicons/react/24/outline'; // Other useful icons

const CourseDetailsPage = () => {
  // 1. Tous les useState au début
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [allLessons, setAllLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(true);
  const [completedLessons, setCompletedLessons] = useState(new Set());

  // 2. Tous les useMemo ensuite
  const groupedLessons = useMemo(() => {
    const groups = {};
    allLessons.forEach(lesson => {
      const type = lesson.content_type;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(lesson);
    });
    return groups;
  }, [allLessons]);

  const downloadableLessonsGrouped = useMemo(() => {
    const downloads = {};
    allLessons
      .filter(lesson =>
        lesson.content_url &&
        lesson.content_type !== 'video' &&
        (!lesson.is_subscriber_only || isSubscribed)
      )
      .forEach(lesson => {
        const type = lesson.content_type;
        if (!downloads[type]) {
          downloads[type] = [];
        }
        downloads[type].push(lesson);
      });
    return downloads;
  }, [allLessons, isSubscribed]);

  // 3. useEffect en dernier
  useEffect(() => {
    const fetchCourseData = async () => {
      // In a real application, you would make API calls here:
      // const courseResponse = await fetch(`/api/courses/${courseId}`);
      // const lessonsResponse = await fetch(`/api/courses/${courseId}/lessons`); // This would return a flat list
      // const enrollmentResponse = await fetch(`/api/user/current/enrollment/${courseId}`);
      // const userSubscriptionResponse = await fetch(`/api/user/current/subscription_status`);
      // const userCompletedLessonsResponse = await fetch(`/api/user/current/completed_lessons/${courseId}`);

      const dummyCourse = {
        course_id: parseInt(courseId),
        title: 'Sécuriser ses applications web',
        description: 'La sécurité est une préoccupation essentielle pour protéger les données sensibles et assurer la fiabilité des applications en ligne. Aussi, je vous propose dans cette série de vidéos de parler des bonnes pratiques mais aussi des failles de sécurité à éviter.',
        category_id: 1, // FK to Categories
        level: 'intermédiaire',
        language: 'français',
        thumbnail_url: 'https://via.placeholder.com/600x300?text=Web+Security',
        teacher_id: 1, // FK to Users
        teacher_name: 'John Doe', // Simulated teacher name
        is_subscriber_only: false, // Matches Courses.is_subscriber_only
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-06-01T14:30:00Z',
        total_duration_minutes: 49, // From calculations or stored
        number_of_chapters: 8, // From calculations or stored
        last_updated_at: '2024-05-20', // Example
        average_rating: 4.8,
        total_reviews: 120,
      };

      // FLAT LIST OF LESSONS from your DB
      const dummyAllLessons = [
        // Videos
        { lesson_id: 1, title: 'Introduction au Cours', content_type: 'video', duration_minutes: 2, content_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', is_subscriber_only: false, order_index: 1 },
        { lesson_id: 2, title: 'Comment sécuriser les données', content_type: 'video', duration_minutes: 16, content_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', is_subscriber_only: false, order_index: 2 },
        { lesson_id: 3, title: 'Hacher les mots de passe', content_type: 'video', duration_minutes: 5, content_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', is_subscriber_only: false, order_index: 3 },
        { lesson_id: 4, title: 'Les injections SQL', content_type: 'video', duration_minutes: 5, content_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', is_subscriber_only: false, order_index: 4 },
        { lesson_id: 5, title: 'Les failles XSS', content_type: 'video', duration_minutes: 3, content_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', is_subscriber_only: false, order_index: 5 },
        { lesson_id: 6, title: 'Attaques CSRF', content_type: 'video', duration_minutes: 7, content_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', is_subscriber_only: false, order_index: 6 },
        { lesson_id: 7, title: 'Envoi de fichiers malicieux', content_type: 'video', duration_minutes: 6, content_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', is_subscriber_only: false, order_index: 7 },
        { lesson_id: 8, title: 'Attaques temporelles', content_type: 'video', duration_minutes: 4, content_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', is_subscriber_only: false, order_index: 8 },

        // Documents (PDF)
        { lesson_id: 9, title: 'Guide de bonnes pratiques sécurité.pdf', content_type: 'pdf', duration_minutes: 0, content_url: '/documents/guide_securite.pdf', is_subscriber_only: false, order_index: 9 },
        { lesson_id: 10, title: 'Checklist Sécurité Web.pdf', content_type: 'pdf', duration_minutes: 0, content_url: '/documents/checklist_securite.pdf', is_subscriber_only: false, order_index: 10 },
        { lesson_id: 11, title: 'Rapport sur les vulnérabilités.pdf', content_type: 'pdf', duration_minutes: 0, content_url: '/documents/rapport_vulnerabilites.pdf', is_subscriber_only: true, order_index: 11 }, // Subscriber only PDF

        // Textes
        { lesson_id: 12, title: 'Notes de cours avancées', content_type: 'text', duration_minutes: 0, content_url: '/documents/notes_avancees.txt', is_subscriber_only: false, order_index: 12 },
        { lesson_id: 13, title: 'Cas pratiques détaillés', content_type: 'text', duration_minutes: 0, content_url: '/documents/cas_pratiques.txt', is_subscriber_only: false, order_index: 13 },

        // Images
        { lesson_id: 14, title: 'Infographie des attaques XSS', content_type: 'image', duration_minutes: 0, content_url: '/images/xss_infographie.png', is_subscriber_only: false, order_index: 14 },
        { lesson_id: 15, title: 'Schéma de protection CSRF', content_type: 'image', duration_minutes: 0, content_url: '/images/csrf_schema.png', is_subscriber_only: false, order_index: 15 },
      ].sort((a, b) => a.order_index - b.order_index); // Ensure stable order

      // Simulate enrollment status
      const dummyEnrollmentStatus = true; // User is enrolled in this course
      const dummyIsSubscribed = true; // User is subscribed
      const dummyCompletedLessons = new Set([1, 2, 9]); // Simulate some completed lessons

      setTimeout(() => {
        setCourse(dummyCourse);
        setAllLessons(dummyAllLessons);
        setIsEnrolled(dummyEnrollmentStatus);
        setIsSubscribed(dummyIsSubscribed);
        setCompletedLessons(dummyCompletedLessons);
        setLoading(false);
      }, 700);
    };

    fetchCourseData();
  }, [courseId]);

  // 4. Fonctions utilitaires (pas de Hooks)
  const getContentTypeDisplay = (contentType) => {
    switch (contentType) {
      case 'video':
        return 'Vidéos du Cours';
      case 'pdf':
        return 'Documents PDF';
      case 'text':
        return 'Fichiers Texte';
      case 'image':
        return 'Images et Infographies';
      default:
        return 'Autres Ressources';
    }
  };

  const getContentTypeIcon = (contentType) => {
    switch (contentType) {
      case 'text':
      case 'pdf':
        return <DocumentTextIcon className="h-5 w-5 text-indigo-500 mr-2" />;
      case 'image':
        return <PhotoIcon className="h-5 w-5 text-blue-500 mr-2" />;
      case 'video':
        return <PlayIcon className="h-5 w-5 text-e-bosy-purple mr-2" />;
      default:
        return <FolderIcon className="h-5 w-5 text-gray-500 mr-2" />; // Default to a general folder icon
    }
  };

  // 5. Rendu conditionnel
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-lg text-gray-700">Chargement du cours...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <p className="text-lg text-red-600">Erreur lors du chargement du cours: {error}</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-lg text-gray-700">Cours non trouvé.</p>
      </div>
    );
  }

  // 6. Rendu principal
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-e-bosy-purple to-purple-800 text-white py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-2/3">
            <p className="text-sm opacity-80 mb-2">Formation - Sécurité</p>
            <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
            <p className="text-lg opacity-90 mb-6">{course.description}</p>
            <div className="flex items-center space-x-4 text-sm opacity-90 mb-4">
              <span className="flex items-center"><UserIcon className="h-4 w-4 mr-1" /> Par {course.teacher_name}</span>
              <span className="flex items-center"><ClockIcon className="h-4 w-4 mr-1" /> {course.total_duration_minutes} min de vidéos</span>
              <span className="flex items-center"><FolderIcon className="h-4 w-4 mr-1" /> {course.number_of_chapters} chapitres</span>
            </div>
            {!isEnrolled ? (
              <button className="bg-white text-e-bosy-purple px-6 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition duration-300 flex items-center">
                <PlayCircleIcon className="h-6 w-6 mr-2" /> Commencer le cours
              </button>
            ) : (
              <Link
                to={`/course/${course.course_id}/lesson/${allLessons[0]?.lesson_id}`} // Link to the first lesson
                className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold text-lg hover:bg-green-600 transition duration-300 flex items-center w-fit"
              >
                <PlayCircleIcon className="h-6 w-6 mr-2" /> Continuer le cours
              </Link>
            )}
          </div>
          <div className="md:w-1/3 flex justify-center">
            <img src="https://www.freeiconspng.com/uploads/security-icon-10.png" alt="Security Shield" className="h-48 w-48 object-contain" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto p-6 md:p-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Course Content by Type */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Contenu du Cours</h2>

          {Object.entries(groupedLessons).map(([contentType, lessonsOfType], index) => (
            <div key={contentType} className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-100 p-4 font-semibold text-lg flex items-center justify-between">
                <span className="flex items-center">
                  {getContentTypeIcon(contentType)}
                  {getContentTypeDisplay(contentType)}
                </span>
                <span className="text-sm text-gray-600">
                  {lessonsOfType.length} leçon(s)
                </span>
              </div>
              <ul className="divide-y divide-gray-200">
                {lessonsOfType.map(lesson => (
                  <li key={lesson.lesson_id} className="p-4 flex items-center justify-between group">
                    <Link
                      to={`/course/${course.course_id}/lesson/${lesson.lesson_id}`}
                      className={`flex items-center flex-grow text-gray-700 hover:text-e-bosy-purple transition duration-200 ${
                        (!isEnrolled || (lesson.is_subscriber_only && !isSubscribed)) ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      onClick={(e) => {
                        if (!isEnrolled) {
                          e.preventDefault();
                          alert("Veuillez vous inscrire au cours pour accéder à cette leçon.");
                        } else if (lesson.is_subscriber_only && !isSubscribed) {
                          e.preventDefault();
                          alert("Ce contenu est réservé aux abonnés. Veuillez vous abonner.");
                        }
                      }}
                    >
                      {isEnrolled && completedLessons.has(lesson.lesson_id) && <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />}
                      {(!isEnrolled || (lesson.is_subscriber_only && !isSubscribed)) && <LockClosedIcon className="h-5 w-5 text-red-500 mr-2" />}
                      {isEnrolled && !completedLessons.has(lesson.lesson_id) && !lesson.is_subscriber_only && <PlayCircleIcon className="h-5 w-5 text-gray-400 mr-2" />} {/* Non-completed icon */}

                      <span className="flex items-center">
                        {getContentTypeIcon(lesson.content_type)}
                        {lesson.title}
                      </span>
                    </Link>
                    {lesson.content_type === 'video' && (
                      <span className="text-sm text-gray-500">{lesson.duration_minutes} min</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Right Column: Overview/Details/Downloads */}
        <div className="lg:col-span-1 space-y-8">
          {/* Overview Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Aperçu du cours</h2>
            <div className="text-gray-700 space-y-3">
              <p className="flex items-center"><ClockIcon className="h-5 w-5 mr-2 text-gray-500" /> Dernière mise à jour: {new Date(course.last_updated_at).toLocaleDateString('fr-FR')}</p>
              <p className="flex items-center"><span className="font-semibold mr-2">Niveau:</span> {course.level}</p>
              <p className="flex items-center"><span className="font-semibold mr-2">Langue:</span> {course.language}</p>
              <p className="flex items-center"><span className="font-semibold mr-2">Évaluation:</span> {course.average_rating} ({course.total_reviews} avis)</p>
              {course.is_subscriber_only && (
                <p className="flex items-center text-blue-600 font-medium">
                  <LockClosedIcon className="h-5 w-5 mr-2" /> Réservé aux abonnés
                </p>
              )}
            </div>
          </div>

          {/* Downloadable Resources Section */}
          {Object.keys(downloadableLessonsGrouped).length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Ressources Téléchargeables</h2>
              {Object.entries(downloadableLessonsGrouped).map(([type, lessonsOfType]) => (
                <div key={type} className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2 capitalize flex items-center">
                    {getContentTypeIcon(type)}
                    {getContentTypeDisplay(type)}
                  </h3>
                  <ul className="space-y-2">
                    {lessonsOfType.map(lesson => (
                      <li key={`dl-${lesson.lesson_id}`} className="flex items-center justify-between">
                        <span className="text-gray-700 text-sm">{lesson.title}</span>
                        <a
                          href={lesson.content_url}
                          download // This attribute prompts the browser to download the file
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

          {/* Useful Links Section (as in your example) */}
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