'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, ZoomIn, ZoomOut, ArrowLeft, Loader2, Play, Clock, BookOpen, Star, Share2, Sun, Type, Search, Bookmark, Highlighter } from 'lucide-react';
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

interface Bookmark {
    id: number;
    page_number: number;
    title: string;
    created_at: string;
}

interface Note {
    id: number;
    page_number: number;
    content: string;
    color: string;
    created_at: string;
}

interface Highlight {
    id: number;
    page_number: number;
    text_content: string;
    title?: string;
    color: string;
    range_start?: string;
    range_end?: string;
    created_at: string;
}

interface Flashcard {
    id: number;
    front_content: string;
    back_content: string;
    created_at: string;
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
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const [pdfBlob, setPdfBlob] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState<number | undefined>(undefined);

    // New Feature States
    const [activeModal, setActiveModal] = useState<'none' | 'theme' | 'typography' | 'search' | 'bookmark' | 'highlight' | 'highlight_create' | 'note' | 'flashcard'>('none');
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');
    // Search specific state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<{ page: number, match_text: string }[]>([]);

    // Feature Content States
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [highlights, setHighlights] = useState<Highlight[]>([]);
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

    // Selection Text
    const [selectedText, setSelectedText] = useState('');
    const [highlightPopup, setHighlightPopup] = useState<{ x: number, y: number, text: string } | null>(null);

    // Features Data Fetching
    const fetchFeatures = async () => {
        if (!token || !id) return;
        const apiUrl = getApiUrl();
        try {
            const res = await fetch(`${apiUrl}/api/books/${id}/features`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setBookmarks(data.bookmarks);
                setNotes(data.notes);
                setHighlights(data.highlights);
                setFlashcards(data.flashcards);
            }
        } catch (e) {
            console.error("Failed to fetch features", e);
        }
    };

    useEffect(() => {
        fetchFeatures();
    }, [id, token]);

    // Handlers
    const saveBookmark = async (title: string) => {
        const apiUrl = getApiUrl();
        const res = await fetch(`${apiUrl}/api/books/${id}/bookmarks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ page_number: pageNumber, title })
        });
        if (res.ok) fetchFeatures();
    };

    const deleteFeature = async (type: 'bookmarks' | 'notes' | 'highlights' | 'flashcards', featureId: number) => {
        const apiUrl = getApiUrl();
        const res = await fetch(`${apiUrl}/api/books/${id}/${type}/${featureId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            // Optimistic update
            if (type === 'bookmarks') setBookmarks(prev => prev.filter(b => b.id !== featureId));
            if (type === 'notes') setNotes(prev => prev.filter(n => n.id !== featureId));
            if (type === 'highlights') setHighlights(prev => prev.filter(h => h.id !== featureId));
            if (type === 'flashcards') setFlashcards(prev => prev.filter(f => f.id !== featureId));
        }
    };

    const saveNote = async (content: string) => {
        const apiUrl = getApiUrl();
        const res = await fetch(`${apiUrl}/api/books/${id}/notes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ page_number: pageNumber, content })
        });
        if (res.ok) fetchFeatures();
    };

    const saveHighlight = async (text: string, title: string = '', color: string = 'yellow') => {
        const apiUrl = getApiUrl();
        const res = await fetch(`${apiUrl}/api/books/${id}/highlights`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ page_number: pageNumber, text_content: text, title, color })
        });
        if (res.ok) fetchFeatures();
    };

    const saveFlashcard = async (front: string, back: string) => {
        const apiUrl = getApiUrl();
        const res = await fetch(`${apiUrl}/api/books/${id}/flashcards`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ front_content: front, back_content: back })
        });
        if (res.ok) fetchFeatures();
    };

    // Text Selection Handler
    useEffect(() => {
        const handleSelection = () => {
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0 && selection.toString().trim().length > 0) {
                const text = selection.toString().trim();
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();

                if (rect.width > 0 && rect.height > 0) {
                    setHighlightPopup({
                        x: rect.left + (rect.width / 2),
                        y: rect.top - 10,
                        text: text
                    });
                    setSelectedText(text);
                }
            }
        };

        const handleMouseDown = (e: MouseEvent) => {
            if (highlightPopup && !(e.target as HTMLElement).closest('#highlight-popup')) {
                setHighlightPopup(null);
            }
        };
        document.addEventListener('mouseup', handleSelection);
        document.addEventListener('mousedown', handleMouseDown);
        return () => {
            document.removeEventListener('mouseup', handleSelection);
            document.removeEventListener('mousedown', handleMouseDown);
        };
    }, [highlightPopup]);

    // Responsive width calculation
    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                // Subtract padding for a better fit
                const padding = window.innerWidth < 768 ? 16 : 64;
                setContainerWidth(containerRef.current.offsetWidth - padding);
            }
        };

        updateWidth();
        window.addEventListener('resize', updateWidth);

        // Initial delay to ensure DOM is settled
        const timer = setTimeout(updateWidth, 500);

        return () => {
            window.removeEventListener('resize', updateWidth);
            clearTimeout(timer);
        };
    }, []);

    useEffect(() => {
        if (!token || !id) return;

        const apiUrl = getApiUrl();
        let currentUrl: string | null = null;
        setLoading(true);
        setError(null);
        setPdfBlob(null);

        const fetchPdf = async () => {
            try {
                console.log(`Fetching PDF blob for book: ${id}, attempt: ${retryCount + 1}`);
                const pdfRes = await fetch(`${apiUrl}/api/books/${id}/view`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json, application/pdf'
                    }
                });

                if (pdfRes.ok) {
                    const contentType = pdfRes.headers.get('content-type');
                    if (!contentType?.includes('application/pdf') && !contentType?.includes('application/octet-stream')) {
                        console.warn('Unexpected content type:', contentType);
                    }
                    const blob = await pdfRes.blob();
                    currentUrl = URL.createObjectURL(blob);
                    setPdfBlob(currentUrl);
                } else {
                    const errorData = await pdfRes.text().catch(() => 'Unknown error');
                    console.error('Failed to load PDF asset:', pdfRes.status, errorData);
                    setError(`Server error (${pdfRes.status}). Please try re-uploading the book.`);
                }
            } catch (err: any) {
                console.error('Network error loading PDF:', err);
                setError('Network error. Check your connection or the server status.');
            }
            setLoading(false);
        };

        fetch(`${apiUrl}/api/books/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        })
            .then(res => res.json())
            .then(async (data) => {
                setBook(data);
                if (data.progress?.current_page) {
                    setPageNumber(data.progress.current_page);
                }
                await fetchPdf();
            })
            .catch((err) => {
                console.error('Failed to fetch book metadata:', err);
                setError('Could not load book information.');
                setLoading(false);
            });

        return () => {
            if (currentUrl) {
                URL.revokeObjectURL(currentUrl);
            }
        };
    }, [id, token, retryCount]);

    const handleRetry = () => {
        setRetryCount(prev => prev + 1);
    };

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

    // PDF Document Proxy
    const [pdfDocument, setPdfDocument] = useState<any>(null);
    const [isSearching, setIsSearching] = useState(false);

    function onDocumentLoadSuccess(pdf: any) {
        setNumPages(pdf.numPages);
        setPdfDocument(pdf);
    }

    const handleSearch = async () => {
        if (!pdfDocument || !searchQuery.trim()) return;

        setIsSearching(true);
        setSearchResults([]);
        const results: { page: number, match_text: string }[] = [];
        const lowerQuery = searchQuery.toLowerCase();

        try {
            for (let i = 1; i <= pdfDocument.numPages; i++) {
                const page = await pdfDocument.getPage(i);
                const textContent = await page.getTextContent();
                const textItems = textContent.items.map((item: any) => item.str).join(' ');

                if (textItems.toLowerCase().includes(lowerQuery)) {
                    // Extract a snippet around the match
                    const index = textItems.toLowerCase().indexOf(lowerQuery);
                    const start = Math.max(0, index - 20);
                    const end = Math.min(textItems.length, index + 40);
                    const snippet = (start > 0 ? '...' : '') + textItems.substring(start, end) + (end < textItems.length ? '...' : '');

                    results.push({ page: i, match_text: snippet });
                }

                // Optional: Limit results for performance
                if (results.length >= 20) break;
            }
        } catch (e) {
            console.error("Search failed", e);
        }

        setSearchResults(results);
        setIsSearching(false);
    };

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
        <div className="h-screen bg-zinc-950 text-white flex flex-col overflow-hidden select-none">
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
                <div ref={containerRef} className="w-full max-w-4xl mx-auto flex justify-center">
                    <Document
                        file={pdfBlob}
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={(err) => {
                            console.error('PDF Load Error:', err);
                            setError(`PDF Engine Error: ${err.message}. Please try a hard refresh (Ctrl+F5).`);
                        }}
                        loading={
                            <div className="w-[600px] aspect-[1/1.4] bg-zinc-800 animate-pulse flex flex-col items-center justify-center text-zinc-500 gap-4">
                                <Loader2 className="animate-spin text-zinc-600" size={32} />
                                <span className="text-sm font-medium">Rendering PDF...</span>
                            </div>
                        }
                        error={
                            <div className="w-[600px] aspect-[1/1.4] flex flex-col items-center justify-center text-red-500 p-8 text-center bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl">
                                <p className="font-bold mb-4 text-lg">Unable to load PDF</p>
                                <p className="text-sm text-zinc-400 mb-6">{error || 'This could be due to a server error or an invalid file. Please try re-uploading the book.'}</p>
                                <button
                                    onClick={handleRetry}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20"
                                >
                                    Retry Loading
                                </button>
                            </div>
                        }
                    >
                        {pdfBlob && (
                            <Page
                                pageNumber={pageNumber}
                                scale={scale}
                                width={containerWidth}
                                renderAnnotationLayer={false}
                                renderTextLayer={true}
                                className="shadow-2xl shadow-black"
                                customTextRenderer={(textItem: any) => {
                                    const str = textItem.str;
                                    const itemIndex = textItem.itemIndex;
                                    const match = highlights.find(h => h.page_number === pageNumber && h.text_content.includes(str));
                                    if (match) {
                                        const colorMap: Record<string, string> = {
                                            'yellow': 'rgba(234, 179, 8, 0.4)',
                                            'green': 'rgba(34, 197, 94, 0.4)',
                                            'blue': 'rgba(59, 130, 246, 0.4)',
                                            'red': 'rgba(239, 68, 68, 0.4)',
                                        };
                                        return <span key={itemIndex} style={{ backgroundColor: colorMap[match.color] || 'rgba(255, 255, 0, 0.4)' }}>{str}</span>;
                                    }
                                    return str;
                                }}
                                loading={
                                    <div className="w-full aspect-[1/1.4] bg-zinc-800 animate-pulse flex items-center justify-center">
                                        <Loader2 className="animate-spin text-zinc-600" size={32} />
                                    </div>
                                }
                            />
                        )}
                    </Document>
                </div>
            </main>

            {/* Navigation Footer */}
            <footer className="h-16 border-t border-zinc-800 bg-zinc-900/80 backdrop-blur-md px-6 flex items-center justify-center gap-8 z-20 mb-20">
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

            {/* Modals Overlay */}
            {activeModal !== 'none' && (
                <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm" onClick={() => setActiveModal('none')}>
                    <div
                        className="absolute bottom-0 left-0 right-0 p-4 animate-in slide-in-from-bottom-10 fade-in duration-200 lg:top-1/2 lg:bottom-auto lg:left-1/2 lg:right-auto lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-[400px]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl max-h-[80vh] flex flex-col">

                            {/* Theme Modal */}
                            {activeModal === 'theme' && (
                                <div className="p-6">
                                    <h3 className="text-white text-sm font-bold mb-4">Reading Theme</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button onClick={() => setTheme('light')} className={`h-12 rounded-full flex items-center justify-center text-xs font-bold transition-all border-2 ${theme === 'light' ? 'bg-white border-white text-black' : 'bg-white text-black border-transparent opacity-80'}`}>Light</button>
                                        <button onClick={() => setTheme('dark')} className={`h-12 rounded-full flex items-center justify-center text-xs font-bold transition-all border-2 ${theme === 'dark' ? 'bg-zinc-900 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-zinc-900 border-zinc-700 text-zinc-400'}`}>Dark</button>
                                    </div>
                                </div>
                            )}

                            {/* Typography Modal (For PDF scaling as placeholder or real adjust) */}
                            {activeModal === 'typography' && (
                                <div className="p-6 space-y-6">
                                    <h3 className="text-white text-base font-bold mb-2">Typography & Zoom</h3>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs text-zinc-400 font-medium">
                                                <span>Zoom Level</span>
                                                <span>{Math.round(scale * 100)}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0.5"
                                                max="2.0"
                                                step="0.1"
                                                value={scale}
                                                onChange={(e) => setScale(parseFloat(e.target.value))}
                                                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Search Modal */}
                            {activeModal === 'search' && (
                                <div className="p-4 h-full flex flex-col">
                                    <div className="relative shrink-0">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                                        <input
                                            type="text"
                                            placeholder="Search in book..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                            className="w-full bg-black border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-600"
                                            autoFocus
                                        />
                                        {isSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 animate-spin" size={16} />}
                                    </div>

                                    <div className="mt-4 flex-1 overflow-y-auto custom-scrollbar space-y-2">
                                        {searchResults.length > 0 ? (
                                            searchResults.map((result, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => {
                                                        setPageNumber(result.page);
                                                        setActiveModal('none');
                                                    }}
                                                    className="w-full text-left p-3 rounded-lg bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 transition-colors group"
                                                >
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-[10px] uppercase font-bold text-zinc-500">Page {result.page}</span>
                                                    </div>
                                                    <p className="text-xs text-zinc-300 line-clamp-2">
                                                        <span dangerouslySetInnerHTML={{
                                                            __html: result.match_text.replace(new RegExp(searchQuery, 'gi'), match => `<span class="text-blue-400 font-bold bg-blue-400/10">${match}</span>`)
                                                        }} />
                                                    </p>
                                                </button>
                                            ))
                                        ) : (
                                            !isSearching && searchQuery && (
                                                <div className="text-center py-8 text-zinc-500 text-xs">
                                                    No results found for "{searchQuery}"
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Bookmarks Modal */}
                            {activeModal === 'bookmark' && (
                                <div className="flex flex-col h-full">
                                    <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                                        <h3 className="font-bold text-white">Bookmarks</h3>
                                        <span className="text-xs text-zinc-500">{bookmarks.length} saved</span>
                                    </div>

                                    <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Bookmark title..."
                                                className="flex-1 bg-black border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-600 outline-none transition-colors"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        const val = e.currentTarget.value;
                                                        if (val.trim()) {
                                                            saveBookmark(val);
                                                            e.currentTarget.value = '';
                                                        }
                                                    }
                                                }}
                                            />
                                            <button
                                                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-2 text-xs font-bold transition-colors"
                                                onClick={(e) => {
                                                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                                    if (input.value.trim()) {
                                                        saveBookmark(input.value);
                                                        input.value = '';
                                                    }
                                                }}
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                                        {bookmarks.length === 0 ? (
                                            <div className="text-center py-8 text-zinc-500 text-xs">No bookmarks yet.</div>
                                        ) : (
                                            bookmarks.map(bm => (
                                                <div key={bm.id} className="bg-black/50 border border-zinc-800 p-3 rounded-lg flex items-center justify-between group">
                                                    <div>
                                                        <p className="text-sm font-medium text-white">{bm.title}</p>
                                                        <p className="text-[10px] text-zinc-500">Page {bm.page_number} • {new Date(bm.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => deleteFeature('bookmarks', bm.id)}
                                                        className="text-zinc-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Bookmark size={14} fill="currentColor" />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Notes Modal */}
                            {activeModal === 'note' && (
                                <div className="flex flex-col h-full">
                                    <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                                        <h3 className="font-bold text-white">Notes</h3>
                                        <span className="text-xs text-zinc-500">{notes.length} saved</span>
                                    </div>

                                    <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
                                        <div className="space-y-2">
                                            <textarea
                                                placeholder="Write a note..."
                                                className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-600 outline-none transition-colors resize-none h-40"
                                            />
                                            <button
                                                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-2 text-xs font-bold transition-colors"
                                                onClick={(e) => {
                                                    const textarea = e.currentTarget.previousElementSibling as HTMLTextAreaElement;
                                                    if (textarea.value.trim()) {
                                                        saveNote(textarea.value);
                                                        textarea.value = '';
                                                    }
                                                }}
                                            >
                                                Save Note
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                                        {notes.length === 0 ? (
                                            <div className="text-center py-8 text-zinc-500 text-xs">No notes yet.</div>
                                        ) : (
                                            notes.map(note => (
                                                <div key={note.id} className="bg-black/50 border border-zinc-800 p-3 rounded-lg flex flex-col gap-2 group">
                                                    <p className="text-xs text-zinc-300 leading-relaxed">{note.content}</p>
                                                    <div className="flex justify-between items-center pt-2 border-t border-zinc-800/50">
                                                        <p className="text-[10px] text-zinc-500">Page {note.page_number} • {new Date(note.created_at).toLocaleDateString()}</p>
                                                        <button
                                                            onClick={() => deleteFeature('notes', note.id)}
                                                            className="text-zinc-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Highlights List Modal */}
                            {activeModal === 'highlight' && (
                                <div className="flex flex-col h-full">
                                    <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                                        <h3 className="font-bold text-white">Highlights</h3>
                                        <span className="text-xs text-zinc-500">{highlights.length} saved</span>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                                        {highlights.length === 0 ? (
                                            <div className="text-center py-8 text-zinc-500 text-xs">No highlights yet. Select text to add one.</div>
                                        ) : (
                                            highlights.map(hl => (
                                                <div key={hl.id} className="bg-black/50 border border-zinc-800 p-3 rounded-lg group">
                                                    {hl.title && <p className="text-xs font-bold text-white mb-1">{hl.title}</p>}
                                                    <p className={`text-xs text-zinc-300 italic pl-2 border-l-2 ${hl.color === 'yellow' ? 'border-yellow-500' : 'border-blue-500'} mb-2`}>"{hl.text_content}"</p>
                                                    <div className="flex justify-between items-center">
                                                        <p className="text-[10px] text-zinc-500">Page {hl.page_number}</p>
                                                        <button
                                                            onClick={() => deleteFeature('highlights', hl.id)}
                                                            className="text-zinc-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 text-[10px]"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Flashcards Modal */}
                            {activeModal === 'flashcard' && (
                                <div className="flex flex-col h-full">
                                    <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                                        <h3 className="font-bold text-white">Flashcards</h3>
                                        <span className="text-xs text-zinc-500">{flashcards.length} cards</span>
                                    </div>

                                    <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                placeholder="Front (Question)"
                                                className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-600 outline-none transition-colors"
                                                id="fc-front"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Back (Answer)"
                                                className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-600 outline-none transition-colors"
                                                id="fc-back"
                                            />
                                            <button
                                                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-2 text-xs font-bold transition-colors"
                                                onClick={() => {
                                                    const front = (document.getElementById('fc-front') as HTMLInputElement);
                                                    const back = (document.getElementById('fc-back') as HTMLInputElement);
                                                    if (front.value.trim() && back.value.trim()) {
                                                        saveFlashcard(front.value, back.value);
                                                        front.value = '';
                                                        back.value = '';
                                                        front.focus();
                                                    }
                                                }}
                                            >
                                                Add Card
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                                        {flashcards.length === 0 ? (
                                            <div className="text-center py-8 text-zinc-500 text-xs">No cards created.</div>
                                        ) : (
                                            flashcards.map(fc => (
                                                <div key={fc.id} className="bg-black/50 border border-zinc-800 p-3 rounded-lg group">
                                                    <div className="mb-2">
                                                        <p className="text-[10px] text-zinc-500 uppercase font-bold">Front</p>
                                                        <p className="text-xs text-white">{fc.front_content}</p>
                                                    </div>
                                                    <div className="mb-2">
                                                        <p className="text-[10px] text-zinc-500 uppercase font-bold">Back</p>
                                                        <p className="text-xs text-zinc-300">{fc.back_content}</p>
                                                    </div>
                                                    <div className="flex justify-end">
                                                        <button
                                                            onClick={() => deleteFeature('flashcards', fc.id)}
                                                            className="text-zinc-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 text-[10px]"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Create Highlight Modal */}
                            {activeModal === 'highlight_create' && (
                                <div className="p-6 space-y-4">
                                    <h3 className="text-white text-sm font-bold">Save Highlight</h3>
                                    <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700">
                                        <p className="text-xs text-zinc-300 italic line-clamp-4">"{selectedText}"</p>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Add a title (optional)"
                                        className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-600 outline-none"
                                        id="hl-title"
                                        autoFocus
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                        {['yellow', 'green', 'blue', 'red'].map(color => (
                                            <button
                                                key={color}
                                                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${color === 'yellow' ? 'bg-yellow-500/10 border-yellow-500 hover:bg-yellow-500/20' :
                                                        color === 'green' ? 'bg-green-500/10 border-green-500 hover:bg-green-500/20' :
                                                            color === 'blue' ? 'bg-blue-500/10 border-blue-500 hover:bg-blue-500/20' :
                                                                'bg-red-500/10 border-red-500 hover:bg-red-500/20'
                                                    }`}
                                                onClick={() => {
                                                    const titleInput = document.getElementById('hl-title') as HTMLInputElement;
                                                    const title = titleInput ? titleInput.value : '';
                                                    saveHighlight(selectedText, title, color);
                                                    setActiveModal('highlight');
                                                }}
                                            >
                                                <div className={`w-4 h-4 rounded-full ${color === 'yellow' ? 'bg-yellow-500' :
                                                        color === 'green' ? 'bg-green-500' :
                                                            color === 'blue' ? 'bg-blue-500' : 'bg-red-500'
                                                    }`} />
                                                <span className="text-xs font-bold text-white capitalize">{color}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}

            {/* Highlight Popup Button */}
            {highlightPopup && (
                <div
                    id="highlight-popup"
                    className="fixed z-[70] bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl p-2 flex gap-2 animate-in fade-in zoom-in duration-200"
                    style={{
                        left: highlightPopup.x,
                        top: highlightPopup.y - 50,
                        transform: 'translateX(-50%)'
                    }}
                >
                    <button
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-md flex items-center gap-2"
                        onClick={(e) => {
                            e.stopPropagation();
                            setActiveModal('highlight_create');
                            setHighlightPopup(null);
                        }}
                    >
                        <Highlighter size={14} />
                        Highlight
                    </button>
                </div>
            )}

            {/* Bottom Toolbar & Action */}
            <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-zinc-900 pb-2 pt-2 z-50">
                <div className="max-w-xl mx-auto flex items-center justify-between px-6">

                    {/* Font Settings */}
                    <button
                        onClick={() => setActiveModal(activeModal === 'typography' ? 'none' : 'typography')}
                        className={`flex flex-col items-center gap-1.5 transition-colors group ${activeModal === 'typography' ? 'text-blue-500' : 'text-zinc-400 hover:text-white'}`}
                    >
                        <div className="p-2 rounded-xl bg-zinc-900 group-hover:bg-zinc-800 border border-zinc-800 transition-colors">
                            <Type size={18} />
                        </div>
                        <span className="text-[10px] font-medium">Font</span>
                    </button>

                    {/* Search */}
                    <button
                        onClick={() => setActiveModal(activeModal === 'search' ? 'none' : 'search')}
                        className={`flex flex-col items-center gap-1.5 transition-colors group ${activeModal === 'search' ? 'text-blue-500' : 'text-zinc-400 hover:text-white'}`}
                    >
                        <div className="p-2 rounded-xl bg-zinc-900 group-hover:bg-zinc-800 border border-zinc-800 transition-colors">
                            <Search size={18} />
                        </div>
                        <span className="text-[10px] font-medium">Search</span>
                    </button>
                    {/* Highlight */}
                    <button
                        onClick={() => setActiveModal(activeModal === 'highlight' ? 'none' : 'highlight')}
                        className={`flex flex-col items-center gap-1.5 transition-colors group ${activeModal === 'highlight' ? 'text-blue-500' : 'text-zinc-400 hover:text-white'}`}
                    >
                        <div className="p-2 rounded-xl bg-zinc-900 group-hover:bg-zinc-800 border border-zinc-800 transition-colors">
                            <Type size={18} className="rotate-90" />
                        </div>
                        <span className="text-[10px] font-medium">Highlight</span>
                    </button>

                    {/* Note */}


                    {/* Note */}
                    <button
                        onClick={() => setActiveModal(activeModal === 'note' ? 'none' : 'note')}
                        className={`flex flex-col items-center gap-1.5 transition-colors group ${activeModal === 'note' ? 'text-blue-500' : 'text-zinc-400 hover:text-white'}`}
                    >
                        <div className="p-2 rounded-xl bg-zinc-900 group-hover:bg-zinc-800 border border-zinc-800 transition-colors">
                            <BookOpen size={18} />
                        </div>
                        <span className="text-[10px] font-medium">Note</span>
                    </button>

                    {/* Bookmark */}
                    <button
                        onClick={() => setActiveModal(activeModal === 'bookmark' ? 'none' : 'bookmark')}
                        className={`flex flex-col items-center gap-1.5 transition-colors group ${activeModal === 'bookmark' ? 'text-blue-500' : 'text-zinc-400 hover:text-white'}`}
                    >
                        <div className="p-2 rounded-xl bg-zinc-900 group-hover:bg-zinc-800 border border-zinc-800 transition-colors">
                            <Bookmark size={18} />
                        </div>
                        <span className="text-[10px] font-medium">Bookmark</span>
                    </button>

                    {/* Flashcards */}
                    <button
                        onClick={() => setActiveModal(activeModal === 'flashcard' ? 'none' : 'flashcard')}
                        className={`flex flex-col items-center gap-1.5 transition-colors group ${activeModal === 'flashcard' ? 'text-blue-500' : 'text-zinc-400 hover:text-white'}`}
                    >
                        <div className="p-2 rounded-xl bg-zinc-900 group-hover:bg-zinc-800 border border-zinc-800 transition-colors">
                            <Star size={18} />
                        </div>
                        <span className="text-[10px] font-medium">Flashcard</span>
                    </button>
                </div>
            </div>

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
