import React from 'react';
import { Link } from 'react-router-dom'; // Import Link
import Navbar from '../Components/Navbar';
import { BookOpenIcon, UsersIcon, AcademicCapIcon } from '@heroicons/react/24/outline'; // Import icons

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto p-8 text-center mt-10">
        <h2 className="text-5xl font-bold text-gray-800 mt-16">
          Apprenez avec <span className="text-e-bosy-purple">e-BoSy</span>
        </h2>
        <p className="mt-4 text-xl text-gray-600">
          Découvrez des cours en ligne de qualité, créés par des experts passionnés
        </p>
        <div className="mt-10 space-x-4">
          <Link to="/courses" className="bg-e-bosy-purple text-white px-8 py-3 rounded-md text-lg hover:bg-purple-700 inline-block">
            Explorer les cours
          </Link>
          <Link to="/login" className="border border-e-bosy-purple text-e-bosy-purple px-8 py-3 rounded-md text-lg hover:bg-purple-50 inline-block">
            Se connecter
          </Link>
        </div>

        {/* Section "Pourquoi choisir e-BoSy ?" based on Capture d'écran 2025-05-29 115729.png */}
        <div className="mt-20">
          <h3 className="text-3xl font-bold text-gray-800 mb-8">Pourquoi choisir e-BoSy ?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Cours de qualité */}
            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <BookOpenIcon className="h-8 w-8 text-e-bosy-purple" />
              </div>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">Cours de qualité</h4>
              <p className="text-gray-700 text-center">
                Des cours créés par des experts dans leur domaine avec du contenu mis à jour régulièrement.
              </p>
            </div>

            {/* Communauté active */}
            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <UsersIcon className="h-8 w-8 text-e-bosy-purple" />
              </div>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">Communauté active</h4>
              <p className="text-gray-700 text-center">
                Rejoignez une communauté d'apprenants motivés et échangez avec vos pairs.
              </p>
            </div>

            {/* Certificats reconnus */}
            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <AcademicCapIcon className="h-8 w-8 text-e-bosy-purple" />
              </div>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">Certificats reconnus</h4>
              <p className="text-gray-700 text-center">
                Obtenez des certificats validés à la fin de vos formations pour valoriser vos compétences.
              </p>
            </div>
          </div>
        </div>

        {/* Section for course listings (optional, but seen in Capture d'écran 2025-05-29 115758.png) */}
        <div className="mt-20">
          <h3 className="text-3xl font-bold text-gray-800 mb-8">Nos Cours Populaires</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Example Course Card: Introduction à JavaScript */}
            <div className="bg-white p-6 rounded-lg shadow-md text-left">
              <div className="bg-gray-200 h-40 rounded-md mb-4 flex items-center justify-center">
                {/* Placeholder for course image */}
                <span className="text-gray-500">Image du cours</span>
              </div>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">Introduction à JavaScript</h4>
              <p className="text-gray-600 text-sm mb-4">Apprenez les bases de JavaScript de zéro</p>
              <p className="text-gray-500 text-sm">Par Marie Dupont</p>
              <div className="flex items-center justify-between mt-4 text-gray-700 text-sm">
                <span>🕒 8 heures</span>
                <span>👥 1234</span>
                <span>⭐ 4.8</span>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-e-bosy-purple text-2xl font-bold">49.99€</span>
                <Link to="/courses/javascript-intro" className="bg-e-bosy-purple text-white px-4 py-2 rounded-md hover:bg-purple-700">
                  Voir le cours
                </Link>
              </div>
            </div>

            {/* Example Course Card: React pour débutants */}
            <div className="bg-white p-6 rounded-lg shadow-md text-left">
              <div className="bg-gray-200 h-40 rounded-md mb-4 flex items-center justify-center">
                <span className="text-gray-500">Image du cours</span>
              </div>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">React pour débutants</h4>
              <p className="text-gray-600 text-sm mb-4">Maîtrisez React et créez vos premières applications</p>
              <p className="text-gray-500 text-sm">Par Pierre Martin</p>
              <div className="flex items-center justify-between mt-4 text-gray-700 text-sm">
                <span>🕒 12 heures</span>
                <span>👥 887</span>
                <span>⭐ 4.9</span>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-e-bosy-purple text-2xl font-bold">79.99€</span>
                <Link to="/courses/react-for-beginners" className="bg-e-bosy-purple text-white px-4 py-2 rounded-md hover:bg-purple-700">
                  Voir le cours
                </Link>
              </div>
            </div>

            {/* Example Course Card: Node.js et API REST */}
            <div className="bg-white p-6 rounded-lg shadow-md text-left">
              <div className="bg-gray-200 h-40 rounded-md mb-4 flex items-center justify-center">
                <span className="text-gray-500">Image du cours</span>
              </div>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">Node.js et API REST</h4>
              <p className="text-gray-600 text-sm mb-4">Développez des APIs robustes avec Node.js</p>
              <p className="text-gray-500 text-sm">Par Sophie Bernard</p>
              <div className="flex items-center justify-between mt-4 text-gray-700 text-sm">
                <span>🕒 15 heures</span>
                <span>👥 756</span>
                <span>⭐ 4.7</span>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-e-bosy-purple text-2xl font-bold">99.99€</span>
                <Link to="/courses/nodejs-rest-api" className="bg-e-bosy-purple text-white px-4 py-2 rounded-md hover:bg-purple-700">
                  Voir le cours
                </Link>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default HomePage;