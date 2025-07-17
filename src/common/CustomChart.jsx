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
    const data = {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        datasets: [
            {
                label: "Month",
                borderColor: "#3B82F6",
                pointBorderColor: "#3B82F6",
                pointBackgroundColor: "#3B82F6",
                pointHoverBackgroundColor: "#3B82F6",
                pointHoverBorderColor: "#3B82F6",
                pointBorderWidth: 1,
                pointHoverRadius: 1,
                pointHoverBorderWidth: 1,
                pointRadius: 4,
                fill: false,
                borderWidth: 4,
                tension: 0,
                // eslint-disable-next-line react/prop-types
                data: props.data,
            },
            // {
            //     label: "Year",
            //     borderColor: "#1C1C1C",
            //     pointBorderColor: "#1C1C1C",
            //     pointBackgroundColor: "#1C1C1C",
            //     pointHoverBackgroundColor: "#1C1C1C",
            //     pointHoverBorderColor: "#1C1C1C",
            //     pointBorderWidth: 1,
            //     pointHoverRadius: 1,
            //     pointHoverBorderWidth: 1,
            //     pointRadius: 3,
            //     fill: false,
            //     borderWidth: 4,
            //     tension: 0.3,
            //     data: props.data2
            // },
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