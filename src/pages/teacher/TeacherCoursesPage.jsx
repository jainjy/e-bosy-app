import React, { useState } from "react";
import {
  PlusIcon,
  VideoCameraIcon,
  MagnifyingGlassIcon,
  BookOpenIcon, // Not used in this version but kept from original
  UsersIcon,
  StarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  Bars3BottomLeftIcon, // For Manage Lessons
  ArrowPathIcon, // For Refresh or general action
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import CreateCourseModal from "../../components/CreateCourseModal"; // We'll create this
import EditCourseModal from "../../components/EditCourseModal"; // We'll create this

const TeacherCoursesPage = () => {
  const [courses, setCourses] = useState([
    {
      id: "course-1",
      title: "Advanced JavaScript for Developers",
      description: "Deep dive into advanced JavaScript concepts.",
      category: "Development",
      level: "Advanced",
      language: "Français",
      thumbnail_url: "https://via.placeholder.com/150",
      status: "Published",
      studentsEnrolled: 245,
      updatedDate: "2023-06-15",
      rating: 4.8,
      lessonsCount: 3,
      isLiveSession: false,
    },
    {
      id: "course-2",
      title: "React Frontend Masterclass",
      description: "Master React for modern web development.",
      category: "Development",
      level: "Intermediate",
      language: "English",
      thumbnail_url: "https://via.placeholder.com/150",
      status: "Published",
      studentsEnrolled: 189,
      updatedDate: "2023-05-22",
      rating: 4.9,
      lessonsCount: 2,
      isLiveSession: false,
    },
    {
      id: "course-3",
      title: "Vue.js for Beginners",
      description: "Get started with Vue.js framework.",
      category: "Development",
      level: "Beginner",
      language: "Français",
      thumbnail_url: "https://via.placeholder.com/150",
      status: "Draft",
      updatedDate: "2023-08-03",
      completionPercentage: 65,
      lessonsCount: 1,
      isLiveSession: false,
    },
    {
      id: "course-4",
      title: "Node.js API Development",
      description: "Build robust APIs with Node.js.",
      category: "Backend",
      level: "Intermediate",
      language: "English",
      thumbnail_url: "https://via.placeholder.com/150",
      status: "Draft",
      updatedDate: "2023-08-18",
      completionPercentage: 30,
      lessonsCount: 0,
      isLiveSession: false,
    },
    {
      id: "course-5",
      title: "Marketing Digital Fundamentals",
      description: "Learn the basics of digital marketing.",
      category: "Marketing",
      level: "Beginner",
      language: "Français",
      thumbnail_url: "https://via.placeholder.com/150",
      status: "Published",
      studentsEnrolled: 320,
      updatedDate: "2024-01-20",
      rating: 4.7,
      lessonsCount: 5,
      isLiveSession: false,
    },
    {
      id: "course-6",
      title: "Data Science with Python",
      description: "An introduction to data science using Python.",
      category: "Data Science",
      level: "Intermediate",
      language: "English",
      thumbnail_url: "https://via.placeholder.com/150",
      status: "Draft",
      updatedDate: "2024-02-10",
      completionPercentage: 80,
      lessonsCount: 4,
      isLiveSession: false,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("All Courses");

  // State for Create Course Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // State for Edit Course Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(null); // Stores the course being edited

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesTab =
      activeTab === "All Courses" || course.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      setCourses(courses.filter((course) => course.id !== id));
      console.log(`Deleting course with ID: ${id}`);
    }
  };

  const handlePublish = (id) => {
    setCourses(
      courses.map((course) =>
        course.id === id
          ? { ...course, status: "Published", studentsEnrolled: 0, rating: 0 }
          : course
      )
    );
    console.log(`Publishing course with ID: ${id}`);
  };

  // Functions to open/close modals
  const openCreateModal = () => setIsCreateModalOpen(true);
  const closeCreateModal = () => setIsCreateModalOpen(false);

  const openEditModal = (course) => {
    setCurrentCourse(course);
    setIsEditModalOpen(true);
  };
  const closeEditModal = () => {
    setCurrentCourse(null);
    setIsEditModalOpen(false);
  };

  const handleCreateCourse = (newCourseData) => {
    const newId = `course-${courses.length + 1}`; // Simple ID generation
    setCourses([
      ...courses,
      {
        id: newId,
        status: "Draft", // New courses start as Draft
        studentsEnrolled: 0,
        rating: 0,
        lessonsCount: 0,
        isLiveSession: false,
        completionPercentage: 0,
        updatedDate: new Date().toISOString().slice(0, 10), // Current date
        ...newCourseData,
      },
    ]);
    closeCreateModal();
    console.log("New Course Created:", newCourseData);
  };

  const handleUpdateCourse = (updatedCourseData) => {
    setCourses(
      courses.map((course) =>
        course.id === updatedCourseData.id
          ? { ...course, ...updatedCourseData }
          : course
      )
    );
    closeEditModal();
    console.log("Course Updated:", updatedCourseData);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Mes Cours</h1>
      <p className="text-gray-600 mb-8">
        Gérez vos cours et suivez leur performance.
      </p>

      {/* Search and Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex items-center w-full sm:w-auto flex-grow">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Rechercher des cours..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-e-bosy-purple focus:border-transparent w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
          <button className="ml-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent">
            Rechercher
          </button>
        </div>

        <div className="flex space-x-3 w-full sm:w-auto justify-end">
          <button
            onClick={openCreateModal} // Use onClick to open modal
            className="flex items-center px-4 py-2 bg-e-bosy-purple text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Créer Nouveau Cours
          </button>
          <Link
            to="/dashboard/live-sessions/schedule"
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
          >
            <VideoCameraIcon className="h-5 w-5 mr-2" />
            Session Live Générale
          </Link>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex border-b border-gray-200 mb-6 space-x-6">
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "All Courses"
              ? "border-b-2 border-e-bosy-purple text-e-bosy-purple"
              : "text-gray-600 hover:text-gray-800"
          } focus:outline-none`}
          onClick={() => setActiveTab("All Courses")}
        >
          Tous les Cours
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "Published"
              ? "border-b-2 border-e-bosy-purple text-e-bosy-purple"
              : "text-gray-600 hover:text-gray-800"
          } focus:outline-none`}
          onClick={() => setActiveTab("Published")}
        >
          Publiés
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "Draft"
              ? "border-b-2 border-e-bosy-purple text-e-bosy-purple"
              : "text-gray-600 hover:text-gray-800"
          } focus:outline-none`}
          onClick={() => setActiveTab("Draft")}
        >
          Brouillons
        </button>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {course.title}
                </h2>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    course.status === "Published"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {course.status === "Published" ? "Publié" : "Brouillon"}
                </span>
              </div>

              {course.status === "Published" ? (
                <>
                  <p className="text-sm text-gray-600 mb-2">
                    <UsersIcon className="h-4 w-4 inline-block mr-1" />
                    {course.studentsEnrolled} étudiants inscrits
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    Mis à jour: {course.updatedDate}
                  </p>
                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                    <span>{course.rating} avis</span>
                    <Link
                      to={`/dashboard/courses/${course.id}/analytics`}
                      className="ml-4 text-e-bosy-purple hover:underline"
                    >
                      Voir les analyses
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-600 mb-2">
                    Pas encore publié
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    Mis à jour: {course.updatedDate}
                  </p>
                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <UsersIcon className="h-4 w-4 text-gray-500 mr-1" />
                    <span>Aucun étudiant encore</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div
                      className="bg-e-bosy-purple h-2.5 rounded-full"
                      style={{ width: `${course.completionPercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mb-4">
                    Progression du cours: {course.completionPercentage}%
                  </p>
                </>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mt-4 border-t pt-4 border-gray-100">
                <Link
                  to={`/dashboard/courses/${course.id}/lessons`}
                  className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent"
                >
                  <Bars3BottomLeftIcon className="h-4 w-4 mr-1" />
                  Gérer les leçons ({course.lessonsCount})
                </Link>

                <Link
                  to={`/courses/${course.id}`} // Link to the public course view
                  className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent"
                >
                  <EyeIcon className="h-4 w-4 mr-1" />
                  {course.status === "Published" ? "Voir" : "Aperçu"}
                </Link>

                <button
                  onClick={() => openEditModal(course)} // Use onClick to open edit modal
                  className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent"
                >
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Modifier
                </button>

                {course.status === "Published" ? (
                  <button
                    onClick={() => handleDelete(course.id)}
                    className="flex items-center px-3 py-2 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent"
                  >
                    <TrashIcon className="h-4 w-4 mr-1" />
                    Supprimer
                  </button>
                ) : (
                  <button
                    onClick={() => handlePublish(course.id)}
                    className="flex items-center px-3 py-2 text-sm bg-e-bosy-purple text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <ArrowPathIcon className="h-4 w-4 mr-1" />
                    Publier
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-600">
            Aucun cours trouvé pour cette sélection.
          </p>
        )}
      </div>

      {/* Create Course Modal */}
      {isCreateModalOpen && (
        <CreateCourseModal
          onClose={closeCreateModal}
          onCreateCourse={handleCreateCourse}
        />
      )}

      {/* Edit Course Modal */}
      {isEditModalOpen && (
        <EditCourseModal
          course={currentCourse}
          onClose={closeEditModal}
          onUpdateCourse={handleUpdateCourse}
        />
      )}
    </div>
  );
};

export default TeacherCoursesPage;