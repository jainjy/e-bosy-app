import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL, getData } from '../../services/ApiFetch';
import { useAuth } from '../../contexts/AuthContext';
import {
  AcademicCapIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
  BookOpenIcon,
  UserIcon,
  CalendarIcon,
  CheckBadgeIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import Navbar from '../../Components/Navbar';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const DEFAULT_COURSE_IMAGE = "/images/default-course.jpg";
const CoursesToCertifyPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    const fetchCoursesWithoutCertification = async () => {
      try {
        setLoading(true);
        const [data, error] = await getData(`enrollments/certificates/available/${user.userId}`);
        
        if (!error) {
          setCourses(data || []);
          console.log(data)
        } else {
          setError("Erreur lors du chargement des cours");
        }
      } catch (err) {
        setError("Une erreur est survenue");
      } finally {
        setLoading(false);
      }
    };

    if (user?.userId) {
      fetchCoursesWithoutCertification();
    }
  }, [user?.userId]);

  // Filtrage des cours
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Liste unique des catégories
  const categories = ['all', ...new Set(courses.map(course => course.category?.name).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">

<LoadingSpinner/>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* En-tête avec navigation */}
        <div className="mb-8">
          <Link
            to="/certificates"
            className="inline-flex items-center text-gray-600 hover:text-e-bosy-purple mb-4 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Retour aux certificats
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Cours disponibles pour certification</h1>
              <p className="text-gray-600 mt-2">
                Obtenez vos certificats pour les cours que vous avez terminés
              </p>
            </div>
            <div className="flex items-center gap-2 text-gray-600 bg-white px-4 py-2 rounded-lg shadow-sm">
              <CheckBadgeIcon className="h-5 w-5 text-e-bosy-purple" />
              <span>{filteredCourses.length} cours disponibles</span>
            </div>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un cours..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-e-bosy-purple focus:border-e-bosy-purple"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-400" />
            <select
              className="border border-gray-300 rounded-lg py-2 px-3 focus:ring-e-bosy-purple focus:border-e-bosy-purple"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">Toutes les catégories</option>
              {categories.filter(cat => cat !== 'all').map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Grille des cours avec animation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <div
                key={course.courseId}
                className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-e-bosy-purple transform hover:-translate-y-1"
              >
                {/* Image du cours */}
                <div className="h-48 overflow-hidden rounded-t-lg">
                  <img
                    src={course.thumbnailUrl?API_BASE_URL+course.thumbnailUrl: DEFAULT_COURSE_IMAGE}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-6">
                  {/* Catégorie */}
                  <div className="flex items-center mb-4">
                    <span className="px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded-full">
                      {course.category?.name || 'Non catégorisé'}
                    </span>
                  </div>

                  {/* Titre et description */}
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {course.description || 'Aucune description disponible'}
                  </p>

                  {/* Détails du cours */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center text-gray-600">
                      <UserIcon className="h-5 w-5 mr-2 text-e-bosy-purple" />
                      <span className="text-sm">{course.teacher?.firstName} {course.teacher?.lastName}</span>
                    </div>
                  </div>

                  {/* Bouton de certification */}
                  <Link
                    to={`/course/${course.courseId}/certification`}
                    className="flex items-center justify-between w-full px-4 py-3 bg-e-bosy-purple text-white rounded-lg hover:bg-purple-700 transition-colors group"
                  >
                    <span className="flex items-center">
                      <AcademicCapIcon className="h-5 w-5 mr-2" />
                      Passer la certification
                    </span>
                    <ChevronRightIcon className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 bg-white rounded-lg shadow-sm">
              <AcademicCapIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || selectedCategory !== 'all' 
                  ? "Aucun cours ne correspond à votre recherche"
                  : "Aucun cours disponible pour certification"}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchTerm || selectedCategory !== 'all'
                  ? "Essayez de modifier vos critères de recherche"
                  : "Terminez d'abord les exercices et leçons de vos cours inscrits."}
              </p>
              <Link
                to="/courses"
                className="inline-flex items-center mt-4 text-e-bosy-purple hover:text-purple-700 transition-colors"
              >
                <BookOpenIcon className="h-5 w-5 mr-2" />
                Voir mes cours en cours
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoursesToCertifyPage;