'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { Play, Clock, BookOpen, Star, Share2, ArrowLeft } from 'lucide-react';
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
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');


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

                {/* Fixed Bottom Action Bar */}
                <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-zinc-900 p-4 z-50">
                    <div className="max-w-xl mx-auto">
                        <button
                            onClick={() => router.push(`/books/${id}/read`)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] flex items-center justify-center gap-2"
                        >
                            <Play size={20} fill="currentColor" />
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
