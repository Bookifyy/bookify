'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { getApiUrl } from '../../../lib/utils';
import { useParams } from 'next/navigation';
import { Plus, BookOpen, Clock, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { AddBookModal } from '../../../components/AddBookModal';

interface GroupBook {
    id: number;
    title: string;
    author: string;
    cover_image: string | null;
    pivot: {
        added_at: string;
        added_by_user_id: number;
    }
}

export default function GroupBooksPage() {
    const { token } = useAuth();
    const params = useParams();
    const id = params.id;

    const [books, setBooks] = useState<GroupBook[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        if (token && id) fetchBooks();
    }, [token, id]);

    const fetchBooks = async () => {
        try {
            const apiUrl = getApiUrl();
            const res = await fetch(`${apiUrl}/api/groups/${id}`, { // The show endpoint returns books relation
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setBooks(data.books || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-indigo-500" /></div>;

    return (
        <div className="space-y-6">
            <button
                onClick={() => setShowAddModal(true)}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
                <Plus size={20} />
                Add from Library
            </button>

            <div className="space-y-4">
                {books.length === 0 ? (
                    <div className="text-center py-12 bg-zinc-900/50 rounded-xl border border-zinc-800 border-dashed">
                        <BookOpen className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-white mb-1">No books yet</h3>
                        <p className="text-zinc-500 text-sm">Add a book to start reading together.</p>
                    </div>
                ) : (
                    books.map(book => (
                        <div key={book.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex gap-4">
                            {/* Cover */}
                            <div className="w-16 h-24 bg-zinc-800 rounded-lg flex-shrink-0 overflow-hidden relative">
                                {book.cover_image ? (
                                    <Image
                                        src={book.cover_image?.startsWith('http') ? book.cover_image : `${getApiUrl()}${book.cover_image}`}
                                        alt={book.title}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                        <BookOpen size={24} />
                                    </div>
                                )}
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-bold text-white truncate">{book.title}</h3>
                                <p className="text-zinc-400 text-sm mb-3">{book.author}</p>

                                {/* Progress Bar (Mocked for now as per plan, assuming user progress) */}
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-zinc-500">Your Progress</span>
                                        <span className="text-indigo-400 font-bold">0%</span>
                                    </div>
                                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500 w-0" />
                                    </div>
                                </div>

                                <div className="mt-3 flex items-center gap-2 text-xs text-zinc-600">
                                    <span>Added by User #{book.pivot.added_by_user_id}</span>
                                    <span>•</span>
                                    <span>{new Date(book.pivot.added_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Book Modal */}
            <AddBookModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                groupId={Number(id)}
                onBookAdded={fetchBooks}
            />
        </div>
    );
}
