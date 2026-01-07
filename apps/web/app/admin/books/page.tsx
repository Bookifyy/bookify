'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Upload, X, Book as BookIcon, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminBooksPage() {
    const { token } = useAuth();
    const router = useRouter();
    const [subjects, setSubjects] = useState<{ id: number; name: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        author: '',
        subject_id: '',
        description: '',
        isbn: '',
        language: 'en',
        publisher: '',
        is_premium: false,
    });

    const [files, setFiles] = useState<{ book_file: File | null; cover_image: File | null }>({
        book_file: null,
        cover_image: null,
    });

    useEffect(() => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        fetch(`${apiUrl}/api/subjects`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        })
            .then(res => res.json())
            .then(setSubjects)
            .catch(err => console.error('Failed to fetch subjects:', err));
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            data.append(key, value.toString());
        });
        if (files.book_file) data.append('book_file', files.book_file);
        if (files.cover_image) data.append('cover_image', files.cover_image);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${apiUrl}/api/books`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: data,
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => router.push('/'), 2000);
            } else {
                let message = 'Failed to upload book';
                try {
                    const errData = await res.json();
                    message = errData.message || message;
                } catch (e) {
                    // If response is not JSON (e.g. 413 Payload Too Large HTML)
                    if (res.status === 413) message = 'File too large (Server limit exceeded)';
                    else message = `Server Error (${res.status}): Please check if the file is too large.`;
                }
                setError(message);
            }
        } catch (err: any) {
            console.error('Upload Error:', err);
            setError(err.message || 'An error occurred during upload. Check your connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Upload New Book</h1>
                    <p className="text-zinc-500 text-sm">Add a new book to the platform library.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {success ? (
                    <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-8 flex flex-col items-center gap-4 text-center text-green-500">
                        <CheckCircle2 size={48} />
                        <div className="space-y-1">
                            <h3 className="font-bold text-lg">Upload Successful!</h3>
                            <p className="text-sm opacity-80">The book has been added to the library. Redirecting...</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column: Metadata */}
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Book Title</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Author</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        value={formData.author}
                                        onChange={e => setFormData({ ...formData, author: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Subject</label>
                                    <select
                                        required
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        value={formData.subject_id}
                                        onChange={e => setFormData({ ...formData, subject_id: e.target.value })}
                                    >
                                        <option value="">Select Subject</option>
                                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                    {subjects.length === 0 && !loading && (
                                        <p className="text-[10px] text-amber-500 mt-1">
                                            No subjects found. Please run the seeder or add subjects via database.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Description</label>
                                <textarea
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-32"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl">
                                <input
                                    type="checkbox"
                                    id="is_premium"
                                    className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-indigo-600 focus:ring-indigo-500"
                                    checked={formData.is_premium}
                                    onChange={e => setFormData({ ...formData, is_premium: e.target.checked })}
                                />
                                <label htmlFor="is_premium" className="text-sm font-medium text-white">Premium Content</label>
                            </div>
                        </div>

                        {/* Right Column: Files */}
                        <div className="space-y-6">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Book File (PDF/EPUB)</label>
                                <div className="relative group">
                                    <input
                                        required
                                        type="file"
                                        accept=".pdf,.epub"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        onChange={e => setFiles({ ...files, book_file: e.target.files?.[0] || null })}
                                    />
                                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-xl p-8 bg-zinc-900 transition-colors group-hover:bg-zinc-800 group-hover:border-indigo-500/50">
                                        <Upload size={24} className="text-zinc-500 mb-2 group-hover:text-indigo-400" />
                                        <span className="text-sm font-medium text-zinc-400">
                                            {files.book_file ? files.book_file.name : 'Select PDF or EPUB'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Cover Image</label>
                                <div className="relative group">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        onChange={e => setFiles({ ...files, cover_image: e.target.files?.[0] || null })}
                                    />
                                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-xl p-8 bg-zinc-900 transition-colors group-hover:bg-zinc-800 group-hover:border-indigo-500/50">
                                        <BookIcon size={24} className="text-zinc-500 mb-2 group-hover:text-indigo-400" />
                                        <span className="text-sm font-medium text-zinc-400">
                                            {files.cover_image ? files.cover_image.name : 'Select Cover Image'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-500 text-xs font-medium">
                                    {error}
                                </div>
                            )}

                            <button
                                disabled={loading}
                                type="submit"
                                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                {loading ? 'Uploading...' : 'Save Book'}
                            </button>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
}
