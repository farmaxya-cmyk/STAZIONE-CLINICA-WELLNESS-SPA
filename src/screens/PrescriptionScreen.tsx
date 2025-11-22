import React from 'react';
import { UploadCloudIcon } from '../components/icons/UploadCloudIcon';
import { FileTextIcon } from '../components/icons/FileTextIcon';
import { XCircleIcon } from '../components/icons/XCircleIcon';
import { MailIcon } from '../components/icons/MailIcon';
import { WhatsAppIcon } from '../components/icons/WhatsAppIcon';
import { PHARMACY_EMAIL, PHARMACY_WHATSAPP_NUMBER } from '../data/constants';
import { getStoredJSON } from '../utils/storage';
import { User } from '../types';

interface PrescriptionHistoryItem {
  id: number;
  date: string;
  files: string[];
}

interface StagedFile {
    file: File;
    previewUrl: string; // From URL.createObjectURL
}

const PrescriptionScreen = ({ user, showNotification }: { user: User; showNotification: (message: string, type?: 'success' | 'error') => void; }) => {
    const [stagedFiles, setStagedFiles] = React.useState<StagedFile[]>([]);
    const [history, setHistory] = React.useState<PrescriptionHistoryItem[]>([]);
    const storageKey = `prescriptionHistory_${user.email}`;

    React.useEffect(() => {
        const savedHistory = getStoredJSON(storageKey, []);
        setHistory(savedHistory.sort((a, b) => b.id - a.id));
    }, [storageKey]);

    // Clean up object URLs to prevent memory leaks
    React.useEffect(() => {
        return () => {
            stagedFiles.forEach(sf => URL.revokeObjectURL(sf.previewUrl));
        };
    }, [stagedFiles]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const currentFiles = stagedFiles;
            const newFiles: StagedFile[] = Array.from(e.target.files).map((file: File) => ({
                file: file,
                previewUrl: URL.createObjectURL(file)
            }));
            
            // Clean up old URLs before setting new state
            currentFiles.forEach(sf => URL.revokeObjectURL(sf.previewUrl));
            
            setStagedFiles(prev => [...prev, ...newFiles]);
            e.target.value = ''; // Reset input to allow re-uploading the same file
        }
    };

    const handleRemoveFile = (indexToRemove: number) => {
        setStagedFiles(prev => {
            const fileToRemove = prev[indexToRemove];
            if (fileToRemove) {
                URL.revokeObjectURL(fileToRemove.previewUrl); // Clean up memory for the removed file
            }
            return prev.filter((_, index) => index !== indexToRemove);
        });
    };

    const handleSend = (method: 'email' | 'whatsapp') => {
        if (stagedFiles.length === 0) {
            showNotification('Nessuna ricetta da inviare.', 'error');
            return;
        }

        const fileNames = stagedFiles.map(sf => `- ${sf.file.name}`).join('\n');
        const body = `Buongiorno,\n\nSi richiede la preparazione delle seguenti ricette mediche per ${user.name}:\n${fileNames}\n\n(I file delle ricette sono stati allegati a questa comunicazione)\n\nGrazie,\n${user.name}`;
        
        const emailBody = `Buongiorno,\n\nIn allegato le seguenti ricette mediche per ${user.name}:\n${fileNames}\n\n(Ricorda di allegare manualmente i file prima di inviare)\n\nGrazie,\n${user.name}`;

        if (method === 'email') {
            const mailtoLink = `mailto:${PHARMACY_EMAIL}?subject=${encodeURIComponent(`Invio Ricette Mediche - ${user.name}`)}&body=${encodeURIComponent(emailBody)}`;
            window.open(mailtoLink, '_blank');
        } else {
            const whatsappLink = `https://wa.me/${PHARMACY_WHATSAPP_NUMBER}?text=${encodeURIComponent(body)}`;
            window.open(whatsappLink, '_blank');
        }

        const newHistoryItem: PrescriptionHistoryItem = {
            id: Date.now(),
            date: new Date().toISOString(),
            files: stagedFiles.map(sf => sf.file.name),
        };

        const newHistory = [newHistoryItem, ...history];
        localStorage.setItem(storageKey, JSON.stringify(newHistory));
        setHistory(newHistory);
        
        // Clean up and reset state
        setStagedFiles([]);
        showNotification('La tua richiesta è pronta per essere inviata!', 'success');
    };

    return (
        <div className="p-4 md:p-8 animate-fade-in">
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Invio Ricette Mediche</h1>
            <p className="text-xl text-slate-600 mb-8">Carica una o più ricette da inviare alla farmacia.</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Upload and Staging */}
                <div className="space-y-8">
                    <div className="bg-white p-6 rounded-2xl shadow-lg">
                        <h2 className="text-2xl font-bold text-slate-700 mb-4">1. Carica le tue ricette</h2>
                        <div className="relative border-2 border-dashed border-slate-300 rounded-lg p-10 text-center">
                            <input
                                type="file"
                                accept="image/*,.pdf"
                                multiple
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                aria-label="Carica file"
                            />
                            <div className="flex flex-col items-center text-slate-500 pointer-events-none">
                                <UploadCloudIcon className="w-12 h-12 mb-2" />
                                <p className="font-semibold">Trascina i file qui o clicca per caricare</p>
                                <p className="text-sm">Puoi selezionare più file (PDF, JPG, PNG)</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-2xl shadow-lg">
                        <h2 className="text-2xl font-bold text-slate-700 mb-4">2. Ricette da Inviare</h2>
                        {stagedFiles.length > 0 ? (
                            <div className="space-y-3">
                                <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                    {stagedFiles.map((stagedFile, index) => (
                                        <li key={`${stagedFile.file.name}-${stagedFile.file.lastModified}-${index}`} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg animate-fade-in">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                {stagedFile.file.type.startsWith('image/') ? (
                                                    <img src={stagedFile.previewUrl} alt={stagedFile.file.name} className="w-12 h-12 rounded-md object-cover flex-shrink-0" />
                                                ) : (
                                                    <div className="w-12 h-12 flex items-center justify-center bg-slate-200 rounded-md flex-shrink-0">
                                                        <FileTextIcon className="w-6 h-6 text-slate-600" />
                                                    </div>
                                                )}
                                                <div className="overflow-hidden">
                                                    <span className="font-medium text-slate-700 truncate block" title={stagedFile.file.name}>{stagedFile.file.name}</span>
                                                    <span className="text-xs text-slate-500">{Math.round(stagedFile.file.size / 1024)} KB</span>
                                                </div>
                                            </div>
                                            <button onClick={() => handleRemoveFile(index)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 flex-shrink-0 ml-2">
                                                <XCircleIcon className="w-5 h-5" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200">
                                    <button onClick={() => handleSend('email')} className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 transition-colors">
                                        <MailIcon className="w-5 h-5" /> Invia via Email
                                    </button>
                                    <button onClick={() => handleSend('whatsapp')} className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors">
                                        <WhatsAppIcon className="w-5 h-5" /> Invia via WhatsApp
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-center text-slate-500 py-8">Non hai ancora aggiunto nessuna ricetta.</p>
                        )}
                    </div>
                </div>

                {/* Right Column: History */}
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <h2 className="text-2xl font-bold text-slate-700 mb-4">Storico Ricette Inviate</h2>
                    {history.length > 0 ? (
                        <ul className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                            {history.map(item => (
                                <li key={item.id} className="bg-slate-50 p-4 rounded-lg">
                                    <p className="font-semibold text-slate-800">Invio del {new Date(item.date).toLocaleString('it-IT')}</p>
                                    <ul className="mt-2 text-sm text-slate-600 list-disc list-inside space-y-1">
                                        {item.files.map(fileName => <li key={fileName}>{fileName}</li>)}
                                    </ul>
                                </li>
                            ))}
                        </ul>
                    ) : (
                         <p className="text-center text-slate-500 py-16">Nessuna ricetta inviata in precedenza.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PrescriptionScreen;