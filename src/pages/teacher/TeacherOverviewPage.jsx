// TeacherOverviewPage.js
import React from 'react';
import Chart from 'react-apexcharts';
import {
  BookOpenIcon,
  UsersIcon,
  AcademicCapIcon,
  ClockIcon,
  CurrencyDollarIcon,
  StarIcon,
  EyeIcon,
  CalendarDaysIcon,
  ClipboardDocumentCheckIcon,
  PlusIcon,
  MegaphoneIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useTeacherDashboard } from '../../hooks/useTeacherDashboard';
import {LoadingSpinner} from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const TeacherOverviewPage = () => {
  const eBosyPurple = '#6B46C1';
  const { dashboardData, loading, error } = useTeacherDashboard();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;
  if (!dashboardData) return <div>Aucune donnée disponible</div>;

  // Préparer les données pour les graphiques
  const weeklyTeachingActivityData = {
    series: [{
      name: 'Minutes Enseignées',
      data: dashboardData.weeklyActivity.minutesPerDay
    }],
    options: {
      chart: {
        height: 350,
        type: 'line',
        zoom: { enabled: false },
        toolbar: { show: false }
      },
      dataLabels: { enabled: false },
      stroke: {
        curve: 'smooth',
        colors: [eBosyPurple]
      },
      xaxis: {
        categories: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
        title: { text: 'Jour de la Semaine' }
      },
      yaxis: {
        title: { text: 'Minutes Enseignées' },
        min: 0,
        max: 160
      },
      grid: {
        row: {
          colors: ['#f3f3f3', 'transparent'],
          opacity: 0.5
        },
      },
      title: {
        text: 'Activité d\'Enseignement Hebdomadaire',
        align: 'left',
        margin: 10,
        style: {
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#263238'
        },
      }
    },
  };

  const courseSubjectDistributionData = {
    series: dashboardData.subjectDistribution.subjects.map(s => s.count),
    options: {
      chart: {
        width: 380,
        type: 'donut',
      },
      labels: dashboardData.subjectDistribution.subjects.map(s => s.subject),
      responsive: [{
        breakpoint: 480,
        options: {
          chart: { width: 200 },
          legend: { position: 'bottom' }
        }
      }],
      colors: [eBosyPurple, '#FF4560', '#00E396', '#FEB019'],
      legend: {
        position: 'bottom',
        fontSize: '13px',
        markers: {
          width: 12,
          height: 12,
        },
        itemMargin: {
          horizontal: 10,
          vertical: 0
        },
      },
      plotOptions: {
        pie: {
          donut: {
            labels: {
              show: true,
              total: {
                showAlways: true,
                show: true,
                label: 'Total',
                formatter: function (w) {
                  const totalCourses = w.globals.series.reduce((a, b) => a + b, 0);
                  return totalCourses + ' Cours';
                }
              }
            }
          }
        }
      },
      title: {
        text: 'Distribution de Mes Cours par Sujet',
        align: 'left',
        margin: 10,
        style: {
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#263238'
        },
      }
    },
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Tableau de Bord Enseignant</h1>
      <p className="text-gray-600 mb-8">Gérez vos cours et suivez les progrès de vos étudiants.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Cours Publiés</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{dashboardData.stats.publishedCourses}</p>
          </div>
          <BookOpenIcon className="h-8 w-8 text-e-bosy-purple" />
        </div>

        <div className="bg-white p-6 rounded-lg shadow flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Total Étudiants</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{dashboardData.stats.totalStudents}</p>
          </div>
          <UsersIcon className="h-8 w-8 text-e-bosy-purple" />
        </div>

        <div className="bg-white p-6 rounded-lg shadow flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Heures Enseignées</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{dashboardData.stats.teachingHours}</p>
          </div>
          <ClockIcon className="h-8 w-8 text-e-bosy-purple" />
        </div>

        <div className="bg-white p-6 rounded-lg shadow flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Gains Estimés</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">$ {dashboardData.stats.estimatedEarnings}</p>
          </div>
          <CurrencyDollarIcon className="h-8 w-8 text-e-bosy-purple" />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Mes Cours</h3>
          <Link to="/cours" className="text-e-bosy-purple hover:underline text-sm">
            Voir Tous les Cours
          </Link>
        </div>
        <div className="overflow-x-auto pb-4 -mx-4 px-4">
          <div className="flex space-x-6 min-w-max">
            {dashboardData.courses.map((course, index) => {
              let progressColor;
              if (course.averageProgress >= 70) progressColor = 'bg-green-500';
              else if (course.averageProgress >= 40) progressColor = 'bg-yellow-500';
              else progressColor = 'bg-red-500';

              return (
                <div key={index} className="w-72 flex-shrink-0 border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                  <div className="h-32 bg-gray-200 rounded-md mb-3 flex items-center justify-center text-gray-400">
                    <BookOpenIcon className="h-10 w-10" />
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-1">{course.title}</h4>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div 
                      className={`${progressColor} h-2.5 rounded-full`} 
                      style={{ width: `${course.averageProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">Progression Moyenne: {course.averageProgress}%</p>
                  <div className="flex items-center text-sm text-gray-600">
                    <AcademicCapIcon className="h-4 w-4 mr-1" />
                    <span>Prochain: {course.nextModule}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <Chart 
            options={weeklyTeachingActivityData.options} 
            series={weeklyTeachingActivityData.series} 
            type="line" 
            height={350} 
          />
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <Chart 
            options={courseSubjectDistributionData.options} 
            series={courseSubjectDistributionData.series} 
            type="donut" 
            width="100%" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Prochaines Sessions Live</h3>
          <ul className="space-y-4">
            {dashboardData.upcomingSessions.map((session, index) => (
              <li key={index} className="flex items-center justify-between border-b pb-3 mb-3 last:border-b-0 last:pb-0">
                <div className="flex items-start">
                  <CalendarDaysIcon className="h-6 w-6 text-e-bosy-purple mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-800">{session.title}</p>
                    <p className="text-sm text-gray-600">{session.description}</p>
                  </div>
                </div>
                <button className="bg-gray-100 text-gray-700 text-sm px-4 py-2 rounded-md hover:bg-gray-200 flex-shrink-0">
                  Rappel
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-6 text-center">
            <Link to="/evenements" className="text-e-bosy-purple hover:underline text-sm">
              Voir Toutes les Sessions
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Évaluations des Cours</h3>
          <ul className="space-y-4">
            {dashboardData.courseReviews.map((review, index) => (
              <li key={index} className="flex items-center justify-between border-b pb-3 mb-3 last:border-b-0 last:pb-0">
                <div className="flex items-start">
                  <StarIcon className="h-6 w-6 text-e-bosy-purple mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-800">{review.title}</p>
                    <p className="text-sm text-gray-600">
                      Évalué le {new Date(review.reviewedAt).toLocaleDateString()} | Note Moyenne: {review.averageRating.toFixed(1)}/5
                    </p>
                  </div>
                </div>
                <button className="bg-e-bosy-purple text-white text-sm px-4 py-2 rounded-md hover:bg-purple-700 flex-shrink-0">
                  <EyeIcon className="h-5 w-5 inline-block mr-1" /> Voir
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-6 text-center">
            <Link to="/cours" className="text-e-bosy-purple hover:underline text-sm">
              Voir Toutes les Évaluations
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions Rapides</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link to="/ajouter-cours" className="bg-gray-100 p-4 rounded-lg flex flex-col items-center justify-center text-center hover:bg-gray-200">
            <PlusIcon className="h-6 w-6 text-e-bosy-purple mb-2" />
            <span className="text-gray-700 text-sm">Ajouter un Cours</span>
          </Link>
          <Link to="/gerer-etudiants" className="bg-gray-100 p-4 rounded-lg flex flex-col items-center justify-center text-center hover:bg-gray-200">
            <UsersIcon className="h-6 w-6 text-e-bosy-purple mb-2" />
            <span className="text-gray-700 text-sm">Gérer les Étudiants</span>
          </Link>
          <Link to="/envoyer-message" className="bg-gray-100 p-4 rounded-lg flex flex-col items-center justify-center text-center hover:bg-gray-200">
            <MegaphoneIcon className="h-6 w-6 text-e-bosy-purple mb-2" />
            <span className="text-gray-700 text-sm">Envoyer un Message</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TeacherOverviewPage;