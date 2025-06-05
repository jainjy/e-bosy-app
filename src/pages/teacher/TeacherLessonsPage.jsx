import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  PlusIcon,
  VideoCameraIcon,
  PencilIcon,
  TrashIcon,
  PlayCircleIcon, // For Live lesson action
  CubeTransparentIcon, // For content blocks
} from "@heroicons/react/24/outline"; // Using outline icons as seen in the design

const TeacherLessonsPage = () => {
  const { courseId } = useParams(); // Get courseId from URL params (e.g., /dashboard/courses/:courseId/lessons)

  // Mock data for a specific course and its lessons
  // In a real application, you'd fetch this data based on courseId
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    // Simulate fetching course and lesson data
    // Replace with actual API call to your backend
    const fetchCourseAndLessons = () => {
      // Example data for a single course and its lessons
      const mockCourse = {
        id: courseId,
        title: "Advanced JavaScript for Developers", // This would come from your DB
        status: "Published",
        totalLessons: 3,
      };

      const mockLessons = [
        {
          id: "lesson-1",
          number: 1,
          title: "JavaScript ES6+ Features",
          description:
            "Learn about modern JavaScript features, including arrow functions, destructuring, and spread/rest operators.",
          duration: "45 min",
          contentBlocks: 5,
          isLiveAvailable: true,
        },
        {
          id: "lesson-2",
          number: 2,
          title: "Async Programming with Promises",
          description:
            "Master asynchronous programming patterns using Promises, async/await, and error handling.",
          duration: "1 hr",
          contentBlocks: 8,
          isLiveAvailable: false,
        },
        {
          id: "lesson-3",
          number: 3,
          title: "Working with Modules",
          description:
            "Understand how to organize your code using ES Modules and CommonJS.",
          duration: "30 min",
          contentBlocks: 3,
          isLiveAvailable: true,
        },
        // Add more mock lessons
      ];

      setCourse(mockCourse);
      setLessons(mockLessons);
    };

    fetchCourseAndLessons();
  }, [courseId]); // Re-fetch if courseId changes

  if (!course) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen text-center text-gray-600">
        Chargement du cours...
      </div>
    );
  }

  const handleDeleteLesson = (lessonId) => {
    // In a real app, you'd make an API call to delete the lesson
    if (
      window.confirm(
        `Êtes-vous sûr de vouloir supprimer la leçon ${lessonId} ?`
      )
    ) {
      setLessons(lessons.filter((lesson) => lesson.id !== lessonId));
      console.log(`Deleting lesson with ID: ${lessonId}`);
    }
  };

  const handleStartLiveSession = (lessonId) => {
    // In a real app, you'd trigger a live session creation/start API call
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
            to={`/dashboard/courses/${course.id}/lessons/add`} // Link to add new lesson page
            className="flex items-center px-4 py-2 bg-e-bosy-purple text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Ajouter une Leçon
          </Link>
          <Link
            to={`/dashboard/live-sessions/schedule?courseId=${course.id}`} // Optionnel: passer courseId via query param
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
                  <span className="ml-auto text-gray-500 text-sm flex-shrink-0">
                    {lesson.duration}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {lesson.description}
                </p>
                <div className="flex items-center text-xs text-gray-500">
                  <CubeTransparentIcon className="h-4 w-4 mr-1" />
                  <span>{lesson.contentBlocks} blocs de contenu</span>
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
                    lesson.isLiveAvailable
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
