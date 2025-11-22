import React from 'react';
import { assessmentsData } from '../data/assessmentsData';
import { LineChart } from '../components/LineChart';
import { getStoredJSON } from '../utils/storage';

const AssessmentScreen = ({ user, onNavigate, onStartAssessment }) => {
    const [historyData, setHistoryData] = React.useState({});

    React.useEffect(() => {
        if (user) {
            const data = {};
            Object.keys(assessmentsData).forEach(key => {
                const history = getStoredJSON(`assessmentHistory_${user.email}_${key}`, []);
                if (history.length > 0) {
                    data[key] = history;
                }
            });
            setHistoryData(data);
        }
    }, [user]);

    const hasHistory = Object.keys(historyData).length > 0;

    return (
        <div className="p-4 md:p-8 animate-fade-in pb-32">
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Test di Autovalutazione</h1>
            <p className="text-xl text-slate-600 mb-8">Scegli un'area da analizzare per iniziare.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.values(assessmentsData).map(assessment => (
                    <div
                        key={assessment.id}
                        onClick={() => onStartAssessment(assessment.id)}
                        className="bg-white rounded-xl shadow-md p-6 flex flex-col items-start cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 animate-slide-in-up"
                    >
                        <div className="p-3 bg-sky-100 rounded-full mb-4">
                            <assessment.Icon className="w-8 h-8 text-sky-600" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">{assessment.title}</h2>
                        <p className="text-slate-500 mt-2">Valuta la tua situazione attuale in quest'area.</p>
                    </div>
                ))}
            </div>

            {hasHistory && (
                <div className="mt-16 pt-8 border-t border-slate-200 animate-fade-in">
                    <h2 className="text-3xl font-bold text-slate-800 mb-6">I tuoi progressi nel tempo</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Object.keys(historyData).map(key => {
                            const assessment = assessmentsData[key];
                            const data = historyData[key];
                            const latestScore = data.length > 0 ? data[data.length - 1].score : 0;
                            
                            return (
                                <div key={key} className="bg-white p-6 rounded-xl shadow-lg border border-slate-100">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-sky-50 rounded-lg">
                                                <assessment.Icon className="w-6 h-6 text-sky-600" />
                                            </div>
                                            <h3 className="font-bold text-slate-700">{assessment.title}</h3>
                                        </div>
                                        <span className="text-2xl font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-md min-w-[3rem] text-center">{latestScore}</span>
                                    </div>
                                    <div className="w-full h-48">
                                        <LineChart data={data} width={400} height={200} />
                                    </div>
                                    <div className="mt-4 text-right">
                                         <button onClick={() => onStartAssessment(key)} className="text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors">
                                            Ripeti il test →
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssessmentScreen;