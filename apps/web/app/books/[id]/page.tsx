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

        // Feature States (Mock Data for now)
        const [bookmarks, setBookmarks] = useState([
            { id: 1, title: 'Calculus definition', page: 12, date: '2 days ago' },
            { id: 2, title: 'Derivative rules', page: 54, date: '1 week ago' },
        ]);
        const [notes, setNotes] = useState([
            { id: 1, content: 'Remember to practice chain rule.', page: 55, date: '1 day ago' }
        ]);
        const [highlights, setHighlights] = useState([
            { id: 1, text: 'Fundamental Theorem of Calculus', color: 'yellow', page: 60 }
        ]);
        const [flashcards, setFlashcards] = useState([
            { id: 1, front: 'd/dx (sin x)', back: 'cos x' }
        ]);

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
                                                                setBookmarks([{ id: Date.now(), title: val, page: book?.progress?.current_page || 1, date: 'Just now' }, ...bookmarks]);
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
                                                            setBookmarks([{ id: Date.now(), title: input.value, page: book?.progress?.current_page || 1, date: 'Just now' }, ...bookmarks]);
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
                                                            <p className="text-[10px] text-zinc-500">Page {bm.page} • {bm.date}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => setBookmarks(bookmarks.filter(b => b.id !== bm.id))}
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
                                                    className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-600 outline-none transition-colors resize-none h-20"
                                                />
                                                <button
                                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-2 text-xs font-bold transition-colors"
                                                    onClick={(e) => {
                                                        const textarea = e.currentTarget.previousElementSibling as HTMLTextAreaElement;
                                                        if (textarea.value.trim()) {
                                                            setNotes([{ id: Date.now(), content: textarea.value, page: book?.progress?.current_page || 1, date: 'Just now' }, ...notes]);
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
                                                            <p className="text-[10px] text-zinc-500">Page {note.page} • {note.date}</p>
                                                            <button
                                                                onClick={() => setNotes(notes.filter(n => n.id !== note.id))}
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

                                {/* Highlights Modal */}
                                {activeModal === 'highlight' && (
                                    <div className="flex flex-col h-full">
                                        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                                            <h3 className="font-bold text-white">Highlights</h3>
                                            <span className="text-xs text-zinc-500">{highlights.length} saved</span>
                                        </div>

                                        <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
                                            <div className="space-y-2">
                                                <div className="flex gap-2 mb-2">
                                                    {['yellow', 'green', 'blue', 'red'].map(color => (
                                                        <button
                                                            key={color}
                                                            className={`w-6 h-6 rounded-full border-2 ${color === 'yellow' ? 'bg-yellow-500/20 border-yellow-500' : color === 'green' ? 'bg-green-500/20 border-green-500' : color === 'blue' ? 'bg-blue-500/20 border-blue-500' : 'bg-red-500/20 border-red-500'}`}
                                                            onClick={() => {
                                                                // In a real app this would set selection color
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="Text to highlight (mock)..."
                                                    className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-600 outline-none transition-colors"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            const val = e.currentTarget.value;
                                                            if (val.trim()) {
                                                                setHighlights([{ id: Date.now(), text: val, color: 'yellow', page: book?.progress?.current_page || 1 }, ...highlights]);
                                                                e.currentTarget.value = '';
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                                            {highlights.length === 0 ? (
                                                <div className="text-center py-8 text-zinc-500 text-xs">No highlights yet.</div>
                                            ) : (
                                                highlights.map(hl => (
                                                    <div key={hl.id} className="bg-black/50 border border-zinc-800 p-3 rounded-lg group">
                                                        <p className={`text-xs text-zinc-300 italic pl-2 border-l-2 ${hl.color === 'yellow' ? 'border-yellow-500' : 'border-blue-500'} mb-2`}>"{hl.text}"</p>
                                                        <div className="flex justify-between items-center">
                                                            <p className="text-[10px] text-zinc-500">Page {hl.page}</p>
                                                            <button
                                                                onClick={() => setHighlights(highlights.filter(h => h.id !== hl.id))}
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
                                                            setFlashcards([{ id: Date.now(), front: front.value, back: back.value }, ...flashcards]);
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
                                                            <p className="text-xs text-white">{fc.front}</p>
                                                        </div>
                                                        <div className="mb-2">
                                                            <p className="text-[10px] text-zinc-500 uppercase font-bold">Back</p>
                                                            <p className="text-xs text-zinc-300">{fc.back}</p>
                                                        </div>
                                                        <div className="flex justify-end">
                                                            <button
                                                                onClick={() => setFlashcards(flashcards.filter(card => card.id !== fc.id))}
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

                            </div>
                        </div>
                    </div>
                )}


                {/* Bottom Toolbar & Action */}
                <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-zinc-900 pb-6 pt-2 z-50">
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
                                <Type size={18} className="rotate-90" /> {/* Simulate Pen or just use Type for now, lucide might have Highlighter */}
                            </div>
                            <span className="text-[10px] font-medium">Highlight</span>
                        </button>

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
