// TeacherCoursesPage.js
import React, { useState, useEffect, useMemo } from "react";
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
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
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import CourseFormModal from "../../components/CourseFormModal";
import LiveSessionFormModal from "../../components/LiveSessionFormModal";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { getData, deleteData, postData, putData, patchData, API_BASE_URL } from "../../services/ApiFetch";
import { useAuth } from '../../contexts/AuthContext';
import { EllipsisVerticalIcon } from "lucide-react";

const DEFAULT_COURSE_IMAGE = "/images/default-course.jpg";

const COURSE_STATUS = {
  DRAFT: 'brouillon',
  PUBLISHED: 'publier',
  ALL: 'tous'
};

const CourseStats = ({ courses }) => {
  const stats = useMemo(() => ({
    total: courses.length,
    published: courses.filter(c => c.status === COURSE_STATUS.PUBLISHED).length,
    totalLessons: courses.reduce((acc, course) => acc + (course.lessonsCount || 0), 0),
    averageProgress: Math.round(
      courses.reduce((acc, course) => acc + (course.completionPercentage || 0), 0) / courses.length
    )
  }), [courses]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Cours</h3>
        <p className="text-3xl font-bold text-e-bosy-purple">{stats.total}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Cours Publiés</h3>
        <p className="text-3xl font-bold text-green-600">{stats.published}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Leçons</h3>
        <p className="text-3xl font-bold text-blue-600">{stats.totalLessons}</p>
      </div>
    </div>
  );
};

