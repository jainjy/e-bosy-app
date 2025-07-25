import React from "react";
import { Link } from "react-router-dom";
import { 
  AcademicCapIcon, ClockIcon, BookOpenIcon, CheckCircleIcon,
  CalendarIcon, LightBulbIcon
} from "@heroicons/react/24/outline";
import { useStudentDashboard } from "../../hooks/useStudentDashboard";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";
import Chart from 'react-apexcharts';
import { motion } from "framer-motion";
import { Tooltip as ReactTooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { API_BASE_URL } from "../../services/ApiFetch";

const DEFAULT_COURSE_IMAGE = "/images/default-course.jpg";

const ActivityHeatmap = ({ data }) => {
  const activities = data?.activities || [];
  const maxValue = Math.max(...activities.map(a => a.coursesActive), 1);

  // Fonction pour obtenir le nom du jour en français court
  const getDayName = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', { weekday: 'short' })
      .replace('.', '') // retirer les points
      .slice(0, 3);
  };

  // Jours uniq en ordre chrono
  const uniqueDays = [...new Set(
    activities.map(activity => getDayName(activity.date))
  )];

  return (
    <div className="overflow-x-auto p-4">
      <div className="flex flex-col items-center">
        {/* Labels des jours avec largeur fixe alignée sur la grille */}
        <div className="grid grid-cols-7 gap-2 mb-2 w-full max-w-[280px]">
          {uniqueDays.map(day => (
            <div key={day} className="text-xs font-semibold text-gray-500 text-center">
              {day}
            </div>
          ))}
        </div>

        {/* Grille d'activités avec la même largeur fixe */}
        <div className="grid grid-cols-7 gap-2 w-full max-w-[280px]">
          {activities.map((activity, index) => {
            const intensity = activity.coursesActive > 0 
              ? Math.min(4, Math.ceil((activity.coursesActive / maxValue) * 4)) 
              : 0;

            const bgClasses = [
              'bg-gray-100 border border-gray-200',
              'bg-indigo-100 border-indigo-200',
              'bg-indigo-300 border-indigo-400',
              'bg-indigo-600 border-indigo-700',
              'bg-indigo-900 border-indigo-900',
            ];
            const bgClass = bgClasses[intensity];

            const date = new Date(activity.date);
            const formattedDate = date.toLocaleDateString('fr-FR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long'
            });

            return (
              <motion.div 
                key={index}
                className={`aspect-square rounded-lg cursor-pointer ${bgClass} transition-all duration-300 ease-in-out shadow-sm flex items-center justify-center`}
                whileHover={{ scale: 1.2, boxShadow: '0 0 10px rgba(99, 102, 241, 0.5)' }}
                data-tooltip-id="activity-tooltip"
                data-tooltip-content={`${activity.coursesActive} cours actif(s)\n${formattedDate}`}
                aria-label={`${activity.coursesActive} cours actif(s) le ${formattedDate}`}
              >
                <span className={`text-xs font-semibold ${intensity > 2 ? 'text-white' : 'text-gray-700'}`}>
                  {activity.coursesActive}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Légende avec la même largeur */}
        <div className="flex justify-between w-full max-w-[280px] mt-2 px-2 text-xs text-gray-500 select-none">
          <span>Il y a {activities.length} jours</span>
          <span>Aujourd'hui</span>
        </div>
      </div>

      <ReactTooltip id="activity-tooltip" />
    </div>
  );
};

const StudentOverviewPage = () => {
  const { dashboardData, loading, error } = useStudentDashboard();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;
  if (!dashboardData) return <div className="p-6 text-center">Aucune donnée disponible</div>;

  // Configuration graphiques ApexCharts améliorée
  const timeSpentOptions = {
    chart: {
      type: 'bar',
      height: 350,
      toolbar: { show: false },
      animations: { enabled: true, easing: 'easeout', speed: 900 }
    },
    xaxis: { 
      categories: dashboardData.timeSpent.dailyBreakdown.map(d => 
        new Date(d.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
      ),
      labels: { style: { fontSize: '12px', fontWeight: '600' } }
    },
    yaxis: { 
      title: { text: 'Minutes passées', style: { fontWeight: 'bold' } },
      labels: { formatter: val => Math.round(val) }
    },
    colors: ['#6366f1'],
    plotOptions: {
      bar: {
        borderRadius: 6,
        horizontal: false,
        columnWidth: '60%',
      }
    },
    tooltip: {
      y: { formatter: val => `${val} min` }
    },
  };

  const peerComparisonOptions = {
    chart: {
      type: 'bar',
      height: 350,
      toolbar: { show: false },
      animations: { enabled: true, easing: 'easeout', speed: 900 }
    },
    xaxis: { 
      categories: ['Votre progression', 'Moyenne des pairs'],
      labels: { style: { fontSize: '14px', fontWeight: '600' } }
    },
    yaxis: {
      title: { text: 'Progression (%)', style: { fontWeight: 'bold' } },
      min: 0,
      max: 100,
    },
    colors: ['#8b5cf6', '#ec4899'],
    plotOptions: {
      bar: {
        borderRadius: 6,
        horizontal: false,
        columnWidth: '45%',
      }
    },
    tooltip: {
      y: { formatter: val => `${val}%` }
    },
  };

  const assessmentOptions = {
    chart: {
      type: 'radar',
      height: 350,
      toolbar: { show: false }
    },
    xaxis: {
      categories: dashboardData.assessmentPerformance.submissions.map(s => s.assessmentTitle),
      labels: { style: { fontWeight: '600' } }
    },
    yaxis: {
      show: false,
      min: 0,
      max: 100
    },
    markers: {
      size: 5,
      colors: ['#ec4899'],
      strokeWidth: 3,
      strokeColor: '#ec4899',
    },
    fill: {
      opacity: 0.15,
      colors: ['#ec4899']
    },
    stroke: {
      width: 3,
      colors: ['#ec4899']
    },
    tooltip: {
      y: { formatter: val => `${val}%` }
    },
  };


  return (
    <div className="p-6 bg-gray-50 min-h-screen max-w-full">
      {/* Header + XP */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Tableau de bord étudiant</h1>
          <p className="text-gray-600 mt-2 max-w-xl select-none">Suivi de votre progression d'apprentissage</p>
        </div>
        <div>
          <div className="flex items-center bg-white px-5 py-3 rounded-full shadow-md select-none">
            <LightBulbIcon className="h-6 w-6 text-yellow-400 mr-3" aria-hidden="true" />
            <span className="text-lg font-semibold text-gray-700">{dashboardData.stats.points || 0} points d'expérience</span>
          </div>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
        <StatCard 
          icon={<BookOpenIcon className="h-10 w-10" aria-hidden="true" />} 
          label="Cours suivis" 
          value={dashboardData.stats.enrolledCourses} 
          info="Votre parcours d'apprentissage"
        />
        <StatCard 
          icon={<CheckCircleIcon className="h-10 w-10" aria-hidden="true" />} 
          label="Cours terminés" 
          value={dashboardData.stats.completedCourses} 
          info="Objectifs accomplis"
        />
        <StatCard 
          icon={<ClockIcon className="h-10 w-10" aria-hidden="true" />} 
          label="Heures apprises" 
          value={dashboardData.stats.learningHours} 
          info="Temps investi"
        />
        <StatCard 
          icon={<AcademicCapIcon className="h-10 w-10" aria-hidden="true" />} 
          label="Certificats" 
          value={dashboardData.stats.certificatesCount} 
          info="Réussites validées"
        />
      </div>

      {/* Activité + Prochaines conférences */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <section className="lg:col-span-1 bg-white p-8 rounded-2xl shadow-lg">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6 select-none">Activité récente</h3>
          <ActivityHeatmap data={dashboardData.weeklyActivity} />
        </section>

        <section className="bg-white p-8 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-semibold text-gray-900 select-none">Prochaines Conférences</h3>
            <Link 
              to="/live-sessions" 
              className="text-indigo-600 hover:underline flex items-center text-sm font-semibold"
            >
              <CalendarIcon className="h-5 w-5 mr-1" aria-hidden="true" /> Voir plus
            </Link>
          </div>
          <div className="space-y-5">
            {dashboardData.upcomingSchedule.slice(0, 3).map((item, index) => (
              <motion.div 
                key={index}
                className="border-l-4 border-indigo-500 pl-5 py-3 bg-indigo-50 rounded-r-lg cursor-pointer select-none"
                whileHover={{ x: 5, boxShadow: '0 2px 10px rgba(99, 102, 241, 0.2)' }}
                aria-label={`${item.title} - ${item.description} le ${new Date(item.date).toLocaleString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit'
                })}`}
              >
                <p className="font-semibold text-gray-900 truncate">{item.title}</p>
                <p className="text-sm text-gray-700 truncate">{item.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {item.type === 'live_session' ? 'Session live' : 'Évaluation'} •{' '}
                  <span>{new Date(item.date).toLocaleDateString('fr-FR', { 
                    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
                  })}</span>
                </p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      {/* Temps passé + Comparaison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
        <section className="bg-white p-8 rounded-2xl shadow-lg overflow-x-auto">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6 select-none">Temps passé</h3>
          <Chart 
            options={timeSpentOptions}
            series={[{
              name: 'Minutes',
              data: dashboardData.timeSpent.dailyBreakdown.map(d => d.minutes)
            }]}
            type="bar"
            height={320}
          />
          <p className="mt-3 text-center text-gray-600 font-medium select-none">
            Total : {Math.floor(dashboardData.timeSpent.totalMinutes / 60)}h {dashboardData.timeSpent.totalMinutes % 60}min
          </p>
        </section>

        <section className="bg-white p-8 rounded-2xl shadow-lg overflow-x-auto">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6 select-none">Comparaison avec les pairs</h3>
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
            height={320}
          />
        </section>
      </div>

      {/* Cours en progression */}
      <section className="bg-white p-8 rounded-2xl shadow-lg mb-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold text-gray-900 select-none">Cours en progression</h3>
          <Link 
            to="/mycourses" 
            className="text-indigo-600 hover:underline flex items-center text-base font-semibold"
            aria-label="Voir tous les cours en progression"
          >
            <BookOpenIcon className="h-5 w-5 mr-1" aria-hidden="true" /> Voir tous
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {dashboardData.continueLearning.map((course, index) => (
            <CourseProgressCard key={index} course={course} />
          ))}
        </div>
      </section>

      {/* Evaluation + Certificats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
        <section className="bg-white p-8 rounded-2xl shadow-lg overflow-x-auto">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6 select-none">Performance aux évaluations</h3>
          <Chart 
            options={assessmentOptions}
            series={[{
              name: 'Score (%)',
              data: dashboardData.assessmentPerformance.submissions.map(s => 
                Math.round((s.score / s.totalScore) * 100)
              )
            }]}
            type="radar"
            height={320}
          />
          <p className="mt-3 text-center text-gray-600 font-medium select-none">
            Score moyen : {Math.round(dashboardData.assessmentPerformance.averageScore)}%
          </p>
        </section>

        <section className="bg-white p-8 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-semibold text-gray-900 select-none">Certificats obtenus</h3>
            <Link 
              to="/certificates" 
              className="text-indigo-600 hover:underline flex items-center text-base font-semibold"
              aria-label="Voir tous les certificats obtenus"
            >
              <AcademicCapIcon className="h-5 w-5 mr-1" aria-hidden="true" /> Voir tous
            </Link>
          </div>
          <div className="space-y-6">
            {dashboardData.certificates.slice(0, 2).map((cert, index) => (
              <motion.div 
                key={index}
                className="flex items-center p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl select-none cursor-pointer"
                whileHover={{ scale: 1.03, boxShadow: '0 4px 12px rgba(99, 102, 241, 0.15)' }}
                aria-label={`Certificat du cours ${cert.courseTitle}, délivré le ${new Date(cert.issuedAt).toLocaleDateString('fr-FR')}`}
              >
                <div className="bg-white p-4 rounded-full shadow mr-5 flex-shrink-0">
                  <AcademicCapIcon className="h-7 w-7 text-indigo-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 truncate max-w-xs">{cert.courseTitle}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Délivré le {new Date(cert.issuedAt).toLocaleDateString('fr-FR')}
                  </p>
                  <Link 
                    to={`/certificates/${cert.verificationCode}`}
                    className="inline-block mt-2 text-indigo-600 text-sm font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
                  >
                    Voir le certificat
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      {/* Répartition par sujet */}
      <section className="bg-white p-8 rounded-2xl shadow-lg">
        <h3 className="text-2xl font-semibold text-gray-900 mb-6 select-none">Répartition par sujet</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {dashboardData.subjectDistribution.subjects.map((subject, index) => (
            <motion.div 
              key={index}
              className="bg-indigo-50 p-6 rounded-xl text-center cursor-default select-none"
              whileHover={{ y: -6, boxShadow: '0 10px 15px rgba(99, 102, 241, 0.15)' }}
              aria-label={`${subject.percentage} % sur le sujet ${subject.subject}, ${subject.completedLessons} leçons complétées`}
            >
              <p className="text-lg font-extrabold text-indigo-700">{subject.percentage}%</p>
              <p className="text-gray-700 mt-1 font-semibold">{subject.subject}</p>
              <p className="text-sm text-gray-500 mt-2">{subject.completedLessons} leçons complétées</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

const StatCard = ({ icon, label, value, info }) => {
  return (
    <motion.div 
      className="bg-white p-6 rounded-2xl shadow-md flex items-center gap-6 cursor-default select-none"
      whileHover={{ y: -6, boxShadow: '0 10px 15px rgba(99, 102, 241, 0.15)' }}
    >
      <div className="text-indigo-600 bg-indigo-100 p-4 rounded-full flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-gray-500 text-sm font-semibold">{label}</p>
        <p className="text-4xl font-extrabold text-gray-900">{value}</p>
        {info && <p className="text-xs text-gray-400 mt-1">{info}</p>}
      </div>
    </motion.div>
  );
};

const CourseProgressCard = ({ course }) => {
  // fallback fiable image
  const thumbnail = course.thumbnailUrl ? (API_BASE_URL + course.thumbnailUrl) : DEFAULT_COURSE_IMAGE;

  return (
    <motion.div 
      className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
      whileHover={{ y: -5, boxShadow: '0 10px 15px rgba(99, 102, 241, 0.15)' }}
      aria-label={`Cours ${course.title} par ${course.instructor}, progression à ${course.progress} %`}
    >
      <div className="p-5">
        <div className="flex justify-between items-start gap-4 mb-4">
          <div className="flex-grow min-w-0">
            <h4 className="font-semibold text-gray-900 text-lg line-clamp-1">{course.title}</h4>
            <p className="text-sm text-gray-600 truncate">Par {course.instructor}</p>
          </div>
          <img 
            src={thumbnail} 
            alt={`Vignette pour ${course.title}`} 
            className="w-16 h-16 object-cover rounded-lg border border-gray-300 flex-shrink-0"
            onError={e => { e.currentTarget.src = DEFAULT_COURSE_IMAGE; }}
          />
        </div>
        <div className="text-sm text-gray-700">
          <div className="flex justify-between mb-1 font-medium">
            <span>Progression</span>
            <span>{course.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-indigo-600 h-3 rounded-full transition-all duration-[1000ms] ease-out"
              style={{ width: `${course.progress}%` }}
            />
          </div>
        </div>
        <div className="mt-5 flex justify-between items-center">
          <div className="text-xs text-gray-500 italic select-none" aria-label={`Prochaine leçon : ${course.nextLesson}`}>
            Prochaine : {course.nextLesson}
          </div>
          <Link 
            to={`/cours/${course.courseId}`}
            className="text-indigo-600 text-sm font-semibold hover:underline flex items-center"
            aria-label={`Continuer le cours ${course.title}`}
          >
            Continuer
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default StudentOverviewPage;
