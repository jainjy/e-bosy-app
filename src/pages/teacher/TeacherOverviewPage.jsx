import React from "react";
import { Link } from "react-router-dom";
import { 
  BookOpenIcon, UsersIcon, ClockIcon,
  DocumentCheckIcon, AcademicCapIcon, LightBulbIcon, ChatBubbleLeftIcon, CalendarIcon
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
    <div className="p-4 bg-white rounded-xl shadow-lg">
      <h4 className="text-sm font-semibold text-gray-700 mb-4">
        Activité des étudiants par heure
      </h4>
      
      {/* Légende */}
      <div className="flex items-center justify-end space-x-6 mb-3 select-none">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border rounded bg-gray-100" />
          <span className="text-xs text-gray-500">Faible activité</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded bg-purple-500" />
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
            'bg-gray-100',             // Aucune activité
            'bg-purple-200',           // Faible activité
            'bg-purple-300',           // Activité moyenne
            'bg-purple-400',           // Activité élevée
            'bg-purple-600',           // Activité très élevée
          ][intensity];

          return (
            <div key={index} className="flex flex-col items-center" >
              <motion.div 
                className={`w-full h-12 ${bgClass} rounded-lg cursor-pointer`}
                whileHover={{ scale: 1.1, boxShadow: '0 0 10px rgba(124, 58, 237, 0.5)' }}
                title={`${hour.activityCount} étudiants actifs à ${hour.hour}h`}
                aria-label={`${hour.activityCount} étudiants actifs à ${hour.hour} heures`}
              >
                <div className="flex items-center justify-center h-full">
                  <span className="text-xs font-semibold text-gray-800">
                    {hour.activityCount}
                  </span>
                </div>
              </motion.div>
              <span className="text-xs text-gray-500 mt-1 select-none">
                {hour.hour}h
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-500 mt-3 select-none">
        Cette visualisation montre le nombre d'étudiants actifs par heure de la journée.<br />
        Plus la couleur est foncée, plus l'activité est importante.
      </p>
    </div>
  );
};

const StatCard = ({ icon, label, value, info }) => {
  return (
    <motion.div 
      className="bg-white p-6 rounded-xl shadow-md flex items-center gap-6 cursor-default select-none"
      whileHover={{ y: -5, boxShadow: '0 10px 15px rgba(124, 58, 237, 0.3)' }}
    >
      <div className="mr-4 text-purple-600 bg-purple-100 p-3 rounded-full flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-gray-600 text-sm font-semibold">{label}</p>
        <p className="text-2xl font-extrabold text-gray-900">{value}</p>
        {info && <p className="text-xs text-gray-500 mt-1">{info}</p>}
      </div>
    </motion.div>
  );
};

const ProgressRadial = ({ value, label, color, icon }) => {
  const validValue = Math.min(100, Math.max(0, value || 0));
  
  return (
    <motion.div 
      className="flex flex-col items-center p-4 bg-white rounded-xl shadow-md select-none"
      whileHover={{ scale: 1.05, boxShadow: `0 0 15px ${color}88` }}
    >
      <div className="relative w-24 h-24">
        <svg className="w-full h-full" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
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
      <p className="mt-2 text-center text-gray-700 text-sm font-medium">{label}</p>
    </motion.div>
  );
};

const TeacherOverviewPage = () => {
  const { dashboardData, loading, error } = useTeacherDashboard();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;
  if (!dashboardData) return <div className="p-6 text-center text-gray-500">Aucune donnée disponible</div>;

  const coursePerformanceOptions = {
    chart: {
      type: 'bar',
      height: 350,
      toolbar: { show: false },
      animations: { enabled: true, easing: 'easeout', speed: 800 }
    },
    plotOptions: {
      bar: {
        borderRadius: 6,
        horizontal: false,
        columnWidth: '40%',
        endingShape: 'rounded'
      },
    },
    colors: ['#7C3AED', '#8B5CF6', '#4F46E5'], // violet / indigo / bleu foncé
    dataLabels: { enabled: false },
    xaxis: {
      categories: dashboardData?.courses?.map(c => c.title) || [],
      labels: { style: { fontSize: '12px', fontWeight: '600' } }
    },
    yaxis: { 
      title: { text: 'Pourcentage', style: { fontWeight: '600' } },
      min: 0,
      max: 100
    },
    legend: {
      position: 'top',
      horizontalAlign: 'center',
      fontSize: '14px',
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
      labels: { style: { fontSize: '12px', fontWeight: '600' } }
    },
    yaxis: { 
      title: { text: 'Nombre d’étudiants', style: { fontWeight: '600' } },
      min: 0
    },
    colors: ['#4F46E5'], // bleu foncé au lieu du rose
    plotOptions: {
      bar: {
        borderRadius: 6,
        horizontal: false,
      }
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen max-w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Tableau de bord enseignant</h1>
          <p className="text-gray-600 mt-2 max-w-xl select-none">Analyse de la progression des étudiants et performance de vos cours</p>
        </div>
        
        <div>
          <div className="flex items-center bg-white px-5 py-3 rounded-full shadow-sm select-none">
            <LightBulbIcon className="h-6 w-6 text-indigo-500 mr-3" aria-hidden="true" />
            <span className="text-lg font-semibold text-gray-700">
              {dashboardData?.stats?.certificatesIssued || 0} certificats délivrés
            </span>
          </div>
        </div>
      </div>

      {/* StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
        <StatCard 
          icon={<BookOpenIcon className="h-10 w-10" aria-hidden="true" />} 
          label="Cours publiés" 
          value={dashboardData?.stats?.publishedCourses || 0} 
          info="Votre portefeuille pédagogique"
        />
        <StatCard 
          icon={<UsersIcon className="h-10 w-10" aria-hidden="true" />} 
          label="Étudiants actifs" 
          value={dashboardData?.stats?.totalStudents || 0} 
          info="Apprenants engagés"
        />
        <StatCard 
          icon={<ClockIcon className="h-10 w-10" aria-hidden="true" />} 
          label="Heures enseignées" 
          value={dashboardData?.stats?.teachingHours || 0} 
          info="Temps investi"
        />
      </div>

      {/* Indicateurs pédagogiques */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 select-none">Indicateurs pédagogiques</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ProgressRadial 
            value={dashboardData?.stats?.averageCompletion || 0} 
            label="Complétion moyenne" 
            color="#7C3AED" 
            icon={<DocumentCheckIcon className="h-6 w-6" />}
          />
          <ProgressRadial 
            value={dashboardData?.stats?.averageQuizSuccess || 0} 
            label="Réussite aux quiz" 
            color="#8B5CF6" 
            icon={<AcademicCapIcon className="h-6 w-6" />}
          />
          <ProgressRadial 
            value={dashboardData?.stats?.liveSessionParticipationRate || 0} 
            label="Participation sessions live" 
            color="#4F46E5" 
            icon={<UsersIcon className="h-6 w-6" />}
          />
        </div>
      </div>

      {/* Graphiques performances */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 select-none">Performance des cours</h3>
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
            aria-label="Graphique performance des cours"
          />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 select-none">Performance des évaluations</h3>
          <Chart 
            options={assessmentPerformanceOptions}
            series={[{
              name: 'Étudiants',
              data: dashboardData?.assessmentPerformance?.scoreDistributions?.map(a => 
                Object.values(a.scoreCounts).reduce((sum, count) => sum + count, 0)) || []
            }]}
            type="bar"
            height={350}
            aria-label="Graphique performance des évaluations"
          />
        </div>
      </div>

      {/* Étudiants nécessitant une attention */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-10 overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900 select-none">Étudiants nécessitant une attention</h3>
          <Link to="/students" className="text-indigo-600 hover:underline flex items-center text-sm">
            <UsersIcon className="h-4 w-4 mr-1" aria-hidden="true" /> Voir tous
          </Link>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider select-none">Étudiant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider select-none">Cours</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider select-none">Progression</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider select-none">Dernière activité</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider select-none">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(dashboardData?.studentsNeedingAttention || []).map((student, index) => (
              <motion.tr 
                key={index}
                className="hover:bg-gray-50 transition-colors duration-200"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="text-sm font-medium text-gray-900 truncate">{student.name}</div>
                      <div className="text-sm text-gray-500 truncate">{student.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.courseTitle}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{student.progress}%</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className={`h-2 rounded-full transition-all duration-1000 ease-out`}
                      style={{ 
                        width: `${student.progress}%`,
                        backgroundColor: student.progress < 30 ? '#dc2626' : (student.progress < 60 ? '#fbbf24' : '#7c3aed') // rouge / jaune / violet
                      }}
                    ></div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.lastActivity ? 
                    new Date(student.lastActivity).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : 
                    'Jamais'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link 
                    to={`/messages/${student.userId}`} 
                    className="text-purple-700 hover:text-purple-900 flex items-center"
                    aria-label={`Envoyer un message à ${student.name}`}
                  >
                    <ChatBubbleLeftIcon className="h-4 w-4 mr-1" aria-hidden="true" /> Message
                  </Link>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>


      {/* Derniers retours + sessions live */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-lg overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900 select-none">Derniers retours sur les cours</h3>
            <Link to="/assessments" className="text-purple-700 hover:underline flex items-center text-sm font-semibold">
              <DocumentCheckIcon className="h-4 w-4 mr-1" aria-hidden="true" /> Voir tous
            </Link>
          </div>
          <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
            {(dashboardData?.courseReviews || []).map((review, index) => (
              <motion.div 
                key={index}
                className="border border-gray-200 rounded-xl p-4 bg-gradient-to-r from-purple-50 to-indigo-50 cursor-pointer select-none"
                whileHover={{ y: -5, boxShadow: '0 5px 15px rgba(124, 58, 237, 0.15)' }}
                aria-label={`Retour sur ${review.title} avec note ${review.rating}`}
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-gray-800 truncate">{review.title}</h4>
                  <div className="flex items-center" aria-label={`Note ${review.rating} étoiles`}>
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`h-5 w-5 ${i < (review.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                        focusable="false"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{review.feedback}</p>
                <Link 
                  to={`/course/${review.courseId}`} 
                  className="inline-block mt-3 text-purple-700 text-sm font-semibold hover:underline"
                  aria-label={`Voir le cours ${review.title}`}
                >
                  Voir le cours
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg overflow-y-auto max-h-[560px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900 select-none">Prochaines sessions live</h3>
            <Link to="/live-sessions" className="text-purple-700 hover:underline flex items-center text-sm font-semibold">
              <CalendarIcon className="h-4 w-4 mr-1" aria-hidden="true" /> Voir calendrier
            </Link>
          </div>
          <div className="space-y-4">
            {(dashboardData?.upcomingSessions || []).map((session, index) => (
              <motion.div 
                key={index}
                className="border-l-4 border-purple-700 pl-4 py-3 bg-purple-50 rounded-r-lg select-none cursor-default"
                whileHover={{ x: 5, boxShadow: '0 2px 10px rgba(124, 58, 237, 0.2)' }}
                aria-label={`${session.title}, ${new Date(session.startTime).toLocaleString('fr-FR')}, ${session.attendeeCount} inscrits`}
              >
                <p className="font-semibold text-gray-800 truncate">{session.title}</p>
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
                  <span className="text-xs bg-white px-2 py-1 rounded-full select-none">
                    {session.attendeeCount} inscrit{session.attendeeCount > 1 ? 's' : ''}
                  </span>
                  <Link 
                    to={`/sessions/${session.courseId}`} 
                    className="text-sm text-purple-700 font-medium hover:underline"
                    aria-label={`Voir détails de la session ${session.title}`}
                  >
                    Détails
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherOverviewPage;
