// CustomChart.js
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
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



const CustomChart = ({ ...props }) => {
    const resolved = props?.data?.map(item => item.resolved);
    const pending = props?.data?.map(item => item.pending);
    const labels = props?.data?.map(item => item.label);
    // console.log(labels);

    const data = {
        labels: labels,

        datasets: [
            {
                label: "Resolved",
                data: resolved,
                borderColor: "#367BE0",
                backgroundColor: "#367BE0",
                pointBorderColor: "#367BE0",
                pointBackgroundColor: "#367BE0",
                fill: false,
                borderWidth: 3,
                tension: 0,
                pointRadius: 4,
            },
            {
                label: "Pending",
                data: pending,
                borderColor: "#F97316",
                backgroundColor: "#F97316",
                pointBorderColor: "#F97316",
                pointBackgroundColor: "#F97316",
                fill: false,
                borderWidth: 3,
                tension: 0,
                pointRadius: 4,
            }
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    boxWidth: 8,
                    boxHeight: 8,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    padding: 20,
                    color: "#374151",
                    font: {
                        size: 14,
                        family: 'Arial',
                        weight: '500',
                    }
                }
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Number of Alerts',
                    color: '#111',
                    font: {
                        size: 14,
                    }
                },
                ticks: {
                    color: "rgba(0,0,0,0.7)",
                    stepSize: 1,
                    padding: 10,
                },
                grid: {
                    display: true,
                    drawBorder: false,
                    drawOnChartArea: true,
                    drawTicks: true,
                    color: "#E5E7EB"
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: "#4B5563"
                }
            }
        }
    };


    return <Line data={data} options={options} />;
};

export default CustomChart;