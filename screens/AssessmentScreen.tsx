import React from 'react';
import { assessmentsData } from '../data/assessmentsData';

const AssessmentScreen = ({ onNavigate, onStartAssessment }) => {
    return (
        <div className="p-4 md:p-8 animate-fade-in">
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
        </div>
    );
};

export default AssessmentScreen;