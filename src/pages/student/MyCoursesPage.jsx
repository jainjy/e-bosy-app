import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { AcademicCapIcon } from '@heroicons/react/24/solid';
import { API_BASE_URL, getData } from '../../services/ApiFetch';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import Navbar from '../../Components/Navbar';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const DEFAULT_COURSE_IMAGE = "/images/default-course.jpg";

const MyCoursesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [certificates, setCertificates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchEnrolledCoursesAndCategories = async () => {
      try {
        setLoading(true);
        const [enrollmentsData, enrollmentsError] = await getData(`enrollments`);
        if (enrollmentsError) throw enrollmentsError;

        const [categoriesData, categoriesError] = await getData(`courses/categories`);
        if (categoriesError) throw categoriesError;

        const userEnrollments = enrollmentsData.filter(enrollment => enrollment.userId === user.userId);
        setEnrolledCourses(userEnrollments);
        setCategories(categoriesData);

        const certificatePromises = userEnrollments.map(async (enrollment) => {
          const [certificateData, certificateError] = await getData(
            `enrollments/certificates/course/${enrollment.courseId}/user/${user.userId}`
          );
          if (certificateError) {
            console.error(`Erreur lors de la récupération du certificat pour le cours ${enrollment.courseId}:`, certificateError);
            return { courseId: enrollment.courseId, certificate: null };
          }
          return { courseId: enrollment.courseId, certificate: certificateData };
        });

        const certificateResults = await Promise.all(certificatePromises);
        const certificatesMap = certificateResults.reduce((acc, { courseId, certificate }) => {
          acc[courseId] = certificate;
          return acc;
        }, {});
        setCertificates("certificates ",certificatesMap);
        console.log(certificatesMap)
      } catch (err) {
        setError(err.message);
        toast.error("Erreur lors du chargement de vos cours ou des catégories.");
      } finally {
        setLoading(false);
      }
    };

    if (user?.userId) {
      fetchEnrolledCoursesAndCategories();
    }
  }, [user?.userId]);

  const filteredCourses = enrolledCourses.filter(enrollment => {
    const matchesSearch = enrollment.course.title.toLowerCase().includes(searchTerm.toLowerCase());
    let matchesStatus = false;
    if (selectedStatusFilter === 'all') {
      matchesStatus = true;
    } else if (selectedStatusFilter === 'in-progress') {
      matchesStatus = enrollment.completionRate > 0 && enrollment.completionRate < 100;
    } else if (selectedStatusFilter === 'not-started') {
      matchesStatus = enrollment.completionRate === 0;
    } else if (selectedStatusFilter === 'completed') {
      matchesStatus = enrollment.completionRate === 100;
    }
    const matchesCategory = selectedCategoryFilter === 'all' ||
      (enrollment.course.category && enrollment.course.category.categoryId.toString() === selectedCategoryFilter);
    return matchesSearch && matchesStatus && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <p className="text-lg text-red-600">Erreur lors du chargement des cours : {error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Mes Cours</h1>
          <p className="text-lg text-gray-600">Continuez votre apprentissage là où vous l'avez laissé et explorez de nouvelles opportunités.</p>
        </div>
        <Link
          to="/courses"
          className="bg-gradient-to-r from-purple-600 to-e-bosy-purple text-white px-6 py-3 rounded-lg shadow-lg hover:from-purple-700 hover:to-purple-800 transition transform hover:-translate-y-1 flex items-center space-x-2 text-lg font-medium"
        >
          <AcademicCapIcon className="h-6 w-6" />
          <span>Parcourir Plus de Cours</span>
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
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="w-full rounded-full border-gray-300 pl-6 pr-12 py-3 text-lg focus:ring-e-bosy-purple focus:border-e-bosy-purple shadow-sm transition duration-200 appearance-none"
            >
              <option value="all">Toutes les catégories</option>
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
        <div className="flex flex-wrap justify-center md:justify-start gap-3 w-full pt-4 md:pt-0">
          {[
            { label: 'Tous', value: 'all' },
            { label: 'En Cours', value: 'in-progress' },
            { label: 'Non Commencés', value: 'not-started' },
            { label: 'Terminés', value: 'completed' },
          ].map(filter => (
            <button
              key={filter.value}
              onClick={() => setSelectedStatusFilter(filter.value)}
              className={`px-5 py-2 rounded-full text-base font-medium transition-all duration-300 shadow-sm
                ${selectedStatusFilter === filter.value
                  ? 'bg-e-bosy-purple text-white transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-800'
                }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredCourses.length > 0 ? (
          filteredCourses.map(enrollment => (
            <div key={enrollment.enrollmentId} className="block bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
              <div className="relative h-48 bg-gray-100">
                <img
                  src={enrollment.course.thumbnailUrl ? `${API_BASE_URL}/${enrollment.course.thumbnailUrl}` : DEFAULT_COURSE_IMAGE}
                  alt={enrollment.course.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = DEFAULT_COURSE_IMAGE;
                  }}
                />
                <div className="absolute bottom-4 left-4 right-4 bg-gray-800 bg-opacity-70 rounded-full h-3">
                  <div
                    className="bg-e-bosy-purple h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${enrollment.completionRate}%` }}
                  />
                </div>
                {certificates[enrollment.courseId] && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                      <AcademicCapIcon className="h-4 w-4 mr-1" />
                      Certifié
                    </span>
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                    {enrollment.course.category?.name || 'Général'}
                  </span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    enrollment.completionRate === 0
                      ? 'bg-blue-100 text-blue-800'
                      : enrollment.completionRate > 0 && enrollment.completionRate < 100
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {enrollment.completionRate === 0 ? 'Non Commencé' : enrollment.completionRate < 100 ? 'En Cours' : 'Terminé'}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 leading-tight">
                  {enrollment.course.title}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Dernière activité: {new Date(enrollment.lastActivityAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
                <div className="flex flex-col space-y-3 pt-3 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-base text-gray-700 font-semibold">
                      {enrollment.completionRate}% Complété
                    </span>
                    <Link
                      to={`/course/${enrollment.courseId}`}
                      className="text-base font-bold text-e-bosy-purple hover:text-purple-700 transition-colors"
                    >
                      Continuer →
                    </Link>
                  </div>
                  {certificates[enrollment.courseId] ? (
                    <Link
                      to={`/certificates/${certificates[enrollment.courseId].certificateId}`}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-600 transition duration-300 inline-flex items-center"
                    >
                      <AcademicCapIcon className="h-5 w-5 mr-2" />
                      Voir la certification
                    </Link>
                  ) : (
                    <Link
                      to={`/course/${enrollment.courseId}/assessments`}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm inline-flex items-center transition duration-300
                        ${enrollment.completionRate >= 80
                          ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      onClick={(e) => {
                        if (enrollment.completionRate < 80) {
                          e.preventDefault();
                          toast.error("Vous devez compléter au moins 80% du cours pour passer l'examen.");
                        }
                      }}
                    >
                      <AcademicCapIcon className="h-5 w-5 mr-2" />
                      Obtenir la certification
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-20 bg-white rounded-xl shadow-lg">
            <AcademicCapIcon className="mx-auto h-24 w-24 text-gray-400 mb-6" />
            <p className="text-2xl font-semibold text-gray-700 mb-4">
              Vous n'êtes inscrit à aucun cours pour le moment.
            </p>
            <p className="text-lg text-gray-500 mb-8">
              Lancez-vous dans une nouvelle aventure d'apprentissage !
            </p>
            <Link
              to="/courses"
              className="inline-block bg-gradient-to-r from-purple-600 to-e-bosy-purple text-white px-8 py-4 rounded-lg shadow-xl hover:from-purple-700 hover:to-purple-800 transition transform hover:-translate-y-1 text-lg font-bold"
            >
              Parcourir les cours disponibles
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCoursesPage;