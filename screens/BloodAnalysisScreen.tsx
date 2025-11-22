import React from 'react';
import { GoogleGenAI } from '@google/genai';
import { UploadCloudIcon } from '../components/icons/UploadCloudIcon';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import { XCircleIcon } from '../components/icons/XCircleIcon';
import { FileTextIcon } from '../components/icons/FileTextIcon';
import { marked } from 'marked';

// Helper function to convert file to base64
// FIX: Added File type to the file parameter and specified the Promise should resolve to a string, ensuring the data passed to the API is correctly typed.
const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
};

const Loader = ({ text }) => (
    <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-600 font-semibold">{text}</p>
    </div>
);

const ErrorMessage = ({ message }) => (
     <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
        <div className="flex">
            <div className="py-1">
                <XCircleIcon className="w-6 h-6 text-red-500 mr-3" />
            </div>
            <div>
                <p className="font-bold">Errore</p>
                <p>{message}</p>
            </div>
        </div>
    </div>
);

const BloodAnalysisScreen = ({ user }) => {
    // FIX: Typed the image state to be a File or null.
    const [image, setImage] = React.useState<File | null>(null);
    const [imagePreview, setImagePreview] = React.useState('');
    const [analysis, setAnalysis] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    React.useEffect(() => {
        // Clean up the object URL when the component unmounts or the image preview changes
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);
    
    // FIX: Added type for the event object.
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
            setAnalysis('');
            setError('');
        }
    };

    const handleAnalyze = async () => {
        if (!image) {
            setError('Per favore, carica un\'immagine prima di avviare l\'analisi.');
            return;
        }
        setIsLoading(true);
        setError('');
        setAnalysis('');

        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
            const imagePart = await fileToGenerativePart(image);
            
            const prompt = `
            Analizza l'immagine di questo referto di analisi del sangue. Fornisci un riassunto chiaro e comprensibile in formato Markdown.
            Per ogni valore significativo:
            1.  Identifica il nome del test (es. Colesterolo HDL, Emoglobina, ecc.).
            2.  Indica il valore misurato e le unità di misura.
            3.  Confronta il valore con i range di riferimento, se presenti nel documento.
            4.  Evidenzia i valori che sono fuori norma (alti o bassi).
            5.  Spiega brevemente e in termini semplici a cosa serve quel test e cosa potrebbe indicare un valore fuori norma.
            
            Termina con un paragrafo di consigli generali per il benessere basati sui risultati, senza fornire diagnosi mediche.
            
            Importante: Includi un disclaimer chiaro alla fine, che specifichi che questa è un'analisi AI, non sostituisce un parere medico, e l'utente deve consultare il proprio medico per una valutazione completa.
            `;

            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: { parts: [imagePart, { text: prompt }] },
            });
            
            setAnalysis(response.text);

        } catch (err) {
            console.error(err);
            setError('Si è verificato un errore durante l\'analisi. Assicurati che l\'immagine sia chiara e riprova.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setImage(null);
        setImagePreview('');
        setAnalysis('');
        setError('');
        setIsLoading(false);
    };

    return (
        <div className="p-4 md:p-8 animate-fade-in">
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Analisi Referti Sanguigni con AI</h1>
            <p className="text-xl text-slate-600 mb-8">Carica una foto del tuo referto per ottenere un'analisi dettagliata.</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upload and Preview Column */}
                <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col">
                    <h2 className="text-2xl font-bold text-slate-700 mb-4">1. Carica il tuo referto</h2>
                    
                    {!imagePreview ? (
                        <div className="relative border-2 border-dashed border-slate-300 rounded-lg p-12 text-center flex-grow flex flex-col justify-center">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                aria-label="Carica file"
                            />
                            <div className="flex flex-col items-center text-slate-500">
                                <UploadCloudIcon className="w-12 h-12 mb-2" />
                                <p className="font-semibold">Trascina un file qui o clicca per caricare</p>
                                <p className="text-sm">PNG, JPG, WEBP, HEIC</p>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-4 flex flex-col flex-grow">
                             <p className="text-sm font-medium text-slate-600 mb-2">Anteprima immagine:</p>
                            <div className="flex-grow mb-4">
                                <img src={imagePreview} alt="Anteprima referto" className="w-full h-full max-h-96 object-contain rounded-lg border border-slate-200" />
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                                 <button
                                    onClick={handleAnalyze}
                                    disabled={isLoading}
                                    className="w-full bg-sky-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-sky-700 focus:outline-none transition-all duration-300 flex items-center justify-center gap-2 disabled:bg-slate-400"
                                >
                                    <SparklesIcon className="w-5 h-5" />
                                    <span>{isLoading ? 'Analisi in corso...' : 'Analizza con AI'}</span>
                                </button>
                                <button
                                    onClick={handleReset}
                                    disabled={isLoading}
                                    className="w-full bg-slate-200 text-slate-800 font-bold py-3 px-6 rounded-lg hover:bg-slate-300 transition-colors"
                                >
                                    Cambia File
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Analysis Result Column */}
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <h2 className="text-2xl font-bold text-slate-700 mb-4">2. Risultati dell'Analisi</h2>
                     {isLoading && <Loader text="L'intelligenza artificiale sta analizzando il tuo documento..." />}
                     {error && <ErrorMessage message={error} />}
                     {analysis && (
                        <div 
                            className="prose max-w-none text-slate-700 animate-fade-in"
                            dangerouslySetInnerHTML={{ __html: marked.parse(analysis) as string }}
                        ></div>
                     )}
                     {!isLoading && !error && !analysis && (
                         <div className="text-center text-slate-500 py-16">
                            <FileTextIcon className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                            <p>I risultati della tua analisi appariranno qui.</p>
                        </div>
                     )}
                </div>
            </div>
        </div>
    );
};

export default BloodAnalysisScreen;
