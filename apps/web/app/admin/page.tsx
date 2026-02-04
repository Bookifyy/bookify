'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

interface User {
    id: number;
    name: string;
    email: string;
    roles: { name: string }[];
}

export default function AdminDashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();

    // Dashboard Stats State
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalBooks: 0,
        activeUsers: 0,
        premiumUsers: 0
    });

    // Fake data for visual proof-of-concept (replace with real API later)
    useEffect(() => {
        if (!loading && user) {
            // Simulate fetching stats
            setTimeout(() => {
                setStats({
                    totalUsers: 1243,
                    totalBooks: 85,
                    activeUsers: 342,
                    premiumUsers: 128
                });
            }, 500);
        }
    }, [loading, user]);

    if (loading) return <div className="p-8 text-zinc-500">Loading dashboard...</div>;

    const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden group hover:border-zinc-700 transition-all">
            <div className={`absolute top-4 right-4 p-3 rounded-xl bg-${color}-500/10 text-${color}-500 group-hover:bg-${color}-500/20 transition-colors`}>
                <Icon size={24} />
            </div>
            <p className="text-zinc-500 text-sm font-medium uppercase tracking-wider mb-1">{title}</p>
            <h3 className="text-3xl font-serif font-bold text-white mb-4">{value.toLocaleString()}</h3>
            <div className="flex items-center gap-2 text-xs">
                <span className="text-green-500 font-bold bg-green-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                    {change}
                </span>
                <span className="text-zinc-600">vs last month</span>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Dashboard</h1>
                    <p className="text-zinc-400">Welcome back, Administrator. Here's what's happening.</p>
                </div>
                <button
                    onClick={() => { router.push('/admin/books/create') }} // Quick action
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20"
                >
                    + Upload New Book
                </button>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    change="+12%"
                    icon={require('lucide-react').Users}
                    color="blue"
                />
                <StatCard
                    title="Total Books"
                    value={stats.totalBooks}
                    change="+4%"
                    icon={require('lucide-react').BookOpen}
                    color="purple"
                />
                <StatCard
                    title="Active Readers"
                    value={stats.activeUsers}
                    change="+18%"
                    icon={require('lucide-react').Activity}
                    color="green"
                />
                <StatCard
                    title="Premium Subs"
                    value={stats.premiumUsers}
                    change="+8%"
                    icon={require('lucide-react').CreditCard}
                    color="amber"
                />
            </div>

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Users */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white">Recent Signups</h3>
                        <button onClick={() => router.push('/admin/users')} className="text-xs font-bold text-indigo-400 hover:text-indigo-300">View All</button>
                    </div>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 text-sm font-bold">
                                        U{i}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-zinc-200">User {i}</p>
                                        <p className="text-xs text-zinc-500">user{i}@example.com</p>
                                    </div>
                                </div>
                                <span className="text-xs text-zinc-600">2h ago</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* System Status (Placeholder for Security/Audit Phase) */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6">System Status</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-zinc-800">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-sm font-medium text-zinc-300">Database Connection</span>
                            </div>
                            <span className="text-xs font-bold text-green-500">Operational</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-zinc-800">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-sm font-medium text-zinc-300">API Gateway</span>
                            </div>
                            <span className="text-xs font-bold text-green-500">Operational</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-zinc-800">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-sm font-medium text-zinc-300">Storage Services</span>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-bold text-green-500 block">Operational</span>
                                <span className="text-[10px] text-zinc-600">45% Used</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
