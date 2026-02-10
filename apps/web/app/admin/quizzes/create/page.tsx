'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Clock, Award, Save, Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { getApiUrl } from '../../../lib/utils';
import Link from 'next/link';
import { Modal } from '../../components/Modal';

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
    const [attachment, setAttachment] = useState<File | null>(null);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState('');
    const [modalType, setModalType] = useState<'success' | 'error'>('success');

    const showNotification = (title: string, message: string, type: 'success' | 'error' = 'success') => {
        setModalTitle(title);
        setModalMessage(message);
        setModalType(type);
        setShowModal(true);
    };

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

            // Use FormData for file upload
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            if (bookId) formData.append('book_id', bookId);
            formData.append('time_limit_minutes', timeLimit.toString());
            formData.append('passing_score', passingScore.toString());
            if (attachment) formData.append('attachment', attachment);

            const res = await fetch(`${apiUrl}/api/admin/quizzes`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // Content-Type is set automatically with FormData
                },
                body: formData
            });

            if (res.ok) {
                const quiz = await res.json();
                router.push(`/admin/quizzes/${quiz.id}`); // Redirect to edit page
            } else {
                const error = await res.json();
                showNotification('Error', error.message || 'Failed to create quiz', 'error');
            }
        } catch (err) {
            console.error(err);
            showNotification('Connection Error', 'Failed to connect to server', 'error');
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

                {/* Attachment (Question Paper) */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                        <Save size={16} /> {/* Using Save icon for now, could be FileText */}
                        Question Paper (PDF) <span className="text-zinc-500 text-xs font-normal">(Optional)</span>
                    </label>
                    <div className="flex items-center gap-4">
                        <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={e => setAttachment(e.target.files ? e.target.files[0] : null)}
                            className="block w-full text-sm text-zinc-400
                                file:mr-4 file:py-2.5 file:px-4
                                file:rounded-lg file:border-0
                                file:text-sm file:font-semibold
                                file:bg-zinc-800 file:text-white
                                hover:file:bg-zinc-700
                                cursor-pointer"
                        />
                    </div>
                    <p className="text-xs text-zinc-500">
                        Upload a PDF exam paper if you don't want to create individual questions manually.
                    </p>
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

            {/* Notification Modal */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={modalTitle}>
                <div className="space-y-4 text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border ${modalType === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'
                        }`}>
                        {modalType === 'success' ? <CheckCircle size={32} /> : <XCircle size={32} />}
                    </div>
                    <p className="text-zinc-300 text-lg">
                        {modalMessage}
                    </p>
                    <div className="pt-4">
                        <button
                            onClick={() => setShowModal(false)}
                            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-lg font-bold transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </Modal>
        </div >
    );
}
