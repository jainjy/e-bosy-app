import React from "react";
import { Link } from "react-router-dom";
import { 
  BookOpenIcon, UsersIcon, ClockIcon, CurrencyDollarIcon,
  DocumentCheckIcon, AcademicCapIcon, ChartBarIcon, 
  LightBulbIcon, ChatBubbleLeftIcon, CalendarIcon
} from "@heroicons/react/24/outline";
import { useTeacherDashboard } from "../../hooks/useTeacherDashboard";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";
import Chart from 'react-apexcharts';
import { motion } from "framer-motion";

const EngagementHeatmap = ({ data }) => {
  const hourlyEngagement = data?.hourlyEngagement || [];
  const maxActivityCount = Math.max(...hourlyEngagement.map(h => h.activityCount), 1);

  return (
    <div className="p-4">
      <h4 className="text-sm font-medium text-gray-600 mb-3">
        Activité des étudiants par heure
      </h4>
      
      <div className="flex flex-col space-y-4">
        {/* Légende */}
        <div className="flex items-center justify-end space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-100 rounded"></div>
            <span className="text-xs text-gray-500">Faible activité</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-xs text-gray-500">Forte activité</span>
          </div>
        </div>

        {/* Grille des heures */}
        <div className="grid grid-cols-12 gap-2">
          {hourlyEngagement.map((hour, index) => {
            const intensity = hour.activityCount > 0 
              ? Math.min(4, Math.ceil((hour.activityCount / maxActivityCount) * 4)) 
              : 0;
            
            const bgClass = [
              'bg-gray-100',           // Aucune activité
              'bg-green-200',          // Faible activité
              'bg-green-300',          // Activité moyenne
              'bg-green-400',          // Activité élevée
              'bg-green-500',          // Activité très élevée
            ][intensity];

            return (
              <div key={index} className="flex flex-col items-center">
                <motion.div 
                  className={`w-full h-12 ${bgClass} rounded-lg cursor-pointer`}
                  whileHover={{ scale: 1.1 }}
                  title={`${hour.activityCount} étudiants actifs à ${hour.hour}h`}
                >
                  <div className="flex items-center justify-center h-full">
                    <span className="text-xs font-medium text-gray-700">
                      {hour.activityCount}
                    </span>
                  </div>
                </motion.div>
                <span className="text-xs text-gray-500 mt-1">
                  {hour.hour}h
                </span>
              </div>
            );
          })}
        </div>

        {/* Informations complémentaires */}
        <div className="text-xs text-gray-500 mt-2">
          <p>Cette visualisation montre le nombre d'étudiants actifs par heure de la journée.</p>
          <p>Plus la couleur est foncée, plus l'activité est importante.</p>
        </div>
      </div>
    </div>
  );
};

const ProgressRadial = ({ value, label, color, icon }) => {
  const validValue = Math.min(100, Math.max(0, value || 0));
  
  return (
    <motion.div 
      className="flex flex-col items-center p-4"
      whileHover={{ scale: 1.05 }}
    >
      <div className="relative w-24 h-24">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="251.2"
            strokeDashoffset={251.2 * (1 - validValue / 100)}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-gray-400 mb-1">
            {icon}
          </div>
          <span className="text-xl font-bold" style={{ color }}>
            {Math.round(validValue)}%
          </span>
        </div>
      </div>
      <p className="mt-2 text-center text-gray-600 text-sm font-medium">{label}</p>
    </motion.div>
  );
};

