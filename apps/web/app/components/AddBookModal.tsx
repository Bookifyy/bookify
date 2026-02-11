'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getApiUrl } from '../lib/utils';
import { Loader2, X, Search, Check, BookOpen } from 'lucide-react';
import Image from 'next/image';

interface LibraryBook {
    id: number;
    title: string;
    author: string;
    cover_image: string | null;
    progress?: {
        percentage: number;
    };
}

export function AddBookModal({ isOpen, onClose, groupId, onBookAdded }: { isOpen: boolean, onClose: () => void, groupId: number, onBookAdded: () => void }) {
    const { token } = useAuth();
    const [search, setSearch] = useState('');
    const [books, setBooks] = useState<LibraryBook[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState<number | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) fetchLibrary();
    }, [isOpen]);

    const fetchLibrary = async () => {
        setLoading(true);
        try {
            const apiUrl = getApiUrl();
            const res = await fetch(`${apiUrl}/api/library`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setBooks(data.data || []); // Accessing paginated data or direct array
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddBook = async (bookId: number) => {
        setAdding(bookId);
        try {
            const apiUrl = getApiUrl();
            const res = await fetch(`${apiUrl}/api/groups/${groupId}/books`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ book_id: bookId })
            });

            if (res.ok) {
                onBookAdded();
                onClose();
            } else {
                const data = await res.json();
                setError(data.message || 'Failed to add book');
            }
        } catch (err) {
            setError('Connection failed');
        } finally {
            setAdding(null);
        }
    };

    const filteredBooks = books.filter(b =>
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.author.toLowerCase().includes(search.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                    <h2 className="text-xl font-bold text-white">Add Books from Library</h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-4 border-b border-zinc-800 bg-black">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                            placeholder="Search books..."
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="animate-spin text-indigo-500" />
                        </div>
                    ) : filteredBooks.length > 0 ? (
                        filteredBooks.map(book => (
                            <div key={book.id} className="bg-black border border-zinc-800 rounded-xl p-3 flex gap-4 hover:border-zinc-700 transition-colors">
                                <div className="w-12 h-16 bg-zinc-800 rounded flex-shrink-0 relative overflow-hidden">
                                    {book.cover_image ? (
                                        <Image src={book.cover_image} alt={book.title} fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                            <BookOpen size={16} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <h4 className="font-bold text-white truncate">{book.title}</h4>
                                    <p className="text-zinc-400 text-sm truncate">{book.author}</p>
                                    {book.progress && (
                                        <div className="w-full h-1 bg-zinc-800 rounded-full mt-2 overflow-hidden">
                                            <div
                                                className="h-full bg-indigo-500"
                                                style={{ width: `${book.progress.percentage}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleAddBook(book.id)}
                                    disabled={adding === book.id}
                                    className="px-4 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 rounded-lg text-sm font-bold transition-colors self-center"
                                >
                                    {adding === book.id ? <Loader2 className="animate-spin" size={16} /> : 'Add'}
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="text-center p-12 text-zinc-500">
                            {search ? 'No books found matching your search.' : 'Your library is empty.'}
                        </div>
                    )}
                </div>

                {error && <div className="p-4 bg-red-500/10 text-red-500 text-sm text-center border-t border-red-500/20">{error}</div>}

                <div className="p-4 border-t border-zinc-800 bg-black flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 text-zinc-400 hover:text-white transition-colors">
                        Cancel
                    </button>
                    {/* Add to Group button is per-item in the list */}
                </div>
            </div>
        </div>
    );
}
