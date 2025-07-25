import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { BookOpenIcon, UsersIcon, AcademicCapIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { API_BASE_URL, getData } from '../services/ApiFetch';
import Navbar from '../components/Navbar';

const DEFAULT_COURSE_IMAGE = "/images/default-course.jpg";
const DEFAULT_AVATAR = "/images/default-avatar.jpg";

// Features remain unchanged
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
    title: "Certifications",
    description: "Obtenez des certificats valides à la fin de vos formations pour valoriser vos compétences."
  }
];

const HomePage = () => {
  const [popularCourses, setPopularCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
    const fetchData = async () => {
      try {
        setLoading(true);
        const [coursesData, coursesError] = await getData('courses');
        if (coursesError) throw coursesError;
        const sortedCourses = coursesData
          .sort((a, b) => (b.courseRate * 0.6 + b.studentsEnrolled * 0.4) - (a.courseRate * 0.6 + a.studentsEnrolled * 0.4))
          .slice(0, 3);
        setPopularCourses(sortedCourses);
        const [teachersData, teachersError] = await getData('users/teachers');
        if (teachersError) throw teachersError;
        setTeachers(teachersData.sort((a, b) => b.coursesCount - a.coursesCount).slice(0, 4));
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-x-hidden">
      {/* Hero Section full background */}
      <div
        className="relative min-h-screen flex flex-col"
        style={{
          backgroundImage: "url('/images/hero-bg.png')",
          backgroundSize: 'cover', backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-purple-50/30 to-white/40 z-0" />
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center px-4 pb-24 z-10 relative mt-4">
          {/* Hero animated */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
            className="w-full max-w-3xl text-center space-y-8"
          >
            <h1 className="font-extrabold text-gray-800 text-5xl md:text-6xl tracking-tight drop-shadow leading-tight">
              Apprenez avec{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-700 via-pink-500 to-fuchsia-500 animate-gradient-x">
                e-BoSy
              </span>
            </h1>
            <p className="mt-2 text-xl md:text-2xl text-gray-700 font-normal drop-shadow">
              Découvrez des cours en ligne de qualité, créés par des experts passionnés. Formez-vous à votre rythme, toute l'année.
            </p>
            <div className="mt-8 flex justify-center gap-6">
              <Link
                to="/courses"
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full text-lg shadow-xl hover:from-purple-700 hover:to-pink-600 transition-transform duration-300 transform hover:scale-105 flex items-center gap-2 font-semibold outline-none focus:ring-4 focus:ring-purple-300"
              >
                Explorer les cours
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="bg-white/80 text-purple-600 px-8 py-4 rounded-full text-lg shadow hover:bg-purple-100 border border-purple-200 transition-all duration-300 font-semibold outline-none focus:ring-4 focus:ring-purple-200"
              >
                Se connecter
              </Link>
            </div>
          </motion.div>
        </main>
        {/* Faux séparateur flottant bas */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />
      </div>

      {/* Section Pourquoi choisir e-BoSy avec fond */}
      <section
        className="py-24 relative"
        style={{
          backgroundImage: "url('/images/section-bg.png')",
          backgroundRepeat: 'repeat',
        }}
      >
        <div className="container mx-auto px-4">
          <motion.h3
            className="text-3xl font-bold text-gray-800 mb-12 text-center"
            data-aos="fade-up"
          >
            Pourquoi choisir <span className="text-e-bosy-purple">e-BoSy</span> ?
          </motion.h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                className="bg-white/90 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border-l-4 border-e-bosy-purple"
                data-aos="zoom-in"
                data-aos-delay={idx * 100}
                whileHover={{ y: -8, scale: 1.03 }}
              >
                <div className="w-16 h-16 mx-auto flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-200 rounded-2xl mb-6 animate-pulse">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-semibold text-gray-800 mb-3 text-center">{feature.title}</h4>
                <p className="text-gray-600 text-base text-center">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Séparateur */}
      <div className="w-full flex justify-center py-10">
        <span className="w-32 h-1 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-40" />
      </div>

      {/* Section Cours Populaires avec fond subtil */}
      <section
        className="py-20 bg-gradient-to-b from-purple-50/20 via-white/80 to-pink-50/10 backdrop-blur-sm"
      >
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-gray-800 mb-12 text-center" data-aos="fade-up">
            Nos Cours les Plus Populaires
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {popularCourses.map((course) => (
              <motion.div
                key={course.courseId}
                className="bg-white p-6 rounded-3xl shadow-2xl hover:shadow-3xl border border-purple-50 transition-all duration-300"
                data-aos="fade-up"
                whileHover={{ y: -8 }}
              >
                <div className="relative mb-6 overflow-hidden rounded-xl">
                  <img
                    src={course.thumbnailUrl ? `${API_BASE_URL}/${course.thumbnailUrl}` : DEFAULT_COURSE_IMAGE}
                    alt={course.title}
                    className="w-full h-48 object-cover transform hover:scale-105 transition-transform duration-200"
                    onError={e => { e.target.onerror = null; e.target.src = DEFAULT_COURSE_IMAGE; }}
                  />
                  <div className="absolute top-2 left-2 bg-white/80 px-3 py-1 rounded-full text-xs font-semibold text-purple-600 shadow">{course.isSubscriberOnly ? 'Premium' : 'Gratuit'}</div>
                </div>
                <h4 className="text-lg font-bold text-gray-800 mb-2">{course.title}</h4>
                <p className="text-gray-600 text-sm mb-3">{course.description}</p>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">{course.teacher.firstName} {course.teacher.lastName}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-400">★</span>
                    <span className="text-sm text-gray-700 bg-yellow-50 px-2 rounded">{course.courseRate.toFixed(1)} ({course.totalReviews})</span>
                  </div>
                </div>
                <div className="text-xs text-purple-800 mb-4">{course.studentsEnrolled} étudiants inscrits</div>
                <Link
                  to={`/course/${course.courseId}`}
                  className="block w-full text-center bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-xl shadow hover:shadow-lg font-medium transition-all duration-300"
                >
                  Voir le cours
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Séparateur */}
      <div className="w-full flex justify-center py-8">
        <span className="w-24 h-1 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 opacity-30" />
      </div>

      {/* Section Enseignants */}
      <section className="py-16 bg-white">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-gray-800 mb-12 text-center" data-aos="fade-up">
            Nos Meilleurs Enseignants
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {teachers.map((teacher) => (
              <motion.div
                key={teacher.userId}
                className="bg-gradient-to-tl from-purple-50/60 via-white/80 to-pink-50/40 border border-purple-50 shadow-xl p-6 rounded-2xl hover:shadow-2xl transition-all duration-300 flex flex-col items-center"
                data-aos="fade-up"
                whileHover={{ y: -6, scale: 1.03 }}
              >
                <img
                  src={teacher.profilePictureUrl ? `${API_BASE_URL}/${teacher.profilePictureUrl}` : DEFAULT_AVATAR}
                  alt={`${teacher.firstName} ${teacher.lastName}`}
                  className="w-24 h-24 rounded-full object-cover border-4 border-purple-100 mb-4 shadow-lg"
                  onError={e => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR; }}
                />
                <h4 className="text-lg font-bold text-gray-800 mb-1 text-center">{teacher.firstName} {teacher.lastName}</h4>
                <p className="text-xs text-pink-600 mb-1 text-center">{teacher.specialty || "Instructeur"}</p>
                <div className="text-sm text-gray-600 text-center mb-3 flex flex-col gap-0.5">
                  <span>{teacher.coursesCount} cours</span>
                  <span>{teacher.studentsCount} étudiants</span>
                </div>
                <Link
                  to={`/teacher/${teacher.userId}`}
                  className="mt-2 block text-center bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-8 rounded-xl shadow hover:shadow-lg transition-all font-semibold"
                >
                  Voir le profil
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
