import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PlusIcon,
  AcademicCapIcon,
  ClipboardDocumentCheckIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  DocumentTextIcon,
  StarIcon,
  CalendarIcon,
  QuestionMarkCircleIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { getData, deleteData } from '../../services/ApiFetch';
import { toast } from 'react-hot-toast';
import AssessmentFormModal from '../../components/AssessmentFormModal';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const AssessmentsPage = () => {
  const { courseId } = useParams();
  const [assessments, setAssessments] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAssessmentForm, setShowAssessmentForm] = useState(false);
  const [formType, setFormType] = useState('exercise');
  const [editingAssessment, setEditingAssessment] = useState(null);

  const fetchQuestions = async (assessmentId) => {
    try {
      const [questionsData] = await getData(`assessments/${assessmentId}/questions`);
      return questionsData || [];
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error("Erreur lors du chargement des questions");
      return [];
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [courseData] = await getData(`courses/${courseId}`);
        setCourse(courseData);

        const [assessmentsData] = await getData(`assessments/course/${courseId}`);

        const assessmentsWithQuestions = await Promise.all(
          assessmentsData.map(async (assessment) => {
            const questions = await fetchQuestions(assessment.assessmentId);
            return {
              ...assessment,
              questionCount: questions.length
            };
          })
        );

        setAssessments(assessmentsWithQuestions);
      } catch (error) {
        toast.error("Erreur lors du chargement des évaluations");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette évaluation ?')) {
      try {
        await deleteData(`assessments/${id}`);
        setAssessments(assessments.filter(a => a.assessmentId !== id));
        toast.success("Évaluation supprimée avec succès");
      } catch (error) {
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  const handleCreateAssessment = (type) => {
    setFormType(type);
    setShowAssessmentForm(true);
  };

  const handleEdit = (assessment) => {
    if (assessment) {
      setEditingAssessment(assessment);
      setFormType(assessment.type);
      setShowAssessmentForm(true);
    }
  };

  const handleFormSubmit = async (data) => {
    try {
      if (editingAssessment) {
        setAssessments(assessments.map(a =>
          a.assessmentId === editingAssessment.assessmentId ? data : a
        ));
      } else {
        setAssessments([...assessments, data]);
      }
      setShowAssessmentForm(false);
      setEditingAssessment(null);
      toast.success(`Évaluation ${editingAssessment ? 'modifiée' : 'créée'} avec succès`);
    } catch (error) {
      toast.error(`Erreur lors de la ${editingAssessment ? 'modification' : 'création'} de l'évaluation`);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <nav className="flex items-center space-x-4 mb-8">
        <Link
          to="/mycourses"
          className="flex items-center text-e-bosy-purple hover:text-purple-700 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          <span className="font-medium">Retour aux Cours</span>
        </Link>
        <div className="h-6 w-px bg-gray-300"></div>
        <div className="text-gray-600">{course?.title}</div>
      </nav>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Évaluations</h1>
            <p className="text-gray-600 flex items-center">
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Gérez les exercices et examens pour ce cours
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => handleCreateAssessment('exercise')}
              className="flex items-center px-5 py-2.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors shadow-sm"
            >
              <ClipboardDocumentCheckIcon className="h-5 w-5 mr-2" />
              Nouvel Exercice
            </button>
            <button
              onClick={() => handleCreateAssessment('exam')}
              className="flex items-center px-5 py-2.5 bg-e-bosy-purple text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
            >
              <AcademicCapIcon className="h-5 w-5 mr-2" />
              Nouvel Examen
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assessments.map((assessment,index) => (
          <div
            key={assessment.assessmentId+index}
            className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${
              assessment.type === 'exam'
                ? 'border-l-purple-500 border-gray-200'
                : 'border-l-yellow-500 border-gray-200'
            } hover:shadow-lg transition-shadow duration-200`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium ${
                  assessment.type === 'exam'
                    ? 'bg-purple-100 text-purple-800 ring-1 ring-purple-300'
                    : 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-300'
                }`}>
                  {assessment.type === 'exam' ? (
                    <>
                      <AcademicCapIcon className="h-4 w-4 mr-2" />
                      Examen
                    </>
                  ) : (
                    <>
                      <ClipboardDocumentCheckIcon className="h-4 w-4 mr-2" />
                      Exercice
                    </>
                  )}
                </span>
                <h3 className="text-xl font-semibold text-gray-800 mt-2">
                  {assessment.title}
                </h3>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleEdit(assessment);
                  }}
                  className="p-2 text-gray-600 hover:text-e-bosy-purple rounded-full hover:bg-purple-50 transition-colors"
                  title="Modifier l'évaluation"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(assessment.assessmentId)}
                  className="p-2 text-gray-600 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                  title="Supprimer l'évaluation"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className={`p-3 rounded-lg ${
                assessment.type === 'exam' ? 'bg-purple-50' : 'bg-yellow-50'
              }`}>
                <div className="flex items-center text-sm text-gray-700">
                  <StarIcon className={`h-5 w-5 mr-2 ${assessment.type === 'exam' ? 'text-purple-500' : 'text-yellow-500'}`} />
                  <span>{assessment.totalScore} points</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${
                assessment.type === 'exam' ? 'bg-purple-50' : 'bg-yellow-50'
              }`}>
                <div className="flex items-center text-sm text-gray-700">
                  <ClockIcon className={`h-5 w-5 mr-2 ${assessment.type === 'exam' ? 'text-purple-500' : 'text-yellow-500'}`} />
                  <span>{assessment.timeLimit || 'Non limitée'}</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${
                assessment.type === 'exam' ? 'bg-purple-50' : 'bg-yellow-50'
              }`}>
                <div className="flex items-center text-sm text-gray-700">
                  <QuestionMarkCircleIcon className={`h-5 w-5 mr-2 ${assessment.type === 'exam' ? 'text-purple-500' : 'text-yellow-500'}`} />
                  <span>{assessment.questionCount || 0} questions</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${
                assessment.type === 'exam' ? 'bg-purple-50' : 'bg-yellow-50'
              }`}>
                <div className="flex items-center text-sm text-gray-700">
                  <CalendarIcon className={`h-5 w-5 mr-2 ${assessment.type === 'exam' ? 'text-purple-500' : 'text-yellow-500'}`} />
                  <span>{new Date(assessment.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <Link
                to={`/courses/${courseId}/assessments/${assessment.assessmentId}/questions`}
                className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors group ${
                  assessment.type === 'exam'
                    ? 'bg-purple-50 hover:bg-purple-100 text-purple-700'
                    : 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700'
                }`}
              >
                <div className="flex items-center">
                  <DocumentTextIcon className={`h-5 w-5 mr-2 ${
                    assessment.type === 'exam' ? 'text-purple-600' : 'text-yellow-600'
                  }`} />
                  <span>Gérer les questions</span>
                </div>
                <ChevronRightIcon className={`h-5 w-5 group-hover:translate-x-1 transition-transform ${
                  assessment.type === 'exam' ? 'text-purple-400' : 'text-yellow-400'
                }`} />
              </Link>
            </div>
          </div>
        ))}

        {assessments.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center text-gray-500 py-12">
            <DocumentTextIcon className="h-16 w-16 mb-4" />
            <p className="text-xl font-medium mb-2">Aucune évaluation créée</p>
            <p className="text-sm">Commencez par créer un exercice ou un examen</p>
          </div>
        )}
      </div>

      {showAssessmentForm && (
        <AssessmentFormModal
          courseId={courseId}
          type={formType}
          assessment={editingAssessment}
          onClose={() => {
            setShowAssessmentForm(false);
            setEditingAssessment(null);
          }}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  );
};

export default AssessmentsPage;
