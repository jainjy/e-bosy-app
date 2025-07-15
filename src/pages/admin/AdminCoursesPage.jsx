import React, { useState, useEffect, useMemo } from "react";
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
  MagnifyingGlassIcon,
  Bars3BottomLeftIcon,
  TrashIcon,
  ArrowPathIcon,
  EyeIcon,
  CogIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { getData, deleteData, patchData, API_BASE_URL } from "../../services/ApiFetch";
import { useAuth } from '../../contexts/AuthContext';
import { EllipsisVerticalIcon } from "lucide-react";

const DEFAULT_COURSE_IMAGE = "/images/default-course.jpg";

const COURSE_STATUS = {
  DRAFT: 'brouillon',
  PUBLISHED: 'publier',
};

const CourseCard = ({ course, onDelete, onPublish, teachers }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const teacher = teachers.find(t => t.userId === course.teacherId);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
      <div className="relative h-48 bg-gray-100">
        <img
          src={course.thumbnailUrl ? `${API_BASE_URL}/${course.thumbnailUrl}` : DEFAULT_COURSE_IMAGE}
          alt={course.title}
          className="w-full h-full object-cover"
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
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
            {course.category?.name || 'Général'}
          </span>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
            course.status === COURSE_STATUS.DRAFT
              ? 'bg-gray-100 text-gray-700'
              : 'bg-green-100 text-green-800'
          }`}>
            {course.status === COURSE_STATUS.DRAFT ? 'Brouillon' : 'Publié'}
          </span>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2 leading-tight">
          {course.title}
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Professeur: {teacher ? `${teacher.firstName} ${teacher.lastName}` : "Non assigné"}
        </p>
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <div className="flex space-x-2">
            <Link
              to={`/courses/${course.courseId}/lessons`}
              className="flex items-center justify-center py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
            >
              <EyeIcon className="h-4 w-4 mr-1" />
              Voir les leçons
            </Link>
            <button
              onClick={() => onDelete(course.courseId)}
              className="flex items-center justify-center py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
            >
              <TrashIcon className="h-4 w-4 mr-1" />
              Supprimer
            </button>
          </div>
          {course.status === COURSE_STATUS.DRAFT && (
            <button
              onClick={() => onPublish(course)}
              className="flex items-center justify-center py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
            >
              <ArrowPathIcon className="h-4 w-4 mr-1" />
              Publier
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const AdminCoursesPage = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesData, coursesError] = await getData("courses");
        if (coursesError) throw new Error(coursesError.message);
        setCourses(coursesData);

        const [teachersData, teachersError] = await getData("users?role=enseignant");
        if (teachersError) throw new Error(teachersError.message);
        setTeachers(teachersData);

        const [categoriesData, categoriesError] = await getData("courses/categories");
        if (categoriesError) throw new Error(categoriesError.message);
        setCategories(categoriesData);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory ? course.category?.categoryId == selectedCategory : true;
      return matchesSearch && matchesCategory;
    });
  }, [courses, searchTerm, selectedCategory]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Vous ne pourrez pas annuler cette action !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
      try {
        const [_, error] = await deleteData(`courses/${id}`);
        if (error) throw new Error(error.message);
        setCourses(courses.filter((course) => course.courseId !== id));
        toast.success("Cours supprimé avec succès.");
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const handlePublish = async (course) => {
    try {
      if (course.lessonsCount > 0) {
        const id = course.courseId;
        const [_, error] = await patchData(`courses/${id}/status`, { status: COURSE_STATUS.PUBLISHED });
        if (error) throw new Error(error.message);
        setCourses(courses.map((course) =>
          course.courseId === id ? {
            ...course,
            status: COURSE_STATUS.PUBLISHED,
            studentsEnrolled: 0,
            rating: 0
          } : course
        ));
        toast.success("Cours publié avec succès");
      } else {
        toast.info("Il n'y a aucune leçon dans ce cours, vous ne pouvez pas le publier");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Gestion des Cours</h1>
          <p className="text-lg text-gray-600">Administrez les cours et gérez les catégories.</p>
        </div>
        <Link
          to="/categories"
          className="bg-gradient-to-r from-purple-600 to-e-bosy-purple text-white px-6 py-3 rounded-lg shadow-lg hover:from-purple-700 hover:to-purple-800 transition transform hover:-translate-y-1 flex items-center space-x-2 text-lg font-medium"
        >
          <CogIcon className="h-6 w-6" />
          <span>Gérer les Catégories</span>
        </Link>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-lg mb-10 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-6">
          <div className="relative w-full md:w-1/2 lg:w-2/3">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher des cours par titre..."
              className="w-full rounded-full border-gray-300 pl-12 pr-6 py-3 text-lg focus:ring-e-bosy-purple focus:border-e-bosy-purple shadow-sm transition duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative w-full md:w-1/2 lg:w-1/3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-full border-gray-300 pl-6 pr-12 py-3 text-lg focus:ring-e-bosy-purple focus:border-e-bosy-purple shadow-sm transition duration-200 appearance-none"
            >
              <option value="">Toutes les catégories</option>
              {categories.map(category => (
                <option key={category.categoryId} value={category.categoryId.toString()}>
                  {category.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredCourses.length > 0 ? (
          filteredCourses.map(course => (
            <CourseCard
              key={course.courseId}
              course={course}
              onDelete={handleDelete}
              onPublish={handlePublish}
              teachers={teachers}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-20 bg-white rounded-xl shadow-lg">
            <p className="text-2xl font-semibold text-gray-700 mb-4">
              Aucun cours trouvé pour cette sélection.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCoursesPage;
