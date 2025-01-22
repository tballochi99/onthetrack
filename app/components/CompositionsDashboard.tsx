"use client";

import { useState, useEffect } from 'react';
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function CompositionsDashboard({ userId }) {
    const [data, setData] = useState(null);
    const [timeFrame, setTimeFrame] = useState('all');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/user/${userId}/compositions?timeFrame=${timeFrame}`);
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                const result = await res.json();
                if (result.success) {
                    setData(result.data);
                } else {
                    console.error('Failed to fetch data:', result.message);
                }
            } catch (error) {
                console.error('Error fetching compositions:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [timeFrame, userId]);

    const dateCounts = data?.reduce((acc, comp) => {
        const date = new Date(comp.createdAt).toLocaleDateString();
        if (acc[date]) {
            acc[date] += 1;
        } else {
            acc[date] = 1;
        }
        return acc;
    }, {});

    const dates = Object.keys(dateCounts || {}).reverse();
    const counts = Object.values(dateCounts || {}).reverse();

    const chartData = {
        labels: dates,
        datasets: [
            {
                label: 'Compositions Created',
                data: counts,
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                borderColor: 'rgb(16, 185, 129)',
                borderWidth: 2,
                fill: true,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                labels: { color: 'white', font: { size: 14 } },
            },
            title: {
                display: true,
                text: 'Compositions Created Over Time',
                color: 'white',
                font: { size: 20 },
            },
        },
        scales: {
            x: {
                ticks: { color: 'white', font: { size: 14 } },
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
            },
            y: {
                ticks: { color: 'white', font: { size: 14 } },
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
            },
        },
    };

    return (
        <div className="p-8 flex justify-center items-start min-h-screen bg-gray-900">
            <div className="bg-gray-800 p-8 rounded-lg shadow-2xl max-w-4xl w-full mt-10">
                <h1 className="text-4xl font-bold text-white text-center mb-8">Compositions Dashboard</h1>
                <div className="flex justify-center space-x-4 mb-6">
                    {['month', 'year', 'all'].map((frame) => (
                        <button
                            key={frame}
                            onClick={() => setTimeFrame(frame)}
                            className={`px-6 py-3 rounded-md text-lg font-semibold transition-colors ${
                                timeFrame === frame
                                    ? 'bg-emerald-600 text-white shadow-lg'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                        >
                            {frame === 'month' ? '1 Month' : frame === 'year' ? '1 Year' : 'All Time'}
                        </button>
                    ))}
                </div>
                {isLoading ? (
                    <div className="flex justify-center items-center h-80">
                        <div className="animate-spin rounded-full h-24 w-24 border-t-2 border-b-2 border-emerald-500"></div>
                    </div>
                ) : data ? (
                    <Line data={chartData} options={chartOptions} />
                ) : (
                    <p className="text-center text-gray-400">No data available</p>
                )}
            </div>
        </div>
    );
}