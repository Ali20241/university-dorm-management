import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const MaintenanceChart = ({ open, inProgress, completed }) => {
  const data = {
    labels: ['Open', 'In Progress', 'Completed'],
    datasets: [
      {
        label: 'Maintenance Requests',
        data: [open, inProgress, completed],
        backgroundColor: ['#EF4444', '#F59E0B', '#22C55E'],
        borderRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Maintenance Requests by Status',
        font: { size: 14 },
      },
    },
  };

  return (
    <div style={{ height: '250px' }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default MaintenanceChart;