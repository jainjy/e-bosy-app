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
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast'; // Assuming you have react-hot-toast installed for better notifications

const CertificationInstructionsPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToDeclaration, setAgreedToDeclaration] = useState(false);

  const handleStartTest = () => {
    if (agreedToTerms && agreedToDeclaration) {
      navigate(`/course/${courseId}/certification/exam`);
    } else {
      toast.error("Veuillez accepter toutes les déclarations pour continuer.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-6 font-sans">
      <div className="max-w-4xl mx-auto py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-e-bosy-purple transition-colors mb-8 text-sm font-medium"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          <span>Retour au cours</span>
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
            <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">
              Examen de Certification
            </h1>
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-e-bosy-purple text-white shadow-md">
              <AcademicCapIcon className="h-5 w-5 mr-2" />
              Certifié
            </span>
          </div>

          {/* Section: Overview/Instructions */}
          <div className="bg-white rounded-lg p-0 mb-8 border-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <ClipboardDocumentCheckIcon className="h-7 w-7 text-e-bosy-purple mr-3" />
              Instructions importantes
            </h2>
            <ul className="space-y-5 text-gray-700">
              <li className="flex items-start">
                <ClockIcon className="h-6 w-6 text-blue-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <strong className="text-gray-900">Gestion du Temps:</strong> Le temps est{' '}
                  <b className="text-e-bosy-purple">commun aux deux examens</b>. Une fois le
                  chronomètre lancé, il ne s'arrête pas. Assurez-vous d'être prêt(e) avant de commencer.
                </div>
              </li>
              <li className="flex items-start">
                <StarIcon className="h-6 w-6 text-yellow-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <strong className="text-gray-900">Score Minimum:</strong> Un score de{' '}
                  <b className="text-green-600">70%</b> est requis pour chaque examen afin
                  d'obtenir la certification. Préparez-vous bien !
                </div>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <strong className="text-gray-900">Navigation Flexible:</strong> Vous
                  pouvez naviguer librement entre les questions et les sections des deux
                  examens. N'hésitez pas à revoir vos réponses.
                </div>
              </li>
              <li className="flex items-start">
                <ExclamationCircleIcon className="h-6 w-6 text-red-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <strong className="text-gray-900">Soumission Finale:</strong> La
                  validation finale de votre certification n'est possible qu'après avoir
                  terminé les deux examens.
                </div>
              </li>
            </ul>
          </div>

          {/* Section: Confirmation Form (now directly below instructions) */}
          <div className="bg-white rounded-lg p-0 border-none pt-8 border-t border-gray-100 mt-8"> {/* Added top border for separation */}
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Confirmation d'Intégrité
            </h2>
            <p className="text-gray-700 mb-8 text-center">
              Pour garantir l'équité de l'examen, veuillez accepter les déclarations suivantes.
            </p>

            <div className="space-y-6">
              <div className="flex items-start text-gray-700">
                <input
                  type="checkbox"
                  id="declarationStatement"
                  checked={agreedToDeclaration}
                  onChange={(e) => setAgreedToDeclaration(e.target.checked)}
                  className="form-checkbox h-5 w-5 text-e-bosy-purple rounded border-gray-300 bg-white focus:ring-e-bosy-purple flex-shrink-0 mt-1"
                />
                <label htmlFor="declarationStatement" className="ml-3 text-base leading-relaxed">
                  Je déclare ne pas copier de code de quelque source que ce soit, y compris des collègues, et je m'abstiendrai de consulter des sites web ou des outils d'IA pour obtenir de l'aide. Je m'engage en outre à ne pas copier ni partager de contenu ou de questions de cette évaluation par tout autre moyen ou forum. Je comprends que toute infraction entraînera l'annulation de ma certification.
                </label>
              </div>

              <div className="flex items-start text-gray-700">
                <input
                  type="checkbox"
                  id="termsAndPrivacy"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="form-checkbox h-5 w-5 text-e-bosy-purple rounded border-gray-300 bg-white focus:ring-e-bosy-purple flex-shrink-0 mt-1"
                />
                <label htmlFor="termsAndPrivacy" className="ml-3 text-base leading-relaxed">
                  J'accepte les <a href="#" className="text-e-bosy-purple hover:underline font-semibold">Conditions d'utilisation</a> et la <a href="#" className="text-e-bosy-purple hover:underline font-semibold">Politique de confidentialité</a> de la plateforme.
                </label>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-center mt-10">
            <button
              onClick={handleStartTest}
              disabled={!agreedToDeclaration || !agreedToTerms}
              className={`px-10 py-3 rounded-lg font-bold text-xl transition-all duration-300 ${
                agreedToDeclaration && agreedToTerms
                  ? 'bg-e-bosy-purple text-white hover:bg-purple-700 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-e-bosy-purple focus:ring-opacity-50'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              <PlayIcon className="h-7 w-7 mr-3" /> {/* Icon inside button */}
              Accepter & Commencer l'Examen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificationInstructionsPage;