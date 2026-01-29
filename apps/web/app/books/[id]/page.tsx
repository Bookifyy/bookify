'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { Play, Clock, BookOpen, Star, Share2, ArrowLeft, Sun, Type, Search, Bookmark } from 'lucide-react';
import { resolveAssetUrl, getApiUrl } from '../../lib/utils';

interface Book {
    id: number;
    title: string;
    author: string;
    description: string;
    cover_image: string;
    subject: { name: string };
    is_premium: boolean;
    progress?: {
        current_page: number;
        total_pages: number;
        percentage_completed: number;
    };
}

export default function BookDetailPage() {
    const { id } = useParams();
    const { token } = useAuth();
    const router = useRouter();
    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);
    const [addingToLibrary, setAddingToLibrary] = useState(false);
    const [showThemeModal, setShowThemeModal] = useState(false);
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');

    const [fontSize, setFontSize] = useState(16);
    const [lineHeight, setLineHeight] = useState(1.6);
    const [activeModal, setActiveModal] = useState<'none' | 'theme' | 'typography' | 'search' | 'bookmark' | 'highlight' | 'note' | 'flashcard'>('none');
    const [searchQuery, setSearchQuery] = useState('');

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
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id, token]);

    const addToLibrary = async () => {
        if (!token || !book) return;
        setAddingToLibrary(true);
        try {
            const apiUrl = getApiUrl();
            const res = await fetch(`${apiUrl}/api/library/add`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ book_id: book.id })
            });

            if (res.ok) {
                alert('Added to your library!');
            }
        } catch (err) {
            console.error('Failed to add to library:', err);
        } finally {
            setAddingToLibrary(false);
        }
    };

    if (loading) return <div className="p-8 text-zinc-500">Loading book details...</div>;
    if (!book) return <div className="p-8 text-red-500">Book not found.</div>;



    // ... (rest of code)

    // --- Continue Reading Layout ---
    if (book.progress && book.progress.percentage_completed > 0) {
        // Mock Chapters Data
        const chapters = [
            { number: 1, title: 'Functions and Models', pages: 48, startPage: 1 },
            { number: 2, title: 'Limits and Derivatives', pages: 72, startPage: 49 },
            { number: 3, title: 'Differentiation Rules', pages: 84, startPage: 121 },
        ];

        // Theme Classes Mapping
        const themeClasses = {
            dark: 'bg-black text-white',
            light: 'bg-white text-black',
        };

        const subTextClasses = {
            dark: 'text-zinc-400',
            light: 'text-zinc-600',
        }

        const cardClasses = {
            dark: 'bg-zinc-900/50 hover:bg-zinc-900',
            light: 'bg-zinc-100 hover:bg-zinc-200',
        }

        // Feature Mock Data
        const mockBookmarks = [
            { id: 1, title: 'Calculus definition', page: 12, date: '2 days ago' },
            { id: 2, title: 'Derivative rules', page: 54, date: '1 week ago' },
        ];

        return (
            <div className={`min-h-screen pb-80 transition-colors duration-300 ${themeClasses[theme] || themeClasses.dark}`}>
                {/* Header */}
                <div className="pt-8 px-4 flex flex-col items-center text-center space-y-4">
                    <div className="w-32 h-48 rounded-lg shadow-2xl overflow-hidden mb-2">
                        {book?.cover_image ? (
                            <img
                                src={resolveAssetUrl(book.cover_image)}
                                alt={book?.title ?? 'Book Cover'}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                                <BookOpen className="text-zinc-600" />
                            </div>
                        )}
                    </div>
                    <div>
                        <h1 className="text-xl font-bold font-serif mb-1">{book?.title}</h1>
                        <p className={`text-sm mb-1 ${subTextClasses[theme] || subTextClasses.dark}`}>{book?.author}</p>
                        <p className="text-blue-500 text-xs font-medium uppercase tracking-wider">
                            {book?.subject?.name} • {book?.progress?.total_pages || '?'} pages
                        </p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="max-w-xl mx-auto px-6 mt-8">
                    <div className={`h-1.5 rounded-full overflow-hidden mb-2 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-slate-200'}`}>
                        <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${Math.max(0, Math.min(100, book?.progress?.percentage_completed || 0))}%` }}
                        />
                    </div>
                    <div className={`flex justify-between text-[11px] font-medium uppercase tracking-wider ${subTextClasses[theme] || subTextClasses.dark}`}>
                        <span>Page {book?.progress?.current_page || 0}</span>
                        <span>{book?.progress?.total_pages || '?'} pages</span>
                    </div>
                </div>

                {/* Chapters List */}
                <div
                    className="max-w-xl mx-auto px-6 mt-10 space-y-2"
                    style={{ fontSize: `${fontSize}px`, lineHeight: lineHeight }}
                >
                    <h3 className={`text-xs font-bold uppercase tracking-wider mb-4 ${subTextClasses[theme]}`}>Chapters</h3>
                    <div className="space-y-3">
                        {chapters.map((chapter) => (
                            <div key={chapter.number} className={`p-4 rounded-xl flex items-center justify-between group cursor-pointer transition-colors ${cardClasses[theme]}`}>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-xs font-bold ${subTextClasses[theme]}`}>{chapter.number}</span>
                                        <h4 className="font-medium">{chapter.title}</h4>
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600 ml-1"></div>
                                    </div>
                                    <p className={`text-[11px] pl-4 ${subTextClasses[theme]}`}>{chapter.pages} pages • Starting page {chapter.startPage}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stats */}
                <div className="max-w-xl mx-auto px-6 mt-6">
                    <div className={`border rounded-xl p-4 space-y-2 ${theme === 'dark' ? 'bg-zinc-900/30 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex justify-between items-center text-sm">
                            <span className={subTextClasses[theme]}>Time spent</span>
                            <span className="font-medium">30h 47m</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className={subTextClasses[theme]}>Progress</span>
                            <span className="font-medium">{Math.round(book.progress.percentage_completed)}% complete</span>
                        </div>
                    </div>
                </div>

                {/* Info Footer */}
                <div className="max-w-xl mx-auto px-8 mt-4">
                    <div className={`text-[10px] flex items-center gap-1.5 ${subTextClasses[theme]}`}>
                        <div className="w-1 h-1 rounded-full bg-blue-600"></div>
                        Protected content • User ID: #Q2/Q9QG30
                    </div>
                </div>

                {/* Modals Overlay */}
                {activeModal !== 'none' && (
                    <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm" onClick={() => setActiveModal('none')}>
                        <div
                            className="absolute bottom-0 left-0 right-0 p-4 animate-in slide-in-from-bottom-10 fade-in duration-200 lg:top-1/2 lg:bottom-auto lg:left-1/2 lg:right-auto lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-[400px]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">

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

                                {/* Typography Modal */}
                                {activeModal === 'typography' && (
                                    <div className="p-6 space-y-6">
                                        <h3 className="text-white text-base font-bold mb-2">Typography</h3>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs text-zinc-400 font-medium">
                                                    <span>Font Size</span>
                                                    <span>{fontSize}px</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="12"
                                                    max="24"
                                                    step="1"
                                                    value={fontSize}
                                                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                                                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs text-zinc-400 font-medium">
                                                    <span>Line Height</span>
                                                    <span>{lineHeight}</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="1.0"
                                                    max="2.0"
                                                    step="0.1"
                                                    value={lineHeight}
                                                    onChange={(e) => setLineHeight(parseFloat(e.target.value))}
                                                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Search Modal */}
                                {activeModal === 'search' && (
                                    <div className="p-4">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                                            <input
                                                type="text"
                                                placeholder="Search in book..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full bg-black border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-600"
                                                autoFocus
                                            />
                                        </div>
                                        {searchQuery && (
                                            <div className="mt-4 text-center text-zinc-500 text-xs py-8">
                                                No results found for "{searchQuery}"
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Bookmarks Modal */}
                                {activeModal === 'bookmark' && (
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-bold text-white">Bookmarks</h3>
                                            <span className="text-xs text-zinc-500">{mockBookmarks.length} found</span>
                                        </div>
                                        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                                            {mockBookmarks.map(bm => (
                                                <div key={bm.id} className="bg-black/50 border border-zinc-800 p-3 rounded-lg flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-white">{bm.title}</p>
                                                        <p className="text-[10px] text-zinc-500">Page {bm.page} • {bm.date}</p>
                                                    </div>
                                                    <button className="text-zinc-600 hover:text-red-500 transition-colors"><Bookmark size={14} fill="currentColor" /></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Other Feature Modals (Generic) */}
                                {['highlight', 'note', 'flashcard'].includes(activeModal) && (
                                    <div className="p-8 text-center">
                                        <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-400">
                                            {activeModal === 'highlight' && <Type size={20} />}
                                            {activeModal === 'note' && <Bookmark size={20} />}
                                            {activeModal === 'flashcard' && <BookOpen size={20} />}
                                        </div>
                                        <h3 className="font-bold text-white capitalize mb-2">{activeModal}s</h3>
                                        <p className="text-xs text-zinc-500">
                                            Create your first {activeModal} to get started.
                                            <br />This feature is coming soon to the platform.
                                        </p>
                                        <button className="mt-6 w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-2.5 rounded-lg text-xs transition-colors">
                                            Create New {activeModal.charAt(0).toUpperCase() + activeModal.slice(1)}
                                        </button>
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>
                )}


                {/* Bottom Toolbar & Action */}
                <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-zinc-900 p-4 pb-6 z-50">
                    <div className="max-w-xl mx-auto space-y-4">
                        {/* Toolbar Icons */}
                        <div className="flex justify-between px-4">
                            <button
                                onClick={() => setActiveModal(activeModal === 'theme' ? 'none' : 'theme')}
                                className={`flex flex-col items-center gap-1 transition-colors ${activeModal === 'theme' ? 'text-blue-500' : 'text-zinc-400 hover:text-white'}`}
                            >
                                <Sun size={18} />
                                <span className="text-[10px]">Theme</span>
                            </button>
                            <button
                                onClick={() => setActiveModal(activeModal === 'typography' ? 'none' : 'typography')}
                                className={`flex flex-col items-center gap-1 transition-colors ${activeModal === 'typography' ? 'text-blue-500' : 'text-zinc-400 hover:text-white'}`}
                            >
                                <Type size={18} />
                                <span className="text-[10px]">Font</span>
                            </button>
                            <button
                                onClick={() => setActiveModal(activeModal === 'search' ? 'none' : 'search')}
                                className={`flex flex-col items-center gap-1 transition-colors ${activeModal === 'search' ? 'text-blue-500' : 'text-zinc-400 hover:text-white'}`}
                            >
                                <Search size={18} />
                                <span className="text-[10px]">Search</span>
                            </button>
                            <button
                                onClick={() => setActiveModal(activeModal === 'bookmark' ? 'none' : 'bookmark')}
                                className={`flex flex-col items-center gap-1 transition-colors ${activeModal === 'bookmark' ? 'text-blue-500' : 'text-zinc-400 hover:text-white'}`}
                            >
                                <Bookmark size={18} />
                                <span className="text-[10px]">Bookmark</span>
                            </button>
                        </div>

                        {/* Pills */}
                        <div className="flex justify-center gap-2">
                            {['Highlight', 'Note', 'Flashcard'].map(action => (
                                <button
                                    key={action}
                                    onClick={() => setActiveModal(action.toLowerCase() as any)}
                                    className={`bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-[10px] uppercase font-bold tracking-wider px-4 py-1.5 rounded-full transition-colors border border-zinc-800 ${activeModal === action.toLowerCase() ? 'border-blue-600 text-blue-500' : ''}`}
                                >
                                    • {action}
                                </button>
                            ))}
                        </div>

                        {/* Main Button */}
                        <button
                            onClick={() => router.push(`/books/${id}/read`)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                        >
                            Continue Reading
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- Standard Hero Layout (Unchanged) ---
    return (
        <div className="min-h-screen bg-black text-white">
            {/* Hero Section */}
            <div className="relative min-h-screen md:h-[500px] w-full overflow-hidden flex flex-col">
                <div
                    className="absolute inset-0 bg-cover bg-center blur-3xl opacity-30 scale-110"
                    style={{ backgroundImage: `url(${resolveAssetUrl(book.cover_image)})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                <div className="relative z-10 p-8 pt-4 max-w-6xl mx-auto flex flex-col h-full justify-between w-full">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-md mb-8 md:mb-0"
                    >
                        <ArrowLeft size={20} />
                    </button>

                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-end mb-8 md:mb-12">
                        <div className="relative w-48 h-72 md:w-56 md:h-80 flex-shrink-0 shadow-2xl shadow-black rounded-lg overflow-hidden border border-zinc-800">
                            <img
                                src={resolveAssetUrl(book.cover_image)}
                                alt={book.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="space-y-4 flex-1 text-center md:text-left w-full">
                            <div className="flex items-center justify-center md:justify-start gap-2">
                                <span className="bg-indigo-600 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                                    {book.subject?.name}
                                </span>
                                {book.is_premium && (
                                    <span className="bg-yellow-500 text-black text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                                        Premium
                                    </span>
                                )}
                            </div>
                            <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">{book.title}</h1>
                            <p className="text-xl text-zinc-400 font-medium">{book.author}</p>

                            {/* Standard Actions */}
                            <div className="flex flex-col md:flex-row gap-4 pt-4 justify-center md:justify-start">
                                <button
                                    onClick={() => router.push(`/books/${id}/read`)}
                                    className="bg-white text-black px-8 py-3 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors w-full md:w-auto"
                                >
                                    <Play size={20} fill="black" /> Start Reading
                                </button>
                                <button
                                    onClick={addToLibrary}
                                    disabled={addingToLibrary}
                                    className="bg-zinc-900 border border-zinc-800 px-6 py-3 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors disabled:opacity-50 w-full md:w-auto"
                                >
                                    {addingToLibrary ? 'Adding...' : <><Star size={20} /> Add to Library</>}
                                </button>
                                <button className="p-3 bg-zinc-900 border border-zinc-800 rounded-full hover:bg-zinc-800 transition-colors hidden md:block">
                                    <Share2 size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-8 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8">
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold">About this book</h2>
                        <p className="text-zinc-400 leading-relaxed whitespace-pre-line">
                            {book.description || "No description available for this title."}
                        </p>
                    </section>
                </div>

                <div className="space-y-8">
                    <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl space-y-6">
                        <h3 className="font-bold text-lg">Reading Stats</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Avg. Time</p>
                                <div className="flex items-center gap-2 text-white font-medium">
                                    <Clock size={16} className="text-indigo-400" />
                                    <span>4h 20m</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Pages</p>
                                <div className="flex items-center gap-2 text-white font-medium">
                                    <BookOpen size={16} className="text-blue-400" />
                                    <span>342</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
