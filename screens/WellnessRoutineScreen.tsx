import React from 'react';
import { wellnessProgramsData } from '../data/wellnessProgramsData';
import { LockIcon } from '../components/icons/LockIcon';
import { BellIcon } from '../components/icons/BellIcon';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon';
import { ChevronDownIcon } from '../components/icons/ChevronDownIcon';
import { WellnessProgram } from '../src/types';
import { getStoredJSON } from '../utils/storage';


// Fix: Changed to a named export to resolve module resolution error.
export const WellnessRoutineScreen = ({ user, showNotification }) => {
    const [missionStates, setMissionStates] = React.useState({});
    const [manualUnlocks, setManualUnlocks] = React.useState([]);
    const [activeReminders, setActiveReminders] = React.useState(new Set());
    const [openProgram, setOpenProgram] = React.useState(null);

    const storageKeys = React.useMemo(() => ({
        missionStates: `missionStates_${user.email}`,
        manualUnlocks: `manualUnlocks_${user.email}`,
        reminders: `activeReminders_${user.email}`,
    }), [user.email]);
    
    React.useEffect(() => {
        const savedMissionStates = getStoredJSON(storageKeys.missionStates, {});
        const savedUnlocks = getStoredJSON(storageKeys.manualUnlocks, []);
        const savedReminders = getStoredJSON(storageKeys.reminders, []);

        setMissionStates(savedMissionStates);
        setManualUnlocks(savedUnlocks);
        setActiveReminders(new Set(savedReminders));
    }, [storageKeys]);
    
    const pointsData = React.useMemo(() => {
        let total = 0;
        const byProgram: { [key: string]: { name: string; points: number; dependsOn?: string; unlocksAt?: number; } } = {};
        // FIX: Cast Object.values to WellnessProgram[] to provide type information for the `program` variable.
        for (const program of Object.values(wellnessProgramsData) as WellnessProgram[]) {
            let programPoints = 0;
            const allMissions = [...(program.daily || []), ...(program.weekly || [])];
            for (const mission of allMissions) {
                if (missionStates[mission.id]?.completed) {
                    programPoints += mission.points;
                }
            }
            if(program.id){
                byProgram[program.id] = { name: program.name, points: programPoints, dependsOn: program.dependsOn, unlocksAt: program.unlocksAt };
                total += programPoints;
            }
        }
        return { total, byProgram };
    }, [missionStates]);

    const handleToggleMission = (missionId, missionPoints) => {
        setMissionStates(prev => {
            const newStates = { ...prev };
            const wasCompleted = newStates[missionId]?.completed || false;
            newStates[missionId] = { ...newStates[missionId], completed: !wasCompleted };
            localStorage.setItem(storageKeys.missionStates, JSON.stringify(newStates));
            const message = wasCompleted ? `Missione annullata.` : `Missione completata! +${missionPoints} punti!`;
            showNotification(message, 'success');
            return newStates;
        });
    };
    
    const onToggleReminder = (missionId) => {
        setActiveReminders(prev => {
            const newReminders = new Set(prev);
            if (newReminders.has(missionId)) {
                newReminders.delete(missionId);
                showNotification('Promemoria disattivato.', 'success');
            } else {
                newReminders.add(missionId);
                showNotification('Promemoria attivato!', 'success');
            }
            localStorage.setItem(storageKeys.reminders, JSON.stringify(Array.from(newReminders)));
            return newReminders;
        });
    };
    
    const programGroups = React.useMemo(() => {
        const groups: { [key: string]: { title: string; programs: WellnessProgram[] } } = {
            food: { title: '🍎 Alimentazione', programs: [] },
            sleep: { title: '🌙 Sonno', programs: [] },
            anxiety_stress: { title: '🧘 Ansia & Stress', programs: [] },
            activity: { title: '🏃 Movimento', programs: [] },
            smart: { title: '🚀 Programmi Smart', programs: [] }
        };

        // FIX: Cast Object.values to WellnessProgram[] to provide type information for the `p` variable.
        (Object.values(wellnessProgramsData) as WellnessProgram[]).forEach(p => {
            if (p.id.startsWith('food')) groups.food.programs.push(p);
            else if (p.id.startsWith('sleep')) groups.sleep.programs.push(p);
            else if (p.id.startsWith('anxiety_stress')) groups.anxiety_stress.programs.push(p);
            else if (p.id.startsWith('activity')) groups.activity.programs.push(p);
            else if (p.isSmart) groups.smart.programs.push(p);
        });

        // Sort levels within each group
        for (const key in groups) {
            groups[key].programs.sort((a, b) => {
                const aLevel = parseInt(a.id.match(/\d+$/)?.[0] || '1');
                const bLevel = parseInt(b.id.match(/\d+$/)?.[0] || '1');
                if (a.id.includes('gold')) return -1; 
                if (b.id.includes('gold')) return 1;
                return aLevel - bLevel;
            });
        }

        return groups;
    }, []);

    // FIX: Explicitly type ProgramCard as a React.FC to allow the 'key' prop in map function.
    const ProgramCard: React.FC<{ program: WellnessProgram }> = ({ program }) => {
        const programPoints = pointsData.byProgram[program.id]?.points || 0;
        const dependency = pointsData.byProgram[program.dependsOn];
        const isLocked = dependency && (dependency.points < dependency.unlocksAt) && !manualUnlocks.includes(program.id);
        const missions = [...(program.daily || []), ...(program.weekly || [])];

        if (isLocked) {
            return (
                <div className="bg-white rounded-xl shadow-lg p-4 opacity-60">
                    <div className="flex items-center justify-center gap-4 text-center">
                        <LockIcon className="w-8 h-8 text-slate-400" />
                        <div>
                            <h3 className="text-lg font-bold text-slate-600">{program.name}</h3>
                            <p className="text-sm text-slate-500">
                                Sbloccabile con {dependency.unlocksAt - dependency.points} punti in {dependency.name}.
                            </p>
                        </div>
                    </div>
                </div>
            );
        }
        
        const isExpanded = openProgram === program.id;

        return (
            <div className="bg-white rounded-xl shadow-lg">
                <button 
                    className="w-full text-left p-4 flex justify-between items-center"
                    onClick={() => setOpenProgram(isExpanded ? null : program.id)}
                >
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">{program.Icon}</span>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">{program.name}</h3>
                            <p className="text-slate-500">{program.subtitle}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <span className="font-bold text-sky-600 text-lg">{programPoints} Punti</span>
                       <ChevronDownIcon className={`w-6 h-6 text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                </button>
                {isExpanded && (
                    <div className="p-4 border-t border-slate-200 animate-fade-in">
                        <p className="text-slate-600 mb-4">{program.description}</p>
                        <ul className="space-y-3">
                            {missions.map(mission => (
                                <li key={mission.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">{mission.Icon}</span>
                                        <div>
                                            <p className="font-semibold text-slate-700">{mission.title}</p>
                                            <p className="text-sm text-slate-500">{mission.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {mission.remindable && (
                                            <button 
                                                onClick={() => onToggleReminder(mission.id)}
                                                className={`p-2 rounded-full transition-colors ${activeReminders.has(mission.id) ? 'bg-sky-100 text-sky-600' : 'text-slate-400 hover:bg-slate-200'}`}
                                                aria-label={activeReminders.has(mission.id) ? 'Disattiva promemoria' : 'Attiva promemoria'}
                                            >
                                                <BellIcon className="w-5 h-5"/>
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => handleToggleMission(mission.id, mission.points)}
                                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold rounded-full transition-colors bg-white border-2"
                                            style={{ 
                                                borderColor: missionStates[mission.id]?.completed ? '#22c55e' : '#e2e8f0',
                                                color: missionStates[mission.id]?.completed ? '#166534' : '#334155'
                                            }}
                                        >
                                            {missionStates[mission.id]?.completed && <CheckCircleIcon className="w-5 h-5 text-green-600"/>}
                                            <span>{mission.points} Punti</span>
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="p-4 md:p-8 animate-fade-in">
            <h1 className="text-4xl font-bold text-slate-800 mb-2">La Tua Routine di Benessere</h1>
            <p className="text-xl text-slate-600 mb-8">Completa le missioni, accumula punti e sblocca nuovi livelli!</p>

            <div className="bg-sky-600 text-white p-6 rounded-2xl shadow-lg mb-8 text-center">
                <p className="text-lg text-sky-200">Punti Benessere Totali</p>
                <p className="text-5xl font-bold">{pointsData.total}</p>
            </div>
            
            {Object.keys(programGroups).map(key => {
                const group = programGroups[key];
                if (group.programs.length === 0) return null;
                return (
                    <div key={key} className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-700 mb-4">{group.title}</h2>
                        <div className="space-y-4">
                             {group.programs.map(p => (
                                 <ProgramCard key={p.id} program={p} />
                             ))}
                        </div>
                    </div>
                );
            })}

        </div>
    );
};