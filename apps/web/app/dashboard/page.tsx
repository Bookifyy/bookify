'use client';

import { BarChart3, TrendingUp, Clock, BookOpen } from 'lucide-react';

export default function DashboardPage() {
    return (
        <div className="p-8 space-y-8">
            <h1 className="text-2xl font-bold text-white">Reading Statistics</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Time Spent', value: '24h 15m', icon: Clock, color: 'text-blue-500' },
                    { label: 'Books Read', value: '12', icon: BookOpen, color: 'text-green-500' },
                    { label: 'Day Streak', value: '12', icon: TrendingUp, color: 'text-yellow-500' },
                    { label: 'Assignments', value: '4', icon: BarChart3, color: 'text-purple-500' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-zinc-500 font-medium">{stat.label}</span>
                            <stat.icon size={20} className={stat.color} />
                        </div>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl h-64 flex items-center justify-center">
                <p className="text-zinc-500 italic">Reading Activity Chart Placeholder</p>
            </div>
        </div>
    );
}
