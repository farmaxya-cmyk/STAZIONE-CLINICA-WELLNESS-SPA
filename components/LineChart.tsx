import React from 'react';

export const LineChart = ({ data, width = 400, height = 200, color = "#0ea5e9" }) => {
    if (!data || data.length < 2) {
        return <div className="flex items-center justify-center h-full text-slate-500">Dati insufficienti per il grafico.</div>;
    }

    const padding = 20;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const yMax = 80;
    const yMin = 20;

    const getX = (index) => (index / (data.length - 1)) * chartWidth + padding;
    const getY = (score) => chartHeight - ((score - yMin) / (yMax - yMin)) * chartHeight + padding;

    const path = data
        .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.score)}`)
        .join(' ');

    return (
        <svg viewBox={`0 0 ${width} ${height}`} aria-label="Grafico dell'andamento dei punteggi">
            <path d={path} fill="none" stroke={color} strokeWidth="2" />
            {data.map((d, i) => (
                <g key={i}>
                    <circle cx={getX(i)} cy={getY(d.score)} r="4" fill={color} />
                    <title>{`Punteggio: ${d.score}\nData: ${new Date(d.date).toLocaleDateString('it-IT')}`}</title>
                </g>
            ))}
            <text x={padding - 5} y={getY(yMin)} textAnchor="end" dominantBaseline="middle" className="text-xs fill-slate-500">{yMin}</text>
            <text x={padding - 5} y={getY(yMax)} textAnchor="end" dominantBaseline="middle" className="text-xs fill-slate-500">{yMax}</text>
        </svg>
    );
};