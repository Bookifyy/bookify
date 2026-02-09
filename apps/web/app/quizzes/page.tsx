'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { Play, Clock, Award, BookOpen, CheckCircle, AlertCircle } from 'lucide-react';
import { getApiUrl } from '../../lib/utils';
import Link from 'next/link';

interface QuizAttempt {
    id: number;
    score: number;
    status: 'in_progress' | 'completed';
    created_at: string;
}

interface Quiz {
    id: number;
    title: string;
    description: string;
    book: {
        title: string;
        cover_image: string;
    } | null;
    questions_count: number;
    time_limit_minutes: number;
    passing_score: number;
    latest_attempt?: QuizAttempt;
}

export default function StudentQuizzesPage() {
    const { token } = useAuth();
    const router = useRouter();
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            fetchQuizzes();
        }
    }, [token]);

    const fetchQuizzes = async () => {
        try {
            const apiUrl = getApiUrl();
            const res = await fetch(`${apiUrl}/api/quizzes`, {
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

    if (loading) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
    );

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Quizzes</h1>
                <p className="text-zinc-400">Practice comprehension with quick quizzes generated from your books and notes.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {quizzes.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-zinc-900/50 rounded-2xl border border-zinc-800 border-dashed">
                        <Award className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No Quizzes Available Yet</h3>
                        <p className="text-zinc-500">Check back later for new quizzes added by your instructor.</p>
                    </div>
                ) : (
                    quizzes.map((quiz) => (
                        <div key={quiz.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all group">
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="space-y-1">
                                        {quiz.book && (
                                            <div className="flex items-center gap-2 text-xs font-medium text-indigo-400 mb-2">
                                                <BookOpen size={14} />
                                                <span>{quiz.book.title}</span>
                                            </div>
                                        )}
                                        <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">{quiz.title}</h3>
                                    </div>

                                    {quiz.latest_attempt ? (
                                        quiz.latest_attempt.status === 'completed' ? (
                                            <div className={`flex flex-col items-end ${quiz.latest_attempt.score >= quiz.passing_score ? 'text-green-500' : 'text-amber-500'}`}>
                                                <span className="text-2xl font-bold">{quiz.latest_attempt.score}%</span>
                                                <span className="text-[10px] uppercase font-bold tracking-wider">
                                                    {quiz.latest_attempt.score >= quiz.passing_score ? 'Passed' : 'Completed'}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full text-xs font-bold border border-amber-500/20 animate-pulse">
                                                In Progress
                                            </div>
                                        )
                                    ) : (
                                        <div className="bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full text-xs font-bold">
                                            Not Started
                                        </div>
                                    )}
                                </div>

                                <p className="text-zinc-400 text-sm mb-6 line-clamp-2 h-10">{quiz.description}</p>

                                <div className="flex items-center gap-4 text-xs font-medium text-zinc-500 mb-6">
                                    <div className="flex items-center gap-1.5 bg-zinc-950 px-2.5 py-1.5 rounded-md">
                                        <Clock size={14} />
                                        {quiz.time_limit_minutes} mins
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-zinc-950 px-2.5 py-1.5 rounded-md">
                                        <Award size={14} />
                                        Pass: {quiz.passing_score}%
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-zinc-950 px-2.5 py-1.5 rounded-md">
                                        <CheckCircle size={14} />
                                        {quiz.questions_count} Questions
                                    </div>
                                </div>

                                <Link
                                    href={`/quizzes/${quiz.id}`}
                                    className={`
                                        w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all
                                        ${quiz.latest_attempt && quiz.latest_attempt.status === 'in_progress'
                                            ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/20'
                                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20'
                                        }
                                    `}
                                >
                                    <Play size={18} fill="currentColor" />
                                    {quiz.latest_attempt && quiz.latest_attempt.status === 'in_progress' ? 'Resume Quiz' : 'Start Quiz'}
                                </Link>
                            </div>

                            {/* Progress Bar visual decoration */}
                            {quiz.latest_attempt && quiz.latest_attempt.status === 'completed' && (
                                <div className="h-1 bg-zinc-800 w-full mt-auto">
                                    <div
                                        className={`h-full ${quiz.latest_attempt.score >= quiz.passing_score ? 'bg-green-500' : 'bg-amber-500'}`}
                                        style={{ width: `${quiz.latest_attempt.score}%` }}
                                    />
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
