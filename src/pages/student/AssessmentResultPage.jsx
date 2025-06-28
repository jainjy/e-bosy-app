import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  CheckCircleIcon,
  XCircleIcon,
  AcademicCapIcon,
  ArrowLeftIcon,
  ArrowDownTrayIcon // Remplacer DocumentDownloadIcon par ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { getData } from '../../services/ApiFetch';
import { toast } from 'react-hot-toast';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const AssessmentResultPage = () => {
  const { submissionId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const [data] = await getData(`assessments/submissions/${submissionId}`);
        setResult(data);
      } catch (error) {
        toast.error("Erreur lors du chargement des résultats");
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [submissionId]);

  if (loading) {
    return (
<LoadingSpinner/>
    );
  }

  const scorePercentage = (result.score / result.assessment.totalScore) * 100;
  const hasPassed = scorePercentage >= 70;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className={`bg-white rounded-xl shadow-lg p-8 ${
          hasPassed ? 'border-t-4 border-green-500' : 'border-t-4 border-red-500'
        }`}>
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${
              hasPassed ? 'bg-green-100' : 'bg-red-100'
            } mb-4`}>
              {hasPassed ? (
                <CheckCircleIcon className="h-10 w-10 text-green-500" />
              ) : (
                <XCircleIcon className="h-10 w-10 text-red-500" />
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {hasPassed ? 'Félicitations !' : 'Continuez vos efforts !'}
            </h1>
            <p className="text-gray-600">
              {hasPassed 
                ? 'Vous avez réussi cette évaluation' 
                : 'Vous pouvez réessayer cette évaluation plus tard'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-e-bosy-purple mb-2">
                  {result.score}/{result.assessment.totalScore}
                </div>
                <div className="text-sm text-gray-600">Score final</div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-e-bosy-purple mb-2">
                  {scorePercentage.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Pourcentage de réussite</div>
              </div>
            </div>
          </div>

          {hasPassed && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
              <div className="flex items-start space-x-4">
                <AcademicCapIcon className="h-6 w-6 text-green-600 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-green-800 mb-2">
                    Certificat disponible
                  </h3>
                  <p className="text-green-700 text-sm mb-4">
                    Vous pouvez maintenant télécharger votre certificat de réussite.
                  </p>
                  <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                    Télécharger le certificat
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-center space-x-4">
            <Link
              to={`/course/${result.assessment.courseId}`}
              className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Retour au cours
            </Link>
            {!hasPassed && (
              <Link
                to={`/assessment/${result.assessment.assessmentId}`}
                className="flex items-center px-6 py-3 bg-e-bosy-purple text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Réessayer
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentResultPage;