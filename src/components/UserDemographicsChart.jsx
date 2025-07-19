import React from 'react';
import Chart from 'react-apexcharts';

const UserDemographicsChart = ({ data }) => {
  const chartOptions = {
    chart: {
      type: 'bar',
      height: 350,
      toolbar: { show: false }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        endingShape: 'rounded'
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      categories: ['Étudiants', 'Enseignants', 'Administrateurs'],
    },
    yaxis: {
      title: { text: 'Nombre d\'utilisateurs' }
    },
    fill: {
      opacity: 1
    },
    colors: ['#6B46C1', '#3182CE', '#38A169'],
    tooltip: {
      y: {
        formatter: function (val) {
          return val + " utilisateurs"
        }
      }
    }
  };

  const series = [{
    name: "Utilisateurs",
    data: [data.students, data.teachers, data.admins]
  }];

  return (
    <div className="mt-4">
      <Chart
        options={chartOptions}
        series={series}
        type="bar"
        height={350}
      />
    </div>
  );
};

export default UserDemographicsChart;