import React from 'react';
import { Doughnut } from 'react-chartjs-2';

const data = {
  labels: ['Anxiety', 'Mental Disorders', 'Other'],
  datasets: [
    {
      data: [30, 25, 15, 30], // Data points for each section of the chart
      backgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0' // Add more colors if needed
      ],
      hoverBackgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0' // Add more colors if needed
      ]
    }
  ]
};

const options = {
  maintainAspectRatio: false,
  title: {
    display: true,
    text: 'Disease Distribution'
  },
  legend: {
    display: true,
    position: 'bottom'
  }
};

function DoughnutChartComponent() {
  return (
    <Doughnut data={data} options={options} />
  );
}

export default DoughnutChartComponent;
