import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export type StockChartProps = {
  symbol: string;
  history: Array<{ time: string; price: number }>;
};

const StockChart: React.FC<StockChartProps> = ({ symbol, history }) => {
  const data = {
    labels: history.map((h) => h.time),
    datasets: [
      {
        label: symbol + ' Price',
        data: history.map((h) => h.price),
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 7,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverBackgroundColor: 'rgba(139, 92, 246, 1)',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { 
        position: 'top' as const,
        labels: {
          color: '#0f172a',
          font: {
            size: 14,
            weight: 700,
            family: 'Inter, sans-serif'
          },
          padding: 16
        }
      },
      title: { 
        display: true, 
        text: symbol + ' Performance',
        color: '#0f172a',
        font: {
          size: 20,
          weight: 800,
          family: 'Inter, sans-serif'
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#fff',
        bodyColor: '#e2e8f0',
        borderColor: '#3b82f6',
        borderWidth: 2,
        padding: 14,
        displayColors: true,
        boxPadding: 8,
        titleFont: {
          size: 14,
          weight: 700,
          family: 'Inter, sans-serif'
        },
        bodyFont: {
          size: 13,
          weight: 600,
          family: 'Inter, sans-serif'
        }
      }
    },
    scales: {
      x: { 
        display: true, 
          title: { 
          display: true, 
          text: 'Time',
          color: '#64748b',
          font: {
            size: 13,
            weight: 700,
            family: 'Inter, sans-serif'
          }
        },
          ticks: {
          color: '#64748b',
          font: {
            size: 12,
            weight: 600,
            family: 'Inter, sans-serif'
          }
        },
        grid: {
          color: 'rgba(226, 232, 240, 0.5)'
        }
      },
      y: { 
        display: true, 
          title: { 
          display: true, 
          text: 'Price (USD)',
          color: '#64748b',
          font: {
            size: 13,
            weight: 700,
            family: 'Inter, sans-serif'
          }
        },
          ticks: {
          color: '#64748b',
          font: {
            size: 12,
            weight: 600,
            family: 'Inter, sans-serif'
          },
          callback: function(value: any) {
            return '$' + Number(value).toLocaleString();
          }
        },
        grid: {
          color: 'rgba(226, 232, 240, 0.5)'
        }
      },
    },
  };

  return (
    <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '16px' }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default StockChart;
