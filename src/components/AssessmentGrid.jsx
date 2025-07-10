// src/components/AssessmentGrid.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ClipboardDocumentCheckIcon,
  ClockIcon,
  QuestionMarkCircleIcon,
  StarIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ChartBarIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import generateExercisePDF from '../utils/generateExercisePdf';


const AssessmentGrid = ({ assessments, userProgress, courseId, courseTitle, type = 'exercise' }) => {
  if (!assessments || assessments.length === 0) {
    console.log(assessments, 'Aucun exercice ou examen trouvé');
    return (
      <div className="col-span-full text-center py-12">
        <ClipboardDocumentCheckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">
          Aucun {type === 'exam' ? 'examen' : 'exercice'} disponible
        </h3>
        <p className="mt-2 text-gray-500">
          Ce cours n'a pas encore d'{type === 'exam' ? 'examens' : 'évaluations'}.
        </p>
      </div>
    );
  }

  const handleDownloadPDF = (assessment) => {
    console.log('Téléchargement du PDF pour l\'évaluation:', assessment);
    const doc = generateExercisePDF(assessment, userProgress, courseTitle);
    doc.save(`exercice-${assessment.assessmentId}-${assessment.title}.pdf`);
  };

  // Couleurs unifiées pour les exercices et les examens
  const primaryColorClass = 'border-l-e-bosy-purple';
  const hoverPrimaryColorClass = 'hover:border-l-purple-700';
  const bgColorClass = 'bg-purple-100';
  const textColorClass = 'text-e-bosy-purple';
  const buttonBgClass = 'bg-e-bosy-purple hover:bg-purple-700';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {assessments.map((assessment) => {
        const submission = userProgress[assessment.assessmentId];
        const isCompleted = !!submission;
        return (
          <motion.div
            key={assessment.assessmentId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border-l-4 ${primaryColorClass} ${hoverPrimaryColorClass}`}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${bgColorClass} ${textColorClass}`}>
                  <ClipboardDocumentCheckIcon className="h-4 w-4 mr-1.5" />
                  {type === 'exam' ? 'Examen' : 'Exercice'}
                </span>
                {isCompleted && (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    submission.score >= (assessment.totalScore * 0.7)
                      ? 'bg-green-100 text-green-800'
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    <CheckCircleIcon className="h-4 w-4 mr-1.5" />
                    {Math.round((submission.score / assessment.totalScore) * 100)}%
                  </span>
                )}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                {assessment.title}
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="flex items-center text-gray-600">
                  <StarIcon className="h-5 w-5 mr-2 text-yellow-500" />
                  <span>{assessment.totalScore} points</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <ClockIcon className="h-5 w-5 mr-2 text-blue-500" />
                  <span>{assessment.timeLimit || '∞'} min</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <QuestionMarkCircleIcon className="h-5 w-5 mr-2 text-e-bosy-purple" />
                  <span>{assessment.questions?.length || '?'} questions</span>
                </div>
                {isCompleted && (
                  <div className="flex items-center text-gray-600">
                    <ChartBarIcon className="h-5 w-5 mr-2 text-green-500" />
                    <span>{submission.score} / {assessment.totalScore}</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <Link
                  to={`/course/${courseId}/${type === 'exam' ? 'exam' : 'exercise'}/${assessment.assessmentId}`}
                  className={`flex items-center justify-between w-full px-4 py-3 rounded-lg text-white ${buttonBgClass} transition-colors`}
                >
                  <span className="font-medium">
                    {isCompleted ? 'Réessayer' : 'Commencer'}
                  </span>
                  <ChevronRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button
                  onClick={() => handleDownloadPDF(assessment)}
                  className="flex items-center justify-center w-full px-4 py-3 rounded-lg border border-e-bosy-purple text-e-bosy-purple hover:bg-purple-50 transition-colors"
                >
                  <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                  <span className="font-medium">Télécharger PDF</span>
                </button>
              </div>
            </div>
            {isCompleted && (
              <div className="px-6 py-4 bg-gray-50 rounded-b-xl border-t text-sm text-gray-500">
                Dernière tentative le {new Date(submission.submittedAt).toLocaleDateString()}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default AssessmentGrid;
