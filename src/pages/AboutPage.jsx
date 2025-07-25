import React from "react";
import Navbar from "../components/Navbar";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-24 px-4 max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
          <h1 className="text-4xl font-bold text-e-bosy-purple mb-8">À propos de e-BoSy</h1>
          
          <div className="space-y-6 text-gray-600">
            <p className="text-lg">
              e-BoSy est une plateforme d'apprentissage en ligne innovante conçue pour 
              offrir une expérience éducative de haute qualité à nos apprenants.
            </p>

            <div className="grid md:grid-cols-2 gap-8 mt-12">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Notre Mission</h2>
                <p>
                  Nous nous engageons à rendre l'éducation accessible à tous, en 
                  proposant des cours de qualité et des outils pédagogiques innovants.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Notre Vision</h2>
                <p>
                  Devenir la référence en matière d'apprentissage en ligne en offrant 
                  une expérience personnalisée et interactive.
                </p>
              </div>
            </div>

            <div className="mt-12">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Nos Valeurs</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Excellence académique</li>
                <li>Innovation pédagogique</li>
                <li>Accessibilité</li>
                <li>Accompagnement personnalisé</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
