import React from 'react';
import { pharmacyServicesData } from '../data/pharmacyServicesData';
import { PHARMACY_EMAIL, PHARMACY_WHATSAPP_NUMBER } from '../data/constants';
import { getStoredJSON } from '../utils/storage';
import { SelectionSummary } from '../components/SelectionSummary';
import { BookingModal } from '../components/BookingModal';

// --- Main Component ---

const PharmacyServicesScreen = ({ user, showNotification }) => {
    const [selection, setSelection] = React.useState([]);
    const [isBookingModalOpen, setIsBookingModalOpen] = React.useState(false);
    const [bookingHistory, setBookingHistory] = React.useState([]);

    React.useEffect(() => {
        const allBookings = getStoredJSON('spaBookings', []);
        // FIX: Use .getTime() to perform arithmetic operations on dates for sorting.
        const userHistory = allBookings.filter(b => b.userEmail === user.email && b.type === 'pharmacy').sort((a, b) => new Date(b.dateSubmitted).getTime() - new Date(a.dateSubmitted).getTime());
        setBookingHistory(userHistory);
    }, [user.email]);

    const handleSelectItem = (item) => {
        setSelection(prev => {
            const id = item.name;
            const isSelected = prev.some(s => s.id === id);
            if (isSelected) {
                return prev.filter(s => s.id !== id);
            } else {
                return [...prev, { ...item, id }];
            }
        });
    };

    const createBookingRequest = (date, time, method) => {
        const newBooking = { id: new Date().getTime(), userEmail: user.email, userName: user.name, services: selection, requestedDate: date, requestedTime: time, totalPrice: selection.reduce((acc, item) => acc + item.price, 0), status: 'pending', dateSubmitted: new Date().toISOString(), type: 'pharmacy' };
        const allBookings = getStoredJSON('spaBookings', []);
        localStorage.setItem('spaBookings', JSON.stringify([...allBookings, newBooking]));
        setBookingHistory(prev => [newBooking, ...prev]);
        
        const servicesText = selection.map(s => `- ${s.name} (${s.duration} - ${s.price}€)`).join('\n');
        const details = `Richiesta Servizi Farmacia da: ${user.name} (${user.email})\nData: ${new Date(date).toLocaleDateString('it-IT')}\nOra: ${time}\n\nServizi:\n${servicesText}\n\nTotale: ${newBooking.totalPrice}€`.trim();
        if (method === 'email') window.open(`mailto:${PHARMACY_EMAIL}?subject=${encodeURIComponent(`Richiesta Servizi Farmacia - ${user.name}`)}&body=${encodeURIComponent(details)}`, '_blank');
        else if (method === 'whatsapp') window.open(`https://wa.me/${PHARMACY_WHATSAPP_NUMBER}?text=${encodeURIComponent(details)}`, '_blank');
        setIsBookingModalOpen(false); setSelection([]); showNotification('La tua richiesta è pronta per essere inviata!');
    };

    const StatusChip = ({ status }) => {
        const styles = { pending: 'bg-yellow-100 text-yellow-800', confirmed: 'bg-green-100 text-green-800', rejected: 'bg-red-100 text-red-800' };
        const text = { pending: 'In attesa', confirmed: 'Confermata', rejected: 'Rifiutata' };
        return <span className={`px-3 py-1 text-sm font-bold rounded-full ${styles[status]}`}>{text[status]}</span>;
    };

    const totalPrice = selection.reduce((acc, item) => acc + (item.price || 0), 0);

    return (
        <div className="p-4 md:p-8 animate-fade-in pb-32">
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Servizi della Farmacia</h1>
            <p className="text-xl text-slate-600 mb-8">Scegli i servizi di cui hai bisogno e prenota un appuntamento.</p>
            
            <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold text-slate-700 mb-4">{pharmacyServicesData.category}</h2>
                <div className="divide-y divide-slate-200">
                    {pharmacyServicesData.items.map(item => (
                        <div key={item.name} onClick={() => handleSelectItem(item)} className={`py-4 flex justify-between items-start cursor-pointer transition-colors ${selection.some(s => s.id === item.name) ? 'bg-sky-50' : 'hover:bg-slate-50'}`}>
                            <div>
                                <p className="font-bold text-slate-800">{item.name}</p>
                                <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                                <p className="text-sm text-slate-500 mt-1">Durata: {item.duration}</p>
                            </div>
                            <p className="font-semibold text-sky-700 flex-shrink-0 ml-4">{item.price}€</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-12">
                <h2 className="text-3xl font-bold text-slate-800 mb-6">Le Tue Richieste di Servizi</h2>
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                    {bookingHistory.length > 0 ? (
                        <ul className="space-y-4">{bookingHistory.map(b => (
                            <li key={b.id} className="bg-slate-50 p-4 rounded-lg">
                                <div className="flex justify-between items-start gap-4">
                                    <div>
                                        <p className="font-bold text-slate-800">Richiesta del {new Date(b.dateSubmitted).toLocaleDateString('it-IT')}</p>
                                        <p className="text-sm text-slate-600">Appuntamento per: {new Date(b.requestedDate).toLocaleDateString('it-IT')} ore {b.requestedTime}</p>
                                    </div>
                                    <StatusChip status={b.status} />
                                </div>
                                <ul className="mt-2 text-sm text-slate-700 list-disc list-inside">
                                    {b.services.map(s => <li key={s.id}>{s.name}</li>)}
                                </ul>
                            </li>
                        ))}</ul>
                    ) : <p className="text-center text-slate-500 py-8">Non hai richieste di servizi in corso.</p>}
                </div>
            </div>

            {selection.length > 0 && <SelectionSummary selection={selection} total={totalPrice} onProceed={() => setIsBookingModalOpen(true)} />}
            <BookingModal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} selection={selection} user={user} onConfirmByEmail={(d, t) => createBookingRequest(d, t, 'email')} onConfirmByWhatsApp={(d, t) => createBookingRequest(d, t, 'whatsapp')} />
        </div>
    );
};

export default PharmacyServicesScreen;