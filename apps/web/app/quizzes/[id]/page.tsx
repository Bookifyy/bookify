'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import { Clock, ArrowLeft, CheckCircle, AlertTriangle, Loader2, Home, Download } from 'lucide-react';
import { getApiUrl } from '../../lib/utils';
import Link from 'next/link';

interface Question {
    id: number;
    question_text: string;
    type: 'multiple_choice' | 'true_false';
    options: string[] | null;
    points: number;
}

interface Quiz {
    id: number;
    title: string;
    time_limit_minutes: number;
    questions?: Question[];
    active_attempt?: {
        id: number;
        started_at: string;
        status: string;
    };
    attachment_path?: string;
}

export default function QuizTakingPage() {
    const { id } = useParams();
    const { token } = useAuth();
    const router = useRouter();

    // State
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [timeLeft, setTimeLeft] = useState<number | null>(null); // in seconds
    const [submitting, setSubmitting] = useState(false);
    const [submittedData, setSubmittedData] = useState<any>(null); // To show results
    const [error, setError] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);

    useEffect(() => {
        if (token && id) {
            fetchQuizDetails();
        }
    }, [token, id]);

    // Timer Logic
    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev !== null && prev <= 1) {
                    clearInterval(timer);
                    handleSubmit(true); // Auto submit
                    return 0;
                }
                return prev !== null ? prev - 1 : null;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const fetchQuizDetails = async () => {
        try {
            const apiUrl = getApiUrl();
            const res = await fetch(`${apiUrl}/api/quizzes/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setQuiz(data);

                // If attempt exists, calculate time left
                if (data.active_attempt) {
                    const startedAt = new Date(data.active_attempt.started_at).getTime();
                    const now = new Date().getTime();
                    const limitMs = data.time_limit_minutes * 60 * 1000;
                    const elapsed = now - startedAt;
                    const remaining = Math.max(0, Math.floor((limitMs - elapsed) / 1000));

                    setTimeLeft(remaining);
                }
            } else {
                setError('Failed to load quiz');
            }
        } catch (err) {
            setError('Connection error');
        } finally {
            setLoading(false);
        }
    };

    const startQuiz = async () => {
        setLoading(true);
        try {
            const apiUrl = getApiUrl();
            const res = await fetch(`${apiUrl}/api/quizzes/${id}/start`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                // Refresh to get questions and timer
                await fetchQuizDetails();
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to start quiz');
                setLoading(false);
            }
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleAnswerChange = (questionId: number, value: string) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    const handleSubmit = async (auto = false) => {
        if (!quiz || submitting || submittedData) return;

        if (!auto && !confirm('Are you sure you want to submit?')) return;

        setSubmitting(true);
        try {
            const apiUrl = getApiUrl();

            const formData = new FormData();

            // Format answers for API
            const formattedAnswers = Object.entries(answers).map(([qId, val]) => ({
                question_id: parseInt(qId),
                user_answer: val
            }));

            // Append explicit answers if any
            if (formattedAnswers.length > 0) {
                formattedAnswers.forEach((ans, index) => {
                    formData.append(`answers[${index}][question_id]`, ans.question_id.toString());
                    formData.append(`answers[${index}][user_answer]`, ans.user_answer);
                });
            }

            if (attachment) {
                formData.append('attachment', attachment);
            }

            const res = await fetch(`${apiUrl}/api/quizzes/${id}/submit`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // Content-Type is set automatically by FormData
                },
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                setSubmittedData(data);
                window.scrollTo(0, 0);
            } else {
                const errData = await res.json();
                alert(`Submission failed: ${errData.message || 'Unknown error'}`);
            }
        } catch (err) {
            console.error(err);
            alert('Connection error during submission');
        } finally {
            setSubmitting(false);
        }
    };

    // Format seconds to MM:SS
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>;
    if (error) return <div className="p-8 text-red-500 text-center">{error}</div>;
    if (!quiz) return null;

    // --- RESULTS VIEW ---
    if (submittedData) {
        return (
            <div className="max-w-2xl mx-auto p-8 text-center space-y-8 min-h-[80vh] flex flex-col items-center justify-center">
                <div className="mb-6">
                    {submittedData.passed ? (
                        <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                            <CheckCircle size={48} className="text-green-500" />
                        </div>
                    ) : (
                        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                            <AlertTriangle size={48} className="text-red-500" />
                        </div>
                    )}
                    <h1 className="text-4xl font-bold text-white mb-2">{submittedData.passed ? 'Quiz Passed!' : 'Quiz Failed'}</h1>
                    <p className="text-zinc-400">You scored</p>
                    <div className="text-6xl font-black text-white mt-2 mb-2">{submittedData.score}%</div>
                </div>

                <div className="flex gap-4 w-full max-w-sm">
                    <Link href="/quizzes" className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl font-bold transition-colors">
                        Back to Quizzes
                    </Link>
                    {/* Could add a 'Review Answers' button here later */}
                </div>
            </div>
        );
    }

    // --- START SCREEN ---
    if (!quiz.active_attempt) {
        return (
            <div className="max-w-2xl mx-auto p-8 text-center space-y-8 min-h-[80vh] flex flex-col items-center justify-center">
                <div className="space-y-4">
                    <h1 className="text-4xl font-bold text-white">{quiz.title}</h1>
                    <div className="flex items-center justify-center gap-6 text-zinc-400">
                        <div className="flex items-center gap-2">
                            <Clock size={20} />
                            <span>{quiz.time_limit_minutes} Minutes</span>
                        </div>
                        {/* <div className="flex items-center gap-2">
                            <HelpCircle size={20} />
                            <span>Questions</span>
                        </div> */}
                    </div>
                </div>

                <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 max-w-lg mx-auto text-left space-y-4">
                    <h3 className="font-bold text-white">Instructions:</h3>
                    <ul className="list-disc list-inside text-zinc-400 space-y-2 text-sm">
                        <li>This is a timed quiz. The timer starts immediately when you click Start.</li>
                        <li>You cannot pause the timer once it starts.</li>
                        <li>Answers are automatically submitted when time runs out.</li>
                        <li>Do not refresh the page during the quiz.</li>
                    </ul>
                </div>

                <button
                    onClick={startQuiz}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-12 py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-900/20 transition-all transform hover:scale-105"
                >
                    Start Quiz Now
                </button>

                <Link href="/quizzes" className="text-zinc-500 hover:text-zinc-300 text-sm">
                    Cancel and go back
                </Link>
            </div>
        );
    }

    // --- ACTIVE QUIZ VIEW ---
    return (
        <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-8 pb-32">
            {/* Header / Timer */}
            <div className="sticky top-4 z-40 bg-black/80 backdrop-blur-md border border-zinc-800 rounded-xl p-4 flex items-center justify-between shadow-2xl">
                <div className="font-bold text-white truncate max-w-[200px]">{quiz.title}</div>
                <div className={`flex items-center gap-2 font-mono text-xl font-bold ${timeLeft && timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-indigo-400'}`}>
                    <Clock size={24} />
                    {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
                </div>
            </div>

            {/* Question Paper Download */}
            {quiz.attachment_path && (
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex items-center justify-between">
                    <div>
                        <h3 className="text-lg text-white font-medium mb-1">Question Paper</h3>
                        <p className="text-zinc-400 text-sm">Download the attached file to view questions/instructions.</p>
                    </div>
                    <a
                        href={`${getApiUrl()}/storage/${quiz.attachment_path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
                    >
                        <Download size={18} />
                        Download PDF
                    </a>
                </div>
            )}

            {/* Questions Form */}
            {quiz.questions && quiz.questions.length > 0 ? (
                <div className="space-y-8">
                    {quiz.questions.map((q, index) => (
                        <div key={q.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                            {/* ... existing question rendering ... */}
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center font-bold text-zinc-400 text-sm flex-shrink-0">
                                    {index + 1}
                                </div>
                                <h3 className="text-lg text-white font-medium leading-relaxed">{q.question_text}</h3>
                            </div>

                            <div className="space-y-3 ml-12">
                                {q.type === 'multiple_choice' ? (
                                    q.options?.map((opt, i) => (
                                        <label
                                            key={i}
                                            className={`
                                                flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all
                                                ${answers[q.id] === opt
                                                    ? 'bg-indigo-600/10 border-indigo-500 text-white'
                                                    : 'bg-black border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:border-zinc-700'}
                                            `}
                                        >
                                            <div className={`
                                                w-5 h-5 rounded-full border flex items-center justify-center
                                                ${answers[q.id] === opt ? 'border-indigo-500' : 'border-zinc-600'}
                                            `}>
                                                {answers[q.id] === opt && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />}
                                            </div>
                                            <input
                                                type="radio"
                                                name={`q-${q.id}`}
                                                value={opt}
                                                checked={answers[q.id] === opt}
                                                onChange={() => handleAnswerChange(q.id, opt)}
                                                className="hidden"
                                            />
                                            <span className="text-sm md:text-base">{opt}</span>
                                        </label>
                                    ))
                                ) : (
                                    ['True', 'False'].map(val => (
                                        <label
                                            key={val}
                                            className={`
                                                flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all
                                                ${answers[q.id] === val
                                                    ? 'bg-indigo-600/10 border-indigo-500 text-white'
                                                    : 'bg-black border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:border-zinc-700'}
                                            `}
                                        >
                                            <div className={`
                                                w-5 h-5 rounded-full border flex items-center justify-center
                                                ${answers[q.id] === val ? 'border-indigo-500' : 'border-zinc-600'}
                                            `}>
                                                {answers[q.id] === val && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />}
                                            </div>
                                            <input
                                                type="radio"
                                                name={`q-${q.id}`}
                                                value={val}
                                                checked={answers[q.id] === val}
                                                onChange={() => handleAnswerChange(q.id, val)}
                                                className="hidden"
                                            />
                                            <span className="font-bold">{val}</span>
                                        </label>
                                    ))
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl text-center">
                    <p className="text-zinc-400">No interactive questions in this quiz. Please refer to the Question Paper above.</p>
                </div>
            )}

            {/* Answer Sheet Upload */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                <div className="mb-4">
                    <h3 className="text-lg text-white font-medium mb-1">Upload Answer Sheet (Optional)</h3>
                    <p className="text-zinc-400 text-sm">Attach your work in a PDF, Word, or Image file.</p>
                </div>
                <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
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

            {/* Footer Actions */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-800 z-50 flex justify-center">
                <button
                    onClick={() => handleSubmit(false)}
                    disabled={submitting}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-12 py-3 rounded-full font-bold shadow-lg shadow-indigo-900/20 transition-all w-full max-w-md"
                >
                    {submitting ? 'Submitting...' : 'Submit Quiz'}
                </button>
            </div>
        </div>
    );
}
