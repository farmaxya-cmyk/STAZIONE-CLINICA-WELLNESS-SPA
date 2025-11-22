import React from 'react';

export const BreathingScreen = () => {
    const BREATHING_PATTERNS = {
      coherence: { name: '5-5 Coerenza Cardiaca', inhale: 5, hold: 0, exhale: 5, total: 10 },
      vagotonia: { name: '4-6 Vagotonia', inhale: 4, hold: 0, exhale: 6, total: 10 },
      sleep: { name: '4-7-8 Sonno', inhale: 4, hold: 7, exhale: 8, total: 19 },
      training: { name: '6-6 Allenamento', inhale: 6, hold: 0, exhale: 6, total: 12 },
    };

    const DURATION_OPTIONS = [
        { label: '1 Minuto', value: 60 },
        { label: '5 Minuti', value: 300 },
        { label: '10 Minuti', value: 600 },
        { label: '15 Minuti', value: 900 },
    ];

    const [duration, setDuration] = React.useState(DURATION_OPTIONS[0].value);
    const [patternKey, setPatternKey] = React.useState('coherence');
    const [isActive, setIsActive] = React.useState(false);
    const [timeLeft, setTimeLeft] = React.useState(DURATION_OPTIONS[0].value);
    const [cycles, setCycles] = React.useState(0);
    const [instruction, setInstruction] = React.useState('Inizia');
    const [scale, setScale] = React.useState(0.6);

    const mainTimer = React.useRef(null);
    const cycleTimer = React.useRef(null);
    const audioRef = React.useRef(null);

    React.useEffect(() => {
        // Cleanup audio when component unmounts
        const audioEl = audioRef.current;
        return () => {
            if (audioEl) {
                audioEl.pause();
            }
        };
    }, []);

    React.useEffect(() => {
        if (isActive && timeLeft > 0) {
            mainTimer.current = setInterval(() => {
                setTimeLeft(t => t - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            setIsActive(false);
             if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            alert('Sessione di respirazione completata!');
        }
        return () => clearInterval(mainTimer.current);
    }, [isActive, timeLeft]);

    React.useEffect(() => {
        if (!isActive) {
            clearTimeout(cycleTimer.current);
            setInstruction('Inizia');
            setScale(0.6);
            return;
        }

        const pattern = BREATHING_PATTERNS[patternKey];
        
        const breathingCycle = () => {
            setInstruction('Inspira...');
            setScale(1);

            cycleTimer.current = setTimeout(() => {
                if (pattern.hold > 0) {
                    setInstruction('Trattieni');
                }

                cycleTimer.current = setTimeout(() => {
                    setInstruction('...espira');
                    setScale(0.6);

                    cycleTimer.current = setTimeout(() => {
                        setCycles(c => c + 1);
                        if (isActive) breathingCycle();
                    }, pattern.exhale * 1000);
                }, pattern.hold * 1000);
            }, pattern.inhale * 1000);
        };

        breathingCycle();

        return () => clearTimeout(cycleTimer.current);
    }, [isActive, patternKey]);

    const handleStartStop = () => {
        if (isActive) {
            setIsActive(false);
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        } else {
            setTimeLeft(duration);
            setCycles(0);
            setIsActive(true);
            if (audioRef.current) {
                audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
            }
        }
    };
    
    const formatTime = (seconds) => {
        const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
        const secs = String(seconds % 60).padStart(2, '0');
        return `${mins}:${secs}`;
    };

    const currentPattern = BREATHING_PATTERNS[patternKey];
    const circleTransitionDuration = isActive
        ? (instruction === 'Inspira...' ? currentPattern.inhale : currentPattern.exhale)
        : 1;

    return (
        <div className="p-4 md:p-8 animate-fade-in flex flex-col items-center justify-center h-full">
            <div className="w-full max-w-2xl">
                <h1 className="text-4xl font-bold text-slate-800 mb-4 text-center">Coerenza Cardiaca</h1>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <div>
                        <label htmlFor="duration-select" className="block text-sm font-medium text-slate-700 mb-1">Durata Sessione:</label>
                        <select 
                            id="duration-select"
                            value={duration} 
                            onChange={e => setDuration(Number(e.target.value))}
                            disabled={isActive}
                            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 disabled:bg-slate-100"
                        >
                            {DURATION_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="pattern-select" className="block text-sm font-medium text-slate-700 mb-1">Ritmo Respirazione:</label>
                        <select 
                            id="pattern-select"
                            value={patternKey}
                            onChange={e => setPatternKey(e.target.value)}
                            disabled={isActive}
                            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 disabled:bg-slate-100"
                        >
                            {Object.entries(BREATHING_PATTERNS).map(([key, pat]) => <option key={key} value={key}>{pat.name}</option>)}
                        </select>
                    </div>
                </div>

                <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center mx-auto">
                    <div className="absolute w-full h-full bg-sky-200 rounded-full opacity-50"></div>
                    <div 
                        className="absolute w-full h-full bg-sky-300 rounded-full"
                        style={{ 
                            transform: `scale(${scale})`,
                            transition: `transform ${circleTransitionDuration}s ease-in-out`
                        }}
                    ></div>
                    <span className="relative text-2xl font-semibold text-sky-800 z-10">{instruction}</span>
                </div>

                <div className="flex justify-around items-center mt-8 text-center">
                    <div>
                        <p className="text-slate-500">Cicli completati</p>
                        <p className="text-3xl font-bold text-slate-800">{cycles}</p>
                    </div>
                    <div>
                         <p className="text-slate-500">Tempo residuo</p>
                         <p className="text-3xl font-bold text-slate-800">{formatTime(isActive ? timeLeft : duration)}</p>
                    </div>
                </div>

                <button
                    onClick={handleStartStop}
                    className="w-full max-w-xs mx-auto mt-8 block px-8 py-4 bg-sky-600 text-white font-bold text-lg rounded-full shadow-lg hover:bg-sky-700 active:bg-sky-800 transition-colors"
                >
                    {isActive ? 'Ferma Esercizio' : 'Inizia Esercizio'}
                </button>
            </div>
            <audio ref={audioRef} src="https://files.catbox.moe/zc81yy.mp3" loop />
        </div>
    );
};