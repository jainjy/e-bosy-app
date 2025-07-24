import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  UsersIcon, BookOpenIcon, CurrencyDollarIcon, 
  AcademicCapIcon, DocumentCheckIcon, ChartBarIcon,
  ExclamationTriangleIcon, UserPlusIcon, CogIcon
} from "@heroicons/react/24/outline";
import Chart from 'react-apexcharts';
import { useAdminDashboard } from "../../hooks/useAdminDashboard";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";
import { API_BASE_URL } from "../../services/ApiFetch";
import { StarIcon as StarSolidIcon } from "@heroicons/react/20/solid";
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";

// Composant StatCard avec animations
const StatCard = ({ icon, label, value, info, trendData }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1 animate-fade-in">{value}</p>
          {info && <p className="text-xs text-gray-500 mt-2">{info}</p>}
          
          {/* {trendData && trendData.length > 0 && (
            <div className="mt-3">
              <Chart
                options={{
                  chart: { sparkline: { enabled: true } },
                  stroke: { curve: 'smooth', width: 2 },
                  colors: ['#4F46E5'],
                  tooltip: { enabled: false }
                }}
                series={[{ data: trendData }]}
                type="line"
                height={40}
                width={120}
              />
            </div>
          )} */}
        </div>
        <div className="p-3 bg-indigo-100 rounded-full text-indigo-600">
          {icon}
        </div>
      </div>
    </div>
  );
};

// Créez un nouveau composant pour les étoiles
const StarRating = ({ rating }) => {
  const totalStars = 5;
  const fullStars = Math.floor(rating || 0);
  
  return (
    <div className="flex items-center space-x-1">
      {[...Array(totalStars)].map((_, index) => (
        <span key={index} className="flex-shrink-0">
          {index < fullStars ? (
            <StarSolidIcon className="h-5 w-5 text-yellow-400" />
          ) : (
            <StarOutlineIcon className="h-5 w-5 text-gray-300" />
          )}
        </span>
      ))}
      <span className="text-sm text-gray-500 ml-2">
        ({rating?.toFixed(1) || 'N/A'})
      </span>
    </div>
  );
};

// Tableau de performance des cours
const CoursePerformanceTable = ({ courses }) => {
  return (
    <div className="overflow-x-auto rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cours</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inscriptions</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Complétion</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {courses.map((course, index) => (
            <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                <div className="flex items-center">
                  <img src={API_BASE_URL+course.thumbnailUrl} className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mr-3" />
                  <div>
                    <div className="font-medium">{course.title}</div>
                    <div className="text-xs text-gray-500">{course.category}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex items-center">
                  <UsersIcon className="h-4 w-4 text-gray-400 mr-1" />
                  {course.studentCount}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-indigo-600 h-2.5 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${Math.min(100, Math.max(0, course.averageProgress))}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    {Math.round(course.averageProgress)}%
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StarRating rating={course.rating} />
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

  // Données simulées pour les graphiques (en attendant les données réelles)
  const engagementData = useMemo(() => {
    if (!dashboardData?.userEngagement) return [];
    return dashboardData.userEngagement.map(d => ({
      ...d,
      date: new Date(d.date).toLocaleDateString()
    }));
  }, [dashboardData]);

  // Configuration des graphiques
  const revenueChartOptions = {
    chart: {
      type: 'area',
      height: 350,
      toolbar: { show: true },
      zoom: { enabled: false },
      animations: { enabled: true, easing: 'easeout', speed: 800 }
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
      labels: { style: { colors: '#64748b' } }
    },
    yaxis: {
      title: { text: 'Revenus (€)', style: { color: '#64748b' } },
      labels: { formatter: (val) => `€${val.toFixed(2)}` }
    },
    colors: ['#6366f1'],
    tooltip: {
      theme: 'light',
      x: { show: false }
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Tableau de bord administrateur</h1>
        <p className="text-gray-600 mt-2">Vue d'ensemble de la plateforme et gestion stratégique</p>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          icon={<UsersIcon className="h-6 w-6" />}
          label="Utilisateurs"
          value={dashboardData.stats?.totalUsers || 0}
          info={`${dashboardData.stats?.newUsersThisMonth || 0} nouveaux ce mois`}
          trendData={[30, 40, 35, 50, 49, 60]}
        />
        
        <StatCard 
          icon={<BookOpenIcon className="h-6 w-6" />}
          label="Cours publiés"
          value={dashboardData.stats?.activeCourses || 0}
          info={`${dashboardData.courseStatistics?.status?.draft || 0} en brouillon`}
          trendData={[5, 7, 10, 8, 12, 15]}
        />
        
        <StatCard 
          icon={<CurrencyDollarIcon className="h-6 w-6" />}
          label="Revenus totaux"
          value={`€${(dashboardData.stats?.totalRevenue || 0).toFixed(2)}`}
          trendData={[1200, 1500, 1100, 1800, 2000, 2400]}
        />
        
        <StatCard 
          icon={<AcademicCapIcon className="h-6 w-6" />}
          label="Certificats"
          value={dashboardData.stats?.certificatesIssued || 0}
          info={`${Math.round(dashboardData.stats?.averageCompletionRate || 0)}% complétion`}
          trendData={[20, 25, 30, 28, 35, 40]}
        />
      </div>

      {/* Graphiques principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Évolution des revenus</h3>
          <Chart
            options={revenueChartOptions}
            series={[{
              name: 'Revenus',
              data: dashboardData.revenueBreakdown?.map(d => d.revenue) || []
            }]}
            type="area"
            height={350}
          />
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Engagement des utilisateurs</h3>
          <Chart
            options={{
              chart: { 
                type: 'bar', 
                height: 350,
                animations: { enabled: true, easing: 'easeout', speed: 800 }
              },
              plotOptions: { bar: { borderRadius: 4 } },
              xaxis: { 
                categories: engagementData.map(d => d.date),
                labels: { style: { colors: '#64748b' } }
              },
              yaxis: { title: { text: 'Utilisateurs actifs', style: { color: '#64748b' } } },
              colors: ['#8b5cf6'],
            }}
            series={[{
              name: 'Utilisateurs actifs',
              data: engagementData.map(d => d.activeUsers)
            }]}
            type="bar"
            height={350}
          />
        </div>
      </div>

      {/* Performance des cours */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Performance des cours</h3>
          <Link to="/courses" className="text-indigo-600 hover:underline flex items-center">
            Voir tous <ChartBarIcon className="h-4 w-4 ml-1" />
          </Link>
        </div>
        <CoursePerformanceTable courses={dashboardData.coursePerformance || []} />
      </div>

      {/* Problèmes récents */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Alertes récentes</h3>
          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm flex items-center">
            <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
            {dashboardData.recentIssues?.length || 0} problèmes
          </span>
        </div>
        
        <div className="space-y-4">
          {(dashboardData.recentIssues || []).map((issue, index) => (
            <div 
              key={index} 
              className={`p-4 rounded-lg border-l-4 ${
                issue.severity === 'high' ? 'border-red-500 bg-red-50' : 
                issue.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' : 
                'border-blue-500 bg-blue-50'
              } transition-all duration-300 hover:scale-[1.01]`}
            >
              <div className="flex justify-between">
                <h4 className="font-medium text-gray-800">{issue.title}</h4>
                <span className="text-xs text-gray-500">
                  {new Date(issue.reportedAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
              <div className="mt-3 flex justify-between items-center">
                <span className="text-xs px-2 py-1 bg-white rounded-full">
                  {issue.affectedItems} éléments affectés
                </span>
                <button className="text-sm bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 transition-colors">
                  Résoudre
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Actions rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            to="/utilisateurs/nouveau" 
            className="bg-indigo-50 p-4 rounded-lg flex flex-col items-center text-center hover:bg-indigo-100 transition-colors group"
          >
            <div className="bg-indigo-100 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
              <UserPlusIcon className="h-8 w-8 text-indigo-600" />
            </div>
            <span className="font-medium text-gray-800">Ajouter utilisateur</span>
          </Link>
          
          <Link 
            to="/cours/nouveau" 
            className="bg-indigo-50 p-4 rounded-lg flex flex-col items-center text-center hover:bg-indigo-100 transition-colors group"
          >
            <div className="bg-indigo-100 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
              <BookOpenIcon className="h-8 w-8 text-indigo-600" />
            </div>
            <span className="font-medium text-gray-800">Créer un cours</span>
          </Link>
          
          <Link 
            to="/parametres" 
            className="bg-indigo-50 p-4 rounded-lg flex flex-col items-center text-center hover:bg-indigo-100 transition-colors group"
          >
            <div className="bg-indigo-100 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
              <CogIcon className="h-8 w-8 text-indigo-600" />
            </div>
            <span className="font-medium text-gray-800">Paramètres système</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminOverviewPage;