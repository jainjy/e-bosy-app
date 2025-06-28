import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CheckCircleIcon,
  StarIcon,
  ExclamationCircleIcon,
  ArrowLeftIcon,
  PlayIcon,
  ClockIcon,
  AcademicCapIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline';

const CertificationInstructionsPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToDeclaration, setAgreedToDeclaration] = useState(false);

  const handleStartTest = () => {
    if (agreedToTerms && agreedToDeclaration) {
      navigate(`/course/${courseId}/certification/exam`);
    } else {
      // You can add a toast notification here if needed
      alert("Veuillez accepter toutes les déclarations pour continuer.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 font-sans">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-400 hover:text-e-bosy-purple transition-colors mb-8 text-sm uppercase tracking-wide"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          <span>Retour au cours</span>
        </button>

        <div className="bg-gray-800 rounded-lg shadow-xl p-8 border border-gray-700">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-700">
            <h1 className="text-3xl font-extrabold text-white">
              Examen de Certification
            </h1>
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-purple-700 text-white shadow-lg">
              <AcademicCapIcon className="h-5 w-5 mr-2" />
              Certifié
            </span>
          </div>

          {!showConfirmation ? (
            <>
              {/* Section: Overview/Instructions */}
              <div className="bg-gray-700 rounded-lg p-6 mb-8 border border-gray-600">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                  <LightBulbIcon className="h-6 w-6 text-yellow-400 mr-3" />
                  Avant de Commencer
                </h2>
                <ul className="space-y-4 text-gray-200">
                  <li className="flex items-start">
                    <ClockIcon className="h-5 w-5 text-blue-400 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-white">Gestion du Temps:</span> Le temps est{' '}
                      <b className="text-e-bosy-purple">commun aux deux examens</b>. Une fois le
                      chronomètre lancé, il ne s'arrête pas.
                    </div>
                  </li>
                  <li className="flex items-start">
                    <StarIcon className="h-5 w-5 text-yellow-400 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-white">Score Minimum:</span> Un score de{' '}
                      <b className="text-green-400">70%</b> est requis pour chaque examen afin
                      d'obtenir la certification.
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="h-5 w-5 text-green-400 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-white">Navigation Flexible:</span> Vous
                      pouvez naviguer librement entre les questions et les sections des deux
                      examens.
                    </div>
                  </li>
                  <li className="flex items-start">
                    <ExclamationCircleIcon className="h-5 w-5 text-red-400 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-white">Soumission Finale:</span> La
                      validation finale de votre certification n'est possible qu'après avoir
                      terminé les deux examens.
                    </div>
                  </li>
                </ul>
              </div>

              {/* Section: How it Works */}
              <div className="bg-gray-700 rounded-lg p-6 mb-8 border border-gray-600">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                  <PlayIcon className="h-6 w-6 text-e-bosy-purple mr-3" />
                  Comment ça Marche
                </h2>
                <ol className="space-y-3 text-gray-200 list-decimal list-inside pl-5">
                  <li>
                    <span className="font-semibold text-white">Commencez</span> lorsque vous vous
                    sentez prêt et concentré.
                  </li>
                  <li>
                    <span className="font-semibold text-white">Alternez</span> entre les deux
                    examens à votre convenance.
                  </li>
                  <li>
                    <span className="font-semibold text-white">Revérifiez</span> soigneusement
                    toutes vos réponses avant de procéder à la soumission.
                  </li>
                  <li>
                    <span className="font-semibold text-white">Soumettez</span> les deux examens
                    simultanément à la fin de votre session.
                  </li>
                </ol>
              </div>

              {/* Action Button */}
              <button
                onClick={() => setShowConfirmation(true)}
                className="w-full bg-e-bosy-purple text-white py-4 rounded-lg font-bold text-lg hover:bg-purple-700 transition-all duration-300 flex items-center justify-center space-x-3 transform hover:scale-105 shadow-lg"
              >
                <PlayIcon className="h-6 w-6" />
                <span>Commencer l'Examen de Certification</span>
              </button>
            </>
          ) : (
            // Confirmation Form Section
            <div className="bg-gray-700 rounded-lg p-8 border border-gray-600">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Formulaire de Confirmation
              </h2>
              <p className="text-gray-300 mb-6 text-center">
                Avant de commencer, veuillez confirmer les informations suivantes.
              </p>

              <div className="space-y-6">
                <div className="flex items-center text-gray-200">
                  <input
                    type="checkbox"
                    id="declarationStatement"
                    checked={agreedToDeclaration}
                    onChange={(e) => setAgreedToDeclaration(e.target.checked)}
                    className="form-checkbox h-5 w-5 text-green-500 rounded border-gray-600 bg-gray-900 focus:ring-green-500"
                  />
                  <label htmlFor="declarationStatement" className="ml-3 text-sm leading-6">
                    Je déclare ne pas copier de code de quelque source que ce soit, y compris des collègues, et je m'abstiendrai de consulter des sites web ou des outils d'IA pour obtenir de l'aide. Je m'engage en outre à ne pas copier ni partager de contenu ou de questions de cette évaluation par tout autre moyen ou forum.
                  </label>
                </div>

                <div className="flex items-center text-gray-200">
                  <input
                    type="checkbox"
                    id="termsAndPrivacy"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="form-checkbox h-5 w-5 text-green-500 rounded border-gray-600 bg-gray-900 focus:ring-green-500"
                  />
                  <label htmlFor="termsAndPrivacy" className="ml-3 text-sm leading-6">
                    J'accepte les <a href="#" className="text-e-bosy-purple hover:underline">Conditions d'utilisation</a> et la <a href="#" className="text-e-bosy-purple hover:underline">Politique de confidentialité</a> de la plateforme.
                  </label>
                </div>
              </div>

              <div className="flex justify-center mt-10 space-x-4">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="px-6 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-600 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleStartTest}
                  disabled={!agreedToDeclaration || !agreedToTerms}
                  className={`px-8 py-3 rounded-lg font-bold text-lg transition-all duration-300 ${
                    agreedToDeclaration && agreedToTerms
                      ? 'bg-green-600 text-white hover:bg-green-700 transform hover:scale-105 shadow-lg'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Accepter & Commencer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CertificationInstructionsPage;