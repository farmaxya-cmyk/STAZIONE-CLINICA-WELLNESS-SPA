
import React from 'react';
import { getStoredJSON } from '../utils/storage';
import { 
    calculatePercentage, 
    calculateComposites, 
    getTherapyRecommendations,
    WellnessScores 
} from '../utils/wellnessCalculations';
import { WellnessRadarChart } from '../components/WellnessRadarChart';
import { LongevityBody } from '../components/LongevityBody';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon';
import { XCircleIcon } from '../components/icons/XCircleIcon';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import { ClipboardListIcon } from '../components/icons/ClipboardListIcon';
import { ArrowLeftIcon } from '../components/icons/ArrowLeftIcon';

const WellnessDashboard = ({ user, onNavigate }) => {
    const [scores, setScores] = React.useState<WellnessScores>({ fitness: null, sleep: null, diet: null, stress: null, microbiome: null });
    const [hasData, setHasData] = React.useState(false);

    React.useEffect(() => {
        // Recupera gli ultimi punteggi dai test effettuati
        const getLatestScore = (assessmentId: string) => {
            const history = getStoredJSON(`assessmentHistory_${user.email}_${assessmentId}`, []);
            return history.length > 0 ? history[history.length - 1].score : 0;
        };

        const rawScores = {
            fitness: getLatestScore('fitness'),
            sleep: getLatestScore('sleep'),
            diet: getLatestScore('diet'),
            stress: getLatestScore('stress'),
            microbiome: getLatestScore('microbiome'),
        };

        // Controlla se c'è almeno un test fatto
        const anyData = Object.values(rawScores).some(s => s > 0);
        setHasData(anyData);

        if (anyData) {
            // Normalizza i punteggi in percentuale (ritorna null se 0)
            setScores({
                fitness: calculatePercentage(rawScores.fitness, 'fitness'),
                sleep: calculatePercentage(rawScores.sleep, 'sleep'),
                diet: calculatePercentage(rawScores.diet, 'diet'),
                stress: calculatePercentage(rawScores.stress, 'stress'),
                microbiome: calculatePercentage(rawScores.microbiome, 'microbiome'),
            });
        }
    }, [user.email]);

    const composites = calculateComposites(scores);
    const recommendations = getTherapyRecommendations(composites, scores);

    const getRadarInterpretation = () => {
        const entries = [
            { name: 'Fitness', val: scores.fitness },
            { name: 'Sonno', val: scores.sleep },
            { name: 'Dietetica', val: scores.diet },
            { name: 'Stress', val: scores.stress },
            { name: 'Microbioma', val: scores.microbiome }
        ].filter(e => e.val !== null); // Filtra i test non fatti
        
        if (entries.length === 0) return <p className="text-slate-500 italic">Completa i test per vedere l'analisi.</p>;

        // @ts-ignore
        const sorted = [...entries].sort((a, b) => b.val - a.val);
        const best = sorted[0];
        const worst = sorted[sorted.length - 1];
        
        // @ts-ignore
        const avg = Math.round(entries.reduce((acc, curr) => acc + curr.val, 0) / entries.length);

        return (
            <p className="text-slate-600 text-sm leading-relaxed">
                Il tuo <strong>Wellness Index</strong> attuale è <strong>{avg}%</strong>. 
                Il tuo punto di forza è l'area <strong>{best.name}</strong> ({best.val}%), continua così! 
                {best.name !== worst.name && (
                    <>
                    L'area che richiede più attenzione è <strong>{worst.name}</strong> ({worst.val}%), che potrebbe influenzare negativamente il tuo equilibrio. 
                    Consulta il Piano Terapeutico qui sotto per strategie mirate.
                    </>
                )}
            </p>
        );
    };

    if (!hasData) {
        return (
            <div className="p-8 animate-fade-in text-center">
                <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-10">
                    <h1 className="text-3xl font-bold text-slate-800 mb-4">Wellness Dashboard</h1>
                    <p className="text-slate-600 mb-8">Non hai ancora dati sufficienti per generare la tua mappa della longevità. Completa i test di autovalutazione per sbloccare questa funzione.</p>
                    <button 
                        onClick={() => onNavigate('assessments')}
                        className="bg-sky-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-sky-700 transition-colors shadow-lg"
                    >
                        Vai ai Test
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 animate-fade-in pb-32 max-w-7xl mx-auto">
            <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-slate-800">Wellness Dashboard</h1>
                    <p className="text-xl text-slate-600">Analisi olistica del tuo stato di salute e longevità.</p>
                </div>
                <div className="text-right hidden md:block">
                    <p className="text-sm text-slate-500">Ultimo aggiornamento</p>
                    <p className="font-mono font-semibold text-slate-700">{new Date().toLocaleDateString()}</p>
                </div>
            </header>
            
            {/* Top Section: Visualizations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* Left: Radar Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 flex flex-col">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <span className="w-2 h-6 bg-sky-500 rounded-full"></span>
                        Radar Benessere
                    </h2>
                    <div className="flex-grow flex items-center justify-center relative">
                        <WellnessRadarChart scores={scores} composites={composites} />
                    </div>
                    
                    {/* Analisi Sintetica Box */}
                    <div className="mt-6 bg-slate-50 rounded-xl p-4 border border-slate-200">
                        <div className="flex items-center gap-2 mb-2">
                            <SparklesIcon className="w-4 h-4 text-sky-600" />
                            <h3 className="font-bold text-sm text-slate-700 uppercase tracking-wide">Analisi Sintetica</h3>
                        </div>
                        {getRadarInterpretation()}
                    </div>

                    <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                        <div className="p-3 bg-slate-50 rounded-lg">
                            <p className="text-xs text-slate-500 uppercase font-bold">Energia</p>
                            <p className="text-2xl font-bold text-sky-700">{composites.body !== null ? composites.body + '%' : '-'}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg">
                            <p className="text-xs text-slate-500 uppercase font-bold">Mente</p>
                            <p className="text-2xl font-bold text-sky-700">{composites.mind !== null ? composites.mind + '%' : '-'}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg">
                            <p className="text-xs text-slate-500 uppercase font-bold">Emozioni</p>
                            <p className="text-2xl font-bold text-sky-700">{composites.emotions !== null ? composites.emotions + '%' : '-'}</p>
                        </div>
                    </div>
                </div>

                {/* Right: Body Silhouette */}
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                     <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <span className="w-2 h-6 bg-green-500 rounded-full"></span>
                        Mappa Longevità
                    </h2>
                    <LongevityBody 
                        scores={scores} 
                        composites={composites} 
                        gender={user.gender || 'female'} 
                    />
                </div>
            </div>

            {/* Action Callout for Analysis */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl shadow-xl p-8 mb-12 text-white flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                        <ClipboardListIcon className="w-8 h-8 text-sky-400" />
                        Passa all'Azione: Analisi Cliniche
                    </h2>
                    <p className="text-slate-200 max-w-2xl">
                        Hai completato i test di autovalutazione. Per ottenere un quadro clinico completo e personalizzato, prenota le analisi specifiche consigliate per i tuoi obiettivi di salute in CLINICAL WELLNESS SPA presso Farmacia Centrale Montesilvano.
                    </p>
                </div>
                <button 
                    onClick={() => onNavigate('analysisQuote')}
                    className="bg-sky-500 hover:bg-sky-400 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-lg whitespace-nowrap flex items-center gap-2"
                >
                    <span>Scegli i tuoi obiettivi</span>
                    <ArrowLeftIcon className="w-5 h-5 rotate-180" />
                </button>
            </div>

            {/* Bottom Section: Therapeutic Recommendations */}
            <div className="space-y-8">
                <h2 className="text-3xl font-bold text-slate-800 border-b border-slate-200 pb-4">Piano Terapeutico Integrato</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {recommendations.map((rec, index) => (
                        <div key={index} className={`bg-white rounded-2xl shadow-lg overflow-hidden border-t-4 ${
                            rec.status === 'critical' ? 'border-red-500' : 
                            rec.status === 'moderate' ? 'border-yellow-500' : 'border-green-500'
                        }`}>
                            <div className="p-6 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold text-slate-800">{rec.title}</h3>
                                    {rec.status === 'critical' && <div className="flex items-center gap-1 text-red-600 font-bold bg-red-50 px-2 py-1 rounded"><XCircleIcon className="w-5 h-5" /> <span>Critico</span></div>}
                                    {rec.status === 'moderate' && <div className="flex items-center gap-1 text-yellow-600 font-bold bg-yellow-50 px-2 py-1 rounded"><span className="w-3 h-3 rounded-full bg-yellow-500"></span> <span>Moderato</span></div>}
                                    {rec.status === 'optimal' && <div className="flex items-center gap-1 text-green-600 font-bold bg-green-50 px-2 py-1 rounded"><CheckCircleIcon className="w-5 h-5" /> <span>Ottimale</span></div>}
                                </div>
                                
                                <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                                    {rec.description}
                                </p>

                                <div className="flex-grow">
                                    {rec.detailedContent ? (
                                        <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 prose prose-sm max-w-none mb-4" dangerouslySetInnerHTML={{__html: rec.detailedContent}}>
                                            {/* HTML content injected from constants */}
                                        </div>
                                    ) : (
                                        <div className="bg-slate-50 rounded-xl p-4 mb-4">
                                            <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-3">Protocollo Consigliato</h4>
                                            <ul className="space-y-2">
                                                {rec.therapies.map((therapy, tIndex) => (
                                                    <li key={tIndex} className="flex items-start gap-2 text-sm text-slate-700">
                                                        <span className="w-1.5 h-1.5 bg-sky-500 rounded-full mt-1.5 flex-shrink-0"></span>
                                                        {therapy}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                                
                                {rec.actionLink && (
                                    <button 
                                        onClick={() => onNavigate(rec.actionLink!)}
                                        className="w-full mt-auto py-2 px-4 bg-sky-100 text-sky-700 font-semibold rounded-lg hover:bg-sky-200 transition-colors text-sm flex items-center justify-center gap-2"
                                    >
                                        Vai alla risorsa consigliata <ArrowLeftIcon className="w-4 h-4 rotate-180"/>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-12 text-center text-slate-400 text-sm">
                <p>Analisi basata su algoritmi di intelligenza artificiale clinica. I risultati non sostituiscono il parere medico.</p>
            </div>
        </div>
    );
};

export default WellnessDashboard;
