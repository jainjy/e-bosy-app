import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  UsersIcon, BookOpenIcon, CurrencyDollarIcon, 
  AcademicCapIcon, ChartBarIcon,
  ExclamationTriangleIcon, UserPlusIcon, CogIcon
} from "@heroicons/react/24/outline";
import Chart from 'react-apexcharts';
import { useAdminDashboard } from "../../hooks/useAdminDashboard";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";
import { API_BASE_URL } from "../../services/ApiFetch";
import { StarIcon as StarSolidIcon } from "@heroicons/react/20/solid";
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

const StatCard = ({ icon, label, value, info, trendData }) => {
  return (
    <motion.div 
      className="bg-white p-6 rounded-2xl shadow-md cursor-default select-none"
      whileHover={{ y: -6, boxShadow: '0 10px 20px rgba(79, 70, 229, 0.2)' }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      aria-label={`${label}: ${value}${info ? ', ' + info : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-gray-500 text-sm font-semibold tracking-wide uppercase">{label}</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-1">{value}</p>
          {info && <p className="text-xs text-gray-400 mt-1">{info}</p>}

          {/* Décommenter si tu souhaites afficher les graphiques sparkline */}
          {/* {trendData && trendData.length > 0 && (
            <div className="mt-4">
              <Chart
                options={{
                  chart: { sparkline: { enabled: true } },
                  stroke: { curve: 'smooth', width: 2 },
                  colors: ['#6366f1'],
                  tooltip: { enabled: false }
                }}
                series={[{ data: trendData }]}
                type="line"
                height={40}
                width={120}
                aria-label={`${label} trend graph`}
              />
            </div>
          )} */}
        </div>
        <div className="p-3 bg-indigo-100 rounded-full text-indigo-600 flex-shrink-0">
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

const StarRating = ({ rating }) => {
  const totalStars = 5;
  const fullStars = Math.floor(rating || 0);
  const hasHalfStar = (rating || 0) - fullStars >= 0.5;

  return (
    <div className="flex items-center space-x-1" role="img" aria-label={`Note: ${rating ? rating.toFixed(1) : 'N/A'} étoiles`}>
      {[...Array(totalStars)].map((_, index) => (
        <span key={index} className="flex-shrink-0">
          {index < fullStars ? (
            <StarSolidIcon className="h-5 w-5 text-yellow-400" />
          ) : (
            <StarOutlineIcon className="h-5 w-5 text-gray-300" />
          )}
        </span>
      ))}
      <span className="text-sm text-gray-500 ml-2 select-none">({rating?.toFixed(1) ?? 'N/A'})</span>
    </div>
  );
};

const CoursePerformanceTable = ({ courses }) => {
  return (
    <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider select-none">Cours</th>
            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider select-none">Note</th>
            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider select-none">Inscriptions</th>
            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider select-none">Complétion</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {courses.map((course, index) => (
            <tr key={index} className="hover:bg-indigo-50 transition-colors duration-200">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                <div className="flex items-center">
                  <img 
                    src={API_BASE_URL + course.thumbnailUrl} 
                    alt={`${course.title}`} 
                    className="w-16 h-16 rounded-xl border border-gray-200 mr-4 object-cover" 
                    loading="lazy"
                    onError={e => e.currentTarget.src = "/images/default-course.jpg"} 
                  />
                  <div>
                    <div className="font-semibold line-clamp-2">{course.title}</div>
                    <div className="text-xs text-gray-500">{course.category}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                <StarRating rating={course.rating || 0} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                <div className="flex items-center justify-center space-x-1">
                  <UsersIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                  <span>{course.studentCount || 0}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center justify-center">
                  <div className="w-32">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-700"
                          style={{ width: `${Math.min(100, Math.max(0, course.averageProgress || 0))}%` }}
                        />
                      </div>
                      <span className="ml-2 text-sm text-gray-600 min-w-[40px] text-right">
                        {Math.round(course.averageProgress || 0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const AdminOverviewPage = () => {
  const { dashboardData, loading, error } = useAdminDashboard();

  // Data engagement formatée pour le graphique
  const engagementData = useMemo(() => {
    if (!dashboardData?.userEngagement) return [];
    return dashboardData.userEngagement.map(d => ({
      ...d,
      date: new Date(d.date).toLocaleDateString('fr-FR')
    }));
  }, [dashboardData]);


  // Options graphiques avec palette harmonieuse
  const revenueChartOptions = {
    chart: {
      type: 'area',
      height: 350,
      toolbar: { show: true },
      zoom: { enabled: false },
      animations: { enabled: true, easing: 'easeout', speed: 900 },
      foreColor: '#4b5563',
    },
    stroke: { curve: 'smooth', width: 3 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        inverseColors: false,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 90, 100]
      }
    },
    xaxis: {
      categories: dashboardData?.revenueBreakdown?.map(d => d.category) || [],
      labels: { style: { colors: '#64748b', fontWeight: '600' } },
      axisBorder: { show: true, color: '#cbd5e0' },
    },
    yaxis: {
      title: { text: 'Revenus (€)', style: { color: '#64748b', fontWeight: '600' } },
      labels: { formatter: (val) => `€${val.toFixed(2)}` }
    },
    colors: ['#6366f1'],
    tooltip: {
      theme: 'light',
      x: { show: false },
      y: { formatter: (val) => `€${val.toFixed(2)}` }
    }
  };

  const engagementChartOptions = {
    chart: {
      type: 'bar',
      height: 350,
      animations: { enabled: true, easing: 'easeout', speed: 900 },
      toolbar: { show: false },
      foreColor: '#4b5563',
    },
    plotOptions: { 
      bar: { 
        borderRadius: 6,
        columnWidth: '60%'
      }
    },
    xaxis: {
      categories: engagementData.map(d => d.date),
      labels: { style: { colors: '#64748b', fontWeight: '600', fontSize: '12px' } },
      axisBorder: { show: true, color: '#cbd5e0' },
    },
    yaxis: {
      title: { text: 'Utilisateurs actifs', style: { color: '#64748b', fontWeight: '600' } },
    },
    colors: ['#8b5cf6'],
    tooltip: {
      theme: 'light',
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen max-w-full">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-1 select-none">Tableau de bord administrateur</h1>
        <p className="text-gray-600 select-none">Vue d'ensemble de la plateforme et gestion stratégique</p>
      </header>

      {/* Cartes statistiques */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard 
          icon={<UsersIcon className="h-6 w-6" aria-hidden="true" />}
          label="Utilisateurs"
          value={dashboardData.stats?.totalUsers || 0}
          info={`${dashboardData.stats?.newUsersThisMonth || 0} nouveaux ce mois`}
          trendData={[30, 40, 35, 50, 49, 60]}
        />
        <StatCard 
          icon={<BookOpenIcon className="h-6 w-6" aria-hidden="true" />}
          label="Cours publiés"
          value={dashboardData.stats?.activeCourses || 0}
          info={`${dashboardData.courseStatistics?.status?.draft || 0} en brouillon`}
          trendData={[5, 7, 10, 8, 12, 15]}
        />
        <StatCard 
          icon={<CurrencyDollarIcon className="h-6 w-6" aria-hidden="true" />}
          label="Revenus totaux"
          value={`€${(dashboardData.stats?.totalRevenue || 0).toFixed(2)}`}
          trendData={[1200, 1500, 1100, 1800, 2000, 2400]}
        />
        <StatCard 
          icon={<AcademicCapIcon className="h-6 w-6" aria-hidden="true" />}
          label="Certificats"
          value={dashboardData.stats?.certificatesIssued || 0}
          info={`${Math.round(dashboardData.stats?.averageCompletionRate || 0)}% complétion`}
          trendData={[20, 25, 30, 28, 35, 40]}
        />
      </section>

      {/* Graphiques */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 overflow-x-auto">
          <h2 className="text-xl font-semibold text-gray-800 mb-5 select-none">Évolution des revenus</h2>
          <Chart
            options={revenueChartOptions}
            series={[{
              name: 'Revenus',
              data: dashboardData.revenueBreakdown?.map(d => d.revenue) || []
            }]}
            type="area"
            height={350}
            aria-label="Graphique d'évolution des revenus"
          />
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 overflow-x-auto">
          <h2 className="text-xl font-semibold text-gray-800 mb-5 select-none">Engagement des utilisateurs</h2>
          <Chart
            options={engagementChartOptions}
            series={[{
              name: 'Utilisateurs actifs',
              data: engagementData.map(d => d.activeUsers)
            }]}
            type="bar"
            height={350}
            aria-label="Graphique d'engagement utilisateurs"
          />
        </div>
      </section>

      {/* Performance des cours */}
      <section className="bg-white p-6 rounded-2xl shadow-lg mb-10 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 select-none">Performance des cours</h2>
          <Link to="/courses" className="text-indigo-600 hover:underline flex items-center font-semibold" aria-label="Voir tous les cours">
            Voir tous <ChartBarIcon className="h-5 w-5 ml-1" aria-hidden="true" />
          </Link>
        </div>
        <CoursePerformanceTable courses={dashboardData.coursePerformance || []} />
      </section>

      {/* Alertes récentes */}
      <section className="bg-white p-6 rounded-2xl shadow-lg mb-10 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 select-none">Alertes récentes</h2>
          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm flex items-center font-semibold select-none" aria-label={`Nombre de problèmes : ${dashboardData.recentIssues?.length || 0}`}>
            <ExclamationTriangleIcon className="h-5 w-5 mr-1 flex-shrink-0" aria-hidden="true" />
            {dashboardData.recentIssues?.length || 0} problème{(dashboardData.recentIssues?.length || 0) > 1 ? 's' : ''}
          </span>
        </div>
        <div className="space-y-4">
          {(dashboardData.recentIssues || []).map((issue, index) => (
            <motion.div 
              key={index} 
              className={`p-4 rounded-lg border-l-4 bg-white transition-transform duration-300 cursor-pointer select-none
                ${
                  issue.severity === 'high' ? 'border-red-500 bg-red-50 hover:scale-[1.03]' : 
                  issue.severity === 'medium' ? 'border-yellow-500 bg-yellow-50 hover:scale-[1.02]' : 
                  'border-blue-500 bg-blue-50 hover:scale-105'
                }
              `}
              aria-label={`${issue.title}, reporté le ${new Date(issue.reportedAt).toLocaleDateString()}`}
              whileHover={{ scale: 1.03 }}
              role="alert"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-800 truncate">{issue.title}</h3>
                <time className="text-xs text-gray-500 tabular-nums">{new Date(issue.reportedAt).toLocaleDateString()}</time>
              </div>
              <p className="text-sm text-gray-600 mt-1 line-clamp-3">{issue.description}</p>
              <div className="mt-3 flex justify-between items-center">
                <span className="text-xs px-2 py-1 bg-white rounded-full select-none">
                  {issue.affectedItems} élément{issue.affectedItems > 1 ? 's' : ''} affecté{issue.affectedItems > 1 ? 's' : ''}
                </span>
                <button
                  className="text-sm bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-label={`Résoudre le problème : ${issue.title}`}
                >
                  Résoudre
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Actions rapides */}
      <section className="bg-white p-6 rounded-2xl shadow-lg mb-10 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 select-none">Actions rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link 
            to="/utilisateurs/nouveau" 
            className="bg-indigo-50 p-6 rounded-lg flex flex-col items-center text-center transition-transform hover:bg-indigo-100 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400 group"
            aria-label="Ajouter un nouvel utilisateur"
          >
            <div className="bg-indigo-100 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
              <UserPlusIcon className="h-10 w-10 text-indigo-600" />
            </div>
            <span className="font-semibold text-gray-900">Ajouter utilisateur</span>
          </Link>

          <Link 
            to="/cours/nouveau" 
            className="bg-indigo-50 p-6 rounded-lg flex flex-col items-center text-center transition-transform hover:bg-indigo-100 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400 group"
            aria-label="Créer un nouveau cours"
          >
            <div className="bg-indigo-100 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
              <BookOpenIcon className="h-10 w-10 text-indigo-600" />
            </div>
            <span className="font-semibold text-gray-900">Créer un cours</span>
          </Link>

          <Link 
            to="/parametres" 
            className="bg-indigo-50 p-6 rounded-lg flex flex-col items-center text-center transition-transform hover:bg-indigo-100 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400 group"
            aria-label="Accéder aux paramètres système"
          >
            <div className="bg-indigo-100 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
              <CogIcon className="h-10 w-10 text-indigo-600" />
            </div>
            <span className="font-semibold text-gray-900">Paramètres système</span>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AdminOverviewPage;
