import React from 'react';
import Chart from 'react-apexcharts';

const RevenueTrendChart = ({ data }) => {
  const chartOptions = {
    chart: {
      height: 350,
      type: 'area',
      toolbar: { show: false }
    },
    dataLabels: { enabled: false },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    xaxis: {
      categories: data.months,
    },
    yaxis: {
      title: { text: 'Revenus ($)' },
      labels: {
        formatter: function (value) {
          return "$" + Math.round(value);
        }
      }
    },
    colors: ['#38A169'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.9,
        stops: [0, 100]
      }
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return "$" + Math.round(val)
        }
      }
    }
  };

  const series = [{
    name: "Revenus",
    data: data.amounts
  }];

  return (
    <Chart
      options={chartOptions}
      series={series}
      type="area"
      height={350}
    />
  );
};

export default RevenueTrendChart;