'use client';

import { DollarSign, TrendingUp, CreditCard, Download } from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar
} from 'recharts';

export default function RevenuePage() {
    // Mock Data - Monthly Revenue
    const revenueData = [
        { month: 'Jan', revenue: 4500, expenses: 1200 },
        { month: 'Feb', revenue: 5200, expenses: 1300 },
        { month: 'Mar', revenue: 4800, expenses: 1100 },
        { month: 'Apr', revenue: 6100, expenses: 1400 },
        { month: 'May', revenue: 7500, expenses: 1600 },
        { month: 'Jun', revenue: 8200, expenses: 1800 },
    ];

    const transactions = [
        { id: '#TRX-9821', user: 'Alice Smith', amount: '$12.00', plan: 'Premium Monthly', status: 'Completed', date: '2 mins ago' },
        { id: '#TRX-9820', user: 'John Doe', amount: '$120.00', plan: 'Premium Yearly', status: 'Completed', date: '15 mins ago' },
        { id: '#TRX-9819', user: 'Emma Wilson', amount: '$12.00', plan: 'Premium Monthly', status: 'Failed', date: '1 hour ago' },
        { id: '#TRX-9818', user: 'Michael Brown', amount: '$500.00', plan: 'Institutional', status: 'Completed', date: '2 hours ago' },
        { id: '#TRX-9817', user: 'Sophia Lee', amount: '$12.00', plan: 'Premium Monthly', status: 'Completed', date: '3 hours ago' },
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Revenue & Subscriptions</h1>
                    <p className="text-zinc-400">Financial overview and transaction history.</p>
                </div>
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                    <Download size={18} /> Download Report
                </button>
            </div>

            {/* Financial Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-4 right-4 p-3 rounded-xl bg-green-500/10 text-green-500">
                        <DollarSign size={24} />
                    </div>
                    <p className="text-zinc-500 text-sm font-medium uppercase tracking-wider mb-1">Total Revenue (YTD)</p>
                    <h3 className="text-3xl font-serif font-bold text-white mb-2">$84,230</h3>
                    <span className="text-green-500 text-xs font-bold bg-green-500/10 px-2 py-1 rounded">+18% vs last year</span>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-4 right-4 p-3 rounded-xl bg-blue-500/10 text-blue-500">
                        <CreditCard size={24} />
                    </div>
                    <p className="text-zinc-500 text-sm font-medium uppercase tracking-wider mb-1">Active Subscriptions</p>
                    <h3 className="text-3xl font-serif font-bold text-white mb-2">1,240</h3>
                    <span className="text-blue-500 text-xs font-bold bg-blue-500/10 px-2 py-1 rounded">+5% this month</span>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-4 right-4 p-3 rounded-xl bg-purple-500/10 text-purple-500">
                        <TrendingUp size={24} />
                    </div>
                    <p className="text-zinc-500 text-sm font-medium uppercase tracking-wider mb-1">MRR</p>
                    <h3 className="text-3xl font-serif font-bold text-white mb-2">$14,880</h3>
                    <span className="text-purple-500 text-xs font-bold bg-purple-500/10 px-2 py-1 rounded">Monthly Recurring Revenue</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6">Revenue Growth</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                <XAxis dataKey="month" stroke="#71717a" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                                <YAxis stroke="#71717a" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Recent Transactions</h3>
                    <div className="space-y-4">
                        {transactions.map((trx, i) => (
                            <div key={i} className="flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0">
                                <div>
                                    <p className="text-sm font-medium text-white">{trx.user}</p>
                                    <p className="text-xs text-zinc-500">{trx.plan} • {trx.date}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-white">{trx.amount}</p>
                                    <p className={`text-[10px] font-bold ${trx.status === 'Completed' ? 'text-green-500' : 'text-red-500'}`}>
                                        {trx.status}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-4 py-2 text-sm font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
                        View All Transactions
                    </button>
                </div>
            </div>
        </div>
    );
}
