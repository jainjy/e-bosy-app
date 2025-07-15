import React from 'react';
import Chart from 'react-apexcharts';
import {
  BookOpenIcon,
  UsersIcon,
  AcademicCapIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  MegaphoneIcon,
  CalendarDaysIcon,
  StarIcon,
  PlusIcon,
  EyeIcon,
  ClockIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const TeacherOverviewPage = () => {
  const eBosyPurple = '#6B46C1';

  const weeklyTeachingActivityData = {
    series: [{
      name: 'Minutes Enseignées',
      data: [60, 90, 75, 120, 100, 150, 80],
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
        colors: [eBosyPurple]
      },
      xaxis: {
        categories: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
        title: {
          text: 'Jour de la Semaine'
        }
      },
      yaxis: {
        title: {
          text: 'Minutes Enseignées'
        },
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
        offsetX: 0,
        offsetY: 0,
        floating: false,
        style: {
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#263238'
        },
      }
    },
  };

  const courseSubjectDistributionData = {
    series: [30, 25, 20, 15],
    options: {
      chart: {
        width: 380,
        type: 'donut',
      },
      labels: ['Développement', 'Design', 'Science des Données', 'Marketing'],
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
      colors: [eBosyPurple, '#FF4560', '#00E396', '#FEB019'],
      legend: {
        position: 'bottom',
        offsetY: 0,
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
          radius: 12,
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
        offsetX: 0,
        offsetY: 0,
        floating: false,
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
            <p className="text-3xl font-bold text-gray-900 mt-1">15</p>
          </div>
          <BookOpenIcon className="h-8 w-8 text-e-bosy-purple" />
        </div>

        <div className="bg-white p-6 rounded-lg shadow flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Total Étudiants</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">1,234</p>
          </div>
          <UsersIcon className="h-8 w-8 text-e-bosy-purple" />
        </div>

        <div className="bg-white p-6 rounded-lg shadow flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Heures Enseignées</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">42</p>
          </div>
          <ClockIcon className="h-8 w-8 text-e-bosy-purple" />
        </div>

        <div className="bg-white p-6 rounded-lg shadow flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Gains Estimés</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">$ 2,850</p>
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
            <div className="w-72 flex-shrink-0 border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
              <div className="h-32 bg-gray-200 rounded-md mb-3 flex items-center justify-center text-gray-400">
                <BookOpenIcon className="h-10 w-10" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">Développement Frontend React</h4>
              <p className="text-sm text-gray-600 mb-2">Par [Nom Enseignant]</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '80%' }}></div>
              </div>
              <p className="text-xs text-gray-500 mb-3">Progression Moyenne: 80%</p>
              <div className="flex items-center text-sm text-gray-600">
                <AcademicCapIcon className="h-4 w-4 mr-1" />
                <span>Prochain: Module 5 - Hooks Avancés</span>
              </div>
            </div>

            <div className="w-72 flex-shrink-0 border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
              <div className="h-32 bg-gray-200 rounded-md mb-3 flex items-center justify-center text-gray-400">
                <BookOpenIcon className="h-10 w-10" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">Python pour la Science des Données</h4>
              <p className="text-sm text-gray-600 mb-2">Par [Nom Enseignant]</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '60%' }}></div>
              </div>
              <p className="text-xs text-gray-500 mb-3">Progression Moyenne: 60%</p>
              <div className="flex items-center text-sm text-gray-600">
                <AcademicCapIcon className="h-4 w-4 mr-1" />
                <span>Prochain: Opérations sur les DataFrames Pandas</span>
              </div>
            </div>

            <div className="w-72 flex-shrink-0 border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
              <div className="h-32 bg-gray-200 rounded-md mb-3 flex items-center justify-center text-gray-400">
                <BookOpenIcon className="h-10 w-10" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">Fondamentaux du Design UI/UX</h4>
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
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <Chart options={weeklyTeachingActivityData.options} series={weeklyTeachingActivityData.series} type="line" height={350} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <Chart options={courseSubjectDistributionData.options} series={courseSubjectDistributionData.series} type="donut" width="100%" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Prochaines Sessions Live</h3>
          <ul className="space-y-4">
            <li className="flex items-center justify-between border-b pb-3 mb-3 last:border-b-0 last:pb-0">
              <div className="flex items-start">
                <CalendarDaysIcon className="h-6 w-6 text-e-bosy-purple mr-3 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-800">Session Q&A Live - React</p>
                  <p className="text-sm text-gray-600">Aujourd'hui, 17:00 | Cours: Développement Frontend React</p>
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
                  <p className="font-medium text-gray-800">Correction Projet Final - Science des Données</p>
                  <p className="text-sm text-gray-600">Demain, 11:59 | Cours: Python pour la Science des Données</p>
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
                  <p className="font-medium text-gray-800">Workshop - UI/UX Design Avancé</p>
                  <p className="text-sm text-gray-600">Vendredi, 15:00 | Cours: Fondamentaux du Design UI/UX</p>
                </div>
              </div>
              <button className="bg-gray-100 text-gray-700 text-sm px-4 py-2 rounded-md hover:bg-gray-200 flex-shrink-0">
                Rappel
              </button>
            </li>
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
            <li className="flex items-center justify-between border-b pb-3 mb-3 last:border-b-0 last:pb-0">
              <div className="flex items-start">
                <StarIcon className="h-6 w-6 text-e-bosy-purple mr-3 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-800">Développement Frontend React</p>
                  <p className="text-sm text-gray-600">Évalué le 15 Mars 2023 | Note Moyenne: 4.8/5</p>
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
                  <p className="font-medium text-gray-800">Python pour la Science des Données</p>
                  <p className="text-sm text-gray-600">Évalué le 10 Janvier 2023 | Note Moyenne: 4.5/5</p>
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
                  <p className="font-medium text-gray-800">Fondamentaux du Design UI/UX</p>
                  <p className="text-sm text-gray-600">Évalué le 2 Février 2023 | Note Moyenne: 4.6/5</p>
                </div>
              </div>
              <button className="bg-e-bosy-purple text-white text-sm px-4 py-2 rounded-md hover:bg-purple-700 flex-shrink-0">
                <EyeIcon className="h-5 w-5 inline-block mr-1" /> Voir
              </button>
            </li>
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
