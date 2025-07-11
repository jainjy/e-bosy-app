import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { BookOpenIcon, UsersIcon, AcademicCapIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { API_BASE_URL, getData } from '../services/ApiFetch';
import Navbar from '../Components/Navbar';

const DEFAULT_COURSE_IMAGE = "/images/default-course.jpg";
const DEFAULT_AVATAR = "/images/default-avatar.jpg";

const HomePage = () => {
  const [popularCourses, setPopularCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true
    });

    const fetchData = async () => {
      try {
        setLoading(true);
        // Récupérer tous les cours
        const [coursesData, coursesError] = await getData('courses');
        if (coursesError) throw coursesError;

        // Trier les cours par popularité (note moyenne et nombre d'étudiants)
        const sortedCourses = coursesData
          .sort((a, b) => {
            const scoreA = (a.courseRate * 0.6) + (a.studentsEnrolled * 0.4);
            const scoreB = (b.courseRate * 0.6) + (b.studentsEnrolled * 0.4);
            return scoreB - scoreA;
          })
          .slice(0, 3); // Prendre les 3 premiers cours

        setPopularCourses(sortedCourses);

        // Récupérer les enseignants
        const [teachersData, teachersError] = await getData('users/teachers');
        if (teachersError) throw teachersError;
        console.log(teachersData)

        // Trier les enseignants par nombre de cours
        const sortedTeachers = teachersData
          .sort((a, b) => b.coursesCount - a.coursesCount)
          .slice(0, 4); // Prendre les 4 premiers enseignants

        setTeachers(sortedTeachers);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      <main className="container mx-auto p-8 text-center mt-10">
        {/* Hero Section avec animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-pink-100 opacity-20 rounded-3xl transform -skew-y-3"></div>
          <h2 className="text-6xl font-bold text-gray-800 mt-16 relative z-10">
            Apprenez avec{' '}
            <motion.span
              className="text-e-bosy-purple bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              e-BoSy
            </motion.span>
          </h2>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
            Découvrez des cours en ligne de qualité, créés par des experts passionnés
          </p>
          <div className="mt-10 space-x-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <Link to="/courses" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2 group">
                <span>Explorer les cours</span>
                <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <Link to="/login" className="backdrop-blur-md bg-white/30 border border-purple-200 text-purple-600 px-8 py-4 rounded-xl text-lg hover:bg-purple-50 transition-all duration-300">
                Se connecter
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Section "Pourquoi choisir e-BoSy ?" */}
        <div className="mt-32">
          <h3 className="text-3xl font-bold text-gray-800 mb-12" data-aos="fade-up">
            Pourquoi choisir e-BoSy ?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
                data-aos="zoom-in"
                data-aos-delay={index * 100}
                whileHover={{ y: -10 }}
              >
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mb-6 mx-auto transform hover:rotate-6 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-semibold text-gray-800 mb-4">{feature.title}</h4>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Section Cours Populaires */}
        <div className="mt-32">
          <h3 className="text-3xl font-bold text-gray-800 mb-12" data-aos="fade-up">
            Nos Cours les Plus Populaires
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {popularCourses.map((course) => (
              <motion.div
                key={course.courseId}
                className="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
                data-aos="fade-up"
                whileHover={{ y: -10 }}
              >
                <div className="relative overflow-hidden rounded-xl mb-6">
                  <img
                    src={course.thumbnailUrl ? `${API_BASE_URL}/${course.thumbnailUrl}` : DEFAULT_COURSE_IMAGE}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = DEFAULT_COURSE_IMAGE;
                    }}
                  />
                  <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-purple-600">
                    {course.isSubscriberOnly ? 'Premium' : 'Gratuit'}
                  </div>
                </div>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">{course.title}</h4>
                <p className="text-gray-600 text-sm mb-4">{course.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500">{course.teacher.firstName} {course.teacher.lastName}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-500">⭐</span>
                    <span className="text-sm text-gray-600">{course.courseRate.toFixed(1)}</span>
                    <span className="text-sm text-gray-400">({course.totalReviews} avis)</span>
                  </div>
                </div>
                <div className="text-sm text-gray-500 mb-4">
                  {course.studentsEnrolled} étudiants inscrits
                </div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={`/courses/${course.courseId}`}
                    className="block w-full text-center bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl hover:shadow-lg transition-all duration-300"
                  >
                    Voir le cours
                  </Link>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Section Enseignants */}
        <div className="mt-32">
          <h3 className="text-3xl font-bold text-gray-800 mb-12" data-aos="fade-up">
            Nos Meilleurs Enseignants
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teachers.map((teacher) => (
              <motion.div
                key={teacher.userId}
                className="bg-white p-6 rounded-2xl shadow-2xl hover:shadow-2xl transition-all duration-300"
                data-aos="fade-up"
                whileHover={{ y: -10 }}
              >
                <div className="relative mb-4">
                  <img
                    src={teacher.profilePictureUrl ? `${API_BASE_URL}/${teacher.profilePictureUrl}` : DEFAULT_AVATAR}
                    alt={`${teacher.firstName} ${teacher.lastName}`}
                    className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-purple-100"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = DEFAULT_AVATAR;
                    }}
                  />
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2 text-center">
                  {teacher.firstName} {teacher.lastName}
                </h4>
                <p className="text-sm text-gray-600 mb-3 text-center">{teacher.specialty || 'Instructeur'}</p>
                <div className="text-center text-sm text-gray-500">
                  <p>{teacher.coursesCount} cours</p>
                  <p>{teacher.studentsCount} étudiants</p>
                </div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-4"
                >
                  <Link
                    to={`/teacher/${teacher.userId}`}
                    className="block w-full text-center bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl hover:shadow-lg transition-all duration-300"
                  >
                    Voir le profil
                  </Link>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

const features = [
  {
    icon: <BookOpenIcon className="h-10 w-10 text-purple-600" />,
    title: "Cours de qualité",
    description: "Des cours créés par des experts dans leur domaine avec du contenu mis à jour régulièrement."
  },
  {
    icon: <UsersIcon className="h-10 w-10 text-purple-600" />,
    title: "Communauté active",
    description: "Rejoignez une communauté d'apprenants motivés et échangez avec vos pairs."
  },
  {
    icon: <AcademicCapIcon className="h-10 w-10 text-purple-600" />,
    title: "Certificats reconnus",
    description: "Obtenez des certificats valides à la fin de vos formations pour valoriser vos compétences."
  }
];

export default HomePage;