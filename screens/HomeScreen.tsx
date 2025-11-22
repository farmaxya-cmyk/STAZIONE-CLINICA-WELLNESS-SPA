import React from 'react';

const HomeScreen = ({ user, onNavigate }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-100 text-slate-800">
      <h1 className="text-4xl font-bold mb-4">Clinical Wellness Spa</h1>
      <p className="text-xl">Benvenuto, <strong>{user?.name || 'ospite'}</strong></p>

      <div className="mt-6 space-y-2">
        <button
          onClick={() => onNavigate('profile')}
          className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700"
        >
          Vai al profilo
        </button>
        <button
          onClick={() => onNavigate('logout')}
          className="px-4 py-2 bg-slate-400 text-white rounded hover:bg-slate-500"
        >
          Logout
        </button>
      </div>

      <p className="mt-8 text-sm text-slate-500">
        Dato salvato in localStorage: <br />
        <code>{localStorage.getItem('username') || 'nessuna corrispondenza'}</code>
      </p>
    </div>
  );
};

export default HomeScreen;
