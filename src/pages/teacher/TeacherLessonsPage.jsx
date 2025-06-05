// src/components/TeacherLessonsPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  PlusIcon,
  VideoCameraIcon,
  PencilIcon,
  TrashIcon,
  PlayCircleIcon,
  CubeTransparentIcon,
  DocumentTextIcon // Added for text content
} from "@heroicons/react/24/outline";

const TeacherLessonsPage = () => {
  const { courseId } = useParams();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]); // To store module data for lookup
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourseAndLessons = async () => {
      try {
        // Simulate fetching modules
        const mockModules = [
          { id: "module-1", title: "Introduction au Développement Web" },
          { id: "module-2", title: "Maîtrise de JavaScript" },
          { id: "module-3", title: "Frameworks Front-end Modernes" },
        ];
        setModules(mockModules);

        // Simulate fetching course and lesson data
        const mockCourse = {
          id: courseId,
          title: "Développement Web Fullstack",
          status: "Published",
          totalLessons: 3,
        };
        setCourse(mockCourse);

        const mockLessons = [
          {
            id: "lesson-1",
            module_id: "module-1", // Link to a module
            number: 1, // Order of lesson, not from DB schema directly, but useful for display
            title: "HTML Essentiel",
            description: "Apprenez les bases de la structure HTML.",
            video_url: "https://www.youtube.com/embed/somehtmlvideo",
            content_type: "video",
            content_value: "https://www.youtube.com/embed/somehtmlvideo",
            is_preview: true,
          },
          {
            id: "lesson-2",
            module_id: "module-1",
            number: 2,
            title: "CSS Styles et Mise en Page",
            description: "Découvrez comment styliser vos pages web avec CSS.",
            video_url: "", // No video for this one
            content_type: "text",
            content_value: "Le contenu textuel de la leçon sur CSS...",
            is_preview: false,
          },
          {
            id: "lesson-3",
            module_id: "module-2", // Link to another module
            number: 1,
            title: "Introduction à JavaScript",
            description: "Premiers pas avec la programmation côté client.",
            video_url: "https://www.youtube.com/embed/somejsvideo",
            content_type: "video",
            content_value: "https://www.youtube.com/embed/somejsvideo",
            is_preview: false,
          },
          {
            id: "lesson-4",
            module_id: "module-2",
            number: 2,
            title: "Manipuler le DOM",
            description: "Comprendre comment interagir avec les éléments HTML.",
            video_url: "",
            content_type: "pdf", // Example: PDF lesson
            content_value: "/assets/dom_manipulation_guide.pdf", // Conceptual URL
            is_preview: true,
          },
        ];
        setLessons(mockLessons);
      } catch (err) {
        setError("Failed to load course and lessons.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseAndLessons();
  }, [courseId]);

  const getModuleTitle = (moduleId) => {
    const module = modules.find((m) => m.id === moduleId);
    return module ? module.title : "Module Inconnu";
  };

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
        `Êtes-vous sûr de vouloir supprimer la leçon ${
          lessons.find((l) => l.id === lessonId)?.title
        } ?`
      )
    ) {
      // In a real app, you'd make an API call to delete the lesson
      setLessons(lessons.filter((lesson) => lesson.id !== lessonId));
      console.log(`Deleting lesson with ID: ${lessonId}`);
    }
  };

  const handleStartLiveSession = (lessonId) => {
    console.log(`Starting live session for lesson with ID: ${lessonId}`);
    alert(
      `Démarrage de la session live pour la leçon ${
        lessons.find((l) => l.id === lessonId)?.title
      }`
    );
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
          <Link
            to={`/dashboard/live-sessions/schedule?courseId=${course.id}`}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
          >
            <VideoCameraIcon className="h-5 w-5 mr-2" />
            Démarrer une session live
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
                    {lesson.number}.
                  </span>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {lesson.title}
                  </h3>
                  {lesson.is_preview && (
                    <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      Gratuit
                    </span>
                  )}
                  <span className="ml-auto text-gray-500 text-sm flex-shrink-0">
                    {lesson.content_type === "video" && (
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
                    {lesson.content_type}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {lesson.description || (lesson.content_type !== 'text' && lesson.content_value ? `Fichier: ${lesson.content_value.split('/').pop()}` : '')}
                </p>
                <div className="flex items-center text-xs text-gray-500">
                    {lesson.module_id && (
                        <>
                            <CubeTransparentIcon className="h-4 w-4 mr-1" />
                            <span>Module: {getModuleTitle(lesson.module_id)}</span>
                        </>
                    )}
                </div>
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
                <button
                  onClick={() => handleStartLiveSession(lesson.id)}
                  className={`flex items-center px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-2 ${
                    lesson.isLiveAvailable // Assuming you'd fetch this from backend too or deduce
                      ? "bg-green-100 text-green-800 hover:bg-green-200 focus:ring-green-300"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                  disabled={!lesson.isLiveAvailable}
                >
                  <PlayCircleIcon className="h-4 w-4 mr-1" />
                  Live
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