'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import { getApiUrl } from '../../../lib/utils';
import { Loader2, ArrowLeft, Download, Save, FileText, User, Calendar, BookOpen, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { Modal } from '../../../components/Modal';

interface AttemptDetail {
    id: number;
    user: {
        id: number;
        name: string;
        email: string;
    };
    quiz: {
        id: number;
        title: string;
        book?: { title: string };
        questions: {
            id: number;
            question_text: string;
            points: number;
            correct_answer: string;
        }[];
    };
    answers: {
        question_id: number;
        user_answer: string;
        is_correct: boolean;
    }[];
    status: string;
    score: number | null;
    started_at: string;
    completed_at: string;
    attachment_path: string | null;
}

export default function AdminGradingPage() {
    const { id } = useParams();
    const { token } = useAuth();
    const router = useRouter();

    const [attempt, setAttempt] = useState<AttemptDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [grade, setGrade] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (token && id) {
            fetchSubmission();
        }
    }, [token, id]);

    const fetchSubmission = async () => {
        try {
            const apiUrl = getApiUrl();
            const res = await fetch(`${apiUrl}/api/admin/submissions/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setAttempt(data);
                // Pre-fill grade if exists
                if (data.score !== null) {
                    setGrade(data.score.toString());
                }
            }
        } catch (error) {
            console.error('Failed to fetch submission', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGradeSubmit = async () => {
        if (!attempt) return;

        const scoreNum = parseFloat(grade);
        if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
            alert('Please enter a valid score between 0 and 100');
            return;
        }

        setSubmitting(true);
        try {
            const apiUrl = getApiUrl();
            const res = await fetch(`${apiUrl}/api/admin/submissions/${id}/grade`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ score: scoreNum })
            });

            if (res.ok) {
                alert('Grade saved successfully!');
                router.push('/admin/submissions');
            } else {
                alert('Failed to save grade');
            }
        } catch (error) {
            console.error(error);
            alert('Connection error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-indigo-500" /></div>;
    if (!attempt) return <div className="p-8 text-center text-red-500">Submission not found</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin/submissions" className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-white">Grading Submission #{attempt.id}</h1>
                    <p className="text-zinc-400 text-sm">Review student work and assign a grade.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Submission Details */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Student & Quiz Info */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
                        <div className="flex gap-4 items-start">
                            <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-500">
                                <User size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">{attempt.user.name}</h3>
                                <p className="text-zinc-400 text-sm">{attempt.user.email}</p>
                            </div>
                        </div>
                        <div className="h-px bg-zinc-800 my-4" />
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="block text-zinc-500 mb-1">Quiz Title</span>
                                <span className="text-white font-medium flex items-center gap-2">
                                    <FileText size={14} /> {attempt.quiz.title}
                                </span>
                            </div>
                            <div>
                                <span className="block text-zinc-500 mb-1">Book</span>
                                <span className="text-white font-medium flex items-center gap-2">
                                    <BookOpen size={14} /> {attempt.quiz.book?.title || 'General Quiz'}
                                </span>
                            </div>
                            <div>
                                <span className="block text-zinc-500 mb-1">Submitted At</span>
                                <span className="text-white font-medium flex items-center gap-2">
                                    <Calendar size={14} /> {new Date(attempt.completed_at).toLocaleString()}
                                </span>
                            </div>
                            <div>
                                <span className="block text-zinc-500 mb-1">Status</span>
                                <span className={`
                                    inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border
                                    ${attempt.status === 'completed'
                                        ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                        : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}
                                `}>
                                    {attempt.status.replace('_', ' ').toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Attachment Viewer */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <FileText size={20} className="text-indigo-400" />
                            Submitted Answer Sheet
                        </h3>

                        {attempt.attachment_path ? (
                            <div className="bg-black border border-zinc-800 rounded-lg p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-zinc-800 rounded flex items-center justify-center text-zinc-400">
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white break-all">
                                            {attempt.attachment_path.split('/').pop()}
                                        </p>
                                        <p className="text-xs text-zinc-500">Document/Image</p>
                                    </div>
                                </div>
                                <a
                                    href={`${getApiUrl()}/storage/${attempt.attachment_path}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                                >
                                    <Download size={16} />
                                    Download
                                </a>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-zinc-500 border-2 border-dashed border-zinc-800 rounded-lg">
                                No file attached for this submission.
                            </div>
                        )}
                    </div>

                    {/* Question Responses (if any) */}
                    {attempt.quiz.questions.length > 0 && (
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6">
                            <h3 className="text-lg font-bold text-white mb-4">Question Responses</h3>
                            {attempt.quiz.questions.map((q, index) => {
                                const answer = attempt.answers.find(a => a.question_id === q.id);
                                return (
                                    <div key={q.id} className="border-b border-zinc-800 pb-4 last:border-0 last:pb-0">
                                        <p className="font-medium text-zinc-200 mb-2">
                                            <span className="text-zinc-500 mr-2">{index + 1}.</span>
                                            {q.question_text}
                                            <span className="text-xs text-zinc-500 ml-2">({q.points} pts)</span>
                                        </p>
                                        <div className="flex items-center gap-2 text-sm ml-6">
                                            <span className="text-zinc-500">Student Answer:</span>
                                            <span className={`font-mono ${answer?.user_answer ? 'text-white' : 'text-zinc-600 italic'}`}>
                                                {answer?.user_answer || 'No Answer'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm ml-6 mt-1">
                                            <span className="text-zinc-500">Correct Answer:</span>
                                            <span className="font-mono text-green-400">
                                                {q.correct_answer}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Right Column: Grading Action */}
                <div className="lg:col-span-1">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 sticky top-6">
                        <h3 className="text-xl font-bold text-white mb-4">Grading</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">
                                    Final Score (0-100)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={grade}
                                        onChange={e => setGrade(e.target.value)}
                                        className="w-full bg-black border border-zinc-700 text-white p-3 rounded-lg text-2xl font-bold text-center focus:outline-none focus:border-indigo-500"
                                        placeholder="0"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">%</span>
                                </div>
                            </div>

                            <button
                                onClick={handleGradeSubmit}
                                disabled={submitting || grade === ''}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                            >
                                {submitting ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                                {submitting ? 'Saving...' : 'Submit Grade'}
                            </button>

                            <p className="text-xs text-zinc-500 text-center mt-4">
                                This will mark the quiz as "Graded" and the student will see this score immediately.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
            {/* Notification Modal */}
            <Modal isOpen={showModal} onClose={() => {
                setShowModal(false);
                if (modalType === 'success') router.push('/admin/submissions');
            }} title={modalTitle}>
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
                            onClick={() => {
                                setShowModal(false);
                                if (modalType === 'success') router.push('/admin/submissions');
                            }}
                            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-lg font-bold transition-colors"
                        >
                            {modalType === 'success' ? 'Continue' : 'Close'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
