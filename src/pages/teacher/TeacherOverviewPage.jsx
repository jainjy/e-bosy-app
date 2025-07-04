import React from 'react';
import Chart from 'react-apexcharts';
import {
  BookOpenIcon,
  UsersIcon,
  AcademicCapIcon,
  ChartBarIcon, // For overall stats
  ClipboardDocumentCheckIcon, // For submissions
  MegaphoneIcon, // For attention needed courses
  CalendarDaysIcon, // For upcoming sessions
  StarIcon, // For course reviews
  PlusIcon, // For quick actions
  EyeIcon, // For view certificate/review
  ClockIcon, // For hours taught
  CurrencyDollarIcon // For earnings
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const TeacherOverviewPage = () => {
  // Define e-bosy-purple and its shades for consistency
  const eBosyPurple = '#6B46C1';
  // Data for Charts
  const weeklyTeachingActivityData = {
    series: [{
      name: 'Minutes Taught',
      data: [60, 90, 75, 120, 100, 150, 80], // Minutes taught per day
    }],
    options: {
      chart: {
        height: 350,
        type: 'line',
        zoom: {
          enabled: false
        },
        toolbar: {
          show: false
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth',
        colors: [eBosyPurple] // e-bosy-purple for the line
      },
      xaxis: {
        categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        title: {
          text: 'Jour de la Semaine'
        }
      },
      yaxis: {
        title: {
          text: 'Minutes Enseignees'
        },
        min: 0,
        max: 160 // Adjusted max for better fit
      },
      grid: {
        row: {
          colors: ['#f3f3f3', 'transparent'], // Alternating grid colors
          opacity: 0.5
        },
      },
      title: {
        text: 'Activite d\'Enseignement Hebdomadaire',
        align: 'left',
        margin: 10,
        offsetX: 0,
        offsetY: 0,
        floating: false,
        style: {
          fontSize: '16px',
          fontWeight: 'bold',
          fontFamily: undefined,
          color: '#263238'
        },
      }
    },
  };

  const courseSubjectDistributionData = {
    series: [30, 25, 20, 15], // Percentage/count of courses by subject
    options: {
      chart: {
        width: 380,
        type: 'donut',
      },
      labels: ['Developpement', 'Design', 'Science des Donnees', 'Marketing'],
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 200
          },
          legend: {
            position: 'bottom'
          }
        }
      }],
      colors: [eBosyPurple, '#FF4560', '#00E396', '#FEB019'], // Distinct colors
      legend: {
        position: 'bottom', // Match image
        offsetY: 0, // No vertical offset needed for standard placement
        fontSize: '13px',
        fontFamily: 'Helvetica, Arial',
        fontWeight: 400,
        labels: {
          colors: undefined,
          useSeriesColors: false
        },
        markers: {
          width: 12,
          height: 12,
          strokeWidth: 0,
          strokeColor: '#fff',
          fillColors: undefined,
          radius: 12,
          customHTML: undefined,
          onClick: undefined
        },
        itemMargin: {
          horizontal: 10,
          vertical: 0
        },
        onItemClick: {
          toggleDataSeries: true
        },
        onItemHover: {
          highlightDataSeries: true
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
                  return totalCourses + ' Cours'; // Show total count or percentage
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
        offsetX: 0,
        offsetY: 0,
        floating: false,
        style: {
          fontSize: '16px',
          fontWeight: 'bold',
          fontFamily: undefined,
          color: '#263238'
        },
      }
    },
  };


  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Tableau de Bord Enseignant</h1>
      <p className="text-gray-600 mb-8">Gerez vos cours et suivez les progrès de vos etudiants.</p>

      {/* Stats Cards - Adjusted for Teacher Dashboard based on image */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Cours */}
        <div className="bg-white p-6 rounded-lg shadow flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Cours Publies</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">15</p>
          </div>
          <BookOpenIcon className="h-8 w-8 text-e-bosy-purple" />
        </div>

        {/* Total Etudiants Inscrits (across all courses) */}
        <div className="bg-white p-6 rounded-lg shadow flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Total Etudiants</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">1,234</p>
          </div>
          <UsersIcon className="h-8 w-8 text-e-bosy-purple" />
        </div>

        {/* Heures Enseignees */}
        <div className="bg-white p-6 rounded-lg shadow flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Heures Enseignees</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">42</p>
          </div>
          <ClockIcon className="h-8 w-8 text-e-bosy-purple" />
        </div>

        {/* Gains Estimes */}
        <div className="bg-white p-6 rounded-lg shadow flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Gains Estimes</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">$ 2,850</p>
          </div>
          <CurrencyDollarIcon className="h-8 w-8 text-e-bosy-purple" />
        </div>
      </div>

      {/* "My Courses" / "Courses Taught" Section (similar to "Continue Learning") */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Mes Cours</h3>
          <Link to="/dashboard/courses" className="text-e-bosy-purple hover:underline text-sm">
            Voir Tous les Cours
          </Link>
        </div>
        <div className="overflow-x-auto pb-4 -mx-4 px-4"> {/* Added horizontal scroll */}
          <div className="flex space-x-6 min-w-max"> {/* min-w-max to ensure scrollability */}
            {/* Course Card 1 */}
            <div className="w-72 flex-shrink-0 border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
              <div className="h-32 bg-gray-200 rounded-md mb-3 flex items-center justify-center text-gray-400">
                <BookOpenIcon className="h-10 w-10" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">React Frontend Development</h4>
              <p className="text-sm text-gray-600 mb-2">Par [Nom Enseignant]</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '80%' }}></div>
              </div>
              <p className="text-xs text-gray-500 mb-3">Progression Moyenne: 80%</p>
              <div className="flex items-center text-sm text-gray-600">
                <AcademicCapIcon className="h-4 w-4 mr-1" />
                <span>Prochain: Module 5 - Hooks Avances</span>
              </div>
            </div>
            {/* Course Card 2 */}
            <div className="w-72 flex-shrink-0 border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
              <div className="h-32 bg-gray-200 rounded-md mb-3 flex items-center justify-center text-gray-400">
                <BookOpenIcon className="h-10 w-10" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">Python pour la Science des Donnees</h4>
              <p className="text-sm text-gray-600 mb-2">Par [Nom Enseignant]</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '60%' }}></div>
              </div>
              <p className="text-xs text-gray-500 mb-3">Progression Moyenne: 60%</p>
              <div className="flex items-center text-sm text-gray-600">
                <AcademicCapIcon className="h-4 w-4 mr-1" />
                <span>Prochain: Pandas Dataframe Operations</span>
              </div>
            </div>
            {/* Course Card 3 */}
            <div className="w-72 flex-shrink-0 border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
              <div className="h-32 bg-gray-200 rounded-md mb-3 flex items-center justify-center text-gray-400">
                <BookOpenIcon className="h-10 w-10" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">UI/UX Design Fundamentals</h4>
              <p className="text-sm text-gray-600 mb-2">Par [Nom Enseignant]</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div className="bg-red-500 h-2.5 rounded-full" style={{ width: '30%' }}></div>
              </div>
              <p className="text-xs text-gray-500 mb-3">Progression Moyenne: 30%</p>
              <div className="flex items-center text-sm text-gray-600">
                <AcademicCapIcon className="h-4 w-4 mr-1" />
                <span>Prochain: Recherche Utilisateur</span>
              </div>
            </div>
            {/* Add more course cards as needed */}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Weekly Teaching Activity */}
        <div className="bg-white p-6 rounded-lg shadow">
          <Chart options={weeklyTeachingActivityData.options} series={weeklyTeachingActivityData.series} type="line" height={350} />
        </div>
        {/* Course Subject Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <Chart options={courseSubjectDistributionData.options} series={courseSubjectDistributionData.series} type="donut" width="100%" /> {/* Adjusted width */}
        </div>
      </div>

      {/* Upcoming Sessions & Course Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Upcoming Live Sessions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Prochaines Sessions Live</h3>
          <ul className="space-y-4">
            <li className="flex items-center justify-between border-b pb-3 mb-3 last:border-b-0 last:pb-0">
              <div className="flex items-start">
                <CalendarDaysIcon className="h-6 w-6 text-e-bosy-purple mr-3 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-800">Session Q&A Live - React</p>
                  <p className="text-sm text-gray-600">Aujourd'hui, 17:00 | Cours: Developpement Frontend React</p>
                </div>
              </div>
              <button className="bg-gray-100 text-gray-700 text-sm px-4 py-2 rounded-md hover:bg-gray-200 flex-shrink-0">
                Rappel
              </button>
            </li>
            <li className="flex items-center justify-between border-b pb-3 mb-3 last:border-b-0 last:pb-0">
              <div className="flex items-start">
                <ClipboardDocumentCheckIcon className="h-6 w-6 text-e-bosy-purple mr-3 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-800">Correction Projet Final - Science des Donnees</p>
                  <p className="text-sm text-gray-600">Demain, 11:59 | Cours: Python pour la Science des Donnees</p>
                </div>
              </div>
              <button className="bg-gray-100 text-gray-700 text-sm px-4 py-2 rounded-md hover:bg-gray-200 flex-shrink-0">
                Rappel
              </button>
            </li>
            <li className="flex items-center justify-between">
              <div className="flex items-start">
                <AcademicCapIcon className="h-6 w-6 text-e-bosy-purple mr-3 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-800">Workshop - UI/UX Design Avance</p>
                  <p className="text-sm text-gray-600">Vendredi, 15:00 | Cours: UI/UX Design Fundamentals</p>
                </div>
              </div>
              <button className="bg-gray-100 text-gray-700 text-sm px-4 py-2 rounded-md hover:bg-gray-200 flex-shrink-0">
                Rappel
              </button>
            </li>
          </ul>
          <div className="mt-6 text-center">
            <Link to="/dashboard/events" className="text-e-bosy-purple hover:underline text-sm">
              Voir Toutes les Sessions
            </Link>
          </div>
        </div>

        {/* Course Review Scores (similar to Your Certificates) */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Evaluations des Cours</h3>
          <ul className="space-y-4">
            <li className="flex items-center justify-between border-b pb-3 mb-3 last:border-b-0 last:pb-0">
              <div className="flex items-start">
                <StarIcon className="h-6 w-6 text-e-bosy-purple mr-3 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-800">Developpement Frontend React</p>
                  <p className="text-sm text-gray-600">Evalue le 15 Mars 2023 | Note Moyenne: 4.8/5</p>
                </div>
              </div>
              <button className="bg-e-bosy-purple text-white text-sm px-4 py-2 rounded-md hover:bg-purple-700 flex-shrink-0">
                <EyeIcon className="h-5 w-5 inline-block mr-1" /> Voir
              </button>
            </li>
            <li className="flex items-center justify-between border-b pb-3 mb-3 last:border-b-0 last:pb-0">
              <div className="flex items-start">
                <StarIcon className="h-6 w-6 text-e-bosy-purple mr-3 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-800">Python pour la Science des Donnees</p>
                  <p className="text-sm text-gray-600">Evalue le 10 Janvier 2023 | Note Moyenne: 4.5/5</p>
                </div>
              </div>
              <button className="bg-e-bosy-purple text-white text-sm px-4 py-2 rounded-md hover:bg-purple-700 flex-shrink-0">
                <EyeIcon className="h-5 w-5 inline-block mr-1" /> Voir
              </button>
            </li>
            <li className="flex items-center justify-between">
              <div className="flex items-start">
                <StarIcon className="h-6 w-6 text-e-bosy-purple mr-3 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-800">UI/UX Design Fundamentals</p>
                  <p className="text-sm text-gray-600">Evalue le 2 Fevrier 2023 | Note Moyenne: 4.6/5</p>
                </div>
              </div>
              <button className="bg-e-bosy-purple text-white text-sm px-4 py-2 rounded-md hover:bg-purple-700 flex-shrink-0">
                <EyeIcon className="h-5 w-5 inline-block mr-1" /> Voir
              </button>
            </li>
          </ul>
          <div className="mt-6 text-center">
            <Link to="/dashboard/courses" className="text-e-bosy-purple hover:underline text-sm">
              Voir Toutes les Evaluations
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions (similar to student quick actions) */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions Rapides</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link to="/dashboard/courses" className="bg-gray-100 p-4 rounded-lg flex flex-col items-center justify-center text-center hover:bg-gray-200">
            <BookOpenIcon className="h-6 w-6 text-e-bosy-purple mb-2" />
            <span className="text-gray-700 text-sm">Ajouter un Cours</span>
          </Link>
          <Link to="/dashboard/users" className="bg-gray-100 p-4 rounded-lg flex flex-col items-center justify-center text-center hover:bg-gray-200">
            <UsersIcon className="h-6 w-6 text-e-bosy-purple mb-2" />
            <span className="text-gray-700 text-sm">Gerer les Etudiants</span>
          </Link>
          <Link to="/dashboard/messages" className="bg-gray-100 p-4 rounded-lg flex flex-col items-center justify-center text-center hover:bg-gray-200">
            <MegaphoneIcon className="h-6 w-6 text-e-bosy-purple mb-2" />
            <span className="text-gray-700 text-sm">Envoyer un Message</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TeacherOverviewPage;