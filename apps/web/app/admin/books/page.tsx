'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { BookOpen, Search, Plus, Trash2, Edit2, Star } from 'lucide-react';
import { ConfirmModal } from '../../components/ConfirmModal';

interface Book {
    id: number;
    title: string;
    author: string;
    cover_image?: string;
    subject?: { name: string };
    is_premium: boolean;
    created_at: string;
}

export default function AdminBooksPage() {
    const { token } = useAuth();
    const router = useRouter();
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');

    // Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [bookToDelete, setBookToDelete] = useState<number | null>(null);

    useEffect(() => {
        if (token) fetchBooks();
    }, [token]);

    const fetchBooks = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${apiUrl}/api/books`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            if (!res.ok) throw new Error('Failed to fetch books');
            const data = await res.json();

            // Handle Laravel Pagination (data.data) or Direct Array
            if (data.data && Array.isArray(data.data)) {
                setBooks(data.data);
            } else if (Array.isArray(data)) {
                setBooks(data);
            } else {
                setBooks([]);
                console.error('API return format not recognized:', data);
            }
            setLoading(false);
        } catch (err: any) {
            console.error(err);
            setError('Failed to load books. Showing demo data.');
            // Fallback mock data
            setBooks([
                { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', is_premium: false, created_at: new Date().toISOString(), subject: { name: 'Fiction' } },
                { id: 2, title: 'Clean Code', author: 'Robert C. Martin', is_premium: true, created_at: new Date().toISOString(), subject: { name: 'Technology' } },
                { id: 3, title: '1984', author: 'George Orwell', is_premium: false, created_at: new Date().toISOString(), subject: { name: 'Fiction' } },
            ]);
            setLoading(false);
        }
    };

    const confirmDelete = (id: number) => {
        setBookToDelete(id);
        setDeleteModalOpen(true);
    };

    const handleDeleteBook = async () => {
        if (!bookToDelete) return;

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${apiUrl}/api/books/${bookToDelete}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (res.ok) {
                setBooks(books.filter(b => b.id !== bookToDelete));
            } else {
                console.error('Failed to delete book');
                setError('Failed to delete book. Please try again.');
            }
        } catch (e) {
            console.error(e);
            setError('An error occurred while deleting the book.');
        } finally {
            setDeleteModalOpen(false);
            setBookToDelete(null);
        }
    };

    const resolveAssetUrl = (path: string) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

        // Remove leading slash for cleaner handling
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;

        // If the path already includes 'storage/', just prepend API URL
        if (cleanPath.startsWith('storage/')) {
            return `${apiUrl}/${cleanPath}`;
        }

        return `${apiUrl}/storage/${cleanPath}`;
    };

    const filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDeleteBook}
                title="Delete Book?"
                message="Are you sure you want to delete this book? This action cannot be undone and will remove the book from the user library."
                confirmText="Delete Book"
                isDestructive={true}
            />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Book Management</h1>
                    <p className="text-zinc-400 text-sm">Manage library content, availability, and metadata.</p>
                </div>

                <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search books..."
                            className="bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-600 outline-none w-full md:w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => router.push('/admin/books/create')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-indigo-500/20"
                    >
                        <Plus size={18} />
                        Add Book
                    </button>
                </div>
            </div>

            {error && <div className="p-4 bg-red-500/10 text-red-500 rounded-xl text-sm border border-red-500/20">{error}</div>}

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-zinc-950/50 border-b border-zinc-800">
                            <tr>
                                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Book</th>
                                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Subject</th>
                                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {loading ? (
                                <tr><td colSpan={4} className="p-8 text-center text-zinc-500">Loading books...</td></tr>
                            ) : filteredBooks.length === 0 ? (
                                <tr><td colSpan={4} className="p-8 text-center text-zinc-500">No books found.</td></tr>
                            ) : (
                                filteredBooks.map(book => (
                                    <tr key={book.id} className="group hover:bg-zinc-800/30 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-14 bg-zinc-800 rounded overflow-hidden shrink-0">
                                                    {book.cover_image ? (
                                                        <img src={resolveAssetUrl(book.cover_image)} alt={book.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-zinc-600"><BookOpen size={16} /></div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white text-sm line-clamp-1">{book.title}</p>
                                                    <p className="text-xs text-zinc-500">{book.author}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-zinc-400">
                                            <span className="bg-zinc-800 text-zinc-300 px-2 py-1 rounded text-xs">
                                                {book.subject?.name || 'Uncategorized'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {book.is_premium ? (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20">
                                                    <Star size={12} fill="currentColor" /> Premium
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-zinc-700/50 text-zinc-400 ring-1 ring-zinc-700">
                                                    Free
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors" title="Edit">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => confirmDelete(book.id)}
                                                    className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-400 hover:text-red-500 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