const CourseCard = ({ course, onEdit, onDelete, onPublish }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md">
      <div className="relative">
        <img
          src={course.thumbnailUrl ? `${API_BASE_URL}/${course.thumbnailUrl}` : DEFAULT_COURSE_IMAGE}
          alt={course.title}
          className="w-full h-48 object-cover rounded-t-lg"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = DEFAULT_COURSE_IMAGE;
          }}
        />
        <span
          className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold ${
            course.status === COURSE_STATUS.PUBLISHED
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {course.status === COURSE_STATUS.PUBLISHED ? "Publié" : "Brouillon"}
        </span>
      </div>

      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">{course.title}</h2>

        <div className="flex items-center justify-between mb-4">
          {course.status === COURSE_STATUS.PUBLISHED ? (
            <div className="flex items-center text-gray-600">
              <UsersIcon className="h-4 w-4 mr-1" />
              <span>{course.studentsEnrolled || 0} étudiants</span>
            </div>
          ) : null}
          <div className="flex items-center text-gray-600">
            <Bars3BottomLeftIcon className="h-4 w-4 mr-1" />
            <span>{course.lessonsCount || 0} leçons</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
          <Link
            to={`/courses/${course.courseId}/lessons`}
            className="flex-1 flex items-center justify-center py-2 bg-e-bosy-purple text-white rounded-md hover:bg-purple-700 transition-colors duration-200"
          >
            <Bars3BottomLeftIcon className="h-4 w-4 mr-1" />
            Les leçons
          </Link>

          <Link
            to={`/courses/${course.courseId}/assessments`}
            className="flex-1 flex items-center justify-center py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors duration-200"
          >
            <AcademicCapIcon className="h-4 w-4 mr-1" />
            Les évaluations
          </Link>

          <div className="relative">
            <button
              onClick={toggleMenu}
              className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200"
            >
              <EllipsisVerticalIcon className="h-5 w-5" />
            </button>
            {isMenuOpen && (
              <div className="absolute right-10 bottom-12 mt-2 w-50 bg-white rounded-md shadow-xl z-10">
                <div className="py-1">
                  <button
                    onClick={() => onEdit(course)}
                    className="flex items-center justify-start w-full px-4 py-2 text-md text-gray-700 hover:bg-gray-100"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Modifier
                  </button>
                  <Link
                    to={'/course/'+course.courseId}
                    className="flex items-center justify-start w-full px-4 py-2 text-md text-gray-700 hover:bg-gray-100"
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    Voir
                  </Link>
                  {course.status === COURSE_STATUS.DRAFT && (
                    <button
                      onClick={() => onPublish(course)}
                      className="flex items-center justify-start w-full px-4 py-2 text-md text-green-600 hover:bg-green-100"
                    >
                      <ArrowPathIcon className="h-4 w-4 mr-2" />
                      Publier
                    </button>
                  )}
                   <button
                      onClick={() => onDelete(course.courseId)}
                      className="flex items-center justify-start w-full px-4 py-2 text-md text-red-600 hover:bg-red-100"
                    >
                      <TrashIcon className="h-4 w-4 mr-2" />
                      Supprimer
                    </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const TeacherCoursesPage = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState(COURSE_STATUS.ALL);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isLiveSessionModalOpen, setIsLiveSessionModalOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('updated');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const [data, error] = await getData("courses/teacher/" + user.userId);
        if (error) throw new Error(error.message);
        setCourses(data);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const getSortedCourses = (coursesToSort) => {
    switch (sortBy) {
      case 'updated':
        return [...coursesToSort].sort((a, b) => 
          new Date(b.updatedAt) - new Date(a.updatedAt)
        );
      case 'title':
        return [...coursesToSort].sort((a, b) => 
          a.title.localeCompare(b.title)
        );
      case 'students':
        return [...coursesToSort].sort((a, b) => 
          (b.studentsEnrolled || 0) - (a.studentsEnrolled || 0)
        );
      default:
        return coursesToSort;
    }
  };

  const filteredCourses = useMemo(() => {
    const filtered = courses.filter((course) => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTab = 
        activeTab === COURSE_STATUS.ALL || 
        course.status === activeTab;
      return matchesSearch && matchesTab;
    });
    return getSortedCourses(filtered);
  }, [courses, searchTerm, activeTab, sortBy]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const [_, error] = await deleteData(`courses/${id}`);
        if (error) throw new Error(error.message);
        setCourses(courses.filter((course) => course.courseId !== id));
        toast.success("Course deleted successfully.");
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const handlePublish = async (course) => {
    try {
      if(course.lessonsCount>0){
        const id=course.courseId;
        const [_, error] = await patchData(`courses/${id}/status`, { 
          status: COURSE_STATUS.PUBLISHED 
        });
        if (error) throw new Error(error.message);
      
        setCourses(courses.map((course) =>
          course.courseId ===  id? { 
            ...course, 
            status: COURSE_STATUS.PUBLISHED, 
            studentsEnrolled: 0, 
            rating: 0 
          } : course
        ));
        
        toast.success("Cours publié avec succès");

      }else{
        toast.info("il y a aucun lecons dans ce cours ,vous ne pouvez pas le publier")
      }
      
  
    } catch (error) {
      toast.error(error.message);
    }
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

  const openLiveSessionModal = () => {
    setIsLiveSessionModalOpen(true);
  };

  const closeLiveSessionModal = () => {
    setIsLiveSessionModalOpen(false);
  };

  const handleFormSubmit = async (submittedCourseData) => {
    try {
      let response;
      if (submittedCourseData.courseId) {
        response = await putData(`courses/${submittedCourseData.courseId}`, submittedCourseData, true);
      } else {
        submittedCourseData.teacherId = user.userId;
        response = await postData("courses", submittedCourseData, true);
      }

      const [data, error] = response;
      if (error) throw new Error(error.message);

      if (submittedCourseData.courseId) {
        setCourses(courses.map((course) =>
          course.courseId === data.courseId ? data : course
        ));
        toast.success("Course updated successfully.");
      } else {
        setCourses([...courses, data]);
        toast.success("Course created successfully.");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      closeFormModal();
    }
  };

  const handleLiveSessionSubmit = async (sessionData) => {
    try {
      toast.success("Session en direct planifiée/mise à jour avec succès!");
    } catch (error) {
      toast.error("Erreur lors de la planification/mise à jour de la session en direct.");
    } finally {
      closeLiveSessionModal();
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Mes Cours</h1>
      <p className="text-gray-600 mb-8">
        Gérez vos cours et suivez leur performance.
      </p>

      <CourseStats courses={courses} />

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

        <div className="flex items-center space-x-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-e-bosy-purple focus:border-transparent"
          >
            <option value="updated">Plus récents</option>
            <option value="title">Ordre alphabétique</option>
            <option value="students">Nombre d'étudiants</option>
          </select>

          <div className="flex space-x-3">
            <button
              onClick={openCreateCourseForm}
              className="flex items-center px-4 py-2 bg-e-bosy-purple text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Créer Nouveau Cours
            </button>
            <button
              onClick={openLiveSessionModal}
              className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
            >
              <VideoCameraIcon className="h-5 w-5 mr-2" />
              PlanifieSession Liver 
            </button>
          </div>
        </div>
      </div>

      <div className="flex border-b border-gray-200 mb-6 space-x-6">
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === COURSE_STATUS.ALL
              ? "border-b-2 border-e-bosy-purple text-e-bosy-purple"
              : "text-gray-600 hover:text-gray-800"
          } focus:outline-none`}
          onClick={() => setActiveTab(COURSE_STATUS.ALL)}
        >
          Tous les Cours
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === COURSE_STATUS.PUBLISHED
              ? "border-b-2 border-e-bosy-purple text-e-bosy-purple"
              : "text-gray-600 hover:text-gray-800"
          } focus:outline-none`}
          onClick={() => setActiveTab(COURSE_STATUS.PUBLISHED)}
        >
          Publiés
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === COURSE_STATUS.DRAFT
              ? "border-b-2 border-e-bosy-purple text-e-bosy-purple"
              : "text-gray-600 hover:text-gray-800"
          } focus:outline-none`}
          onClick={() => setActiveTab(COURSE_STATUS.DRAFT)}
        >
          Brouillons
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {filteredCourses.map((course) => (
          <CourseCard
            key={course.courseId}
            course={course}
            onEdit={openEditCourseForm}
            onDelete={handleDelete}
            onPublish={handlePublish}
          />
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <p className="col-span-full text-center text-gray-600">
          Aucun cours trouvé pour cette sélection.
        </p>
      )}

      {isFormModalOpen && (
        <CourseFormModal
          onClose={closeFormModal}
          onSubmit={handleFormSubmit}
          course={courseToEdit}
        />
      )}

      {isLiveSessionModalOpen && (
        <LiveSessionFormModal
          onClose={closeLiveSessionModal}
          onSubmit={handleLiveSessionSubmit}
        />
      )}
    </div>
  );
};

export default TeacherCoursesPage;

