import React from 'react';
import { WellnessScores, CompositeScores } from '../utils/wellnessCalculations';

interface Props {
    scores: WellnessScores;
    composites: CompositeScores;
    gender: 'male' | 'female';
}

export const LongevityBody: React.FC<Props> = ({ scores, composites, gender }) => {
    
    // Note: Please ensure 'body_female.png' and 'body_male.png' are placed in your public/ folder.
    const femaleImage = "/body_female.png"; 
    const maleImage = "/body_male.png";
    
    const getColor = (v: number | null) => {
        if (v === null) return '#94a3b8'; // slate-400
        if (v < 40) return '#ef4444'; // red-500
        if (v < 70) return '#f59e0b'; // amber-500
        return '#10b981'; // emerald-500
    };

    const totalTests = 5;
    const validScores = Object.values(scores).filter((s): s is number => s !== null);
    const completedTests = validScores.length;
    const completionPercentage = Math.round((completedTests / totalTests) * 100);

    // Wellness Index Calculation
    const sumScores = validScores.reduce((a, b) => a + b, 0);
    const wellnessIndex = completedTests > 0 ? Math.round(sumScores / completedTests) : null;

    const getWellnessIndexColorClass = (val: number | null) => {
        if (val === null) return 'text-slate-400';
        if (val <= 50) return 'text-red-500';
        if (val <= 60) return 'text-amber-500';
        if (val <= 80) return 'text-emerald-500';
        return 'text-sky-500';
    };

    // Helper for SVG labels
    const SvgLabel = ({ x, y, align, label, value, targetY }: { x: number, y: number, align: 'start' | 'end', label: string, value: number | null, targetY: number }) => {
        const color = getColor(value);
        // Coordinates for the connecting line end point (at body)
        // Adjusted slightly for the image width
        const lineEndX = align === 'end' ? 180 : 220; 

        return (
            <g className="transition-all duration-300 hover:opacity-100 opacity-90 cursor-default group">
                {/* Connection Line */}
                <line 
                    x1={x} y1={y} 
                    x2={lineEndX} y2={targetY} 
                    stroke={color} 
                    strokeWidth="2" 
                    strokeDasharray="4,2" 
                    opacity="0.4" 
                    className="group-hover:opacity-100 transition-opacity"
                />
                
                {/* Percentage Bubble - with strong shadow */}
                <rect 
                    x={align === 'end' ? x - 52 : x} 
                    y={y - 16} 
                    width="54" 
                    height="34" 
                    rx="12" 
                    fill="white" 
                    stroke={color} 
                    strokeWidth="2.5"
                    filter="drop-shadow(0px 3px 3px rgba(0,0,0,0.15))"
                />
                
                {/* Value Text */}
                <text 
                    x={align === 'end' ? x - 25 : x + 27} 
                    y={y + 1} 
                    textAnchor="middle" 
                    dominantBaseline="middle" 
                    fill={color} 
                    fontWeight="800" 
                    fontSize="15" 
                    fontFamily="sans-serif"
                >
                    {value !== null ? `${value}%` : '-'}
                </text>

                {/* Label Text */}
                <text 
                    x={align === 'end' ? x - 60 : x + 62} 
                    y={y} 
                    textAnchor={align} 
                    dominantBaseline="middle" 
                    fill="#475569" // slate-600
                    fontSize="11" 
                    fontWeight="800"
                    fontFamily="sans-serif"
                    style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}
                >
                    {label}
                </text>
                
                {/* Dot at body connection */}
                 <circle cx={lineEndX} cy={targetY} r="4" fill={color} stroke="white" strokeWidth="2" />
            </g>
        );
    };

    return (
        <div className="flex flex-col w-full bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm h-full">
            
            {/* Progress Bar Section */}
            <div className="px-6 pt-6 bg-white pb-2 z-10">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completezza Profilo</span>
                    <span className="text-xs font-bold text-sky-600">{completionPercentage}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 mb-4 overflow-hidden shadow-inner">
                    <div 
                        className="bg-gradient-to-r from-sky-400 to-sky-600 h-2 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(14,165,233,0.5)]" 
                        style={{ width: `${completionPercentage}%` }}
                    ></div>
                </div>

                 {/* Wellness Index Section */}
                <div className="flex flex-col items-center justify-center py-2 border-b border-slate-100 mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Wellness Index</span>
                    <span className={`text-4xl font-extrabold ${getWellnessIndexColorClass(wellnessIndex)} drop-shadow-sm`}>
                        {wellnessIndex !== null ? `${wellnessIndex}%` : '-'}
                    </span>
                </div>
            </div>
            
            <div className="relative flex-grow flex flex-col items-center justify-center p-2 bg-gradient-to-b from-white via-sky-50/30 to-slate-100/50">
                 <svg viewBox="0 0 400 480" className="w-full h-auto max-h-[480px] drop-shadow-xl select-none">
                    <defs>
                        {/* Enhanced Glow Filter for the image */}
                        <filter id="bodyGlow" x="-50%" y="-50%" width="200%" height="200%">
                             <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                             <feMerge>
                                 <feMergeNode in="coloredBlur"/>
                                 <feMergeNode in="SourceGraphic"/>
                             </feMerge>
                        </filter>
                    </defs>
                    
                    {/* Body Image with Glow */}
                    <image 
                        href={gender === 'male' ? maleImage : femaleImage} 
                        x="50" 
                        y="-20" 
                        width="300" 
                        height="400" 
                        preserveAspectRatio="xMidYMid meet"
                        filter="url(#bodyGlow)"
                        opacity="0.9"
                    />

                    {/* Labels Mapped to Body Parts - Adjusted for image positioning */}
                    
                    {/* HEAD Area - y=70 approx */}
                    <SvgLabel x={110} y={60} align="end" label="SONNO" value={scores.sleep} targetY={60} />
                    <SvgLabel x={290} y={60} align="start" label="STRESS" value={scores.stress} targetY={60} />

                    {/* CHEST Area - y=150 approx */}
                    <SvgLabel x={290} y={160} align="start" label="FITNESS" value={scores.fitness} targetY={160} />

                    {/* GUT Area - y=250 approx */}
                    <SvgLabel x={110} y={260} align="end" label="DIETA" value={scores.diet} targetY={260} />
                    <SvgLabel x={290} y={260} align="start" label="MICROBIOMA" value={scores.microbiome} targetY={280} />

                </svg>

                {/* Bottom Summary Section (Under Feet) */}
                <div className="w-full px-4 pb-6">
                     <div className="flex justify-center items-end gap-4 sm:gap-8">
                        {/* Mente */}
                        <div className="flex flex-col items-center group cursor-default">
                            <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center border-4 ${composites.mind !== null ? 'border-sky-500 text-sky-700 bg-sky-50' : 'border-slate-200 text-slate-400 bg-white'} shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                                <span className="text-lg md:text-xl font-extrabold">{composites.mind !== null ? `${composites.mind}%` : '-'}</span>
                            </div>
                            <span className="text-xs font-bold text-slate-500 mt-2 uppercase tracking-wide group-hover:text-sky-600 transition-colors">Mente</span>
                        </div>

                        {/* Energia (formerly Corpo) */}
                        <div className="flex flex-col items-center group cursor-default">
                             <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center border-4 ${composites.body !== null ? 'border-sky-600 text-sky-800 bg-sky-50' : 'border-slate-200 text-slate-400 bg-white'} shadow-xl shadow-sky-100/50 group-hover:scale-105 transition-transform duration-300`}>
                                <span className="text-lg md:text-xl font-extrabold">{composites.body !== null ? `${composites.body}%` : '-'}</span>
                            </div>
                            <span className="text-xs font-bold text-slate-600 mt-2 uppercase tracking-wide group-hover:text-sky-700 transition-colors">Energia</span>
                        </div>

                        {/* Emozioni */}
                        <div className="flex flex-col items-center group cursor-default">
                            <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center border-4 ${composites.emotions !== null ? 'border-sky-500 text-sky-700 bg-sky-50' : 'border-slate-200 text-slate-400 bg-white'} shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                                <span className="text-lg md:text-xl font-extrabold">{composites.emotions !== null ? `${composites.emotions}%` : '-'}</span>
                            </div>
                             <span className="text-xs font-bold text-slate-500 mt-2 uppercase tracking-wide group-hover:text-sky-600 transition-colors">Emozioni</span>
                        </div>
                     </div>
                </div>

            </div>
        </div>
    );
};
