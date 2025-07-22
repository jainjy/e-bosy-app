import React from "react";
import { Link } from "react-router-dom";
import { 
  BookOpenIcon, UsersIcon, ClockIcon, CurrencyDollarIcon,
  DocumentCheckIcon, AcademicCapIcon
} from "@heroicons/react/24/outline";
import { Sparklines, SparklinesLine } from 'react-sparklines';
import { useTeacherDashboard } from "../../hooks/useTeacherDashboard";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";
import ProgressRadial from "../../components/ProgressRadial";
import EngagementHeatmap from "../../components/EngagementHeatmap";
import StudentProgressChart from "../../components/StudentProgressChart";
import Chart from 'react-apexcharts';

const TeacherOverviewPage = () => {
  const { dashboardData, loading, error } = useTeacherDashboard();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;
  if (!dashboardData) return <div>Aucune donnée disponible</div>;

  const assessmentPerformanceOptions = {
    chart: { type: 'bar', height: 350, toolbar: { show: false } },
    xaxis: { categories: dashboardData.assessmentPerformance.scoreDistributions.map(a => a.title) },
    yaxis: { title: { text: 'Nombre d’étudiants' } },
    colors: ['#FF9800'],
  };
  const assessmentPerformanceSeries = [{
    name: 'Étudiants',
    data: dashboardData.assessmentPerformance.scoreDistributions.map(a => 
      Object.values(a.scoreCounts).reduce((sum, count) => sum + count, 0))
  }];

  const feedbackTrendsOptions = {
    chart: { type: 'line', height: 350, toolbar: { show: false } },
    xaxis: { 
      categories: dashboardData.feedbackTrends?.trends?.map(f => f.date) || [] 
    },
    yaxis: { title: { text: 'Nombre de retours' } },
    colors: ['#4CAF50', '#F44336'],
  };
  
  const feedbackTrendsSeries = [
    { 
      name: 'Positifs', 
      data: dashboardData.feedbackTrends?.trends?.map(f => f.positiveCount) || [] 
    },
    { 
      name: 'Négatifs', 
      data: dashboardData.feedbackTrends?.trends?.map(f => f.negativeCount) || [] 
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Tableau de bord enseignant</h1>
          <p className="text-gray-600 mt-2">Analyse de la progression des étudiants et performance de vos cours</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={<BookOpenIcon className="h-8 w-8" />} label="Cours publiés" value={dashboardData.stats.publishedCourses} sparklineData={[5, 10, 15, 20, 25]} />
        <StatCard icon={<UsersIcon className="h-8 w-8" />} label="Étudiants actifs" value={dashboardData.stats.totalStudents} sparklineData={[100, 200, 150, 300, 250]} />
        <StatCard icon={<ClockIcon className="h-8 w-8" />} label="Heures enseignées" value={dashboardData.stats.teachingHours} sparklineData={[10, 20, 30, 40, 50]} />
        <StatCard icon={<CurrencyDollarIcon className="h-8 w-8" />} label="Revenus totaux" value={`$${dashboardData.stats.totalEarnings}`} sparklineData={[1000, 2000, 1500, 3000, 2500]} />
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Indicateurs pédagogiques</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProgressRadial value={dashboardData.stats.averageCompletion} label="Complétion moyenne" color="#6B46C1" icon={<DocumentCheckIcon className="h-6 w-6" />} />
          <ProgressRadial value={dashboardData.stats.averageQuizSuccess} label="Réussite aux quiz" color="#3182CE" icon={<AcademicCapIcon className="h-6 w-6" />} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Progression des étudiants par cours</h3>
          <StudentProgressChart courses={dashboardData.courses} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Engagement horaire</h3>
          <EngagementHeatmap data={dashboardData.engagementHeatmap} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Performance des évaluations</h3>
          <Chart options={assessmentPerformanceOptions} series={assessmentPerformanceSeries} type="bar" height={350} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Tendances des retours</h3>
          <Chart options={feedbackTrendsOptions} series={feedbackTrendsSeries} type="line" height={350} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Étudiants nécessitant une attention</h3>
          <Link to="/etudiants" className="text-e-bosy-purple hover:underline text-sm">Voir tous les étudiants</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Étudiant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progression</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dernière activité</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dashboardData.studentsNeedingAttention.map((student, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.courseTitle}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.progress}%</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div className="bg-e-bosy-purple h-2 rounded-full" style={{ width: `${student.progress}%` }}></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.lastActivity ? new Date(student.lastActivity).toLocaleDateString() : 'Jamais'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link to={`/messages/${student.userId}`} className="text-e-bosy-purple hover:text-purple-900 mr-3">Message</Link>
                    <Link to={`/suivi/${student.userId}`} className="text-blue-600 hover:text-blue-900">Planifier un suivi</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Derniers retours sur les cours</h3>
            <Link to="/evaluations" className="text-e-bosy-purple hover:underline text-sm">Voir tous</Link>
          </div>
          <div className="space-y-4">
            {dashboardData.courseReviews.map((review, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between">
                  <h4 className="font-medium text-gray-800">{review.title}</h4>
                  <span className="text-sm font-medium">{review.rating ? `${review.rating}/5` : 'N/A'}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{review.feedback}</p>
                <Link to={`/reviews/${review.courseId}`} className="text-e-bosy-purple text-sm">Répondre</Link>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Prochaines sessions live</h3>
            <Link to="/evenements" className="text-e-bosy-purple hover:underline text-sm">Voir calendrier</Link>
          </div>
          <div className="space-y-4">
            {dashboardData.upcomingSessions.map((session, index) => (
              <div key={index} className="border-l-4 border-e-bosy-purple pl-4 py-2">
                <p className="font-medium text-gray-800">{session.title}</p>
                <p className="text-sm text-gray-600">{session.description} • {new Date(session.startTime).toLocaleString()}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">{session.attendeeCount} inscrits</span>
                  <Link to={`/session/${session.courseId}`} className="text-sm text-e-bosy-purple font-medium">Envoyer un rappel</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Actions rapides</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/ajouter-cours" className="bg-gray-100 p-4 rounded-lg flex flex-col items-center justify-center text-center hover:bg-gray-200">
            <BookOpenIcon className="h-6 w-6 text-e-bosy-purple mb-2" />
            <span className="text-gray-700 text-sm">Créer un cours</span>
          </Link>
          <Link to="/messages" className="bg-gray-100 p-4 rounded-lg flex flex-col items-center justify-center text-center hover:bg-gray-200">
            <UsersIcon className="h-6 w-6 text-e-bosy-purple mb-2" />
            <span className="text-gray-700 text-sm">Contacter les étudiants</span>
          </Link>
          <Link to="/evaluations" className="bg-gray-100 p-4 rounded-lg flex flex-col items-center justify-center text-center hover:bg-gray-200">
            <DocumentCheckIcon className="h-6 w-6 text-e-bosy-purple mb-2" />
            <span className="text-gray-700 text-sm">Créer une évaluation</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, sparklineData }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow flex items-center">
      <div className="mr-4 text-e-bosy-purple">{icon}</div>
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <Sparklines data={sparklineData} width={100} height={20}>
          <SparklinesLine color="blue" />
        </Sparklines>
      </div>
    </div>
  );
};

export default TeacherOverviewPage;