'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { Plus, Search, Trash2, Edit, FileText, Clock, Award, BookOpen, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { getApiUrl } from '../../lib/utils';
import Link from 'next/link';
import { Modal } from '../../components/Modal';

interface Quiz {
    id: number;
    title: string;
    description: string;
    book: {
        title: string;
        cover_image: string;
    } | null;
    questions_count: number;
    attempts_count: number;
    time_limit_minutes: number;
    passing_score: number;
    created_at: string;
    attachment_path?: string;
}

export default function AdminQuizzesPage() {
    const { token } = useAuth();
    const router = useRouter();
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState('');
    const [modalType, setModalType] = useState<'success' | 'error' | 'confirm'>('success');
    const [quizToDelete, setQuizToDelete] = useState<number | null>(null);

    const showNotification = (title: string, message: string, type: 'success' | 'error' = 'success') => {
        setModalTitle(title);
        setModalMessage(message);
        setModalType(type);
        setShowModal(true);
    };

    useEffect(() => {
        if (token) {
            fetchQuizzes();
        }
    }, [token]);

    const fetchQuizzes = async () => {
        try {
            const apiUrl = getApiUrl();
            const res = await fetch(`${apiUrl}/api/admin/quizzes`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setQuizzes(data);
            }
        } catch (error) {
            console.error('Failed to fetch quizzes:', error);
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = (id: number) => {
        setQuizToDelete(id);
        setModalTitle('Delete Quiz?');
        setModalMessage('Are you sure you want to delete this quiz? This action cannot be undone.');
        setModalType('confirm');
        setShowModal(true);
    };

    const executeDelete = async () => {
        if (!quizToDelete) return;

        try {
            const apiUrl = getApiUrl();
            const res = await fetch(`${apiUrl}/api/admin/quizzes/${quizToDelete}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                setQuizzes(quizzes.filter(q => q.id !== quizToDelete));
                setShowModal(false);
                setQuizToDelete(null);
            } else {
                setShowModal(false);
                setTimeout(() => showNotification('Error', 'Failed to delete quiz', 'error'), 100);
            }
        } catch (error) {
            console.error('Error deleting quiz:', error);
            setShowModal(false);
            setTimeout(() => showNotification('Error', 'Connection error while deleting quiz', 'error'), 100);
        }
    };

    const filteredQuizzes = quizzes.filter(q =>
        q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.book?.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8 text-zinc-500">Loading quizzes...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Quizzes</h1>
                    <p className="text-zinc-400 text-sm">Manage quizzes, add questions, and track student performance.</p>
                </div>
                <Link
                    href="/admin/quizzes/create"
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-colors w-full md:w-auto justify-center"
                >
                    <Plus size={20} />
                    Create Quiz
                </Link>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={20} />
                <input
                    type="text"
                    placeholder="Search quizzes by title or book..."
                    className="w-full bg-zinc-900 border border-zinc-800 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Quiz List */}
            <div className="grid gap-4">
                {filteredQuizzes.length === 0 ? (
                    <div className="text-center py-12 bg-zinc-900/50 rounded-xl border border-zinc-800 border-dashed">
                        <FileText className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-white mb-1">No quizzes found</h3>
                        <p className="text-zinc-500 text-sm">Create your first quiz to get started.</p>
                    </div>
                ) : (
                    filteredQuizzes.map((quiz) => (
                        <div key={quiz.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors flex flex-col md:flex-row gap-6 md:items-center">
                            <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="text-lg font-bold text-white">{quiz.title}</h3>
                                    {quiz.book && (
                                        <span className="flex items-center gap-1.5 text-xs font-medium text-blue-400 bg-blue-400/10 px-2 py-1 rounded-full border border-blue-400/20">
                                            <BookOpen size={12} />
                                            {quiz.book.title}
                                        </span>
                                    )}
                                </div>
                                <p className="text-zinc-400 text-sm mb-4 line-clamp-2">{quiz.description}</p>

                                <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500">
                                    <div className="flex items-center gap-1.5">
                                        <FileText size={14} />
                                        <span className="text-zinc-300 font-medium">{quiz.questions_count}</span> Questions
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={14} />
                                        <span className="text-zinc-300 font-medium">{quiz.time_limit_minutes}</span> mins
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Award size={14} />
                                        Pass: <span className="text-zinc-300 font-medium">{quiz.passing_score}%</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 ml-auto md:ml-0">
                                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                        {quiz.attempts_count} Attempts
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-zinc-800 pt-4 md:pt-0 md:pl-6">
                                <Link
                                    href={`/admin/quizzes/${quiz.id}`}
                                    className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                                >
                                    <Edit size={16} />
                                    Manage
                                </Link>
                                <button
                                    onClick={() => confirmDelete(quiz.id)}
                                    className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                    title="Delete Quiz"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
            {/* Modal */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={modalTitle}>
                <div className="space-y-4 text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border ${modalType === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                        modalType === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                            'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'
                        }`}>
                        {modalType === 'success' ? <CheckCircle size={32} /> :
                            modalType === 'error' ? <XCircle size={32} /> :
                                <AlertTriangle size={32} />}
                    </div>
                    <p className="text-zinc-300 text-lg">
                        {modalMessage}
                    </p>
                    <div className="pt-4 flex gap-3">
                        {modalType === 'confirm' ? (
                            <>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-lg font-bold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={executeDelete}
                                    className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3 rounded-lg font-bold transition-colors"
                                >
                                    Delete
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-lg font-bold transition-colors"
                            >
                                Close
                            </button>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
}
