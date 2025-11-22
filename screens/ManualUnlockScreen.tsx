import React from 'react';
import { ArrowLeftIcon } from '../components/icons/ArrowLeftIcon';
import { levelPasswords, passwordSummary } from '../data/constants';
import { wellnessProgramsData } from '../data/wellnessProgramsData';
import { WellnessProgram } from '../src/types';
import { getStoredJSON } from '../utils/storage';

const ManualUnlockScreen = ({ user, onNavigate, showNotification }) => {
    const [passwordInputs, setPasswordInputs] = React.useState({});

    const handleUnlock = (programId) => {
        const enteredPassword = passwordInputs[programId];
        const correctPassword = levelPasswords[programId];

        if (enteredPassword === correctPassword) {
            const storageKey = `manualUnlocks_${user.email}`;
            // FIX: Use getStoredJSON for robust parsing from localStorage.
            const existingUnlocks = getStoredJSON(storageKey, []);
            const newUnlocks = [...new Set([...existingUnlocks, programId])];
            localStorage.setItem(storageKey, JSON.stringify(newUnlocks));
            showNotification('Livello sbloccato con successo!', 'success');
        } else {
            showNotification('Password errata. Riprova.', 'error');
        }
    };
    
    // FIX: Cast the result of Object.values to WellnessProgram[] to ensure correct type inference.
    const lockedPrograms = (Object.values(wellnessProgramsData) as WellnessProgram[]).filter(p => p.unlocksAt);

    return (
        <div className="p-4 md:p-8 animate-fade-in">
            <button onClick={() => onNavigate('profile')} className="flex items-center gap-2 text-sky-600 font-semibold mb-6 hover:text-sky-800 transition-colors">
                <ArrowLeftIcon className="w-5 h-5" />
                <span>Torna al Profilo</span>
            </button>
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Sblocco Manuale Livelli</h1>
            <p className="text-xl text-slate-600 mb-8">Inserisci la password per accedere direttamente a un livello.</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <div className="bg-white p-6 rounded-2xl shadow-lg space-y-6">
                        {lockedPrograms.map(p => (
                            <div key={p.id}>
                                <h3 className="font-bold text-slate-700">{p.name} - {p.subtitle}</h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <input
                                        type="password"
                                        placeholder="Inserisci la password"
                                        value={passwordInputs[p.id] || ''}
                                        onChange={(e) => setPasswordInputs({...passwordInputs, [p.id]: e.target.value})}
                                        className="flex-grow p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500"
                                    />
                                    <button
                                        onClick={() => handleUnlock(p.id)}
                                        className="px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 transition-colors"
                                    >
                                        Sblocca
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">🧾 Riepilogo Password</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-600">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                                <tr>
                                    <th scope="col" className="px-4 py-3">Programma</th>
                                    <th scope="col" className="px-4 py-3">Livello</th>
                                    <th scope="col" className="px-4 py-3">Password</th>
                                </tr>
                            </thead>
                            <tbody>
                                {passwordSummary.map(item => (
                                    <tr key={item.level} className="bg-white border-b hover:bg-slate-50">
                                        <td className="px-4 py-3 font-medium text-slate-800">{item.program}</td>
                                        <td className="px-4 py-3">{item.level}</td>
                                        <td className="px-4 py-3"><code className="bg-slate-100 p-1 rounded-md text-sky-700 font-mono">{item.password}</code></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManualUnlockScreen;