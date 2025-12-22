'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { Play, Clock, BookOpen, Star, Share2, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

interface Book {
    id: number;
    title: string;
    author: string;
    description: string;
    cover_image: string;
    subject: { name: string };
    is_premium: boolean;
}

export default function BookDetailPage() {
    const { id } = useParams();
    const { token } = useAuth();
    const router = useRouter();
    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/books/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                setBook(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id, token]);

    if (loading) return <div className="p-8 text-zinc-500">Loading book details...</div>;
    if (!book) return <div className="p-8 text-red-500">Book not found.</div>;

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Hero Section */}
            <div className="relative h-[400px] w-full overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center blur-3xl opacity-30 scale-110"
                    style={{ backgroundImage: `url(${book.cover_image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                <div className="relative z-10 p-8 pt-4 max-w-6xl mx-auto flex flex-col h-full justify-between">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-md"
                    >
                        <ArrowLeft size={20} />
                    </button>

                    <div className="flex flex-col md:flex-row gap-8 items-end mb-8">
                        <div className="relative w-48 h-72 flex-shrink-0 shadow-2xl shadow-black rounded-lg overflow-hidden border border-zinc-800">
                            <img
                                src={book.cover_image}
                                alt={book.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="bg-indigo-600 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                                    {book.subject?.name}
                                </span>
                                {book.is_premium && (
                                    <span className="bg-yellow-500 text-black text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                                        Premium
                                    </span>
                                )}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{book.title}</h1>
                            <p className="text-xl text-zinc-400 font-medium">{book.author}</p>

                            <div className="flex flex-wrap gap-4 pt-4">
                                <button className="bg-white text-black px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-zinc-200 transition-colors">
                                    <Play size={20} fill="black" /> Start Reading
                                </button>
                                <button className="bg-zinc-900 border border-zinc-800 px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-zinc-800 transition-colors">
                                    <Star size={20} /> Add to Library
                                </button>
                                <button className="p-3 bg-zinc-900 border border-zinc-800 rounded-full hover:bg-zinc-800 transition-colors">
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
