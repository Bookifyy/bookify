'use client';

import { useState } from 'react';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { Download, Calendar, ArrowUp, ArrowDown } from 'lucide-react';

export default function AnalyticsPage() {
    const [timeRange, setTimeRange] = useState('30d');

    // Mock Data - User Growth
    const userGrowthData = [
        { name: 'Jan 1', users: 400, active: 240 },
        { name: 'Jan 8', users: 450, active: 280 },
        { name: 'Jan 15', users: 550, active: 350 },
        { name: 'Jan 22', users: 700, active: 450 },
        { name: 'Jan 29', users: 900, active: 620 },
        { name: 'Feb 4', users: 1243, active: 850 },
    ];

    // Mock Data - Book Usage
    const bookCategoryData = [
        { name: 'Fiction', value: 450, color: '#6366f1' },
        { name: 'Science', value: 300, color: '#8b5cf6' },
        { name: 'History', value: 200, color: '#ec4899' },
        { name: 'Tech', value: 293, color: '#10b981' },
    ];

    // Mock Data - Device Usage
    const deviceData = [
        { name: 'Mobile', value: 65, color: '#3b82f6' },
        { name: 'Desktop', value: 25, color: '#6366f1' },
        { name: 'Tablet', value: 10, color: '#a855f7' },
    ];

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-zinc-900 border border-zinc-700 p-3 rounded-lg shadow-xl">
                    <p className="text-zinc-400 text-xs mb-1">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-sm font-bold" style={{ color: entry.color }}>
                            {entry.name}: {entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Analytics Overview</h1>
                    <p className="text-zinc-400">Deep dive into platform usage and performance.</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        className="bg-zinc-900 border border-zinc-800 text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-600"
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                    >
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="90d">Last 3 Months</option>
                        <option value="1y">Last Year</option>
                    </select>
                    <button className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        <Download size={16} /> Export
                    </button>
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Avg Session Time', value: '24m', change: '+12%', isUp: true },
                    { label: 'Pages Read', value: '1.2M', change: '+8%', isUp: true },
                    { label: 'Bounce Rate', value: '42%', change: '-3%', isUp: true }, // Down is good for bounce rate
                    { label: 'New Signups', value: '843', change: '+24%', isUp: true },
                ].map((stat, i) => (
                    <div key={i} className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">{stat.label}</p>
                        <div className="flex items-end justify-between">
                            <span className="text-2xl font-bold text-white">{stat.value}</span>
                            <div className={`flex items-center text-xs font-bold ${stat.isUp ? 'text-green-500' : 'text-red-500'}`}>
                                {stat.isUp ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                                {stat.change}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Graph: User Growth */}
                <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white">User Growth</h3>
                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> Total Users</span>
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Active Users</span>
                        </div>
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={userGrowthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                <XAxis dataKey="name" stroke="#71717a" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                                <YAxis stroke="#71717a" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" name="Total Users" />
                                <Area type="monotone" dataKey="active" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorActive)" name="Active Users" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart: Device Usage */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-2">Device Usage</h3>
                    <p className="text-zinc-500 text-sm mb-6">User preference by platform</p>
                    <div className="h-64 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={deviceData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {deviceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center">
                                <span className="block text-2xl font-bold text-white">65%</span>
                                <span className="text-xs text-zinc-500 uppercase">Mobile First</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Popular Categories Bar Chart */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-6">Popular Categories</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={bookCategoryData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                            <XAxis dataKey="name" stroke="#71717a" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                            <YAxis stroke="#71717a" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#27272a' }} />
                            <Bar dataKey="value" name="Reads" radius={[4, 4, 0, 0]}>
                                {bookCategoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
