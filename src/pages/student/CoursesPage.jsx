import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../Components/Navbar';
import { 
  MagnifyingGlassIcon,
  BookOpenIcon,
  UserIcon,
  CalendarIcon,
  LanguageIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/20/solid';
import { getData } from '../../services/ApiFetch';
import { useAuth } from '../../contexts/AuthContext';
import { useEnrollments } from '../../hooks/useEnrollments';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const API_BASE_URL = "http://localhost:5000";
const DEFAULT_COURSE_IMAGE = "/images/default-course.jpg";

const CoursesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [sortBy, setSortBy] = useState('Plus Populaire');
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const { isEnrolled } = useEnrollments();

  const levels = ['Débutant', 'Intermédiaire', 'Avancé'];

  // Récupération des cours et des catégories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Récupérer tous les cours sans pagination
        const [coursesData, coursesError] = await getData('courses');
        if (coursesError) throw coursesError;
        
        // Récupérer les catégories
        const [categoriesData, categoriesError] = await getData('courses/categories');
        if (categoriesError) throw categoriesError;

        // Utiliser directement les données sans pagination
        setCourses(coursesData);
        setCategories(categoriesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setSelectedCategories(prev =>
      prev.includes(value) ? prev.filter(c => c !== value) : [...prev, value]
    );
  };

  const handleLevelChange = (e) => {
    const value = e.target.value;
    setSelectedLevels(prev =>
      prev.includes(value) ? prev.filter(l => l !== value) : [...prev, value]
    );
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearchTerm = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategories = selectedCategories.length === 0 || selectedCategories.includes(course.category.name);
    const matchesLevels = selectedLevels.length === 0 || selectedLevels.includes(course.level);
    return matchesSearchTerm && matchesCategories && matchesLevels;
  }).sort((a, b) => {
    switch(sortBy) {
      case 'Plus Populaire':
        return b.lessonsCount - a.lessonsCount;
      case 'Plus Récent':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'Plus Ancien':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'Prix: Croissant':
        return (a.isSubscriberOnly ? 1 : 0) - (b.isSubscriberOnly ? 1 : 0);
      case 'Prix: Décroissant':
        return (b.isSubscriberOnly ? 1 : 0) - (a.isSubscriberOnly ? 1 : 0);
      case 'Ordre Alphabétique':
        return a.title.localeCompare(b.title, 'fr', { sensitivity: 'base' });
      default:
        return 0;
    }
  });

  const renderCourseActions = (course) => {
    if (!user) {
      return (
        <Link 
          to="/login" 
          className="w-full block text-center py-2 px-4 bg-e-bosy-purple text-white rounded-md hover:bg-purple-700 transition-colors"
        >
          Se connecter pour s'inscrire
        </Link>
      );
    }

    return isEnrolled(course.courseId) ? (
      <Link 
        to={`/course/${course.courseId}`}
        className="w-full block text-center py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
      >
        Continuer le cours
      </Link>
    ) : (
      <Link 
        to={`/courses/${course.courseId}/enroll`}
        className="w-full block text-center py-2 px-4 bg-e-bosy-purple text-white rounded-md hover:bg-purple-700 transition-colors"
      >
        S'inscrire au cours
      </Link>
    );
  };

  if (loading) {
    return (
<LoadingSpinner/>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center text-red-500">
          Une erreur est survenue: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <Navbar />
      <main className="container mx-auto p-8">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-gray-800 mb-2">Explorez Nos Cours</h2>
          <p className="text-lg text-gray-600">
            Découvrez le cours parfait pour améliorer vos compétences et booster votre carrière.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filtres */}
          <aside className="w-full lg:w-1/4 bg-white p-6 rounded-lg shadow-md h-fit sticky top-24">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.75 0 5 2.25 5 5S14.75 13 12 13 7 10.75 7 8 9.25 3 12 3Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7Z" />
              </svg>
              Filtres
            </h3>

            {/* Catégories */}
            <div className="mb-6">
              <h4 className="text-md font-semibold text-gray-700 mb-3">Catégories</h4>
              {categories.map(category => (
                <div key={category.categoryId} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id={`category-${category.categoryId}`}
                    value={category.name}
                    checked={selectedCategories.includes(category.name)}
                    onChange={handleCategoryChange}
                    className="h-4 w-4 text-e-bosy-purple border-gray-300 rounded focus:ring-e-bosy-purple"
                  />
                  <label htmlFor={`category-${category.categoryId}`} className="ml-2 text-sm text-gray-700">
                    {category.name}
                  </label>
                </div>
              ))}
            </div>

            {/* Niveaux */}
            <div>
              <h4 className="text-md font-semibold text-gray-700 mb-3">Niveau</h4>
              {levels.map(level => (
                <div key={level} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id={`level-${level}`}
                    value={level}
                    checked={selectedLevels.includes(level)}
                    onChange={handleLevelChange}
                    className="h-4 w-4 text-e-bosy-purple border-gray-300 rounded focus:ring-e-bosy-purple"
                  />
                  <label htmlFor={`level-${level}`} className="ml-2 text-sm text-gray-700">
                    {level}
                  </label>
                </div>
              ))}
            </div>
          </aside>

          {/* Liste des cours */}
          <div className="w-full lg:w-3/4">
            {/* Recherche et tri */}
            <div className="flex flex-col md:flex-row items-center justify-between bg-white p-4 rounded-lg shadow-md mb-6">
              <div className="relative w-full md:w-2/3 mr-0 md:mr-4 mb-4 md:mb-0">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher des cours..."
                  className="w-full rounded-md border-gray-300 pl-10 pr-4 py-2 focus:ring-e-bosy-purple focus:border-e-bosy-purple"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative w-full md:w-1/3">
                <select
                  className="w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:ring-e-bosy-purple focus:border-e-bosy-purple"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option>Plus Populaire</option>
                  <option>Plus Récent</option>
                  <option>Plus Ancien</option>
                  <option>Prix: Croissant</option>
                  <option>Prix: Décroissant</option>
                  <option>Ordre Alphabétique</option>
                </select>
              </div>
            </div>

            {/* Résultats */}
            <p className="text-gray-600 text-sm mb-6">
              Affichage de {filteredCourses.length} résultats
              {searchTerm && ` pour "${searchTerm}"`}
              {(selectedCategories.length > 0 || selectedLevels.length > 0) &&
                ` avec filtres: ${[...selectedCategories, ...selectedLevels].join(', ')}`}
            </p>

            {/* Grille des cours */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.length > 0 ? (
                filteredCourses.map(course => (
                  <div key={course.courseId} className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
                    <div className="relative h-40 bg-gray-200">
                      <img 
                        src={course.thumbnailUrl ? `${API_BASE_URL}/${course.thumbnailUrl}` : DEFAULT_COURSE_IMAGE}
                        alt={course.title} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = DEFAULT_COURSE_IMAGE;
                        }}
                      />
                      <div className="absolute top-2 left-2 flex gap-2">
                        <span className="bg-e-bosy-purple text-white text-xs font-semibold px-2 py-1 rounded-full">
                          {course.level}
                        </span>
                        <span className="bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                          {course.language}
                        </span>
                      </div>
                      {course.isSubscriberOnly && (
                        <span className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                          Premium
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-500">
                          {course.category?.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(course.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate">
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {course.description}
                      </p>
                      <div className="border-t pt-3">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <UserIcon className="h-4 w-4" />
                            <span>{course.teacher?.firstName} {course.teacher?.lastName}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <BookOpenIcon className="h-4 w-4" />
                            <span>{course.lessonsCount || 0} leçons</span>
                          </div>
                          <span className={`text-lg font-bold ${course.isSubscriberOnly ? 'text-yellow-500' : 'text-green-500'}`}>
                            {course.isSubscriberOnly ? 'Premium' : 'Gratuit'}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4">
                        {renderCourseActions(course)}
                      </div>
                      {!user && course.isSubscriberOnly && (
                        <div className="mt-2 text-center text-sm text-gray-500">
                          Ce cours nécessite un abonnement Premium
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-10 text-gray-600">
                  Aucun cours ne correspond à vos critères.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CoursesPage;