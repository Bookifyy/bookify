'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Save, X, CheckSquare, AlignLeft, AlertCircle } from 'lucide-react';
import { getApiUrl } from '../../../../lib/utils';
import Link from 'next/link';

interface Question {
    id: number;
    question_text: string;
    type: 'multiple_choice' | 'true_false';
    options: string[] | null;
    correct_answer: string;
    points: number;
}

interface Quiz {
    id: number;
    title: string;
    questions: Question[];
}

export default function EditQuizPage() {
    const { id } = useParams();
    const { token } = useAuth();
    const router = useRouter();
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    // New Question State
    const [qText, setQText] = useState('');
    const [qType, setQType] = useState<'multiple_choice' | 'true_false'>('multiple_choice');
    const [options, setOptions] = useState<string[]>(['', '', '', '']);
    const [correctAnswer, setCorrectAnswer] = useState('');
    const [points, setPoints] = useState(1);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (token && id) fetchQuiz();
    }, [token, id]);

    const fetchQuiz = async () => {
        try {
            const apiUrl = getApiUrl();
            const res = await fetch(`${apiUrl}/api/admin/quizzes/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setQuiz(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const payload = {
            question_text: qText,
            type: qType,
            options: qType === 'multiple_choice' ? options : null,
            correct_answer: correctAnswer,
            points
        };

        try {
            const apiUrl = getApiUrl();
            const res = await fetch(`${apiUrl}/api/admin/quizzes/${id}/questions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                await fetchQuiz();
                setShowAddModal(false);
                resetForm();
            } else {
                alert('Failed to add question');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteQuestion = async (questionId: number) => {
        if (!confirm('Delete this question?')) return;
        try {
            const apiUrl = getApiUrl();
            await fetch(`${apiUrl}/api/admin/quizzes/${id}/questions/${questionId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchQuiz();
        } catch (err) {
            console.error(err);
        }
    };

    const resetForm = () => {
        setQText('');
        setQType('multiple_choice');
        setOptions(['', '', '', '']);
        setCorrectAnswer('');
        setPoints(1);
    };

    if (loading) return <div className="p-8 text-zinc-500">Loading...</div>;
    if (!quiz) return <div className="p-8 text-red-500">Quiz not found</div>;

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center gap-4">
                <Link href="/admin/quizzes" className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div className="flex-1">
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Editing Quiz</p>
                    <h1 className="text-2xl font-bold text-white">{quiz.title}</h1>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold transition-colors"
                >
                    <Plus size={20} />
                    Add Question
                </button>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
                {quiz.questions.length === 0 ? (
                    <div className="text-center py-12 bg-zinc-900/50 rounded-xl border border-zinc-800 border-dashed">
                        <AlertCircle className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-white mb-1">No questions yet</h3>
                        <p className="text-zinc-500 text-sm">Add questions to publish this quiz.</p>
                    </div>
                ) : (
                    quiz.questions.map((q, idx) => (
                        <div key={q.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 relative group">
                            <button
                                onClick={() => handleDeleteQuestion(q.id)}
                                className="absolute top-4 right-4 p-2 text-zinc-600 hover:text-red-400 hover:bg-zinc-800 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <Trash2 size={18} />
                            </button>

                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-500 text-sm flex-shrink-0">
                                    {idx + 1}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${q.type === 'multiple_choice' ? 'bg-purple-500/10 text-purple-400' : 'bg-teal-500/10 text-teal-400'}`}>
                                            {q.type === 'multiple_choice' ? 'Multiple Choice' : 'True / False'}
                                        </span>
                                        <span className="text-xs text-zinc-500 font-medium">{q.points} Points</span>
                                    </div>
                                    <p className="text-white font-medium text-lg mb-4">{q.question_text}</p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {q.type === 'multiple_choice' ? (
                                            q.options?.map((opt, i) => (
                                                <div key={i} className={`px-4 py-3 rounded-lg border text-sm ${opt === q.correct_answer ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-zinc-950 border-zinc-800 text-zinc-400'}`}>
                                                    {opt}
                                                </div>
                                            ))
                                        ) : (
                                            ['True', 'False'].map(opt => (
                                                <div key={opt} className={`px-4 py-3 rounded-lg border text-sm ${opt === q.correct_answer ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-zinc-950 border-zinc-800 text-zinc-400'}`}>
                                                    {opt}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Question Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-zinc-800 flex items-center justify-between sticky top-0 bg-zinc-900 z-10">
                            <h2 className="text-xl font-bold text-white">Add Question</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleAddQuestion} className="p-6 space-y-6">
                            {/* Question Text */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Question Text</label>
                                <textarea
                                    required
                                    value={qText}
                                    onChange={e => setQText(e.target.value)}
                                    className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    rows={3}
                                    placeholder="Enter your question here..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300">Type</label>
                                    <select
                                        value={qType}
                                        onChange={e => {
                                            setQType(e.target.value as any);
                                            setCorrectAnswer(''); // Reset correct answer on type change
                                        }}
                                        className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    >
                                        <option value="multiple_choice">Multiple Choice</option>
                                        <option value="true_false">True / False</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300">Points</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={points}
                                        onChange={e => setPoints(parseInt(e.target.value))}
                                        className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    />
                                </div>
                            </div>

                            {/* Options Logic */}
                            {qType === 'multiple_choice' ? (
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-zinc-300">Options (Select the correct one)</label>
                                    {options.map((opt, i) => (
                                        <div key={i} className="flex gap-3">
                                            <input
                                                type="radio"
                                                name="correct_answer"
                                                checked={correctAnswer === opt && opt !== ''}
                                                onChange={() => setCorrectAnswer(opt)}
                                                disabled={opt === ''}
                                                className="mt-3 w-4 h-4 accent-indigo-500"
                                            />
                                            <input
                                                type="text"
                                                required
                                                value={opt}
                                                onChange={e => {
                                                    const newOpts = [...options];
                                                    newOpts[i] = e.target.value;
                                                    setOptions(newOpts);
                                                    // If this was the correct answer, update it
                                                    if (correctAnswer === opt && opt !== '') setCorrectAnswer(e.target.value);
                                                }}
                                                className="flex-1 bg-black border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                                placeholder={`Option ${i + 1}`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-zinc-300">Correct Answer</label>
                                    <div className="flex gap-4">
                                        {['True', 'False'].map(val => (
                                            <label key={val} className={`
                                                flex-1 cursor-pointer rounded-lg border border-zinc-800 p-4 text-center transition-all
                                                ${correctAnswer === val ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-black text-zinc-400 hover:bg-zinc-800'}
                                            `}>
                                                <input
                                                    type="radio"
                                                    name="correct_answer"
                                                    value={val}
                                                    checked={correctAnswer === val}
                                                    onChange={() => setCorrectAnswer(val)}
                                                    className="hidden"
                                                />
                                                <span className="font-bold">{val}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={submitting || !correctAnswer}
                                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-bold transition-all"
                                >
                                    {submitting ? 'Saving...' : 'Save Question'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
