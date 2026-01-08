'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, ZoomIn, ZoomOut, ArrowLeft, Loader2 } from 'lucide-react';
import { resolveAssetUrl, getApiUrl } from '../../../lib/utils';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set worker path
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Book {
    id: number;
    title: string;
    file_path: string;
    progress?: {
        current_page: number;
        total_pages: number;
    };
}

export default function ReaderPage() {
    const { id } = useParams();
    const { token } = useAuth();
    const router = useRouter();
    const [book, setBook] = useState<Book | null>(null);
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.0);
    const [loading, setLoading] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const apiUrl = getApiUrl();
        fetch(`${apiUrl}/api/books/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        })
            .then(res => res.json())
            .then(data => {
                setBook(data);
                if (data.progress?.current_page) {
                    setPageNumber(data.progress.current_page);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id, token]);

    // Save progress when page changes
    useEffect(() => {
        if (!token || !id || loading || !numPages) return;

        const saveProgress = async () => {
            const apiUrl = getApiUrl();
            try {
                await fetch(`${apiUrl}/api/books/${id}/progress`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        current_page: pageNumber,
                        total_pages: numPages
                    })
                });
            } catch (err) {
                console.error('Failed to save progress:', err);
            }
        };

        const timer = setTimeout(saveProgress, 2000); // Debounce save
        return () => clearTimeout(timer);
    }, [pageNumber, id, token, loading, numPages]);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4 text-white">
                <Loader2 className="animate-spin text-indigo-500" size={48} />
                <p className="text-zinc-400 font-medium tracking-tight">Opening your book...</p>
            </div>
        );
    }

    if (!book) return <div className="p-8 text-red-500">Book not found.</div>;

    const pdfUrl = resolveAssetUrl(book.file_path);

    return (
        <div className="min-h-screen bg-zinc-950 text-white flex flex-col overflow-hidden select-none">
            {/* Reader Header */}
            {!isFullscreen && (
                <header className="h-16 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md px-6 flex items-center justify-between z-20">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-sm font-bold tracking-tight truncate max-w-[200px] md:max-w-md">{book.title}</h1>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Reader Mode</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center bg-zinc-800 rounded-lg p-1">
                            <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="p-1.5 hover:bg-zinc-700 rounded transition-colors text-zinc-400"><ZoomOut size={16} /></button>
                            <span className="text-[10px] font-bold w-12 text-center text-zinc-300">{Math.round(scale * 100)}%</span>
                            <button onClick={() => setScale(s => Math.min(2, s + 0.1))} className="p-1.5 hover:bg-zinc-700 rounded transition-colors text-zinc-400"><ZoomIn size={16} /></button>
                        </div>
                        <button onClick={toggleFullscreen} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400">
                            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                        </button>
                    </div>
                </header>
            )}

            {/* Reader Canvas */}
            <main className="flex-1 overflow-auto bg-zinc-900 flex justify-center p-4 md:p-8 custom-scrollbar relative">
                <div className="shadow-2xl shadow-black rounded-sm overflow-hidden bg-white">
                    <Document
                        file={pdfBlob}
                        onLoadSuccess={onDocumentLoadSuccess}
                        loading={
                            <div className="w-[600px] aspect-[1/1.4] bg-zinc-800 animate-pulse flex flex-col items-center justify-center text-zinc-500 gap-4">
                                <Loader2 className="animate-spin text-zinc-600" size={32} />
                                <span className="text-sm font-medium">Rendering PDF...</span>
                            </div>
                        }
                        error={
                            <div className="w-[600px] aspect-[1/1.4] flex flex-col items-center justify-center text-red-500 p-8 text-center bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl">
                                <p className="font-bold mb-4 text-lg">Unable to load PDF</p>
                                <p className="text-sm text-zinc-400 mb-6">This could be due to a server error or an invalid file. Please try re-uploading the book or checking your connection.</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20"
                                >
                                    Retry Loading
                                </button>
                            </div>
                        }
                    >
                        <Page
                            pageNumber={pageNumber}
                            scale={scale}
                            renderAnnotationLayer={false}
                            renderTextLayer={true}
                            loading={null}
                        />
                    </Document>
                </div>
            </main>

            {/* Navigation Footer */}
            <footer className="h-16 border-t border-zinc-800 bg-zinc-900/80 backdrop-blur-md px-6 flex items-center justify-center gap-8 z-20">
                <button
                    disabled={pageNumber <= 1}
                    onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                    className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 disabled:hover:bg-indigo-600 rounded-full transition-all flex items-center gap-2 pr-4 pl-3"
                >
                    <ChevronLeft size={20} />
                    <span className="text-xs font-bold uppercase tracking-wider">Prev</span>
                </button>

                <div className="flex flex-col items-center">
                    <span className="text-xs font-bold text-white uppercase tracking-tight">Page {pageNumber} of {numPages || '?'}</span>
                    <div className="w-32 md:w-64 bg-zinc-800 h-1 rounded-full mt-2 overflow-hidden">
                        <div
                            className="bg-indigo-500 h-full transition-all duration-300"
                            style={{ width: `${numPages ? (pageNumber / numPages) * 100 : 0}%` }}
                        />
                    </div>
                </div>

                <button
                    disabled={pageNumber >= (numPages || 1)}
                    onClick={() => setPageNumber(p => Math.min(numPages || 1, p + 1))}
                    className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 disabled:hover:bg-indigo-600 rounded-full transition-all flex items-center gap-2 pl-4 pr-3"
                >
                    <span className="text-xs font-bold uppercase tracking-wider">Next</span>
                    <ChevronRight size={20} />
                </button>
            </footer>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #18181b;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #3f3f46;
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #52525b;
                }
            `}</style>
        </div>
    );
}
