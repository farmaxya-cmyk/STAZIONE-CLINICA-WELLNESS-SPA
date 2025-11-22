import React from 'react';
import { LineChart } from '../components/LineChart';
import { assessmentsData } from '../data/assessmentsData';
import { getStoredJSON } from '../utils/storage';

const WellnessDashboard = ({ user, onNavigate }) => {
    const [dashboardData, setDashboardData] = React.useState([]);
    
    React.useEffect(() => {
        const data = Object.keys(assessmentsData).map(assessmentId => {
            const history = getStoredJSON(`assessmentHistory_${user.email}_${assessmentId}`, []);
            const { title, Icon } = assessmentsData[assessmentId];
            
            const latestScore = history.length > 0 ? history[history.length - 1].score : null;
            let trend = 0; // 0 for no change, 1 for up, -1 for down
            if (history.length > 1) {
                const last = history[history.length - 1].score;
                const secondLast = history[history.length - 2].score;
                if (last > secondLast) trend = 1;
                if (last < secondLast) trend = -1;
            }

            return {
                id: assessmentId,
                title,
                Icon,
                history,
                latestScore,
                trend
            };
        });
        setDashboardData(data);
    }, [user.email]);

    const TrendIcon = ({ trend }) => {
        if (trend === 1) return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-green-500"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;
        if (trend === -1) return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-red-500"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>;
        return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-slate-500"><line x1="5" y1="12" x2="19" y2="12"/></svg>;
    }

    return (
        <div className="p-4 md:p-8 animate-fade-in">
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Dashboard Benessere</h1>
            <p className="text-xl text-slate-600 mb-8">I tuoi progressi nel tempo.</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {dashboardData.map(data => (
                    <div key={data.id} className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-sky-100 rounded-full">
                                    <data.Icon className="w-6 h-6 text-sky-600" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-700">{data.title}</h2>
                            </div>
                            {data.latestScore !== null && (
                                <div className="flex items-center gap-2 p-2 bg-slate-100 rounded-lg">
                                    <span className="text-lg font-bold text-slate-800">{data.latestScore}</span>
                                    <TrendIcon trend={data.trend} />
                                </div>
                            )}
                        </div>
                        
                        {data.history.length > 0 ? (
                            <div>
                                <LineChart data={data.history} />
                                <div className="text-center mt-4">
                                    <button onClick={() => onNavigate('assessments')} className="text-sky-600 font-semibold hover:text-sky-800 transition-colors text-sm">
                                        Ripeti il test →
                                    </button>
                                </div>
                            </div>
                        ) : (
                             <div className="text-center py-10">
                                <p className="text-slate-500 mb-4">Non hai ancora completato questo test.</p>
                                <button onClick={() => onNavigate('assessments')} className="px-5 py-2 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 transition-colors">
                                    Inizia il test
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WellnessDashboard;