import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const ApplicationStatusChart = ({ pending, approved, rejected }) => {
  const data = {
    labels: ['Pending', 'Approved', 'Rejected'],
    datasets: [
      {
        data: [pending, approved, rejected],
        backgroundColor: ['#F59E0B', '#22C55E', '#EF4444'],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Application Status',
        font: { size: 14 },
      },
    },
  };

  return (
    <div style={{ height: '250px' }}>
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default ApplicationStatusChart;