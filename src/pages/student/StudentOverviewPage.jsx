import React from 'react';
import Chart from 'react-apexcharts';
import {
  AcademicCapIcon, // Potentiellement pour les certificats
  TicketIcon,     // Pour les certificats
  ClockIcon,      // Pour les heures apprises
  BookOpenIcon,   // Pour les cours inscrits
  CheckCircleIcon, // Pour les cours termines
  CalendarIcon,    // Pour Upcoming Schedule
  DocumentTextIcon, // Pour Browse Courses (Quick Actions)
  HeartIcon,      // Pour My Wishlist (Quick Actions)
  CreditCardIcon, // Pour Payment History (Quick Actions)
  TicketIcon as TicketIconSolid, // Pour Certificates (Quick Actions)
} from '@heroicons/react/24/outline'; // Assurez-vous d'avoir tous les icônes necessaires
import { Link } from 'react-router-dom';

const StudentOverviewPage = () => {
  // Donnees simulees pour les graphiques (à remplacer par des donnees reelles de l'API)

  // Donnees pour le graphique 'Weekly Learning Activity' (Line Chart)
  const weeklyLearningActivityData = {
    series: [{
      name: 'Minutes Spent',
      data: [40, 55, 30, 80, 120, 100, 85] // Minutes passees par jour
    }],
    options: {
      chart: {
        height: 350,
        type: 'line',
        toolbar: {
          show: false // Cache la barre d'outils (zoom, pan, etc.)
        },
        dropShadow: { // Ajoute une ombre comme dans l'image
          enabled: true,
          color: '#000',
          top: 18,
          left: 7,
          blur: 10,
          opacity: 0.2
        },
      },
      colors: ['#6B46C1'], // e-bosy-purple
      dataLabels: {
        enabled: false // Cache les valeurs sur les points de donnees
      },
      stroke: {
        curve: 'smooth',
        width: 3 // Epaisseur de la ligne
      },
      grid: {
        borderColor: '#e7e7e7',
        row: {
          colors: ['#f3f3f3', 'transparent'], // couleurs alternees
          opacity: 0.5
        },
      },
      xaxis: {
        categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        title: {
          text: '' // Pas de titre pour l'axe X dans la maquette
        }
      },
      yaxis: {
        title: {
          text: '' // Pas de titre pour l'axe Y dans la maquette
        },
        min: 0,
        labels: {
          formatter: function (value) {
            return value + ' min'; // Ajoute 'min' aux labels de l'axe Y
          }
        }
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val + " min";
          }
        }
      },
      markers: { // Points sur la ligne
        size: 0, // Pas de marqueurs visibles
      },
      title: { // Titre du graphique
        text: 'Weekly Learning Activity',
        align: 'left',
        style: {
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#333',
        },
      },
      subtitle: { // Sous-titre
        text: 'Minutes spent learning per day',
        align: 'left',
        style: {
          fontSize: '14px',
          color: '#777',
        },
      }
    },
  };

  // Donnees pour le graphique 'Subject Distribution' (Donut Chart)
  const subjectDistributionData = {
    series: [40, 25, 20, 15], // Pourcentages fictifs pour chaque categorie
    options: {
      chart: {
        width: 380,
        type: 'donut',
      },
      labels: ['Web Development', 'Data Science', 'Design', 'Business'],
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
      colors: ['#6B46C1', '#805AD5', '#9F7AEA', '#D6BCFA'], // Nuances de e-bosy-purple pour correspondre à l'image
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
                  return '100%'; // Toujours 100% pour la distribution
                },
                color: '#333',
                fontSize: '24px',
                fontWeight: 'bold',
              },
              value: {
                show: true,
                formatter: function (val) {
                  return val + '%'; // Affiche le pourcentage sur chaque tranche
                },
                fontSize: '18px',
                fontWeight: 'normal',
                color: '#333',
              }
            }
          }
        }
      },
      legend: {
        position: 'bottom', // Legende en bas comme dans l'image
        horizontalAlign: 'left', // Alignement à gauche
        markers: {
            fillColors: ['#6B46C1', '#805AD5', '#9F7AEA', '#D6BCFA'] // Assure que les marqueurs correspondent aux couleurs des tranches
        },
        itemMargin: {
            horizontal: 10,
            vertical: 5
        },
        fontSize: '13px',
      },
      title: { // Titre du graphique
        text: 'Subject Distribution',
        align: 'left',
        style: {
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#333',
        },
      },
      subtitle: { // Sous-titre
        text: 'Your learning by category',
        align: 'left',
        style: {
          fontSize: '14px',
          color: '#777',
        },
      }
    },
  };


  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Student Dashboard</h1>
      <p className="text-gray-600 mb-8">Track your learning progress and manage your courses.</p>

      {/* Stats Cards comme dans la maquette */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Enrolled Courses */}
        <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center justify-center text-center">
          <BookOpenIcon className="h-8 w-8 text-gray-400 mb-2" />
          <p className="text-gray-500 text-sm">Enrolled Courses</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">8</p>
        </div>

        {/* Completed Courses */}
        <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center justify-center text-center">
          <CheckCircleIcon className="h-8 w-8 text-gray-400 mb-2" />
          <p className="text-gray-500 text-sm">Completed Courses</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">3</p>
        </div>

        {/* Hours Learned */}
        <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center justify-center text-center">
          <ClockIcon className="h-8 w-8 text-gray-400 mb-2" />
          <p className="text-gray-500 text-sm">Hours Learned</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">42</p>
        </div>

        {/* Certificates */}
        <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center justify-center text-center">
          <AcademicCapIcon className="h-8 w-8 text-gray-400 mb-2" />
          <p className="text-gray-500 text-sm">Certificates</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">2</p>
        </div>
      </div>

      {/* Continue Learning Section */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Continue Learning</h3>
          <Link to="/dashboard/mycourses" className="text-e-bosy-purple hover:underline text-sm font-medium">View All Courses</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Exemple de carte de cours */}
          <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="w-full h-32 bg-gray-200 flex items-center justify-center text-gray-400">
              {/* Placeholder pour l'image du cours */}
              <BookOpenIcon className="h-12 w-12" />
            </div>
            <div className="p-4">
              <h4 className="font-semibold text-gray-800 text-lg">React Frontend Development</h4>
              <p className="text-sm text-gray-600">By John Doe</p>
              <div className="mt-3 text-sm text-gray-700">
                <p className="mb-1">Progress</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-e-bosy-purple h-2.5 rounded-full" style={{ width: '68%' }}></div>
                </div>
                <span className="text-sm text-gray-500 float-right">68%</span>
              </div>
              <p className="text-xs text-gray-500 mt-4">Next: Advanced State Management</p>
            </div>
          </div>

          {/* Repetez pour Python Data Science */}
          <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="w-full h-32 bg-gray-200 flex items-center justify-center text-gray-400">
              <BookOpenIcon className="h-12 w-12" />
            </div>
            <div className="p-4">
              <h4 className="font-semibold text-gray-800 text-lg">Python Data Science</h4>
              <p className="text-sm text-gray-600">By Sarah Johnson</p>
              <div className="mt-3 text-sm text-gray-700">
                <p className="mb-1">Progress</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-e-bosy-purple h-2.5 rounded-full" style={{ width: '42%' }}></div>
                </div>
                <span className="text-sm text-gray-500 float-right">42%</span>
              </div>
              <p className="text-xs text-gray-500 mt-4">Next: Pandas DataFrame Operations</p>
            </div>
          </div>

          {/* Repetez pour UI/UX Design Fundamentals */}
          <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="w-full h-32 bg-gray-200 flex items-center justify-center text-gray-400">
              <BookOpenIcon className="h-12 w-12" />
            </div>
            <div className="p-4">
              <h4 className="font-semibold text-gray-800 text-lg">UI/UX Design Fundamentals</h4>
              <p className="text-sm text-gray-600">By Michael Chen</p>
              <div className="mt-3 text-sm text-gray-700">
                <p className="mb-1">Progress</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-e-bosy-purple h-2.5 rounded-full" style={{ width: '25%' }}></div>
                </div>
                <span className="text-sm text-gray-500 float-right">25%</span>
              </div>
              <p className="text-xs text-gray-500 mt-4">Next: User Research Methods</p>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques Weekly Learning Activity & Subject Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <Chart options={weeklyLearningActivityData.options} series={weeklyLearningActivityData.series} type="line" height={350} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow flex items-center justify-center"> {/* Centrage pour le donut */}
          <Chart options={subjectDistributionData.options} series={subjectDistributionData.series} type="donut" width={380} />
        </div>
      </div>

      {/* Upcoming Schedule & Your Certificates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Upcoming Schedule */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Upcoming Schedule</h3>
          <p className="text-gray-600 text-sm mb-4">Your upcoming classes and deadlines</p>
          <ul className="space-y-4">
            <li className="flex items-start justify-between border-b pb-4">
              <div className="flex items-center space-x-3">
                <CalendarIcon className="h-6 w-6 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-800">React Live Q&A Session</p>
                  <p className="text-sm text-gray-600">Today, 5:00 PM • React Frontend Development</p>
                </div>
              </div>
              <button className="text-e-bosy-purple text-sm font-medium hover:underline">Remind</button>
            </li>
            <li className="flex items-start justify-between border-b pb-4">
              <div className="flex items-center space-x-3">
                <DocumentTextIcon className="h-6 w-6 text-gray-500" /> {/* Icône pour un devoir/assignement */}
                <div>
                  <p className="font-medium text-gray-800">Python Data Science Assignment Due</p>
                  <p className="text-sm text-gray-600">Tomorrow, 11:59 PM • Python Data Science</p>
                </div>
              </div>
              <button className="text-e-bosy-purple text-sm font-medium hover:underline">Remind</button>
            </li>
            <li className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <CalendarIcon className="h-6 w-6 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-800">UI/UX Design Workshop</p>
                  <p className="text-sm text-gray-600">Friday, 3:00 PM • UI/UX Design Fundamentals</p>
                </div>
              </div>
              <button className="text-e-bosy-purple text-sm font-medium hover:underline">Remind</button>
            </li>
          </ul>
          <div className="mt-6 text-center">
            <Link to="/dashboard/schedule" className="text-e-bosy-purple hover:underline text-sm">View Full Schedule</Link>
          </div>
        </div>

        {/* Your Certificates */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Certificates</h3>
          <p className="text-gray-600 text-sm mb-4">Achievements you've earned</p>
          <ul className="space-y-4">
            <li className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center space-x-3">
                <TicketIcon className="h-6 w-6 text-e-bosy-purple" />
                <div>
                  <p className="font-medium text-gray-800">React Frontend Development</p>
                  <p className="text-sm text-gray-600">Issued: March 15, 2023 • John Doe</p>
                </div>
              </div>
              <Link to="/dashboard/certificates/react-frontend" className="bg-e-bosy-purple text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700">View</Link>
            </li>
            <li className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <TicketIcon className="h-6 w-6 text-e-bosy-purple" />
                <div>
                  <p className="font-medium text-gray-800">JavaScript Fundamentals</p>
                  <p className="text-sm text-gray-600">Issued: January 10, 2023 • Sarah Johnson</p>
                </div>
              </div>
              <Link to="/dashboard/certificates/javascript-fundamentals" className="bg-e-bosy-purple text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700">View</Link>
            </li>
          </ul>
          <div className="mt-6 text-center">
            <Link to="/dashboard/certificates" className="text-e-bosy-purple hover:underline text-sm">View All Certificates</Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/courses" className="bg-gray-100 p-4 rounded-lg flex flex-col items-center justify-center text-center hover:bg-gray-200">
            <BookOpenIcon className="h-6 w-6 text-e-bosy-purple mb-2" />
            <span className="text-gray-700 text-sm">Browse Courses</span>
          </Link>
          <Link to="/dashboard/wishlist" className="bg-gray-100 p-4 rounded-lg flex flex-col items-center justify-center text-center hover:bg-gray-200">
            <HeartIcon className="h-6 w-6 text-e-bosy-purple mb-2" />
            <span className="text-gray-700 text-sm">My Wishlist</span>
          </Link>
          <Link to="/dashboard/purchases" className="bg-gray-100 p-4 rounded-lg flex flex-col items-center justify-center text-center hover:bg-gray-200">
            <CreditCardIcon className="h-6 w-6 text-e-bosy-purple mb-2" />
            <span className="text-gray-700 text-sm">Payment History</span>
          </Link>
          <Link to="/dashboard/certificates" className="bg-gray-100 p-4 rounded-lg flex flex-col items-center justify-center text-center hover:bg-gray-200">
            <TicketIconSolid className="h-6 w-6 text-e-bosy-purple mb-2" />
            <span className="text-gray-700 text-sm">Certificates</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentOverviewPage;