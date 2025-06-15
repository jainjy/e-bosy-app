import React, { useState } from "react";
import {
  PlusIcon,
  VideoCameraIcon,
  MagnifyingGlassIcon,
  UsersIcon,
  StarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  Bars3BottomLeftIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import CourseFormModal from "../../components/CourseFormModal";

const TeacherCoursesPage = () => {
  const [courses, setCourses] = useState([
    {
      course_id: 1, // Changed from 'id' to 'course_id' to match DB
      title: "Advanced JavaScript for Developers",
      description: "Deep dive into advanced JavaScript concepts.",
      category_id: 1, // Added category_id (FK to Categories)
      level: "Advanced",
      language: "Français",
      thumbnail_url: "https://via.placeholder.com/150/0000FF/FFFFFF?text=JS_Adv", // Updated dummy URL for visual
      teacher_id: 101, // Added teacher_id (FK to Users)
      is_subscriber_only: false, // New field
      created_at: "2023-06-01T10:00:00Z", // New field
      updated_at: "2023-06-15T14:30:00Z", // New field
      sections: [
        { title: "Introduction", order: 1 },
        { title: "Advanced Topics", order: 2 },
        { title: "Project Work", order: 3 },
      ],
      status: "Published",
      studentsEnrolled: 245,
      rating: 4.8,
      lessonsCount: 3,
      isLiveSession: false,
    },
    {
      course_id: 2,
      title: "React Frontend Masterclass",
      description: "Master React for modern web development.",
      category_id: 1,
      level: "Intermediate",
      language: "English",
      thumbnail_url: "https://via.placeholder.com/150/FF0000/FFFFFF?text=React",
      teacher_id: 101,
      is_subscriber_only: true,
      created_at: "2023-05-10T09:00:00Z",
      updated_at: "2023-05-22T11:00:00Z",
      sections: [{ title: "Basics", order: 1 }, { title: "Hooks", order: 2 }],
      status: "Published",
      studentsEnrolled: 189,
      rating: 4.9,
      lessonsCount: 2,
      isLiveSession: false,
    },
    {
      course_id: 3,
      title: "Vue.js for Beginners",
      description: "Get started with Vue.js framework.",
      category_id: 1,
      level: "Beginner",
      language: "Français",
      thumbnail_url: "https://via.placeholder.com/150/00FF00/FFFFFF?text=VueJS",
      teacher_id: 101,
      is_subscriber_only: false,
      created_at: "2023-07-20T13:00:00Z",
      updated_at: "2023-08-03T16:00:00Z",
      sections: [{ title: "Getting Started", order: 1 }],
      status: "Draft",
      completionPercentage: 65,
      lessonsCount: 1,
      isLiveSession: false,
    },
    {
      course_id: 4,
      title: "Node.js API Development",
      description: "Build robust APIs with Node.js.",
      category_id: 2,
      level: "Intermediate",
      language: "English",
      thumbnail_url: "https://via.placeholder.com/150/FFFF00/000000?text=NodeJS",
      teacher_id: 101,
      is_subscriber_only: false,
      created_at: "2023-08-01T10:00:00Z",
      updated_at: "2023-08-18T10:00:00Z",
      sections: [],
      status: "Draft",
      completionPercentage: 30,
      lessonsCount: 0,
      isLiveSession: false,
    },
    {
      course_id: 5,
      title: "Marketing Digital Fundamentals",
      description: "Learn the basics of digital marketing.",
      category_id: 3,
      level: "Beginner",
      language: "Français",
      thumbnail_url: "https://via.placeholder.com/150/00FFFF/000000?text=Marketing",
      teacher_id: 102,
      is_subscriber_only: false,
      created_at: "2023-12-01T08:00:00Z",
      updated_at: "2024-01-20T10:00:00Z",
      sections: [{ title: "Digital Channels", order: 1 }, { title: "SEO Basics", order: 2 }],
      status: "Published",
      studentsEnrolled: 320,
      rating: 4.7,
      lessonsCount: 5,
      isLiveSession: false,
    },
    {
      course_id: 6,
      title: "Data Science with Python",
      description: "An introduction to data science using Python.",
      category_id: 4,
      level: "Intermediate",
      language: "English",
      thumbnail_url: "https://via.placeholder.com/150/FF00FF/FFFFFF?text=DataSci",
      teacher_id: 102,
      is_subscriber_only: true,
      created_at: "2024-01-20T09:00:00Z",
      updated_at: "2024-02-10T14:00:00Z",
      sections: [{ title: "Python for Data", order: 1 }, { title: "Data Analysis", order: 2 }],
      status: "Draft",
      completionPercentage: 80,
      lessonsCount: 4,
      isLiveSession: false,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("All Courses");

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState(null);

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
      setCourses(courses.filter((course) => course.course_id !== id));
      console.log(`Deleting course with ID: ${id}`);
    }
  };

  const handlePublish = (id) => {
    setCourses(
      courses.map((course) =>
        course.course_id === id
          ? { ...course, status: "Published", studentsEnrolled: 0, rating: 0 }
          : course
      )
    );
    console.log(`Publishing course with ID: ${id}`);
  };

  const openCreateCourseForm = () => {
    setCourseToEdit(null);
    setIsFormModalOpen(true);
  };

  const openEditCourseForm = (course) => {
    setCourseToEdit(course);
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setCourseToEdit(null);
  };

  const handleFormSubmit = (submittedCourseData) => {
    // In a real application, you'd send this data (including the file or its generated URL) to your backend API.
    // The backend would handle assigning course_id, teacher_id, created_at, updated_at,
    // and storing sections and is_subscriber_only.

    if (submittedCourseData.course_id) {
      // It's an update operation
      setCourses(
        courses.map((course) =>
          course.course_id === submittedCourseData.course_id
            ? {
                ...course,
                ...submittedCourseData,
                updated_at: new Date().toISOString(),
              }
            : course
        )
      );
      console.log("Course Updated:", submittedCourseData);
    } else {
      // It's a create operation
      const newCourseId = Math.max(...courses.map(c => c.course_id)) + 1;
      setCourses([
        ...courses,
        {
          course_id: newCourseId,
          teacher_id: 101, // Assign a dummy teacher_id for now
          status: "Draft",
          studentsEnrolled: 0,
          rating: 0,
          lessonsCount: 0,
          isLiveSession: false,
          completionPercentage: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          sections: [], // New courses start with empty sections
          ...submittedCourseData,
        },
      ]);
      console.log("New Course Created:", submittedCourseData);
    }
    closeFormModal();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Mes Cours</h1>
      <p className="text-gray-600 mb-8">
        Gerez vos cours et suivez leur performance.
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
            onClick={openCreateCourseForm}
            className="flex items-center px-4 py-2 bg-e-bosy-purple text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Creer Nouveau Cours
          </button>
          <Link
            to="/dashboard/live-sessions/schedule"
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
          >
            <VideoCameraIcon className="h-5 w-5 mr-2" />
            Session Live Generale
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
          Publies
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
              key={course.course_id}
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
                  {course.status === "Published" ? "Publie" : "Brouillon"}
                </span>
              </div>

              {course.status === "Published" ? (
                <>
                  <p className="text-sm text-gray-600 mb-2">
                    <UsersIcon className="h-4 w-4 inline-block mr-1" />
                    {course.studentsEnrolled} etudiants inscrits
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    Mis à jour: {new Date(course.updated_at).toLocaleDateString()}
                  </p>
                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                    <span>{course.rating} avis</span>
                    <Link
                      to={`/dashboard/courses/${course.course_id}/analytics`}
                      className="ml-4 text-e-bosy-purple hover:underline"
                    >
                      Voir les analyses
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-600 mb-2">
                    Pas encore publie
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    Mis à jour: {new Date(course.updated_at).toLocaleDateString()}
                  </p>
                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <UsersIcon className="h-4 w-4 text-gray-500 mr-1" />
                    <span>Aucun etudiant encore</span>
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
                  to={`/dashboard/courses/${course.course_id}/lessons`}
                  className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent"
                >
                  <Bars3BottomLeftIcon className="h-4 w-4 mr-1" />
                  Gerer les leçons ({course.lessonsCount})
                </Link>

                <Link
                  to={`/courses/${course.course_id}`}
                  className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent"
                >
                  <EyeIcon className="h-4 w-4 mr-1" />
                  {course.status === "Published" ? "Voir" : "Aperçu"}
                </Link>

                <button
                  onClick={() => openEditCourseForm(course)}
                  className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent"
                >
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Modifier
                </button>

                {course.status === "Published" ? (
                  <button
                    onClick={() => handleDelete(course.course_id)}
                    className="flex items-center px-3 py-2 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent"
                  >
                    <TrashIcon className="h-4 w-4 mr-1" />
                    Supprimer
                  </button>
                ) : (
                  <button
                    onClick={() => handlePublish(course.course_id)}
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
            Aucun cours trouve pour cette selection.
          </p>
        )}
      </div>

      {isFormModalOpen && (
        <CourseFormModal
          onClose={closeFormModal}
          onSubmit={handleFormSubmit}
          course={courseToEdit}
        />
      )}
    </div>
  );
};

export default TeacherCoursesPage;