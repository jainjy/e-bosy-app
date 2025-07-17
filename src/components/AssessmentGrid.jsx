// src/components/AssessmentGrid.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { Grid, List } from 'lucide-react';

const AssessmentGrid = ({ assessments, userProgress, courseId, courseTitle }) => {
  const [viewType, setViewType] = useState('grid');

  if (!assessments || assessments.length === 0) {
    console.log(assessments, 'Aucun exercice trouvé');
    return (
      <div className="col-span-full text-center py-12">
        <ClipboardDocumentCheckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">
          Aucun exercice disponible
        </h3>
        <p className="mt-2 text-gray-500">
          Ce cours n'a pas encore d'évaluations.
        </p>
      </div>
    );
  }

  const handleDownloadPDF = (assessment) => {
    console.log('Téléchargement du PDF pour l\'évaluation:', assessment);
    const doc = generateExercisePDF(assessment, userProgress, courseTitle);
    doc.save(`exercice-${assessment.assessmentId}-${assessment.title}.pdf`);
  };

  // Couleurs pour les exercices
  const primaryColorClass = 'border-l-e-bosy-purple';
  const hoverPrimaryColorClass = 'hover:border-l-purple-700';
  const bgColorClass = 'bg-purple-100';
  const textColorClass = 'text-e-bosy-purple';
  const buttonBgClass = 'bg-e-bosy-purple hover:bg-purple-700';

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const ViewToggle = () => (
    <div className="flex items-center justify-end mb-6 gap-2">
      <button
        onClick={() => setViewType('grid')}
        className={`p-2 rounded-lg transition-colors ${
          viewType === 'grid' ? 'bg-purple-100 text-e-bosy-purple' : 'text-gray-500 hover:bg-gray-100'
        }`}
      >
        <Grid className="h-5 w-5" />
      </button>
      <button
        onClick={() => setViewType('list')}
        className={`p-2 rounded-lg transition-colors ${
          viewType === 'list' ? 'bg-purple-100 text-e-bosy-purple' : 'text-gray-500 hover:bg-gray-100'
        }`}
      >
        <List className="h-5 w-5" />
      </button>
    </div>
  );

  const GridView = () => (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {assessments.map((assessment) => {
        const submission = userProgress[assessment.assessmentId];
        const isCompleted = !!submission;
        return (
          <motion.div
            key={assessment.assessmentId}
            variants={item}
            className={`group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border-l-4 ${primaryColorClass} ${hoverPrimaryColorClass} transform hover:-translate-y-1`}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${bgColorClass} ${textColorClass}`}>
                  <ClipboardDocumentCheckIcon className="h-4 w-4 mr-1.5" />
                  Exercice
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
              <div className="flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Link
                  to={`/course/${courseId}/exercise/${assessment.assessmentId}`}
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
    </motion.div>
  );

  const ListView = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="overflow-x-auto"
    >
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temps</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Questions</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {assessments.map((assessment) => {
            const submission = userProgress[assessment.assessmentId];
            const isCompleted = !!submission;
            return (
              <motion.tr
                key={assessment.assessmentId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ backgroundColor: '#f9fafb' }}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{assessment.title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {assessment.totalScore} points
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {assessment.timeLimit || '∞'} min
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {assessment.questions?.length || '?'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {isCompleted && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      submission.score >= (assessment.totalScore * 0.7)
                        ? 'bg-green-100 text-green-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {Math.round((submission.score / assessment.totalScore) * 100)}%
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/course/${courseId}/exercise/${assessment.assessmentId}`}
                      className="text-e-bosy-purple hover:text-purple-700"
                    >
                      {isCompleted ? 'Réessayer' : 'Commencer'}
                    </Link>
                    <button
                      onClick={() => handleDownloadPDF(assessment)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <ArrowDownTrayIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </motion.div>
  );

  return (
    <div>
      <ViewToggle />
      <AnimatePresence mode="wait">
        {viewType === 'grid' ? <GridView /> : <ListView />}
      </AnimatePresence>
    </div>
  );
};

export default AssessmentGrid;
