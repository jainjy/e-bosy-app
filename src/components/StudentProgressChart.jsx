import React from 'react';
import Chart from 'react-apexcharts';

const StudentProgressChart = ({ courses }) => {
  const chartData = {
    options: {
      chart: {
        type: 'bar',
        height: 350,
        stacked: true,
        toolbar: { show: false }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '35%',
          endingShape: 'rounded'
        },
      },
      colors: ['#6B46C1', '#3182CE', '#38A169'],
      dataLabels: { enabled: false },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
      },
      xaxis: {
        categories: courses.map(course => course.title),
        labels: {
          style: { fontSize: '11px' }
        }
      },
      yaxis: {
        title: { text: 'Pourcentage' },
        max: 100
      },
      fill: { opacity: 1 },
      tooltip: {
        y: {
          formatter: function (val) {
            return val + "%"
          }
        }
      },
      legend: {
        position: 'top',
        horizontalAlign: 'left'
      }
    },
    series: [
      {
        name: 'Progression moyenne',
        data: courses.map(course => course.averageProgress)
      },
      {
        name: 'Réussite aux quiz',
        data: courses.map(course => course.quizSuccessRate)
      },
      {
        name: 'Taux de complétion',
        data: courses.map(course => course.completionRate)
      }
    ]
  };

  return (
    <div className="mt-4">
      <Chart
        options={chartData.options}
        series={chartData.series}
        type="bar"
        height={350}
      />
    </div>
  );
};

export default StudentProgressChart;