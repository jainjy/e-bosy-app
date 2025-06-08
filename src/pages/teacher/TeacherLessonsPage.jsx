// src/components/TeacherLessonsPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  PlusIcon,
  VideoCameraIcon, // Used for external video icon
  PencilIcon,
  TrashIcon,
  PlayCircleIcon,
  CubeTransparentIcon, // Used for AR icon
  DocumentTextIcon, // Used for text and PDF content
  PhotoIcon, // Used for image content
} from "@heroicons/react/24/outline";

const TeacherLessonsPage = () => {
  const { courseId } = useParams();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]); // To store module data for lookup (still using for UI)
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourseAndLessons = async () => {
      try {
        // Simulate fetching modules (if still using for UI display of lessons)
        const mockModules = [
          { id: "module-1", title: "Introduction au Développement Web" },
          { id: "module-2", title: "Maîtrise de JavaScript" },
          { id: "module-3", title: "Frameworks Front-end Modernes" },
        ];
        setModules(mockModules);

        // Simulate fetching course data (from Courses table)
        const mockCourse = {
          id: courseId,
          title: "Développement Web Fullstack",
          status: "Published", // This would come from your DB (e.g., Courses.status if you add it)
          totalLessons: 3, // This would be calculated or fetched
        };
        setCourse(mockCourse);

        // Simulate fetching lesson data (from Lessons table)
        const mockLessons = [
          {
            id: "lesson-1",
            // module_id: "module-1", // Removed from DB schema, keeping for mock purposes if UI depends on it
            title: "HTML Essentiel",
            content: "Apprenez les bases de la structure HTML.", // Content is text
            content_type: "text",
            course_id: courseId,
            is_subscriber_only: false, // Free preview
          },
          {
            id: "lesson-2",
            // module_id: "module-1",
            title: "CSS Styles et Mise en Page",
            content: "https://www.youtube.com/embed/some_css_video", // Content is external video URL
            content_type: "external_video_url",
            course_id: courseId,
            is_subscriber_only: true, // Subscriber only
          },
          {
            id: "lesson-3",
            // module_id: "module-2",
            title: "Introduction à JavaScript (fichier)",
            content: "/uploads/js_intro.mp4", // Content is uploaded video file URL
            content_type: "uploaded_video_file",
            course_id: courseId,
            is_subscriber_only: false, // Free preview
          },
          {
            id: "lesson-4",
            // module_id: "module-2",
            title: "Les fondations de React",
            content: "/uploads/react_basics.pdf", // Content is PDF file URL
            content_type: "pdf",
            course_id: courseId,
            is_subscriber_only: true, // Subscriber only
          },
          {
            id: "lesson-5",
            // module_id: "module-2",
            title: "Images Responsives",
            content: "/uploads/responsive_image.jpg", // Content is Image file URL
            content_type: "image",
            course_id: courseId,
            is_subscriber_only: false, // Free preview
          },
          {
            id: "lesson-6",
            // module_id: "module-3",
            title: "Modèle 3D d'une App",
            content: "/uploads/app_model.glb", // Content is AR file URL
            content_type: "ar",
            course_id: courseId,
            is_subscriber_only: true, // Subscriber only
          },
        ];
        setLessons(mockLessons);
      } catch (err) {
        setError("Échec du chargement du cours et des leçons.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseAndLessons();
  }, [courseId]);

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen text-center text-gray-600">
        Chargement du cours et des leçons...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen text-center text-red-500">
        Erreur: {error}
      </div>
    );
  }

  const handleDeleteLesson = (lessonId) => {
    if (
      window.confirm(
        `Êtes-vous sûr de vouloir supprimer la leçon "${
          lessons.find((l) => l.id === lessonId)?.title
        }" ?`
      )
    ) {
      // In a real app, you'd make an API call to delete the lesson
      setLessons(lessons.filter((lesson) => lesson.id !== lessonId));
      console.log(`Deleting lesson with ID: ${lessonId}`);
    }
  };


  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Back to Courses Link */}
      <Link
        to="/dashboard/courses"
        className="flex items-center text-e-bosy-purple hover:underline mb-6"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        Retour aux Cours
      </Link>

      {/* Course Header */}
      <h1 className="text-3xl font-bold text-gray-800 mb-2">{course.title}</h1>
      <p className="text-gray-600 mb-4">Gérer les leçons pour ce cours.</p>

      {/* Course Status and Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            {course.status === "Published" ? "Publié" : "Brouillon"}
          </span>
          <span className="text-gray-600 text-sm">{lessons.length} leçons</span>
        </div>
        <div className="flex space-x-3">
          <Link
            to={`/dashboard/courses/${course.id}/lessons/add`}
            className="flex items-center px-4 py-2 bg-e-bosy-purple text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Ajouter une Leçon
          </Link>
          {/* Note: Live session link here is for the Course, not a specific lesson based on your LiveSessions schema */}
          <Link
            to={`/dashboard/live-sessions/schedule?courseId=${course.id}`}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
          >
            <VideoCameraIcon className="h-5 w-5 mr-2" />
            Démarrer une session live (Cours)
          </Link>
        </div>
      </div>

      {/* Lessons List */}
      <div className="space-y-6">
        {lessons.length > 0 ? (
          lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between"
            >
              <div className="flex-grow">
                <div className="flex items-center mb-2">
                  <span className="text-lg font-bold text-gray-800 mr-3">
                    {/* Assuming you'd have a lesson number/order either in DB or derived */}
                    {/* {lesson.number}. */ "•"}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {lesson.title}
                  </h3>
                  {lesson.is_subscriber_only && (
                    <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Abonnés seulement
                    </span>
                  )}
                  {!lesson.is_subscriber_only && (
                    <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      Gratuit (Aperçu)
                    </span>
                  )}
                  <span className="ml-auto text-gray-500 text-sm flex-shrink-0 flex items-center">
                    {lesson.content_type === "external_video_url" && (
                      <VideoCameraIcon className="h-4 w-4 inline-block mr-1 text-gray-500" />
                    )}
                    {lesson.content_type === "uploaded_video_file" && (
                      <VideoCameraIcon className="h-4 w-4 inline-block mr-1 text-gray-500" />
                    )}
                    {lesson.content_type === "text" && (
                      <DocumentTextIcon className="h-4 w-4 inline-block mr-1 text-gray-500" />
                    )}
                    {lesson.content_type === "image" && (
                      <PhotoIcon className="h-4 w-4 inline-block mr-1 text-gray-500" />
                    )}
                    {lesson.content_type === "pdf" && (
                      <DocumentTextIcon className="h-4 w-4 inline-block mr-1 text-gray-500" />
                    )}
                    {lesson.content_type === "ar" && (
                      <CubeTransparentIcon className="h-4 w-4 inline-block mr-1 text-gray-500" />
                    )}
                    {lesson.content_type.replace(/_/g, " ")}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {lesson.content_type === "text"
                    ? lesson.content // Show content directly if it's text
                    : `Fichier: ${lesson.content.split("/").pop() || lesson.content}`} {/* Show file name or URL */}
                </p>
                {/* If you want to show module: */}
                {/* <div className="flex items-center text-xs text-gray-500">
                  {lesson.module_id && (
                    <>
                      <CubeTransparentIcon className="h-4 w-4 mr-1" />
                      <span>Module: {getModuleTitle(lesson.module_id)}</span>
                    </>
                  )}
                </div> */}
              </div>

              {/* Lesson Action Buttons */}
              <div className="flex flex-wrap gap-3 mt-4 sm:mt-0 sm:ml-6 justify-end">
                <Link
                  to={`/dashboard/courses/${course.id}/lessons/${lesson.id}/edit`}
                  className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent"
                >
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Modifier
                </Link>
                <button
                  onClick={() => handleDeleteLesson(lesson.id)}
                  className="flex items-center px-3 py-2 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent"
                >
                  <TrashIcon className="h-4 w-4 mr-1" />
                  Supprimer
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-600">
            Aucune leçon trouvée pour ce cours.
          </p>
        )}
      </div>
    </div>
  );
};

export default TeacherLessonsPage;