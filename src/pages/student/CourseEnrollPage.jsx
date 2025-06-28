import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getData, postData } from '../../services/ApiFetch';
import { useAuth } from '../../contexts/AuthContext';
import {
  CheckCircleIcon,
  BookOpenIcon,
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import Navbar from '../../Components/Navbar';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const CourseEnrollPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const [data, error] = await getData(`courses/${courseId}`);
        if (error) throw error;
        setCourse(data);
      } catch (err) {
        toast.error("Erreur lors du chargement du cours");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setEnrolling(true);
      const [data, error] = await postData('enrollments', {
        userId: user.userId, // Assurez-vous d'utiliser la bonne propriété de l'utilisateur
        courseId: parseInt(courseId),
        status: 'en_cours' // Ajout du statut initial
      });

      if (error) throw error;

      toast.success("Inscription réussie !");
      navigate(`/course/${courseId}`);
    } catch (err) {
      console.error('Erreur détaillée:', err);
      toast.error(err.message || "Erreur lors de l'inscription");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <Navbar />
      <LoadingSpinner/>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{course?.title}</h1>
          <p className="text-lg text-gray-600 mb-8">{course?.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Informations du cours */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6">Ce que vous apprendrez</h2>
              <ul className="space-y-4">
                <li className="flex items-center text-gray-700">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                  <span>Accès à {course?.lessonsCount || 0} leçons complètes</span>
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                  <span>Certificat d'achèvement</span>
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                  <span>Accès illimité au contenu</span>
                </li>
              </ul>

              <div className="mt-8 border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Détails du cours</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center text-gray-600">
                    <BookOpenIcon className="h-5 w-5 mr-2" />
                    <span>{course?.lessonsCount || 0} leçons</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <ClockIcon className="h-5 w-5 mr-2" />
                    <span>Accès à vie</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <UserIcon className="h-5 w-5 mr-2" />
                    <span>{course?.teacher?.firstName} {course?.teacher?.lastName}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <AcademicCapIcon className="h-5 w-5 mr-2" />
                    <span>{course?.level}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Carte d'inscription */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">
                  {course?.isSubscriberOnly ? 'Cours Premium' : 'Cours Gratuit'}
                </h2>
                <p className="text-gray-600 mb-6">
                  {course?.isSubscriberOnly ? 
                    'Nécessite un abonnement Premium' : 
                    'Accessible à tous gratuitement'}
                </p>
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className={`w-full py-3 px-6 rounded-md text-white font-semibold 
                    ${course?.isSubscriberOnly ? 
                      'bg-yellow-500 hover:bg-yellow-600' : 
                      'bg-e-bosy-purple hover:bg-purple-700'} 
                    transition-colors disabled:opacity-50`}
                >
                  {enrolling ? 'Inscription en cours...' : "S'inscrire maintenant"}
                </button>
              </div>

              <div className="mt-8 border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Ce qui est inclus</h3>
                <ul className="space-y-3">
                  <li className="flex items-center text-gray-600">
                    <DocumentTextIcon className="h-5 w-5 mr-3" />
                    <span>Ressources téléchargeables</span>
                  </li>
                  <li className="flex items-center text-gray-600">
                    <AcademicCapIcon className="h-5 w-5 mr-3" />
                    <span>Certificat d'achèvement</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CourseEnrollPage;