import React from "react";
import { Link } from "react-router-dom";
import {
  UsersIcon,
  BookOpenIcon,
  CurrencyDollarIcon,
  AcademicCapIcon,
  DocumentCheckIcon,
} from "@heroicons/react/24/outline";
import { Sparklines, SparklinesLine } from 'react-sparklines';
import { useAdminDashboard } from "../../hooks/useAdminDashboard";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";
import UserDemographicsChart from "../../components/UserDemographicsChart";
import RevenueTrendChart from "../../components/RevenueTrendChart";
import CoursePerformanceTable from "../../components/CoursePerformanceTable";
import Chart from 'react-apexcharts';

const AdminOverviewPage = () => {
  const { dashboardData, loading, error } = useAdminDashboard();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;
  if (!dashboardData) return <div>Aucune donnée disponible</div>;

  const engagementChartOptions = {
    chart: { type: 'line', height: 350, toolbar: { show: false } },
    xaxis: { 
      categories: dashboardData.userEngagement.map(d => {
        const date = new Date(d.date);
        return date.toLocaleDateString();
      })
    },
    yaxis: { title: { text: 'Utilisateurs actifs' } },
    colors: ['#FF5733'],
  };
  const engagementSeries = [{
    name: 'Utilisateurs actifs',
    data: dashboardData.userEngagement.map(d => d.activeUsers)
  }];

  const revenueByCategoryOptions = {
    chart: { type: 'pie', height: 350 },
    labels: dashboardData.revenueByCategory.map(r => r.category),
    colors: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
  };
  const revenueByCategorySeries = dashboardData.revenueByCategory.map(r => r.revenue);

  const completionRatesOptions = {
    chart: { type: 'bar', height: 350, toolbar: { show: false } },
    xaxis: { categories: dashboardData.courseCompletionRates.map(c => c.title) },
    yaxis: { title: { text: 'Taux de complétion (%)' } },
    colors: ['#00E396'],
  };
  const completionRatesSeries = [{
    name: 'Taux de complétion',
    data: dashboardData.courseCompletionRates.map(c => c.completionRate)
  }];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Tableau de bord administrateur
        </h1>
        <p className="text-gray-600 mt-2">
          Vue d'ensemble de la plateforme et gestion stratégique
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<UsersIcon className="h-8 w-8" />}
          label="Utilisateurs actifs"
          value={dashboardData.stats.totalUsers}
          info={`${dashboardData.stats.newUsersThisMonth} nouveaux ce mois`}
          sparklineData={[5, 10, 15, 20, 25]}
        />
        <StatCard
          icon={<BookOpenIcon className="h-8 w-8" />}
          label="Cours publiés"
          value={dashboardData.stats.activeCourses}
          info={`${dashboardData.courseStatistics.status.pending} en attente`}
          sparklineData={[10, 20, 30, 40, 50]}
        />
        <StatCard
          icon={<CurrencyDollarIcon className="h-8 w-8" />}
          label="Revenus totaux"
          value={`$${dashboardData.stats.totalRevenue.toFixed(2)}`}
          sparklineData={[100, 200, 150, 300, 250]}
        />
        <StatCard
          icon={<AcademicCapIcon className="h-8 w-8" />}
          label="Certificats émis"
          value={dashboardData.stats.certificatesIssued}
          info={`${Math.round(dashboardData.stats.averageCompletionRate)}% complétion moyenne`}
          sparklineData={[50, 60, 70, 80, 90]}
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Statistiques globales</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800">Participation aux sessions live</h3>
            <div className="mt-4 flex items-end">
              <span className="text-3xl font-bold text-gray-900">
                {Math.round(dashboardData.stats.liveSessionParticipationRate)}%
              </span>
              <AcademicCapIcon className="ml-4 text-gray-400 h-6 w-6" />
            </div>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-orange-500"
                style={{ width: `${dashboardData.stats.liveSessionParticipationRate}%` }}
              ></div>
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800">Utilisateurs actifs</h3>
            <div className="mt-4 flex items-end">
              <span className="text-3xl font-bold text-gray-900">
                {dashboardData.userStatistics.activeUsersPercentage}%
              </span>
              <DocumentCheckIcon className="ml-4 text-gray-400 h-6 w-6" />
            </div>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2n rounded-full bg-green-500"
                style={{ width: `${dashboardData.userStatistics.activeUsersPercentage}%` }}
              ></div>
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800">Cours actifs</h3>
            <div className="mt-4 flex items-end">
              <span className="text-3xl font-bold text-gray-900">
                {dashboardData.courseStatistics.activeCoursesPercentage}%
              </span>
              <BookOpenIcon className="ml-4 text-gray-400 h-6 w-6" />
            </div>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-blue-500"
                style={{ width: `${dashboardData.courseStatistics.activeCoursesPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Engagement des utilisateurs</h3>
          <Chart options={engagementChartOptions} series={engagementSeries} type="line" height={350} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Répartition des revenus</h3>
          <Chart options={revenueByCategoryOptions} series={revenueByCategorySeries} type="pie" height={350} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Taux de complétion des cours</h3>
          <Chart options={completionRatesOptions} series={completionRatesSeries} type="bar" height={350} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Santé du système</h3>
          <div className="text-center">
            <p className="text-2xl font-bold">{dashboardData.systemHealth.status}</p>
            <p className="text-gray-600">Erreurs récentes : {dashboardData.systemHealth.recentErrors}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Performance des cours</h3>
          <Link to="/cours" className="text-e-bosy-purple hover:underline text-sm">
            Gérer les cours
          </Link>
        </div>
        <CoursePerformanceTable courses={dashboardData.coursePerformance} />
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Alertes et interventions</h3>
          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
            {dashboardData.recentIssues.length} problèmes à résoudre
          </span>
        </div>
        <div className="space-y-4">
          {dashboardData.recentIssues.map((issue, index) => (
            <div key={index} className={`border-l-4 ${getIssueBorderColor(issue.severity)} pl-4 py-3`}>
              <div className="flex justify-between">
                <h4 className="font-medium text-gray-800">{issue.title}</h4>
                <span className={`text-xs px-2 py-1 rounded ${getIssueBadgeClass(issue.severity)}`}>
                  {issue.severity === "critical" ? "Critique" : issue.severity === "high" ? "Élevée" : issue.severity === "medium" ? "Moyenne" : "Basse"}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
              <div className="mt-3 flex justify-between items-center">
                <span className="text-xs text-gray-500">{issue.affectedItems} éléments affectés</span>
                <div>
                  <Link to="/issues" className="text-sm text-e-bosy-purple font-medium mr-3">Ignorer</Link>
                  <Link to="/issues" className="text-sm bg-e-bosy-purple text-white px-3 py-1 rounded">Résoudre</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Actions rapides</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Link to="/utilisateurs/nouveau" className="bg-gray-100 p-4 rounded-lg flex flex-col items-center justify-center text-center hover:bg-gray-200">
            <UsersIcon className="h-6 w-6 text-e-bosy-purple mb-2" />
            <span className="text-gray-700 text-sm">Ajouter utilisateur</span>
          </Link>
          <Link to="/cours/nouveau" className="bg-gray-100 p-4 rounded-lg flex flex-col items-center justify-center text-center hover:bg-gray-200">
            <BookOpenIcon className="h-6 w-6 text-e-bosy-purple mb-2" />
            <span className="text-gray-700 text-sm">Créer un cours</span>
          </Link>
          <Link to="/parametres" className="bg-gray-100 p-4 rounded-lg flex flex-col items-center justify-center text-center hover:bg-gray-200">
            <AcademicCapIcon className="h-6 w-6 text-e-bosy-purple mb-2" />
            <span className="text-gray-700 text-sm">Paramètres système</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, info, sparklineData }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {info && <p className="text-xs text-gray-500 mt-2">{info}</p>}
          <Sparklines data={sparklineData} width={100} height={20}>
            <SparklinesLine color="blue" />
          </Sparklines>
        </div>
        <div className="text-e-bosy-purple">{icon}</div>
      </div>
    </div>
  );
};

const getIssueBorderColor = (severity) => {
  switch (severity) {
    case "critical": return "border-red-500";
    case "high": return "border-orange-500";
    case "medium": return "border-yellow-500";
    default: return "border-blue-500";
  }
};

const getIssueBadgeClass = (severity) => {
  switch (severity) {
    case "critical": return "bg-red-100 text-red-800";
    case "high": return "bg-orange-100 text-orange-800";
    case "medium": return "bg-yellow-100 text-yellow-800";
    default: return "bg-blue-100 text-blue-800";
  }
};

export default AdminOverviewPage;