import React from "react";
import { Link } from "react-router-dom";
import { 
  AcademicCapIcon, ClockIcon, BookOpenIcon, CheckCircleIcon,
  CalendarIcon
} from "@heroicons/react/24/outline";
import { useStudentDashboard } from "../../hooks/useStudentDashboard";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";
import ActivityHeatmap from "../../components/ActivityHeatmap";

const DEFAULT_COURSE_IMAGE = "/images/default-course.jpg";

const StudentOverviewPage = () => {
  const { dashboardData, loading, error } = useStudentDashboard();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;
  if (!dashboardData) return <div>Aucune donnée disponible</div>;

  const overallProgress = dashboardData.stats.enrolledCourses > 0 
    ? (dashboardData.stats.completedCourses / dashboardData.stats.enrolledCourses) * 100 
    : 0;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Tableau de bord</h1>
          <p className="text-gray-600 mt-2">
            Suivi de votre progression d'apprentissage
          </p>
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          icon={<BookOpenIcon className="h-8 w-8" />}
          label="Cours suivis"
          value={dashboardData.stats.enrolledCourses}
        />
        <StatCard 
          icon={<CheckCircleIcon className="h-8 w-8" />}
          label="Cours terminés"
          value={dashboardData.stats.completedCourses}
        />
        <StatCard 
          icon={<ClockIcon className="h-8 w-8" />}
          label="Heures apprises"
          value={dashboardData.stats.learningHours}
        />
        <StatCard 
          icon={<AcademicCapIcon className="h-8 w-8" />}
          label="Certificats"
          value={dashboardData.stats.certificatesCount}
        />
      </div>

      {/* Section Activité récente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Activité récente
          </h3>
          <ActivityHeatmap data={dashboardData.weeklyActivity} />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">
              Prochaines échéances
            </h3>
            <Link to="/calendrier" className="text-e-bosy-purple hover:underline text-sm">
              Voir calendrier
            </Link>
          </div>
          <div className="space-y-4">
            {dashboardData.upcomingSchedule.map((deadline, index) => (
              <div key={index} className="border-l-4 border-e-bosy-purple pl-4 py-2">
                <p className="font-medium text-gray-800">{deadline.title}</p>
                <p className="text-sm text-gray-600">{deadline.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {deadline.type === 'live_session' ? 'Session live' : 'Évaluation'} • 
                  <span className={deadline.date < new Date() ? 'text-red-500' : 'text-gray-500'}>
                    {deadline.date < new Date() ? 'En retard' : 'À venir'}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section Cours en progression */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">
            Cours en progression
          </h3>
          <Link to="/mescours" className="text-e-bosy-purple hover:underline text-sm">
            Voir tous les cours
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardData.continueLearning.map((course, index) => (
            <CourseProgressCard 
              key={index}
              course={course}
            />
          ))}
        </div>
      </div>

      {/* Section Certificats */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Certificats obtenus
        </h3>
        <ul className="space-y-3">
          {dashboardData.certificates.map((certificate, index) => (
            <li key={index} className="flex items-start">
              <div className="bg-purple-100 p-2 rounded-full mr-3">
                <AcademicCapIcon className="h-5 w-5 text-e-bosy-purple" />
              </div>
              <div>
                <p className="font-medium">{certificate.courseTitle}</p>
                <p className="text-sm text-gray-600">
                  Par {certificate.instructor} • {new Date(certificate.issuedAt).toLocaleDateString()}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow flex items-center">
      <div className="mr-4 text-e-bosy-purple">
        {icon}
      </div>
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
};

const CourseProgressCard = ({ course }) => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h4 className="font-semibold text-gray-800 text-lg line-clamp-1">
              {course.title}
            </h4>
            <p className="text-sm text-gray-600">Par {course.instructor}</p>
          </div>
        </div>
        
        <div className="mt-3 text-sm text-gray-700">
          <div className="flex justify-between mb-1">
            <span>Progression</span>
            <span>{course.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-e-bosy-purple h-2.5 rounded-full" 
              style={{ width: `${course.progress}%` }}
            ></div>
          </div>
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            <p>Prochaine leçon: {course.nextLesson}</p>
          </div>
          <Link 
            to={`/cours/${course.courseId}`}
            className="text-e-bosy-purple text-sm font-medium hover:underline"
          >
            Continuer
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentOverviewPage;