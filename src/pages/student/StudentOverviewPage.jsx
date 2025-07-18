// StudentOverviewPage.js
import React from "react";
import Chart from "react-apexcharts";
import {
  AcademicCapIcon,
  TicketIcon,
  ClockIcon,
  BookOpenIcon,
  CheckCircleIcon,
  CalendarIcon,
  DocumentTextIcon,
  HeartIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { useStudentDashboard } from "../../hooks/useStudentDashboard";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";
import { API_BASE_URL } from "../../services/ApiFetch";
const DEFAULT_COURSE_IMAGE = "/images/default-course.jpg";
const StudentOverviewPage = () => {
  const { dashboardData, loading, error } = useStudentDashboard();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;
  if (!dashboardData) return <div>Aucune donnée disponible</div>;

  // Préparer les données pour les graphiques
  const weeklyLearningActivityData = {
    series: [
      {
        name: "Minutes Passées",
        data: dashboardData.weeklyActivity.minutesPerDay,
      },
    ],
    options: {
      chart: {
        height: 350,
        type: "line",
        toolbar: { show: false },
        dropShadow: {
          enabled: true,
          color: "#000",
          top: 18,
          left: 7,
          blur: 10,
          opacity: 0.2,
        },
      },
      colors: ["#6B46C1"],
      dataLabels: { enabled: false },
      stroke: {
        curve: "smooth",
        width: 3,
      },
      grid: {
        borderColor: "#e7e7e7",
        row: {
          colors: ["#f3f3f3", "transparent"],
          opacity: 0.5,
        },
      },
      xaxis: {
        categories: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
        title: { text: "" },
      },
      yaxis: {
        title: { text: "" },
        min: 0,
        labels: {
          formatter: function (value) {
            return value + " min";
          },
        },
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val + " min";
          },
        },
      },
      markers: { size: 0 },
      title: {
        text: "Activité d'apprentissage hebdomadaire",
        align: "left",
        style: {
          fontSize: "18px",
          fontWeight: "bold",
          color: "#333",
        },
      },
      subtitle: {
        text: "Minutes passées à apprendre par jour",
        align: "left",
        style: {
          fontSize: "14px",
          color: "#777",
        },
      },
    },
  };

  const subjectDistributionData = {
    series: dashboardData.subjectDistribution.subjects.map((s) => s.percentage),
    options: {
      chart: {
        width: 380,
        type: "donut",
      },
      labels: dashboardData.subjectDistribution.subjects.map((s) => s.subject),
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: { width: 200 },
            legend: { position: "bottom" },
          },
        },
      ],
      colors: ["#6B46C1", "#805AD5", "#9F7AEA", "#D6BCFA"],
      plotOptions: {
        pie: {
          donut: {
            labels: {
              show: true,
              total: {
                showAlways: true,
                show: true,
                label: "Total",
                formatter: function (w) {
                  return "100%";
                },
                color: "#333",
                fontSize: "24px",
                fontWeight: "bold",
              },
              value: {
                show: true,
                formatter: function (val) {
                  return val + "%";
                },
                fontSize: "18px",
                fontWeight: "normal",
                color: "#333",
              },
            },
          },
        },
      },
      legend: {
        position: "bottom",
        horizontalAlign: "left",
        markers: {
          fillColors: ["#6B46C1", "#805AD5", "#9F7AEA", "#D6BCFA"],
        },
        itemMargin: {
          horizontal: 10,
          vertical: 5,
        },
        fontSize: "13px",
      },
      title: {
        text: "Répartition des matières",
        align: "left",
        style: {
          fontSize: "18px",
          fontWeight: "bold",
          color: "#333",
        },
      },
      subtitle: {
        text: "Votre apprentissage par catégorie",
        align: "left",
        style: {
          fontSize: "14px",
          color: "#777",
        },
      },
    },
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Tableau de bord de l'étudiant
      </h1>
      <p className="text-gray-600 mb-8">
        Suivez votre progression d'apprentissage et gérez vos cours.
      </p>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Cours inscrits */}
        <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center justify-center text-center">
          <BookOpenIcon className="h-8 w-8 text-gray-400 mb-2" />
          <p className="text-gray-500 text-sm">Cours inscrits</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {dashboardData.stats.enrolledCourses}
          </p>
        </div>
        {/* Cours terminés */}
        <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center justify-center text-center">
          <CheckCircleIcon className="h-8 w-8 text-gray-400 mb-2" />
          <p className="text-gray-500 text-sm">Cours terminés</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {dashboardData.stats.completedCourses}
          </p>
        </div>
        {/* Heures apprises */}
        <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center justify-center text-center">
          <ClockIcon className="h-8 w-8 text-gray-400 mb-2" />
          <p className="text-gray-500 text-sm">Heures apprises</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {dashboardData.stats.learningHours}
          </p>
        </div>
        {/* Certificats */}
        <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center justify-center text-center">
          <AcademicCapIcon className="h-8 w-8 text-gray-400 mb-2" />
          <p className="text-gray-500 text-sm">Certificats</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {dashboardData.stats.certificatesCount}
          </p>
        </div>
      </div>

      {/* Section Continuer l'apprentissage */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">
            Continuer l'apprentissage
          </h3>
          <Link
            to="/mescours"
            className="text-e-bosy-purple hover:underline text-sm font-medium"
          >
            Voir tous les cours
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardData.continueLearning.map((course, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg overflow-hidden shadow-sm"
            >
              <img
                src={
                  course.thumbnailUrl
                    ? API_BASE_URL + course.thumbnailUrl
                    : DEFAULT_COURSE_IMAGE
                }
  
                className="w-full h-32 bg-gray-200 flex items-center justify-center text-gray-400"
              />

              <div className="p-4">
                <h4 className="font-semibold text-gray-800 text-lg">
                  {course.title}
                </h4>
                <p className="text-sm text-gray-600">Par {course.instructor}</p>
                <div className="mt-3 text-sm text-gray-700">
                  <p className="mb-1">Progression</p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-e-bosy-purple h-2.5 rounded-full"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500 float-right">
                    {course.progress}%
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  Suivant : {course.nextLesson}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Graphiques Activité d'apprentissage hebdomadaire et Répartition des matières */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <Chart
            options={weeklyLearningActivityData.options}
            series={weeklyLearningActivityData.series}
            type="line"
            height={350}
          />
        </div>
        <div className="bg-white p-6 rounded-lg shadow flex items-center justify-center">
          <Chart
            options={subjectDistributionData.options}
            series={subjectDistributionData.series}
            type="donut"
            width={380}
          />
        </div>
      </div>

      {/* Emploi du temps à venir et Vos certificats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Vos certificats */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Vos certificats
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Récompenses que vous avez gagnées
          </p>
          <ul className="space-y-4">
            {dashboardData.certificates.map((cert, index) => (
              <li
                key={index}
                className="flex items-center justify-between border-b pb-4"
              >
                <div className="flex items-center space-x-3">
                  <TicketIcon className="h-6 w-6 text-e-bosy-purple" />
                  <div>
                    <p className="font-medium text-gray-800">
                      {cert.courseTitle}
                    </p>
                    <p className="text-sm text-gray-600">
                      Émis le : {new Date(cert.issuedAt).toLocaleDateString()} •{" "}
                      {cert.instructor}
                    </p>
                  </div>
                </div>
                <Link
                  to={`/certificats/${cert.certificateId}`}
                  className="bg-e-bosy-purple text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700"
                >
                  Voir
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 text-center">
            <Link
              to="/certificats"
              className="text-e-bosy-purple hover:underline text-sm"
            >
              Voir tous les certificats
            </Link>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Actions rapides
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/cours"
            className="bg-gray-100 p-4 rounded-lg flex flex-col items-center justify-center text-center hover:bg-gray-200"
          >
            <BookOpenIcon className="h-6 w-6 text-e-bosy-purple mb-2" />
            <span className="text-gray-700 text-sm">Parcourir les cours</span>
          </Link>
          <Link
            to="/achats"
            className="bg-gray-100 p-4 rounded-lg flex flex-col items-center justify-center text-center hover:bg-gray-200"
          >
            <CreditCardIcon className="h-6 w-6 text-e-bosy-purple mb-2" />
            <span className="text-gray-700 text-sm">
              Historique des paiements
            </span>
          </Link>
          <Link
            to="/certificats"
            className="bg-gray-100 p-4 rounded-lg flex flex-col items-center justify-center text-center hover:bg-gray-200"
          >
            <TicketIcon className="h-6 w-6 text-e-bosy-purple mb-2" />
            <span className="text-gray-700 text-sm">Certificats</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentOverviewPage;
