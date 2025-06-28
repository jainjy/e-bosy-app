import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircleIcon, ExclamationCircleIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

const CertificationResultsPage = ({ overallResults, exams, courseId }) => {
    const navigate = useNavigate();

    // Determine if all exams are passed
    const allExamsPassed = overallResults.every((result, idx) => {
        const exam = exams[idx];
        return result && exam && result.score >= exam.totalScore * 0.7;
    });

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col font-sans items-center justify-center p-8">
            <div className="bg-gray-800 rounded-lg shadow-lg p-10 max-w-4xl w-full text-center">
                <h2 className="text-4xl font-bold text-white mb-8 flex items-center justify-center">
                    <AcademicCapIcon className="h-10 w-10 text-e-bosy-purple mr-4" />
                    Résultats de la Certification
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    {overallResults.map((result, idx) => {
                        const exam = exams[idx];
                        const passed = result && exam && result.score >= exam.totalScore * 0.7;
                        const percentage = result && exam ? Math.round((result.score / exam.totalScore) * 100) : 0;
                        
                        // Fallback titles if exam or title is missing
                        const examTitle = exam?.title || `Examen ${idx + 1}`;

                        return (
                            <div key={idx} className={`bg-gray-700 rounded-lg p-6 border-2 ${
                                passed ? 'border-green-500' : 'border-red-500'
                            }`}>
                                <h3 className="text-xl font-semibold text-white mb-3">{examTitle}</h3>
                                <div className="flex items-center justify-center mb-4">
                                    {passed ? (
                                        <CheckCircleIcon className="h-8 w-8 text-green-400 mr-2" />
                                    ) : (
                                        <ExclamationCircleIcon className="h-8 w-8 text-red-400 mr-2" />
                                    )}
                                    <span className="text-3xl font-bold text-white">{percentage}%</span>
                                </div>
                                <p className="text-gray-300 mb-2">Score: {result?.score || 0} / {exam?.totalScore || 'N/A'}</p>
                                <p className={`font-semibold text-lg ${passed ? 'text-green-400' : 'text-red-400'}`}>
                                    {passed ? 'Réussi' : 'Échec'}
                                </p>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-8 flex flex-col items-center space-y-4">
                    {allExamsPassed ? (
                        <>
                            <p className="text-xl text-green-300 font-semibold mb-4">
                                Félicitations ! Vous avez réussi tous les examens de certification.
                            </p>
                            <button
                                onClick={() => navigate(`/certificates/${courseId}`)} // Assuming a route to view certificates
                                className="bg-e-bosy-purple text-white py-3 px-8 rounded-lg hover:bg-purple-700 transition-colors font-semibold text-lg flex items-center justify-center"
                            >
                                <AcademicCapIcon className="h-6 w-6 mr-3" />
                                Obtenir ma certification
                            </button>
                        </>
                    ) : (
                        <>
                            <p className="text-xl text-red-300 font-semibold mb-4">
                                Vous n'avez pas réussi tous les examens. Veuillez réviser et réessayer.
                            </p>
                            <button
                                onClick={() => navigate(`/course/${courseId}`)}
                                className="bg-gray-600 text-white py-3 px-8 rounded-lg hover:bg-gray-700 transition-colors font-semibold text-lg"
                            >
                                Retourner au cours
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CertificationResultsPage;