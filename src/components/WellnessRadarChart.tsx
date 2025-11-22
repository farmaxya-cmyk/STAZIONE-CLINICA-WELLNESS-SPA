
import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { WellnessScores, CompositeScores } from '../utils/wellnessCalculations';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface Props {
    scores: WellnessScores;
    composites: CompositeScores;
}

export const WellnessRadarChart: React.FC<Props> = ({ scores, composites }) => {
    const data = {
        labels: [
            'Fitness',
            'Sonno',
            'Dietetica',
            'Stress',
            'Microbioma',
            'ENERGIA',
            'MENTE',
            'EMOZIONI'
        ],
        datasets: [
            {
                label: 'Il Tuo Profilo Benessere',
                data: [
                    scores.fitness,
                    scores.sleep,
                    scores.diet,
                    scores.stress,
                    scores.microbiome,
                    composites.body,
                    composites.mind,
                    composites.emotions
                ],
                backgroundColor: 'rgba(14, 165, 233, 0.2)', // sky-500 con trasparenza
                borderColor: 'rgba(14, 165, 233, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(255, 255, 255, 1)',
                pointBorderColor: 'rgba(14, 165, 233, 1)',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(14, 165, 233)',
                spanGaps: true, // IMPORTANT: Connects points ignoring nulls
            },
            {
                label: 'Obiettivo Ottimale',
                data: [80, 80, 80, 80, 80, 80, 80, 80],
                backgroundColor: 'rgba(16, 185, 129, 0.05)', // green-500 molto trasparente
                borderColor: 'rgba(16, 185, 129, 0.4)',
                borderWidth: 1,
                pointRadius: 0,
                borderDash: [5, 5],
            }
        ],
    };

    const options = {
        scales: {
            r: {
                angleLines: {
                    display: true,
                    color: 'rgba(0, 0, 0, 0.1)'
                },
                suggestedMin: 0,
                suggestedMax: 100,
                ticks: {
                    stepSize: 20,
                    backdropColor: 'transparent',
                    font: {
                        size: 10
                    }
                },
                pointLabels: {
                    font: {
                        size: 11,
                        weight: 'bold' as const,
                        family: "'Inter', sans-serif"
                    },
                    color: (context: any) => {
                        // Colora diversamente le label dei compositi
                        const label = context.label;
                        if (['ENERGIA', 'MENTE', 'EMOZIONI'].includes(label)) {
                            return '#0f172a'; // slate-900 più scuro
                        }
                        return '#64748b'; // slate-500
                    }
                }
            },
        },
        plugins: {
            legend: {
                position: 'bottom' as const,
            },
            tooltip: {
                callbacks: {
                    label: function(context: any) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.r !== null) {
                            label += context.parsed.r + '%';
                        } else {
                            label += 'Dati mancanti';
                        }
                        return label;
                    }
                }
            }
        },
        maintainAspectRatio: false,
    };

    return (
        <div className="w-full h-[400px] flex justify-center items-center">
            <Radar data={data} options={options} />
        </div>
    );
};