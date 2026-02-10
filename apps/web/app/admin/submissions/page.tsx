'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext'; // Adjusted path
import { getApiUrl } from '../../lib/utils'; // Adjusted path
import Link from 'next/link';
import { Loader2, Search, Filter, Eye, CheckCircle, Clock } from 'lucide-react';

interface Attempt {
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
    };
    status: string;
    score: number | null;
    started_at: string;
    completed_at: string;
}

export default function AdminSubmissionsPage() {
    const { token } = useAuth();
    const [attempts, setAttempts] = useState<Attempt[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    useEffect(() => {
        if (token) {
            fetchSubmissions();
        }
    }, [token]);

    const fetchSubmissions = async () => {
        try {
            const apiUrl = getApiUrl();
            const res = await fetch(`${apiUrl}/api/admin/submissions`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setAttempts(data);
            }
        } catch (error) {
            console.error('Failed to fetch submissions', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredAttempts = attempts.filter(a => {
        const matchesSearch =
            a.user.name.toLowerCase().includes(search.toLowerCase()) ||
            a.quiz.title.toLowerCase().includes(search.toLowerCase()) ||
            (a.quiz.book?.title || '').toLowerCase().includes(search.toLowerCase());

        const matchesStatus = filterStatus === 'all' || a.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-indigo-500" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold font-serif text-white">Quiz Submissions</h1>
            </div>

            {/* Filters */}
            <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search student, quiz, or book..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-black border border-zinc-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Filter size={18} className="text-zinc-500" />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-black border border-zinc-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending_review">Pending Review</option>
                        <option value="completed">Graded / Completed</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-zinc-950 text-zinc-400 text-xs uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4 font-medium">Student</th>
                            <th className="px-6 py-4 font-medium">Quiz Info</th>
                            <th className="px-6 py-4 font-medium">Submitted</th>
                            <th className="px-6 py-4 font-medium">Status/Score</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {filteredAttempts.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                                    No submissions found matching your filters.
                                </td>
                            </tr>
                        ) : (
                            filteredAttempts.map((attempt) => (
                                <tr key={attempt.id} className="hover:bg-zinc-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-white">{attempt.user.name}</div>
                                        <div className="text-xs text-zinc-500">{attempt.user.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-white">{attempt.quiz.title}</div>
                                        {attempt.quiz.book && (
                                            <div className="text-xs text-indigo-400 mt-0.5">
                                                Book: {attempt.quiz.book.title}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-zinc-400 text-sm">
                                        {new Date(attempt.completed_at).toLocaleDateString()}
                                        <div className="text-xs opacity-60">
                                            {new Date(attempt.completed_at).toLocaleTimeString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {attempt.status === 'pending_review' ? (
                                            <span className="inline-flex items-center gap-1 bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded text-xs font-bold border border-yellow-500/20">
                                                <Clock size={12} /> Pending Review
                                            </span>
                                        ) : (
                                            <div className="flex flex-col">
                                                <span className="inline-flex items-center gap-1 bg-green-500/10 text-green-500 px-2 py-1 rounded text-xs font-bold border border-green-500/20 w-fit">
                                                    <CheckCircle size={12} /> Graded
                                                </span>
                                                <span className="text-sm font-bold text-white mt-1">
                                                    {attempt.score}%
                                                </span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={`/admin/submissions/${attempt.id}`}
                                            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-colors"
                                        >
                                            <Eye size={16} />
                                            {attempt.status === 'pending_review' ? 'Grade' : 'View'}
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
