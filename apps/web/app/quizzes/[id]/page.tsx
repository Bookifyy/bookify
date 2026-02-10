'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import { Clock, ArrowLeft, CheckCircle, AlertTriangle, Loader2, Home, Download, FileText, Upload } from 'lucide-react';
import { getApiUrl } from '../../lib/utils';
import Link from 'next/link';
import { Modal } from '../../components/Modal';

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
    passing_score: number;
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
    const [timeOffset, setTimeOffset] = useState<number>(0); // Client Time - Server Time

    // Modal State
    const [showSubmitModal, setShowSubmitModal] = useState(false);

    useEffect(() => {
        if (token && id) {
            fetchQuizDetails();
        }
    }, [token, id]);

    // Timer Logic (Robust with Server Sync)
    const expiryHandled = useRef(false);

    useEffect(() => {
        if (!quiz?.active_attempt || quiz.active_attempt.status !== 'in_progress') return;

        const limitSeconds = quiz.time_limit_minutes * 60;
        const startedAt = new Date(quiz.active_attempt.started_at).getTime();

        const tick = () => {
            const now = Date.now() - timeOffset; // Adjusted to Server Time

            const elapsed = Math.floor((now - startedAt) / 1000);
            const remaining = Math.max(0, limitSeconds - elapsed);

            setTimeLeft(remaining);

            if (remaining <= 0) {
                // Auto submit
                if (!submitting && !submittedData && !expiryHandled.current) {
                    expiryHandled.current = true; // Prevent multiple calls
                    submitToApi(true);
                }
            }
        };

        tick(); // Initial call
        const timer = setInterval(tick, 1000);

        return () => clearInterval(timer);
    }, [quiz?.active_attempt, timeOffset, submitting, submittedData]);

    const fetchQuizDetails = async () => {
        try {
            const apiUrl = getApiUrl();
            const res = await fetch(`${apiUrl}/api/quizzes/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();

                // Handle new response structure with server_time
                const quizData = data.quiz || data; // Fallback if API changed
                const serverTimeStr = data.server_time;

                setQuiz(quizData);

                if (serverTimeStr) {
                    const serverTime = new Date(serverTimeStr).getTime();
                    const clientTime = Date.now();
                    setTimeOffset(clientTime - serverTime); // Offset to subtract from Client Time to get Server Time
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

    const handleTriggerSubmit = () => {
        setShowSubmitModal(true);
    };

    const submitToApi = async (auto = false) => {
        if (!quiz || submitting || submittedData) return;

        setSubmitting(true);
        setShowSubmitModal(false);

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
                    'Accept': 'application/json',
                    // Content-Type is set automatically by FormData
                },
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                setSubmittedData(data);
                window.scrollTo(0, 0);
            } else {
                const errData = await res.json().catch(() => ({ message: 'Submission failed' }));

                // If auto-submit fails (likely due to missing file), we shouldn't just alert and leave them stuck.
                // We should show a modal explaining they ran out of time and MUST upload.
                if (auto) {
                    // Reset submitting to allow manual retry, but keep expiryHandled true to strict auto-loop
                    // expiryHandled is ref, so we don't change it here.
                    // But maybe we should reset it if we want them to *try* again? 
                    // No, manual submit should be allowed.
                    setError(errData.message || 'Time expired. Submission failed (Missing File?). Please upload and submit manually.');
                } else {
                    alert(`Submission failed: ${errData.message || 'Unknown error'}`);
                }
            }
        } catch (err) {
            console.error(err);
            if (!auto) alert('Connection error during submission');
            else setError('Time expired. Connection error. Please try submitting manually.');
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

    // Validation Check for Modal
    const isAttachmentRequired = quiz?.attachment_path ? true : false;
    const isAttachmentMissing = isAttachmentRequired && !attachment;

    // Logic Rules as per user request:
    // 1. If admin provided file (hasAttachment) -> Student MUST submit file.
    // 2. If admin provided ONLY questions -> Student NOT allowed to submit file.
    // 3. If Admin provided Only questions -> Questions are required? (Implicit)

    // Check if we should block submission
    const blockSubmission = isAttachmentMissing;

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>;
    if (error) return <div className="p-8 text-red-500 text-center">{error}</div>;
    if (!quiz) return null;

    // --- RESULTS VIEW ---
    if (submittedData) {
        const isPending = submittedData.status === 'pending_review';
        const passed = submittedData.passed;

        return (
            <div className="max-w-2xl mx-auto p-8 text-center space-y-8 min-h-[80vh] flex flex-col items-center justify-center">
                <div className="mb-6">
                    {isPending ? (
                        <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                            <Clock size={48} className="text-blue-500" />
                        </div>
                    ) : passed ? (
                        <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                            <CheckCircle size={48} className="text-green-500" />
                        </div>
                    ) : (
                        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                            <AlertTriangle size={48} className="text-red-500" />
                        </div>
                    )}

                    <h1 className="text-4xl font-bold text-white mb-2">
                        {isPending ? 'Submitted for Review' : (passed ? 'Quiz Passed!' : 'Quiz Failed')}
                    </h1>

                    {isPending ? (
                        <p className="text-zinc-400 max-w-md mx-auto">
                            Your submission has been received. Your instructor will grade your file submission and results will be available shortly.
                        </p>
                    ) : (
                        <>
                            <p className="text-zinc-400">You scored</p>
                            <div className="text-6xl font-black text-white mt-2 mb-2">{submittedData.score}%</div>
                        </>
                    )}
                </div>

                <div className="flex gap-4 w-full max-w-sm">
                    <Link href="/quizzes" className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl font-bold transition-colors">
                        Back to Quizzes
                    </Link>
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
                    </div>
                </div>

                <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 max-w-lg mx-auto text-left space-y-4">
                    <h3 className="font-bold text-white">Instructions:</h3>
                    <ul className="list-disc list-inside text-zinc-400 space-y-2 text-sm">
                        <li>This is a timed quiz. The timer starts immediately when you click Start.</li>
                        <li>You cannot pause the timer once it starts.</li>
                        <li>Answers are automatically submitted when time runs out.</li>
                        {quiz.attachment_path && (
                            <li className="text-indigo-400 font-semibold">
                                Check for an attached Question Paper. You MUST upload an Answer Sheet to submit.
                            </li>
                        )}
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

            {/* Submit Modal */}
            <Modal isOpen={showSubmitModal} onClose={() => setShowSubmitModal(false)} title="Submit Quiz?">
                <div className="space-y-4">
                    {isAttachmentMissing ? (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex gap-3 text-red-500">
                            <AlertTriangle className="flex-shrink-0" size={20} />
                            <div>
                                <p className="font-bold">Missing File Attachment</p>
                                <p className="text-sm mt-1">
                                    This quiz requires you to upload an answer sheet file before submitting.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-zinc-300">
                            Are you sure you want to finish and submit your quiz?
                            {quiz.questions && quiz.questions.length > 0 && (
                                <span className="block mt-2 text-sm text-zinc-400">
                                    You have answered {Object.keys(answers).length} of {quiz.questions.length} questions.
                                </span>
                            )}
                            {attachment && (
                                <span className="block mt-2 text-sm text-green-400 flex items-center gap-2">
                                    <FileText size={14} /> File '{attachment.name}' attached.
                                </span>
                            )}
                        </p>
                    )}

                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={() => setShowSubmitModal(false)}
                            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2.5 rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => submitToApi(false)}
                            disabled={blockSubmission}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-bold transition-colors"
                        >
                            Confirm Submit
                        </button>
                    </div>
                </div>
            </Modal>

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
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex items-center justify-between flex-wrap gap-4">
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
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center font-bold text-zinc-400 text-sm flex-shrink-0">
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg text-white font-medium leading-relaxed">{q.question_text}</h3>
                                    <span className="text-xs text-zinc-500 font-semibold mt-1 block">{q.points} Points</span>
                                </div>
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
            {/* Show this section if Attachment path exists (Requirement 2 & 3) OR if it's optional but available? 
                User said: "if admin brought only questions the student is not allowed to submit a pdf".
                So hide this if (!quiz.attachment_path && quiz.questions.length > 0).
            */}
            {(!quiz.questions || quiz.questions.length === 0 || quiz.attachment_path) && (
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                    <div className="mb-4">
                        <h3 className="text-lg text-white font-medium mb-1 flex items-center gap-2">
                            <Upload size={20} />
                            Upload Answer Sheet
                            {quiz.attachment_path && <span className="text-xs text-red-500 bg-red-500/10 px-2 py-0.5 rounded ml-2">REQUIRED</span>}
                        </h3>
                        <p className="text-zinc-400 text-sm">
                            {quiz.attachment_path
                                ? "You strictly need to upload your answer sheet (PDF/Image) to submit."
                                : "Attach your work in a PDF, Word, or Image file."}
                        </p>
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
            )}

            {/* Footer Actions */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-800 z-50 flex justify-center">
                <button
                    onClick={handleTriggerSubmit}
                    disabled={submitting}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-12 py-3 rounded-full font-bold shadow-lg shadow-indigo-900/20 transition-all w-full max-w-md"
                >
                    {submitting ? 'Submitting...' : 'Submit Quiz'}
                </button>
            </div>
        </div>
    );
}
