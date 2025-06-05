import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { AcademicCapIcon } from '@heroicons/react/24/solid'; // Example icon for progress

const MyCoursesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('Tous les Cours'); // 'Tous les Cours', 'En Cours', 'Terminés'

  // Dummy data for user's enrolled courses
  const myEnrolledCourses = [
    {
      id: 1,
      title: 'JavaScript Fondamentaux',
      progress: 60, // Percentage
      status: 'En Cours',
      imageUrl: 'https://via.placeholder.com/300x180?text=JS+Fondamentals',
      lastViewed: 'Lesson 5: Variables'
    },
    {
      id: 2,
      title: 'Développement React',
      progress: 20,
      status: 'En Cours',
      imageUrl: 'https://via.placeholder.com/300x180?text=React+Dev',
      lastViewed: 'Introduction to Components'
    },
    {
      id: 3,
      title: 'Python pour Data Science',
      progress: 100,
      status: 'Terminés',
      imageUrl: 'https://via.placeholder.com/300x180?text=Python+DS',
      lastViewed: 'Course Completed'
    },
    {
      id: 4,
      title: 'Introduction à l\'intelligence artificielle',
      progress: 0,
      status: 'En Cours',
      imageUrl: 'https://via.placeholder.com/300x180?text=AI+Intro',
      lastViewed: 'Start Course'
    },
  ];

  const filteredMyCourses = myEnrolledCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatusFilter === 'Tous les Cours' || course.status === selectedStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Mes Cours</h1>
          <p className="text-gray-600">Continuez votre apprentissage là où vous l'avez laissé.</p>
        </div>
        <Link to="/courses" className="bg-e-bosy-purple text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-purple-700">
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
            {['Tous les Cours', 'En Cours', 'Terminés'].map(status => (
              <button
                key={status}
                onClick={() => setSelectedStatusFilter(status)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200
                  ${selectedStatusFilter === status
                    ? 'bg-e-bosy-purple text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* My Courses Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMyCourses.length > 0 ? (
          filteredMyCourses.map(course => (
            <Link to={`/course/${course.id}`} key={course.id} className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
              <div className="relative h-40 bg-gray-200 flex items-center justify-center overflow-hidden">
                <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover" />
                {course.status === 'En Cours' && (
                  <div className="absolute bottom-2 left-2 right-2 bg-gray-800 bg-opacity-75 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-e-bosy-purple h-full rounded-full"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                )}
                {course.status === 'Terminés' && (
                    <span className="absolute bottom-2 left-2 bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                        Completed
                    </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate">{course.title}</h3>
                <p className="text-sm text-gray-600 mb-3">
                  {course.status === 'En Cours' ? `Last viewed: ${course.lastViewed}` : course.lastViewed}
                </p>
                <div className="flex justify-between items-center">
                  {course.status === 'En Cours' && (
                    <span className="text-sm text-gray-700">{course.progress}% Completed</span>
                  )}
                  <Link to={`/course/${course.id}`} className="bg-e-bosy-purple text-white px-4 py-2 rounded-md hover:bg-purple-700">
                    {course.status === 'En Cours' ? 'En Cours' : 'Voir le cours'}
                  </Link>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-600 text-lg py-10">No courses found matching your criteria.</p>
        )}
      </div>
    </div>
  );
};

export default MyCoursesPage;