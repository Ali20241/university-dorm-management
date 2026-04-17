import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const OccupancyChart = ({ availableRooms, occupiedRooms, maintenanceRooms }) => {
  const data = {
    labels: ['Available Rooms', 'Occupied Rooms', 'Maintenance'],
    datasets: [
      {
        data: [availableRooms, occupiedRooms, maintenanceRooms],
        backgroundColor: ['#22C55E', '#5B5CE2', '#F59E0B'],
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
        text: 'Room Occupancy Distribution',
        font: { size: 14 },
      },
    },
  };

  return (
    <div style={{ height: '250px' }}>
      <Pie data={data} options={options} />
    </div>
  );
};

export default OccupancyChart;