import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { AcademicCapIcon } from '@heroicons/react/24/solid';
import { getData } from '../../services/ApiFetch';
import { useAuth } from '../../services/AuthContext';
import { toast } from 'react-hot-toast';
import Navbar from '../../Components/Navbar';

const API_BASE_URL = "http://localhost:5196";
const DEFAULT_COURSE_IMAGE = "/images/default-course.jpg";

const MyCoursesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        setLoading(true);
        const [data, error] = await getData(`enrollments`);
        
        if (error) throw error;

        // Filtrer les inscriptions pour l'utilisateur connecté
        const userEnrollments = data.filter(enrollment => enrollment.userId === user.userId);
        setEnrolledCourses(userEnrollments);
      } catch (err) {
        setError(err.message);
        toast.error("Erreur lors du chargement de vos cours");
      } finally {
        setLoading(false);
      }
    };

    if (user?.userId) {
      fetchEnrolledCourses();
    }
  }, [user?.userId]);

  const filteredCourses = enrolledCourses.filter(enrollment => {
    const matchesSearch = enrollment.course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatusFilter === 'all' ||
      (selectedStatusFilter === 'in-progress' && enrollment.status === 'en_cours') ||
      (selectedStatusFilter === 'completed' && enrollment.status === 'terminé');
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-700">Chargement de vos cours...</p>
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
    <div className="p-6 bg-gray-50 min-h-screen">
      <Navbar />
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Mes Cours</h1>
          <p className="text-gray-600">Continuez votre apprentissage là où vous l'avez laissé.</p>
        </div>
        <Link to="/courses" className="bg-e-bosy-purple text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-purple-700 transition duration-300">
          <span>Parcourir Plus de Cours</span>
        </Link>
      </div>

      {/* Search and Status Filters */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
          <div className="relative w-full md:w-2/3">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher des cours..."
              className="w-full rounded-md border-gray-300 pl-10 pr-4 py-2 focus:ring-e-bosy-purple focus:border-e-bosy-purple"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
            {[
              { label: 'Tous les Cours', value: 'all' },
              { label: 'En Cours', value: 'in-progress' },
              { label: 'Terminés', value: 'completed' },
            ].map(filter => (
              <button
                key={filter.value}
                onClick={() => setSelectedStatusFilter(filter.value)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200
                  ${selectedStatusFilter === filter.value
                    ? 'bg-e-bosy-purple text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* My Courses Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCourses.length > 0 ? (
          filteredCourses.map(enrollment => (
            <Link 
              to={`/course/${enrollment.courseId}`} 
              key={enrollment.enrollmentId} 
              className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
            >
              <div className="relative h-40 bg-gray-200">
                <img 
                  src={enrollment.course.thumbnailUrl ? `${API_BASE_URL}/${enrollment.course.thumbnailUrl}` : DEFAULT_COURSE_IMAGE}
                  alt={enrollment.course.title} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = DEFAULT_COURSE_IMAGE;
                  }}
                />
                <div className="absolute bottom-2 left-2 right-2 bg-gray-800 bg-opacity-75 rounded-full h-2">
                  <div
                    className="bg-e-bosy-purple h-full rounded-full"
                    style={{ width: `${enrollment.completionRate}%` }}
                  />
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-500">
                    {enrollment.course.category?.name}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    enrollment.status === 'en_cours' 
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {enrollment.status === 'en_cours' ? 'En cours' : 'Terminé'}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {enrollment.course.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Dernière activité: {new Date(enrollment.lastActivityAt).toLocaleDateString('fr-FR')}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">
                    {enrollment.completionRate}% Complété
                  </span>
                  <span className="text-sm font-medium text-e-bosy-purple">
                    Continuer
                  </span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-10 text-gray-600">
            <p className="text-lg mb-4">
              Vous n'êtes inscrit à aucun cours pour le moment.
            </p>
            <Link
              to="/courses"
              className="inline-block bg-e-bosy-purple text-white px-6 py-3 rounded-md hover:bg-purple-700 transition-colors"
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