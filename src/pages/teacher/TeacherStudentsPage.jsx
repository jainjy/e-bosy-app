import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  UsersIcon, 
  ChatBubbleLeftIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { API_BASE_URL, getData } from '../../services/ApiFetch';

const TeacherStudentsPage = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [progressFilter, setProgressFilter] = useState('all');
  const [courses, setCourses] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [enrollmentsData] = await getData(`/enrollments/teacher/${user.userId}/students`);
        const [coursesData] = await getData(`/courses/teacher/${user.userId}`);
        
        const uniqueStudents = enrollmentsData.reduce((acc, enrollment) => {
          const existingStudent = acc.find(s => s.user.userId === enrollment.user.userId);
          if (existingStudent) {
            existingStudent.courses.push({
              courseId: enrollment.courseId,
              title: enrollment.course.title,
              completionRate: enrollment.completionRate
            });
          } else {
            acc.push({
              user: enrollment.user,
              courses: [{
                courseId: enrollment.courseId,
                title: enrollment.course.title,
                completionRate: enrollment.completionRate
              }],
              lastActivityAt: enrollment.lastActivityAt,
              averageCompletionRate: enrollment.completionRate
            });
          }
          return acc;
        }, []);

        setStudents(uniqueStudents);
        setFilteredStudents(uniqueStudents);
        setCourses(coursesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.userId) {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    let results = [...students];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(student => 
        student.user?.firstName.toLowerCase().includes(term) ||
        student.user?.lastName.toLowerCase().includes(term) ||
        student.user?.email.toLowerCase().includes(term)
      );
    }

    if (selectedCourse) {
      results = results.filter(student => 
        student.courses.some(course => course.courseId.toString() === selectedCourse)
      );
    }

    if (progressFilter !== 'all') {
      switch (progressFilter) {
        case 'low':
          results = results.filter(student => 
            student.courses.some(course => course.completionRate < 30)
          );
          break;
        case 'medium':
          results = results.filter(student => 
            student.courses.some(course => 
              course.completionRate >= 30 && course.completionRate < 60
            )
          );
          break;
        case 'high':
          results = results.filter(student => 
            student.courses.some(course => course.completionRate >= 60)
          );
          break;
        case 'inactive':
          results = results.filter(student => 
            !student.lastActivityAt || 
            new Date(student.lastActivityAt) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          );
          break;
        default:
          break;
      }
    }

    setFilteredStudents(results);
  }, [searchTerm, selectedCourse, progressFilter, students]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCourse('');
    setProgressFilter('all');
    setFilteredStudents(students);
  };

  const ProgressModal = ({ student, onClose }) => {
    if (!student) return null;
    
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl"
        >
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <div className="flex items-center space-x-4">
              {student.user.profilePictureUrl ? (
                <img 
                  src={API_BASE_URL + student.user.profilePictureUrl} 
                  alt={`${student.user.firstName}`}
                  className="h-12 w-12 rounded-full object-cover border-2 border-indigo-500"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                  <UsersIcon className="h-6 w-6 text-indigo-500" />
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  {student.user.firstName} {student.user.lastName}
                </h3>
                <p className="text-sm text-gray-500">{student.user.email}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XMarkIcon className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {student.courses.map((course) => (
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                key={course.courseId} 
                className="bg-gray-50 p-4 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium text-gray-800">{course.title}</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    course.completionRate < 30 ? 'bg-red-100 text-red-800' :
                    course.completionRate < 60 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {course.completionRate}%
                  </span>
                </div>
                <div className="relative pt-1">
                  <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-200">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${course.completionRate}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                        course.completionRate < 30 ? 'bg-red-500' :
                        course.completionRate < 60 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t">
            <p className="text-sm text-gray-500">
              Progression moyenne : 
              <span className="font-semibold text-gray-800 ml-1">
                {Math.round(student.courses.reduce((acc, course) => acc + course.completionRate, 0) / student.courses.length)}%
              </span>
            </p>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Tous mes étudiants</h3>
        <div className="flex space-x-2">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-200"
          >
            <FunnelIcon className="h-4 w-4 mr-1" />
            Filtres
          </button>
        </div>
      </div>

      <div className="mb-4 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Rechercher un étudiant ou un cours..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium text-gray-700">Filtres avancés</h4>
            <button 
              onClick={resetFilters}
              className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
            >
              <XMarkIcon className="h-3 w-3 mr-1" />
              Réinitialiser
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="course-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Par cours
              </label>
              <select
                id="course-filter"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                <option value="">Tous les cours</option>
                {courses.map((course) => (
                  <option key={course.courseId} value={course.courseId}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="progress-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Par progression
              </label>
              <select
                id="progress-filter"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={progressFilter}
                onChange={(e) => setProgressFilter(e.target.value)}
              >
                <option value="all">Tous</option>
                <option value="low">Faible (&lt; 30%)</option>
                <option value="medium">Moyenne (30-60%)</option>
                <option value="high">Élevée (&gt; 60%)</option>
                <option value="inactive">Inactifs (30+ jours)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4 text-sm text-gray-500">
        {filteredStudents.length} étudiant(s) trouvé(s)
      </div>

      <div className="overflow-x-auto ring-1 ring-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Étudiant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cours inscrits</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progression moyenne</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dernière activité</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStudents.map((student, index) => (
              <motion.tr 
                key={student.user.userId}
                className="hover:bg-gray-50 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {student.user.profilePictureUrl ? (
                      <img 
                        className="h-10 w-10 rounded-full" 
                        src={API_BASE_URL + student.user.profilePictureUrl} 
                        alt={`${student.user.firstName} ${student.user.lastName}`}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <UsersIcon className="h-5 w-5 text-gray-500" />
                      </div>
                    )}
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {student.user.firstName} {student.user.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{student.user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.courses.length} cours
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {Math.round(student.courses.reduce((acc, course) => acc + course.completionRate, 0) / student.courses.length)}%
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="h-2 rounded-full transition-all duration-1000 ease-out bg-indigo-600"
                      style={{ 
                        width: `${Math.round(student.courses.reduce((acc, course) => acc + course.completionRate, 0) / student.courses.length)}%`
                      }}
                    ></div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.lastActivityAt ? 
                    new Date(student.lastActivityAt).toLocaleDateString('fr-FR', { 
                      day: 'numeric', 
                      month: 'short' 
                    }) : 
                    'Jamais'
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                  <button 
                    onClick={() => {
                      setSelectedStudent(student);
                      setShowProgressModal(true);
                    }}
                    className="inline-flex items-center px-3 py-1.5 border border-indigo-600 rounded-full text-indigo-600 hover:bg-indigo-50 transition-colors"
                  >
                    <ChartBarIcon className="h-4 w-4 mr-1.5" /> 
                    Progression
                  </button>
                  <Link 
                    to={`/messages/${student.user.userId}`} 
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <ChatBubbleLeftIcon className="h-4 w-4 mr-1.5" /> 
                    Message
                  </Link>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <AnimatePresence>
        {showProgressModal && (
          <ProgressModal 
            student={selectedStudent} 
            onClose={() => {
              setShowProgressModal(false);
              setSelectedStudent(null);
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeacherStudentsPage;