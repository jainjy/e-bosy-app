import React from "react";
import { Link } from "react-router-dom";
import { 
  AcademicCapIcon, ClockIcon, BookOpenIcon, CheckCircleIcon,
  CalendarIcon, UserGroupIcon, ChartBarIcon, LightBulbIcon
} from "@heroicons/react/24/outline";
import { useStudentDashboard } from "../../hooks/useStudentDashboard";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";
import Chart from 'react-apexcharts';
import { motion } from "framer-motion";
import { API_BASE_URL } from "../../services/ApiFetch";

const DEFAULT_COURSE_IMAGE = "/images/default-course.jpg";

const ActivityHeatmap = ({ data }) => {
  const activities = data?.activities || [];
  const maxValue = Math.max(...activities.map(a => a.coursesActive), 1);

  // Fonction pour obtenir le nom du jour en français
  const getDayName = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', { weekday: 'short' })
      .replace('.', '') // Enlever le point
      .slice(0, 3); // Prendre les 3 premiers caractères
  };

  // Grouper les activités par jour de la semaine
  const groupedActivities = activities.reduce((acc, activity) => {
    const dayName = getDayName(activity.date);
    if (!acc[dayName]) {
      acc[dayName] = [];
    }
    acc[dayName].push(activity);
    return acc;
  }, {});

  // Obtenir la liste des jours uniques dans l'ordre chronologique
  const uniqueDays = activities
    .map(activity => ({
      name: getDayName(activity.date),
      date: new Date(activity.date)
    }))
    .sort((a, b) => a.date - b.date)
    .map(day => day.name);

  return (
    <div className="overflow-x-auto p-4">
      {/* Labels des jours de la semaine */}
      <div className="flex mb-2 ml-2">
        {uniqueDays.map(day => (
          <div key={day} className="w-10 text-xs text-gray-500 text-center">
            {day}
          </div>
        ))}
      </div>

      <div className="flex">
        <div className="grid grid-cols-7 gap-2">
          {activities.map((activity, index) => {
            const intensity = activity.coursesActive > 0 
              ? Math.min(4, Math.ceil((activity.coursesActive / maxValue) * 4)) 
              : 0;
            
            const bgClass = [
              'bg-gray-100 border border-gray-200',            // 0 activité
              'bg-indigo-200 border border-indigo-300',        // 1-25% activité
              'bg-indigo-400 border border-indigo-500',        // 26-50% activité
              'bg-indigo-600 border border-indigo-700',        // 51-75% activité
              'bg-indigo-800 border border-indigo-900',        // 76-100% activité
            ][intensity];
            
            const date = new Date(activity.date);
            const formattedDate = date.toLocaleDateString('fr-FR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long'
            });
            
            return (
              <motion.div 
                key={index}
                className={`w-10 h-10 rounded-lg ${bgClass} cursor-pointer
                          transition-all duration-200 ease-in-out`}
                whileHover={{ 
                  scale: 1.2,
                  boxShadow: '0 0 8px rgba(99, 102, 241, 0.4)'
                }}
                data-tip={`
                  ${activity.coursesActive} cours actif(s)
                  ${formattedDate}
                `}
              >
                <span className={`flex items-center justify-center h-full
                              text-xs font-medium
                              ${intensity > 2 ? 'text-white' : 'text-gray-700'}`}>
                  {activity.coursesActive}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Étiquettes temporelles */}
      <div className="flex justify-between mt-2">
        <span className="text-xs text-gray-500">
          Il y a {activities.length} jours
        </span>
        <span className="text-xs text-gray-500">
          Aujourd'hui
        </span>
      </div>
    </div>
  );
};

const StudentOverviewPage = () => {
  const { dashboardData, loading, error } = useStudentDashboard();
  console.log("Dashboard Data:", dashboardData);
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;
  if (!dashboardData) return <div>Aucune donnée disponible</div>;

  // Configuration des graphiques
  const timeSpentOptions = {
    chart: {
      type: 'bar',
      height: 350,
      toolbar: { show: false },
      animations: { enabled: true, easing: 'easeout', speed: 800 }
    },
    xaxis: { 
      categories: dashboardData.timeSpent.dailyBreakdown.map(d => 
        new Date(d.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
      )
    },
    yaxis: { 
      title: { text: 'Minutes passées' },
      labels: { formatter: (val) => Math.round(val) }
    },
    colors: ['#6366f1'],
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false,
      }
    }
  };

  const peerComparisonOptions = {
    chart: {
      type: 'bar',
      height: 350,
      toolbar: { show: false },
      animations: { enabled: true, easing: 'easeout', speed: 800 }
    },
    xaxis: { 
      categories: ['Votre progression', 'Moyenne des pairs'],
      labels: { style: { fontSize: '14px' } }
    },
    yaxis: { 
      title: { text: 'Progression (%)' },
      min: 0,
      max: 100
    },
    colors: ['#8b5cf6', '#ec4899'],
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false,
        columnWidth: '45%',
      }
    }
  };

  const assessmentOptions = {
    chart: {
      type: 'radar',
      height: 350,
      toolbar: { show: false }
    },
    xaxis: {
      categories: dashboardData.assessmentPerformance.submissions.map(s => s.assessmentTitle)
    },
    yaxis: {
      show: false,
      min: 0,
      max: 100
    },
    markers: {
      size: 4,
      colors: ['#ff6384'],
      strokeWidth: 2
    },
    fill: {
      opacity: 0.1,
      colors: ['#ff6384']
    },
    stroke: {
      width: 2,
      colors: ['#ff6384']
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Tableau de bord étudiant</h1>
          <p className="text-gray-600 mt-2">Suivi de votre progression d'apprentissage</p>
        </div>
        <div className="mt-4 md:mt-0">
          <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm">
            <LightBulbIcon className="h-5 w-5 text-yellow-500 mr-2" />
            <span className="text-sm font-medium text-gray-700">
              {dashboardData.stats.points || 0} points d'expérience
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          icon={<BookOpenIcon className="h-8 w-8" />} 
          label="Cours suivis" 
          value={dashboardData.stats.enrolledCourses} 
          info="Votre parcours d'apprentissage"
        />
        <StatCard 
          icon={<CheckCircleIcon className="h-8 w-8" />} 
          label="Cours terminés" 
          value={dashboardData.stats.completedCourses} 
          info="Objectifs accomplis"
        />
        <StatCard 
          icon={<ClockIcon className="h-8 w-8" />} 
          label="Heures apprises" 
          value={dashboardData.stats.learningHours} 
          info="Temps investi"
        />
        <StatCard 
          icon={<AcademicCapIcon className="h-8 w-8" />} 
          label="Certificats" 
          value={dashboardData.stats.certificatesCount} 
          info="Réussites validées"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Activité récente</h3>
          <ActivityHeatmap data={dashboardData.weeklyActivity} />

        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Prochaines Conferences</h3>
            <Link to="/live-sessions" className="text-indigo-600 hover:underline flex items-center text-sm">
              <CalendarIcon className="h-4 w-4 mr-1" /> Voir plus
            </Link>
          </div>
          <div className="space-y-4">
            {dashboardData.upcomingSchedule.slice(0, 3).map((item, index) => (
              <motion.div 
                key={index}
                className="border-l-4 border-indigo-500 pl-4 py-2 bg-indigo-50 rounded-r-lg"
                whileHover={{ x: 5 }}
              >
                <p className="font-medium text-gray-800">{item.title}</p>
                <p className="text-sm text-gray-600">{item.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {item.type === 'live_session' ? 'Session live' : 'Évaluation'} • 
                  <span className="ml-1">
                    {new Date(item.date).toLocaleDateString('fr-FR', { 
                      weekday: 'short', 
                      day: 'numeric', 
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Temps passé</h3>
          <Chart 
            options={timeSpentOptions}
            series={[{
              name: 'Minutes',
              data: dashboardData.timeSpent.dailyBreakdown.map(d => d.minutes)
            }]}
            type="bar"
            height={350}
          />
          <p className="mt-2 text-center text-gray-600">
            Total: {Math.floor(dashboardData.timeSpent.totalMinutes / 60)}h {dashboardData.timeSpent.totalMinutes % 60}min
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Comparaison avec les pairs</h3>
          <Chart 
            options={peerComparisonOptions}
            series={[{
              name: 'Progression',
              data: [
                Math.round(dashboardData.peerComparison.yourProgress),
                Math.round(dashboardData.peerComparison.averageProgress)
              ]
            }]}
            type="bar"
            height={350}
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Cours en progression</h3>
          <Link to="/mycourses" className="text-indigo-600 hover:underline flex items-center text-sm">
            <BookOpenIcon className="h-4 w-4 mr-1" /> Voir tous
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dashboardData.continueLearning.map((course, index) => (
            <CourseProgressCard key={index} course={course} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Performance aux évaluations</h3>
          <Chart 
            options={assessmentOptions}
            series={[{
              name: 'Score (%)',
              data: dashboardData.assessmentPerformance.submissions.map(s => 
                Math.round((s.score / s.totalScore) * 100)
              )
            }]}
            type="radar"
            height={350}
          />
          <p className="mt-2 text-center text-gray-600">
            Score moyen: {Math.round(dashboardData.assessmentPerformance.averageScore)}%
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Certificats obtenus</h3>
            <Link to="/certificates" className="text-indigo-600 hover:underline flex items-center text-sm">
              <AcademicCapIcon className="h-4 w-4 mr-1" /> Voir tous
            </Link>
          </div>
          <div className="space-y-4">
            {dashboardData.certificates.slice(0, 2).map((cert, index) => (
              <motion.div 
                key={index}
                className="flex items-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg"
                whileHover={{ scale: 1.02 }}
              >
                <div className="bg-white p-3 rounded-full shadow mr-4">
                  <AcademicCapIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium">{cert.courseTitle}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Délivré le {new Date(cert.issuedAt).toLocaleDateString('fr-FR')}
                  </p>
                  <Link 
                    to={`/certificates/${cert.verificationCode}`}
                    className="inline-block mt-2 text-indigo-600 text-sm font-medium hover:underline"
                  >
                    voir le certificat
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Répartition par sujet</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {dashboardData.subjectDistribution.subjects.map((subject, index) => (
            <motion.div 
              key={index}
              className="bg-indigo-50 p-4 rounded-lg text-center"
              whileHover={{ y: -5 }}
            >
              <p className="text-lg font-bold text-indigo-700">{subject.percentage}%</p>
              <p className="text-gray-700">{subject.subject}</p>
              <p className="text-sm text-gray-500 mt-1">
                {subject.completedLessons} leçons complétées
              </p>
            </motion.div>
          ))}
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
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {info && <p className="text-xs text-gray-500 mt-1">{info}</p>}
      </div>
    </motion.div>
  );
};

const CourseProgressCard = ({ course }) => {
  return (
    <motion.div 
      className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
      whileHover={{ y: -5 }}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h4 className="font-semibold text-gray-800 text-lg line-clamp-1">{course.title}</h4>
            <p className="text-sm text-gray-600">Par {course.instructor}</p>
          </div>
          <img 
            src={API_BASE_URL+ course.thumbnailUrl || DEFAULT_COURSE_IMAGE} 
            alt={course.title} 
            className="w-16 h-16 object-cover rounded-lg border"
          />
        </div>
        <div className="mt-3 text-sm text-gray-700">
          <div className="flex justify-between mb-1">
            <span>Progression</span>
            <span>{course.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${course.progress}%` }}
            ></div>
          </div>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            <p>Prochaine: {course.nextLesson}</p>
          </div>
          <Link 
            to={`/cours/${course.courseId}`}
            className="text-indigo-600 text-sm font-medium hover:underline flex items-center"
          >
            Continuer
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default StudentOverviewPage;