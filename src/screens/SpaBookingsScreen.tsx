import React from 'react';
import { wellnessData } from '../data/wellnessData';
import { PHARMACY_EMAIL, PHARMACY_WHATSAPP_NUMBER } from '../data/constants';
import { getStoredJSON } from '../utils/storage';
import { SelectionSummary } from '../components/SelectionSummary';
import { BookingModal } from '../components/BookingModal';

// --- Main Component ---

const SpaBookingsScreen = ({ user, showNotification }) => {
    const [selection, setSelection] = React.useState([]);
    const [isBookingModalOpen, setIsBookingModalOpen] = React.useState(false);
    const [bookingHistory, setBookingHistory] = React.useState([]);

    React.useEffect(() => {
        const allBookings = getStoredJSON('spaBookings', []);
        const userHistory = allBookings
            .filter(b => b.userEmail === user.email && b.type === 'spa')
            .sort((a, b) => new Date(b.dateSubmitted).getTime() - new Date(a.dateSubmitted).getTime());
        setBookingHistory(userHistory);
    }, [user.email]);

    const handleSelectItem = (item, category) => {
        setSelection(prev => {
            const id = `${category}-${item.name}`;
            const isSelected = prev.some(s => s.id === id);
            if (isSelected) {
                return prev.filter(s => s.id !== id);
            } else {
                return [...prev, { ...item, id }];
            }
        });
    };

    const createBookingRequest = (date, time, method) => {
        const newBooking = { id: new Date().getTime(), userEmail: user.email, userName: user.name, services: selection, requestedDate: date, requestedTime: time, totalPrice: selection.reduce((acc, item) => acc + (item.price || 0), 0), status: 'pending', dateSubmitted: new Date().toISOString(), type: 'spa' };
        const allBookings = getStoredJSON('spaBookings', []);
        localStorage.setItem('spaBookings', JSON.stringify([...allBookings, newBooking]));
        setBookingHistory(prev => [newBooking, ...prev]);
        
        const servicesText = selection.map(s => `- ${s.name} (${s.duration} - ${s.price}€)`).join('\n');
        const details = `Richiesta prenotazione SPA da: ${user.name} (${user.email})\nData: ${new Date(date).toLocaleDateString('it-IT')}\nOra: ${time}\n\nServizi:\n${servicesText}\n\nTotale: ${newBooking.totalPrice}€`.trim();
        if (method === 'email') window.open(`mailto:${PHARMACY_EMAIL}?subject=${encodeURIComponent(`Richiesta Prenotazione SPA - ${user.name}`)}&body=${encodeURIComponent(details)}`, '_blank');
        else if (method === 'whatsapp') window.open(`https://wa.me/${PHARMACY_WHATSAPP_NUMBER}?text=${encodeURIComponent(details)}`, '_blank');
        setIsBookingModalOpen(false); setSelection([]); showNotification('La tua richiesta è pronta per essere inviata!');
    };

    const StatusChip = ({ status }) => {
        const styles = { pending: 'bg-yellow-100 text-yellow-800', confirmed: 'bg-green-100 text-green-800', rejected: 'bg-red-100 text-red-800' };
        const text = { pending: 'In attesa', confirmed: 'Confermata', rejected: 'Rifiutata' };
        return <span className={`px-3 py-1 text-sm font-bold rounded-full ${styles[status]}`}>{text[status]}</span>;
    };

    const allServiceCategories = [
        { category: "Programmi Benessere", items: wellnessData.programs },
        ...wellnessData.treatments
    ];

    const totalPrice = selection.reduce((acc, item) => acc + (item.price || 0), 0);

    return (
        <div className="p-4 md:p-8 animate-fade-in pb-32">
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Percorsi & Trattamenti SPA</h1>
            <p className="text-xl text-slate-600 mb-8">Seleziona i trattamenti per richiedere un appuntamento.</p>
            
            <div className="space-y-8">
                {allServiceCategories.map(({ category, items }) => (
                    <div key={category} className="bg-white p-6 rounded-2xl shadow-lg">
                        <h2 className="text-2xl font-bold text-slate-700 mb-4">{category}</h2>
                        <div className="divide-y divide-slate-200">
                            {(items as any[]).map((item: any) => {
                                // Special handling for items with different price structures
                                if (category === "Trattamenti Microaree RENOPHASE®") {
                                    return (
                                        <div key={item.name} className="py-3">
                                            <p className="font-bold text-slate-800 mb-2">{item.name}</p>
                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <button onClick={() => handleSelectItem({ ...item, name: `${item.name} Base`, duration: item.baseDuration, price: item.basePrice }, category)} className={`flex-1 text-left p-2 rounded-md transition-colors ${selection.some(s => s.id === `${category}-${item.name} Base`) ? 'bg-sky-100' : 'hover:bg-slate-50'}`}>
                                                    Base: <span className="font-semibold">{item.baseDuration} - {item.basePrice}€</span>
                                                </button>
                                                <button onClick={() => handleSelectItem({ ...item, name: `${item.name} con Foto-stimolazione`, duration: item.photoDuration, price: item.photoPrice }, category)} className={`flex-1 text-left p-2 rounded-md transition-colors ${selection.some(s => s.id === `${category}-${item.name} con Foto-stimolazione`) ? 'bg-sky-100' : 'hover:bg-slate-50'}`}>
                                                    + Foto-stimolazione: <span className="font-semibold">{item.photoDuration} - {item.photoPrice}€</span>
                                                </button>
                                            </div>
                                        </div>
                                    )
                                }
                                return (
                                    <div key={item.name} onClick={() => handleSelectItem(item, category)} className={`py-3 flex justify-between items-center cursor-pointer transition-colors ${selection.some(s => s.id === `${category}-${item.name}`) ? 'bg-sky-50' : 'hover:bg-slate-50'}`}>
                                        <div>
                                            <p className="font-bold text-slate-800">{item.name}</p>
                                            <p className="text-sm text-slate-500">{item.duration}</p>
                                        </div>
                                        <p className="font-semibold text-sky-700">{item.price ? `${item.price}€` : `Pacchetto`}</p>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12">
                <h2 className="text-3xl font-bold text-slate-800 mb-6">Le Tue Prenotazioni SPA</h2>
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
                    ) : <p className="text-center text-slate-500 py-8">Non hai prenotazioni SPA attive.</p>}
                </div>
            </div>

            {selection.length > 0 && <SelectionSummary selection={selection} total={totalPrice} onProceed={() => setIsBookingModalOpen(true)} />}
            <BookingModal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} selection={selection} user={user} onConfirmByEmail={(d, t) => createBookingRequest(d, t, 'email')} onConfirmByWhatsApp={(d, t) => createBookingRequest(d, t, 'whatsapp')} />
        </div>
    );
};

export default SpaBookingsScreen;