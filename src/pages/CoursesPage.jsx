
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'; // For the search icon
import { StarIcon } from '@heroicons/react/20/solid'; // For filled star icon
import { ClockIcon, UsersIcon, BookOpenIcon } from '@heroicons/react/24/outline'; // For clock and users icons

const CoursesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [sortBy, setSortBy] = useState('Most Popular');

  // Dummy course data (you would fetch this from an API)
  const allCourses = [
    {
      id: 1,
      title: 'Complete Web Development Bootcamp',
      description: 'Learn HTML, CSS, JavaScript, React, Node.js and more with practical projects',
      instructor: 'Jane Cooper',
      duration: '48 hours',
      lessons: '42 lessons',
      students: 12431, // Changed to number for easier sorting
      rating: 4.8,
      price: 49.99,
      category: 'Web Development',
      level: 'Beginner',
      imageUrl: 'https://via.placeholder.com/300x180?text=Web+Dev+Course'
    },
    {
      id: 2,
      title: 'Data Science and Machine Learning Masterclass',
      description: 'Comprehensive guide to data science, machine learning, and AI with Python',
      instructor: 'Robert Fox',
      duration: '36 hours',
      lessons: '36 lessons',
      students: 8765,
      rating: 4.9,
      price: 59.99,
      category: 'Data Science',
      level: 'Intermediate',
      imageUrl: 'https://via.placeholder.com/300x180?text=Data+Science+Course'
    },
    {
      id: 3,
      title: 'UI/UX Design Fundamentals',
      description: 'Master the principles of user interface and user experience design',
      instructor: 'Wade Warren',
      duration: '24 hours',
      lessons: '28 lessons',
      students: 6543,
      rating: 4.7,
      price: 39.99,
      category: 'Design',
      level: 'Beginner',
      imageUrl: 'https://via.placeholder.com/300x180?text=UI/UX+Design'
    },
    {
      id: 4,
      title: 'React Native Mobile App Development',
      description: 'Build cross-platform mobile apps for iOS and Android with React Native',
      instructor: 'Cameron Williamson',
      duration: '40 hours',
      lessons: '38 lessons',
      students: 9123,
      rating: 4.6,
      price: 69.99,
      category: 'Mobile Development',
      level: 'Intermediate',
      imageUrl: 'https://via.placeholder.com/300x180?text=React+Native'
    },
    {
      id: 5,
      title: 'Python for Data Analysis and Visualization',
      description: 'Learn to analyze and visualize data with Python, Pandas, and Matplotlib',
      instructor: 'Floyd Miles',
      duration: '30 hours',
      lessons: '30 lessons',
      students: 7890,
      rating: 4.7,
      price: 45.00,
      category: 'Data Science',
      level: 'Beginner',
      imageUrl: 'https://via.placeholder.com/300x180?text=Python+Data'
    },
    {
      id: 6,
      title: 'Advanced JavaScript Programming',
      description: 'Deep dive into advanced JavaScript concepts, patterns, and best practices',
      instructor: 'Leslie Alexander',
      duration: '50 hours',
      lessons: '45 lessons',
      students: 5678,
      rating: 4.9,
      price: 89.99,
      category: 'Web Development',
      level: 'Advanced',
      imageUrl: 'https://via.placeholder.com/300x180?text=Advanced+JS'
    },
    {
      id: 7,
      title: 'Digital Marketing Strategies',
      description: 'Comprehensive guide to digital marketing, SEO, SEM, and social media',
      instructor: 'Esther Howard',
      duration: '20 hours',
      lessons: '25 lessons',
      students: 4567,
      rating: 4.5,
      price: 34.99,
      category: 'Marketing',
      level: 'Beginner',
      imageUrl: 'https://via.placeholder.com/300x180?text=Digital+Marketing'
    },
  ];

  const categories = ['Web Development', 'Data Science', 'Design', 'Mobile Development', 'Marketing', 'Business'];
  const levels = ['Beginner', 'Intermediate', 'Advanced'];

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

  const filteredCourses = allCourses.filter(course => {
    const matchesSearchTerm = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategories = selectedCategories.length === 0 || selectedCategories.includes(course.category);
    const matchesLevels = selectedLevels.length === 0 || selectedLevels.includes(course.level);
    return matchesSearchTerm && matchesCategories && matchesLevels;
  }).sort((a, b) => {
    if (sortBy === 'Most Popular') {
      return b.students - a.students; // Sort by student count
    } else if (sortBy === 'Newest') {
      // For demo, we can just sort by ID or add a 'date' field
      return b.id - a.id;
    } else if (sortBy === 'Price: Low to High') {
      return a.price - b.price;
    } else if (sortBy === 'Price: High to Low') {
      return b.price - a.price;
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-50 pt-20"> {/* Added pt-20 for fixed navbar */}
      <Navbar />
      <main className="container mx-auto p-8">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-gray-800 mb-2">Explore Our Courses</h2>
          <p className="text-lg text-gray-600">
            Discover the perfect course to enhance your skills and boost your career with our
            comprehensive selection of high-quality courses.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Section */}
          <aside className="w-full lg:w-1/4 bg-white p-6 rounded-lg shadow-md h-fit sticky top-24"> {/* Adjusted top for sticky filter */}
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.75 0 5 2.25 5 5S14.75 13 12 13 7 10.75 7 8 9.25 3 12 3Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7Z" />
              </svg>
              Filters
            </h3>

            {/* Categories Filter */}
            <div className="mb-6">
              <h4 className="text-md font-semibold text-gray-700 mb-3">Categories</h4>
              {categories.map(category => (
                <div key={category} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id={`category-${category}`}
                    value={category}
                    checked={selectedCategories.includes(category)}
                    onChange={handleCategoryChange}
                    className="h-4 w-4 text-e-bosy-purple border-gray-300 rounded focus:ring-e-bosy-purple"
                  />
                  <label htmlFor={`category-${category}`} className="ml-2 text-sm text-gray-700">
                    {category}
                  </label>
                </div>
              ))}
            </div>

            {/* Level Filter */}
            <div>
              <h4 className="text-md font-semibold text-gray-700 mb-3">Level</h4>
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

          {/* Course Listings Section */}
          <div className="w-full lg:w-3/4">
            {/* Search and Sort */}
            <div className="flex flex-col md:flex-row items-center justify-between bg-white p-4 rounded-lg shadow-md mb-6">
              <div className="relative w-full md:w-2/3 mr-0 md:mr-4 mb-4 md:mb-0">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
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
                  <option>Most Popular</option>
                  <option>Newest</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Showing Results */}
            <p className="text-gray-600 text-sm mb-6">
              Showing {filteredCourses.length} results
              {searchTerm && ` for "${searchTerm}"`}
              {(selectedCategories.length > 0 || selectedLevels.length > 0) &&
                ` with filters: ${[...selectedCategories, ...selectedLevels].join(', ')}`}
            </p>

            {/* Course Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.length > 0 ? (
                filteredCourses.map(course => (
                  <Link to={`/courses/${course.id}`} key={course.id} className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
                    <div className="relative h-40 bg-gray-200 flex items-center justify-center overflow-hidden">
                      {/* Placeholder for course image */}
                      <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover" />
                      <span className="absolute top-2 left-2 bg-e-bosy-purple text-white text-xs font-semibold px-2 py-1 rounded-full">
                        {course.level}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate">{course.title}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                      <p className="text-xs text-gray-500 mb-3">By {course.instructor}</p>
                      <div className="flex items-center justify-between text-gray-700 text-sm mb-3">
                        <span className="flex items-center gap-1">
                          <ClockIcon className="h-4 w-4" /> {course.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpenIcon className="h-4 w-4" /> {course.lessons}
                        </span>
                        <span className="flex items-center gap-1">
                          <UsersIcon className="h-4 w-4" /> {course.students.toLocaleString()} students
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-e-bosy-purple text-xl font-bold">${course.price.toFixed(2)}</span>
                        <span className="flex items-center gap-1 text-gray-700">
                          <StarIcon className="h-4 w-4 text-yellow-400" /> {course.rating}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full text-center py-10 text-gray-600">
                  No courses found matching your criteria.
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