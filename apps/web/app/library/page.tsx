'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BookCard } from '../components/BookCard';
import { resolveAssetUrl, getApiUrl } from '../lib/utils';
import { Loader2, Library as LibraryIcon } from 'lucide-react';

export default function LibraryPage() {
    const { token } = useAuth();
    const [books, setBooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const apiUrl = getApiUrl();
                const res = await fetch(`${apiUrl}/api/library`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setBooks(data);
                }
            } catch (err) {
                console.error('Failed to fetch library books:', err);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchBooks();
    }, [token]);

    return (
        <div className="p-8 pb-16 space-y-8 max-w-[1400px] mx-auto text-zinc-300">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Your Library</h1>
                    <p className="text-zinc-500 text-sm">Find all your purchased and saved books here.</p>
                </div>
                <div className="bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-800 flex items-center gap-2">
                    <LibraryIcon size={18} className="text-indigo-400" />
                    <span className="text-sm font-medium">{books.length} Books</span>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <Loader2 className="animate-spin text-indigo-500" size={40} />
                    <p className="text-zinc-500 animate-pulse font-medium">Loading your collection...</p>
                </div>
            ) : books.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {books.map((item) => (
                        <BookCard
                            key={item.id}
                            id={item.book.id}
                            title={item.book.title}
                            author={item.book.author}
                            coverImage={item.book.cover_image}
                            progress={parseFloat(item.percentage_completed)}
                        />
                    ))}
                </div>
            ) : (
                <div className="bg-zinc-900/50 border border-zinc-900 border-dashed rounded-2xl py-24 flex flex-col items-center justify-center text-center px-4">
                    <div className="bg-zinc-800 p-4 rounded-full mb-4">
                        <LibraryIcon size={32} className="text-zinc-600" />
                    </div>
                    <h3 className="text-white font-bold text-lg mb-1">Your library is empty</h3>
                    <p className="text-zinc-500 max-w-sm mx-auto text-sm">
                        You haven&apos;t added any books to your collection yet. Start by exploring our library!
                    </p>
                </div>
            )}
        </div>
    );
}
