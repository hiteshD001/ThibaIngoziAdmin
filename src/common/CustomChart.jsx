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
import PropTypes from 'prop-types';

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
                borderColor: "#A8C5DA",
                pointBorderColor: "#A8C5DA",
                pointBackgroundColor: "#A8C5DA",
                pointHoverBackgroundColor: "#A8C5DA",
                pointHoverBorderColor: "#A8C5DA",
                pointBorderWidth: 1,
                pointHoverRadius: 1,
                pointHoverBorderWidth: 1,
                pointRadius: 3,
                fill: false,
                borderWidth: 4,
                tension: 0.3,
                data: props.data1,
            },
            {
                label: "Year",
                borderColor: "#1C1C1C",
                pointBorderColor: "#1C1C1C",
                pointBackgroundColor: "#1C1C1C",
                pointHoverBackgroundColor: "#1C1C1C",
                pointHoverBorderColor: "#1C1C1C",
                pointBorderWidth: 1,
                pointHoverRadius: 1,
                pointHoverBorderWidth: 1,
                pointRadius: 3,
                fill: false,
                borderWidth: 4,
                tension: 0.3,
                data: props.data2
            },
        ],
    };

    const options = {
        plugins: {
            legend: {
                position: "top",
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    fontColor: "rgba(0,0,0,0.5)",
                    fontStyle: "bold",
                    beginAtZero: true,
                    stepSize: 10, // Set step size
                    padding: 20,
                },
                grid: {
                    drawTicks: false,
                    display: false,
                },
            },
            x: {
                grid: {
                    zeroLineColor: "transparent",
                },
                ticks: {
                    padding: 20,
                    fontColor: "rgba(0,0,0,0.5)",
                    fontStyle: "bold",
                },
            },
        },
    };

    return <Line data={data} options={options} />;
};

export default CustomChart;

CustomChart.propTypes = {
    data1: PropTypes.arrayOf(PropTypes.number).isRequired,
    data2: PropTypes.arrayOf(PropTypes.number).isRequired,
};