const TeacherOverviewPage = () => {
  const { dashboardData, loading, error } = useTeacherDashboard();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  // Configuration des graphiques
  const coursePerformanceOptions = {
    chart: {
      type: 'bar',
      height: 350,
      toolbar: { show: false },
      animations: { enabled: true, easing: 'easeout', speed: 800 }
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false,
        columnWidth: '35%',
        endingShape: 'rounded'
      },
    },
    colors: ['#6366f1', '#8b5cf6', '#ec4899'],
    dataLabels: { enabled: false },
    xaxis: {
      categories: dashboardData?.courses?.map(c => c.title) || [],
      labels: { style: { fontSize: '12px' } }
    },
    yaxis: { 
      title: { text: 'Pourcentage' },
      min: 0,
      max: 100
    },
    legend: {
      position: 'top',
      horizontalAlign: 'center'
    }
  };

  const assessmentPerformanceOptions = {
    chart: {
      type: 'bar',
      height: 350,
      toolbar: { show: false },
      animations: { enabled: true, easing: 'easeout', speed: 800 }
    },
    xaxis: { 
      categories: dashboardData?.assessmentPerformance?.scoreDistributions?.map(a => a.title) || [],
      labels: { style: { fontSize: '12px' } }
    },
    yaxis: { 
      title: { text: 'Nombre d’étudiants' },
      min: 0
    },
    colors: ['#f59e0b'],
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false,
      }
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Tableau de bord enseignant</h1>
          <p className="text-gray-600 mt-2">Analyse de la progression des étudiants et performance de vos cours</p>
        </div>
        <div className="mt-4 md:mt-0">
          <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm">
            <LightBulbIcon className="h-5 w-5 text-yellow-500 mr-2" />
            <span className="text-sm font-medium text-gray-700">
              {dashboardData?.stats?.certificatesIssued || 0} certificats délivrés
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard 
          icon={<BookOpenIcon className="h-8 w-8" />} 
          label="Cours publiés" 
          value={dashboardData?.stats?.publishedCourses || 0} 
          info="Votre portefeuille pédagogique"
        />
        <StatCard 
          icon={<UsersIcon className="h-8 w-8" />} 
          label="Étudiants actifs" 
          value={dashboardData?.stats?.totalStudents || 0} 
          info="Apprenants engagés"
        />
        <StatCard 
          icon={<ClockIcon className="h-8 w-8" />} 
          label="Heures enseignées" 
          value={dashboardData?.stats?.teachingHours || 0} 
          info="Temps investi"
        />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Indicateurs pédagogiques</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ProgressRadial 
            value={dashboardData?.stats?.averageCompletion || 0} 
            label="Complétion moyenne" 
            color="#6366f1" 
            icon={<DocumentCheckIcon className="h-6 w-6" />} 
          />
          <ProgressRadial 
            value={dashboardData?.stats?.averageQuizSuccess || 0} 
            label="Réussite aux quiz" 
            color="#8b5cf6" 
            icon={<AcademicCapIcon className="h-6 w-6" />} 
          />
          <ProgressRadial 
            value={dashboardData?.stats?.liveSessionParticipationRate || 0} 
            label="Participation sessions live" 
            color="#ec4899" 
            icon={<UsersIcon className="h-6 w-6" />} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Performance des cours</h3>
          <Chart 
            options={coursePerformanceOptions}
            series={[
              {
                name: 'Progression moyenne',
                data: dashboardData?.courses?.map(c => c.averageProgress) || []
              },
              {
                name: 'Réussite aux quiz',
                data: dashboardData?.courses?.map(c => c.quizSuccessRate) || []
              },
              {
                name: 'Taux de complétion',
                data: dashboardData?.courses?.map(c => c.completionRate) || []
              }
            ]}
            type="bar"
            height={350}
          />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Performance des évaluations</h3>
          <Chart 
            options={assessmentPerformanceOptions}
            series={[{
              name: 'Étudiants',
              data: dashboardData?.assessmentPerformance?.scoreDistributions?.map(a => 
                Object.values(a.scoreCounts).reduce((sum, count) => sum + count, 0)) || []
            }]}
            type="bar"
            height={350}
          />
        </div>

      </div>


      <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Étudiants nécessitant une attention</h3>
          <Link to="/students" className="text-indigo-600 hover:underline flex items-center text-sm">
            <UsersIcon className="h-4 w-4 mr-1" /> Voir tous
          </Link>
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
              {(dashboardData?.studentsNeedingAttention || []).map((student, index) => (
                <motion.tr 
                  key={index}
                  className="hover:bg-gray-50"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
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
                      <div 
                        className="h-2 rounded-full transition-all duration-1000 ease-out"
                        style={{ 
                          width: `${student.progress}%`,
                          backgroundColor: student.progress < 30 ? '#ef4444' : 
                                          student.progress < 60 ? '#f59e0b' : '#10b981'
                        }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.lastActivity ? 
                      new Date(student.lastActivity).toLocaleDateString('fr-FR', { 
                        day: 'numeric', month: 'short' 
                      }) : 
                      'Jamais'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link 
                      to={`/messages/${student.userId}`} 
                      className="text-indigo-600 hover:text-indigo-900 mr-3 flex items-center"
                    >
                      <ChatBubbleLeftIcon className="h-4 w-4 mr-1" /> Message
                    </Link>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Derniers retours sur les cours</h3>
            <Link to="/assessments" className="text-indigo-600 hover:underline flex items-center text-sm">
              <DocumentCheckIcon className="h-4 w-4 mr-1" /> Voir tous
            </Link>
          </div>
          <div className="space-y-4">
            {(dashboardData?.courseReviews || []).map((review, index) => (
              <motion.div 
                key={index}
                className="border border-gray-200 rounded-xl p-4 bg-gradient-to-r from-indigo-50 to-purple-50"
                whileHover={{ y: -5 }}
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-gray-800">{review.title}</h4>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`h-5 w-5 ${i < (review.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{review.feedback}</p>
                <Link 
                  to={`/course/${review.courseId}`} 
                  className="inline-block mt-3 text-indigo-600 text-sm font-medium hover:underline"
                >
                  Voir le cours
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Prochaines sessions live</h3>
            <Link to="/live-sessions" className="text-indigo-600 hover:underline flex items-center text-sm">
              <CalendarIcon className="h-4 w-4 mr-1" /> Voir calendrier
            </Link>
          </div>
          <div className="space-y-4">
            {(dashboardData?.upcomingSessions || []).map((session, index) => (
              <motion.div 
                key={index}
                className="border-l-4 border-indigo-500 pl-4 py-3 bg-indigo-50 rounded-r-lg"
                whileHover={{ x: 5 }}
              >
                <p className="font-medium text-gray-800">{session.title}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(session.startTime).toLocaleDateString('fr-FR', { 
                    weekday: 'short', 
                    day: 'numeric', 
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs bg-white px-2 py-1 rounded-full">
                    {session.attendeeCount} inscrits
                  </span>
                  <Link 
                    to={`/sessions/${session.courseId}`} 
                    className="text-sm text-indigo-600 font-medium hover:underline"
                  >
                    Détails
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">
            Analyse de l'activité quotidienne
          </h3>
          <div className="text-sm text-gray-500">
            Dernières 24 heures
          </div>
        </div>
        <EngagementHeatmap data={dashboardData?.engagementHeatmap} />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Actions rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            to="/ajouter-cours" 
            className="bg-indigo-50 p-4 rounded-xl flex flex-col items-center text-center hover:bg-indigo-100 transition-colors group"
          >
            <div className="bg-white p-3 rounded-full shadow mb-3 group-hover:scale-110 transition-transform">
              <BookOpenIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <span className="font-medium text-gray-800">Créer un cours</span>
          </Link>
          
          <Link 
            to="/sessions" 
            className="bg-indigo-50 p-4 rounded-xl flex flex-col items-center text-center hover:bg-indigo-100 transition-colors group"
          >
            <div className="bg-white p-3 rounded-full shadow mb-3 group-hover:scale-110 transition-transform">
              <UsersIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <span className="font-medium text-gray-800">Planifier une session</span>
          </Link>
          
          <Link 
            to="/evaluations" 
            className="bg-indigo-50 p-4 rounded-xl flex flex-col items-center text-center hover:bg-indigo-100 transition-colors group"
          >
            <div className="bg-white p-3 rounded-full shadow mb-3 group-hover:scale-110 transition-transform">
              <DocumentCheckIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <span className="font-medium text-gray-800">Créer une évaluation</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, info }) => {
  return (
    <motion.div 
      className="bg-white p-6 rounded-xl shadow flex items-center"
      whileHover={{ y: -5 }}
    >
      <div className="mr-4 text-indigo-600 bg-indigo-100 p-3 rounded-full">
        {icon}
      </div>
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {info && <p className="text-xs text-gray-500 mt-1">{info}</p>}
      </div>
    </motion.div>
  );
};

export default TeacherOverviewPage;