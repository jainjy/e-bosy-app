import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, PlusIcon, FunnelIcon, Squares2X2Icon as GridIcon, ListBulletIcon as ListIcon, BookOpenIcon, UsersIcon } from '@heroicons/react/24/outline'; // Adjust imports

const ManageCoursesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All'); // 'All', 'Published', 'Drafts', 'Pending'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Dummy course data for management
  const allManagedCourses = [
    {
      id: 1,
      title: 'Introduction to JavaScript',
      description: 'Learn the fundamentals of JavaScript programming',
      instructor: 'By Unknown Instructor', // Or a name
      students: 85,
      price: 0.00,
      status: 'Published',
      imageUrl: 'https://via.placeholder.com/300x180?text=JS+Intro'
    },
    {
      id: 2,
      title: 'React pour débutants',
      description: 'Apprenez à créer des applications modernes avec React',
      instructor: 'By Unknown Instructor',
      students: 124,
      price: 0.00,
      status: 'Published',
      imageUrl: 'https://via.placeholder.com/300x180?text=React+Beginner'
    },
    {
      id: 3,
      title: 'Développement d\'API avec Node.js et Express',
      description: 'Développez des APIs robustes avec Node.js',
      instructor: 'By Unknown Instructor',
      students: 68,
      price: 0.00,
      status: 'Published',
      imageUrl: 'https://via.placeholder.com/300x180?text=Node.js+API'
    },
    {
      id: 4,
      title: 'Advanced CSS Techniques',
      description: 'Master advanced CSS concepts like Flexbox, Grid, and animations.',
      instructor: 'By Unknown Instructor',
      students: 45,
      price: 29.99,
      status: 'Drafts',
      imageUrl: 'https://via.placeholder.com/300x180?text=Advanced+CSS'
    },
    {
      id: 5,
      title: 'Machine Learning with Python',
      description: 'An introductory course to machine learning using Python.',
      instructor: 'By Unknown Instructor',
      students: 0,
      price: 49.99,
      status: 'Pending',
      imageUrl: 'https://via.placeholder.com/300x180?text=ML+Python'
    },
  ];

  const filteredManagedCourses = allManagedCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatusFilter === 'All' || course.status === selectedStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Published': return 'bg-green-100 text-green-800';
      case 'Drafts': return 'bg-gray-100 text-gray-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Manage Courses</h1>
          <p className="text-gray-600">Oversee and edit your course offerings.</p>
        </div>
        <button className="bg-e-bosy-purple text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-purple-700">
          <PlusIcon className="h-5 w-5" />
          <span>Create Course</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
          <div className="relative w-full md:w-1/2">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              className="w-full rounded-md border-gray-300 pl-10 pr-4 py-2 focus:ring-e-bosy-purple focus:border-e-bosy-purple"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
            {['All', 'Published', 'Drafts', 'Pending'].map(status => (
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

        <div className="flex justify-between items-center mt-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-e-bosy-purple text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              title="Grid View"
            >
              <GridIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-e-bosy-purple text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              title="List View"
            >
              <ListIcon className="h-5 w-5" />
            </button>
          </div>
          {/* You could add a more complex filter button here if needed */}
          {/* <button className="p-2 rounded-md text-gray-700 hover:bg-gray-100">
            <FunnelIcon className="h-5 w-5" /> Filter
          </button> */}
        </div>
      </div>

      {/* Course Listings */}
      {filteredManagedCourses.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredManagedCourses.map(course => (
              <Link to={`/dashboard/manage-courses/${course.id}`} key={course.id} className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <div className="relative h-40 bg-gray-200 flex items-center justify-center overflow-hidden">
                  <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover" />
                  <span className={`absolute top-2 right-2 text-xs font-semibold px-2 py-1 rounded-full ${getStatusBadgeClass(course.status)}`}>
                    {course.status}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate">{course.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                  <p className="text-xs text-gray-500 mb-3">{course.instructor}</p>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-sm text-gray-700">
                      <UsersIcon className="h-4 w-4" /> {course.students} students
                    </span>
                    <span className="text-e-bosy-purple text-md font-bold">
                      {course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Instructor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Students
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredManagedCourses.map(course => (
                  <tr key={course.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/dashboard/manage-courses/${course.id}`} className="text-sm font-medium text-gray-900 hover:text-e-bosy-purple">
                        {course.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {course.instructor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {course.students}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(course.status)}`}>
                        {course.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button>
                      <button className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <p className="text-center text-gray-600 text-lg py-10">No courses found matching your criteria.</p>
      )}
    </div>
  );
};

export default ManageCoursesPage;