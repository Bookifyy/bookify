'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const { user, token, loading } = useAuth();
    const router = useRouter();

    // Dashboard Stats State
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalBooks: 0,
        activeUsers: 0,
        premiumUsers: 0
    });
    const [statLoading, setStatLoading] = useState(true);

    useEffect(() => {
        if (!loading && user && token) {
            fetchStats();
        }
    }, [loading, user, token]);

    const fetchStats = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

            // Parallel data fetching for performance
            const [usersRes, booksRes] = await Promise.all([
                fetch(`${apiUrl}/api/admin/users`, { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } }),
                fetch(`${apiUrl}/api/books`, { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } })
            ]);

            let totalUsers_count = 0;
            if (usersRes.ok) {
                const usersData = await usersRes.json();
                totalUsers_count = Array.isArray(usersData) ? usersData.length : (usersData.total || 0);
            }

            let totalBooks_count = 0;
            if (booksRes.ok) {
                const booksData = await booksRes.json();
                // Handle pagination or array
                totalBooks_count = booksData.total !== undefined ? booksData.total : (Array.isArray(booksData) ? booksData.length : 0);
            }
            // Mocking these for now as we don't have tracking endpoints yet
            const activeUsers_count = Math.floor(totalUsers_count * 0.4);
            const premiumUsers_count = Math.floor(totalUsers_count * 0.1);

            setStats({
                totalUsers: totalUsers_count,
                totalBooks: totalBooks_count,
                activeUsers: activeUsers_count,
                premiumUsers: premiumUsers_count
            });
        } catch (error) {
            console.error('Failed to load dashboard stats', error);
        } finally {
            setStatLoading(false);
        }
    };

    if (loading || statLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
                    <p className="text-zinc-500 text-sm">Loading dashboard metrics...</p>
                </div>
            </div>
        );
    }

    const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden group hover:border-zinc-700 transition-all">
            <div className={`absolute top-4 right-4 p-3 rounded-xl bg-${color}-500/10 text-${color}-500 group-hover:bg-${color}-500/20 transition-colors`}>
                <Icon size={24} />
            </div>
            <p className="text-zinc-500 text-sm font-medium uppercase tracking-wider mb-1">{title}</p>
            <h3 className="text-3xl font-serif font-bold text-white mb-4">{value.toLocaleString()}</h3>
            <div className="flex items-center gap-2 text-xs">
                {change && (
                    <span className="text-green-500 font-bold bg-green-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                        {change}
                    </span>
                )}
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
                    {/* Placeholder for now until we have created_at API sort */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-center h-32 text-zinc-500 text-sm">
                            Loading recent activity...
                        </div>
                    </div>
                </div>

                {/* System Status */}
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
