import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { AcademicCapIcon } from '@heroicons/react/24/solid'; // Example icon for progress

const MyCoursesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all'); // 'all', 'in-progress', 'completed'
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simulate fetching data from your backend
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      const dummyData = [
        {
          enrollment_id: 1,
          user_id: 1,
          course_id: 101,
          enrolled_at: '2023-01-15T10:00:00Z',
          last_lesson_id: 5,
          completion_rate: 60, // Matches your 'completion_rate' in Enrollments
          last_activity_at: '2023-06-10T14:30:00Z',
          status: 'in-progress', // Matches your 'status' in Enrollments ('enrolled' or 'completed' as per DB schema, mapping to 'in-progress' for display)
          course: { // Joined course data
            course_id: 101,
            title: 'JavaScript Fondamentaux',
            description: 'Learn the basics of JavaScript.',
            thumbnail_url: 'https://via.placeholder.com/300x180?text=JS+Fondamentals',
            level: 'débutant',
            language: 'français',
            is_subscriber_only: false,
          },
          lastViewedLessonTitle: 'Variables et Types de Données', // Simulated from Lessons table
        },
        {
          enrollment_id: 2,
          user_id: 1,
          course_id: 102,
          enrolled_at: '2023-02-20T11:00:00Z',
          last_lesson_id: 1,
          completion_rate: 20,
          last_activity_at: '2023-06-05T09:00:00Z',
          status: 'in-progress',
          course: {
            course_id: 102,
            title: 'Développement React',
            description: 'Build modern user interfaces with React.',
            thumbnail_url: 'https://via.placeholder.com/300x180?text=React+Dev',
            level: 'intermédiaire',
            language: 'français',
            is_subscriber_only: false,
          },
          lastViewedLessonTitle: 'Introduction aux Composants',
        },
        {
          enrollment_id: 3,
          user_id: 1,
          course_id: 103,
          enrolled_at: '2022-09-01T08:00:00Z',
          last_lesson_id: null, // Or the ID of the last lesson if completed
          completion_rate: 100,
          last_activity_at: '2023-01-10T16:00:00Z',
          status: 'completed',
          course: {
            course_id: 103,
            title: 'Python pour Data Science',
            description: 'Master Python for data analysis and machine learning.',
            thumbnail_url: 'https://via.placeholder.com/300x180?text=Python+DS',
            level: 'avancé',
            language: 'français',
            is_subscriber_only: true,
          },
          lastViewedLessonTitle: 'Cours Terminé',
        },
        {
          enrollment_id: 4,
          user_id: 1,
          course_id: 104,
          enrolled_at: '2024-05-01T13:00:00Z',
          last_lesson_id: null,
          completion_rate: 0,
          last_activity_at: '2024-05-01T13:00:00Z',
          status: 'enrolled', // Initial status when a user just enrolls
          course: {
            course_id: 104,
            title: 'Introduction à l\'intelligence artificielle',
            description: 'An overview of AI concepts and applications.',
            thumbnail_url: 'https://via.placeholder.com/300x180?text=AI+Intro',
            level: 'débutant',
            language: 'français',
            is_subscriber_only: false,
          },
          lastViewedLessonTitle: 'Commencer le cours',
        },
      ];

      setTimeout(() => {
        setEnrolledCourses(dummyData);
        setLoading(false);
      }, 500); // Simulate network delay
    };

    fetchEnrolledCourses();
  }, []);

  const filteredCourses = enrolledCourses.filter(enrollment => {
    const matchesSearch = enrollment.course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatusFilter === 'all' ||
      (selectedStatusFilter === 'in-progress' && enrollment.status === 'in-progress') ||
      (selectedStatusFilter === 'completed' && enrollment.status === 'completed') ||
      (selectedStatusFilter === 'in-progress' && enrollment.status === 'enrolled' && enrollment.completion_rate < 100); // Treat initial 'enrolled' as 'in-progress' if not completed
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
            <Link to={`/course/${enrollment.course_id}`} key={enrollment.enrollment_id} className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
              <div className="relative h-40 bg-gray-200 flex items-center justify-center overflow-hidden">
                <img src={enrollment.course.thumbnail_url} alt={enrollment.course.title} className="w-full h-full object-cover" />
                {(enrollment.status === 'in-progress' || enrollment.status === 'enrolled') && (
                  <div className="absolute bottom-2 left-2 right-2 bg-gray-800 bg-opacity-75 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-e-bosy-purple h-full rounded-full"
                      style={{ width: `${enrollment.completion_rate}%` }}
                    ></div>
                  </div>
                )}
                {enrollment.status === 'completed' && (
                  <span className="absolute bottom-2 left-2 bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    Terminé
                  </span>
                )}
                {enrollment.course.is_subscriber_only && (
                  <span className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    Abonnés Uniquement
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate">{enrollment.course.title}</h3>
                <p className="text-sm text-gray-600 mb-3">
                  {enrollment.status === 'in-progress' || enrollment.status === 'enrolled'
                    ? `Dernière activité: ${new Date(enrollment.last_activity_at).toLocaleDateString()}`
                    : 'Cours terminé le: ' + new Date(enrollment.last_activity_at).toLocaleDateString()}
                </p>
                <div className="flex justify-between items-center">
                  {(enrollment.status === 'in-progress' || enrollment.status === 'enrolled') && (
                    <span className="text-sm text-gray-700">{enrollment.completion_rate}% Complété</span>
                  )}
                  <Link
                    to={`/course/${enrollment.course_id}`}
                    className="bg-e-bosy-purple text-white px-4 py-2 rounded-md hover:bg-purple-700 transition duration-300"
                  >
                    {enrollment.status === 'in-progress' || enrollment.status === 'enrolled' ? 'Continuer' : 'Voir le cours'}
                  </Link>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-600 text-lg py-10">Aucun cours trouvé correspondant à vos critères.</p>
        )}
      </div>
    </div>
  );
};

export default MyCoursesPage;