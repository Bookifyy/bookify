'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Clock, Award, Save, Loader2 } from 'lucide-react';
import { getApiUrl } from '../../../../lib/utils';
import Link from 'next/link';

interface Book {
    id: number;
    title: string;
}

export default function CreateQuizPage() {
    const { token } = useAuth();
    const router = useRouter();
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [bookId, setBookId] = useState('');
    const [timeLimit, setTimeLimit] = useState(30);
    const [passingScore, setPassingScore] = useState(70);

    useEffect(() => {
        // Fetch books for selection
        if (token) {
            const apiUrl = getApiUrl();
            fetch(`${apiUrl}/api/books`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.data) setBooks(data.data);
                    else if (Array.isArray(data)) setBooks(data);
                })
                .catch(err => console.error('Failed to fetch books', err));
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const apiUrl = getApiUrl();
            const res = await fetch(`${apiUrl}/api/admin/quizzes`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title,
                    description,
                    book_id: bookId ? parseInt(bookId) : null,
                    time_limit_minutes: timeLimit,
                    passing_score: passingScore
                })
            });

            if (res.ok) {
                const quiz = await res.json();
                router.push(`/admin/quizzes/${quiz.id}`); // Redirect to edit page to add questions
            } else {
                const error = await res.json();
                alert(`Error: ${error.message || 'Failed to create quiz'}`);
            }
        } catch (err) {
            console.error(err);
            alert('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/quizzes" className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Create New Quiz</h1>
                    <p className="text-zinc-400 text-sm">Set up the basic information for the quiz.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6">

                {/* Title */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Quiz Title <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        required
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="e.g., Calculus - Chapter 1 Review"
                        className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Description</label>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Briefly describe what this quiz covers..."
                        rows={3}
                        className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                    />
                </div>

                {/* Related Book */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                        <BookOpen size={16} />
                        Linked Book (Optional)
                    </label>
                    <select
                        value={bookId}
                        onChange={e => setBookId(e.target.value)}
                        className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    >
                        <option value="">-- No specific book --</option>
                        {books.map(book => (
                            <option key={book.id} value={book.id}>{book.title}</option>
                        ))}
                    </select>
                    <p className="text-xs text-zinc-500">Linking a book helps students find relevant quizzes in their library.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Time Limit */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                            <Clock size={16} />
                            Time Limit (Minutes)
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="180"
                            value={timeLimit}
                            onChange={e => setTimeLimit(parseInt(e.target.value))}
                            className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        />
                    </div>

                    {/* Passing Score */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                            <Award size={16} />
                            Passing Score (%)
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={passingScore}
                                onChange={e => setPassingScore(parseInt(e.target.value))}
                                className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500">%</span>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-zinc-800 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg font-bold transition-all"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        Save & Continue
                    </button>
                </div>
            </form>
        </div>
    );
}
