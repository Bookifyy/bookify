'use client';

import React, { useState, useEffect } from 'react';
import { 
    Flame, 
    Target, 
    Medal, 
    TrendingUp, 
    Calendar, 
    Award,
    BookOpen,
    Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getApiUrl } from '../lib/utils';
import { toast } from 'sonner';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    Tooltip as RechartsTooltip, 
    ResponsiveContainer, 
    PieChart, 
    Pie, 
    Cell 
} from 'recharts';

export default function DashboardPage() {
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [weeklyActivity, setWeeklyActivity] = useState<any[]>([]);
    const [studyDistribution, setStudyDistribution] = useState<any[]>([]);
    const [booksInProgress, setBooksInProgress] = useState<any[]>([]);
    const [stats, setStats] = useState({
        completedBooks: 0,
        streak: 0,
        thisWeekHours: 0,
        readingSpeed: 0
    });

    // Mock achievements for now since there's no DB table for them yet
    const achievements = [
        { title: '10 Day Streak', subtitle: 'Achieved 3 days ago', icon: Flame, color: 'text-blue-500' },
        { title: 'Speed Reader', subtitle: 'Read 50 pages in 1 session', icon: Medal, color: 'text-zinc-400' },
        { title: 'Consistent Learner', subtitle: 'Studied every day this week', icon: Calendar, color: 'text-zinc-400' }
    ];

    useEffect(() => {
        if (!token) return;
        
        const fetchDashboardData = async () => {
            try {
                const res = await fetch(`${getApiUrl()}/api/dashboard`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setWeeklyActivity(data.weeklyActivity || []);
                    setStudyDistribution(data.studyDistribution || []);
                    setBooksInProgress(data.booksInProgress || []);
                    setStats(data.stats || {
                        completedBooks: 0, streak: 0, thisWeekHours: 0, readingSpeed: 0
                    });
                } else {
                    toast.error("Failed to load dashboard data");
                }
            } catch (err) {
                console.error("Dashboard hydrate error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [token]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center py-32 gap-4">
                <Loader2 className="animate-spin text-blue-600" size={32} />
                <p className="text-zinc-600 text-sm font-medium tracking-wide animate-pulse">SYNCING METRICS...</p>
            </div>
        );
    }

    // --- CUSTOM TOOLTIP FOR BAR CHART ---
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#121212] border border-zinc-800 p-3 rounded-lg shadow-xl">
                    <p className="text-white font-medium mb-1">{label}</p>
                    <p className="text-blue-500 text-sm">{`${payload[0].value} minutes`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-black text-white p-8 pb-32 max-w-[1600px] mx-auto space-y-8 font-sans">
            
            {/* 1. YOUR PROGRESS SECTION */}
            <div className="space-y-4">
                <div>
                    <h2 className="text-xl font-semibold tracking-wide text-white">Your Progress</h2>
                    <p className="text-zinc-400 text-sm mt-1">Track your learning journey</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Day Streak */}
                    <div className="bg-[#0f0f12] border border-zinc-800/60 rounded-xl p-5 flex flex-col justify-between h-32 hover:border-zinc-700/80 transition-colors">
                        <div className="flex items-center gap-3">
                            <Flame className="text-white w-5 h-5" />
                            <div>
                                <h3 className="text-2xl font-bold">{stats.streak}</h3>
                                <p className="text-zinc-400 text-xs uppercase tracking-wider font-semibold">Day Streak</p>
                            </div>
                        </div>
                        <p className="text-xs text-zinc-500 font-medium">Keep it up!</p>
                    </div>

                    {/* This Week */}
                    <div className="bg-[#0f0f12] border border-zinc-800/60 rounded-xl p-5 flex flex-col justify-between h-32 hover:border-zinc-700/80 transition-colors">
                        <div className="flex items-center gap-3">
                            <Target className="text-blue-600 w-5 h-5" />
                            <div>
                                <h3 className="text-2xl font-bold">{stats.thisWeekHours}h</h3>
                                <p className="text-zinc-400 text-xs uppercase tracking-wider font-semibold">This Week</p>
                            </div>
                        </div>
                        <p className="text-xs text-blue-500 font-medium">7min extra</p>
                    </div>

                    {/* Completed */}
                    <div className="bg-[#0f0f12] border border-zinc-800/60 rounded-xl p-5 flex flex-col justify-between h-32 hover:border-zinc-700/80 transition-colors">
                        <div className="flex items-center gap-3">
                            <Medal className="text-zinc-400 w-5 h-5" />
                            <div>
                                <h3 className="text-2xl font-bold">{stats.completedBooks}</h3>
                                <p className="text-zinc-400 text-xs uppercase tracking-wider font-semibold">Completed</p>
                            </div>
                        </div>
                        <p className="text-xs text-zinc-500 font-medium">Books finished</p>
                    </div>

                    {/* Reading Speed */}
                    <div className="bg-[#0f0f12] border border-zinc-800/60 rounded-xl p-5 flex flex-col justify-between h-32 hover:border-zinc-700/80 transition-colors">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="text-blue-600 w-5 h-5" />
                            <div>
                                <h3 className="text-2xl font-bold">{stats.readingSpeed}</h3>
                                <p className="text-zinc-400 text-xs uppercase tracking-wider font-semibold">Pages/Hour</p>
                            </div>
                        </div>
                        <p className="text-xs text-zinc-500 font-medium">Reading speed</p>
                    </div>
                </div>
            </div>

            {/* ANALYTICS ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 2. WEEKLY ACTIVITY (Bar Chart) - Takes 2 cols on Large screens */}
                <div className="lg:col-span-2 bg-[#0f0f12] border border-zinc-800/60 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-8">
                        <Calendar className="w-4 h-4 text-white" />
                        <h2 className="text-[15px] font-semibold text-white">Weekly Activity</h2>
                    </div>
                    
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyActivity} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#71717a', fontSize: 12 }} 
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#71717a', fontSize: 12 }} 
                                    ticks={[0, 40, 80, 120, 160]}
                                />
                                <RechartsTooltip 
                                    content={<CustomTooltip />} 
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                                />
                                <Bar 
                                    dataKey="minutes" 
                                    fill="#5a67d8" 
                                    radius={[2, 2, 0, 0]} 
                                    maxBarSize={60}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-6 text-center">
                        <p className="text-xs font-medium text-zinc-400">Total: 847 minutes this week</p>
                    </div>
                </div>

                {/* 3. STUDY DISTRIBUTION (Donut Chart) - Takes 1 col */}
                <div className="bg-[#0f0f12] border border-zinc-800/60 rounded-xl p-6 flex flex-col">
                    <h2 className="text-[15px] font-semibold text-white mb-2">Study Distribution</h2>
                    
                    <div className="flex-1 flex flex-col justify-between">
                        <div className="h-40 w-full relative -mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={studyDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={45}
                                        outerRadius={65}
                                        paddingAngle={2}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {studyDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip 
                                        contentStyle={{ backgroundColor: '#121212', borderColor: '#27272a', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        
                        {/* Custom Legend replacing default for tighter control */}
                        <div className="space-y-2 mt-4">
                            {studyDistribution.map((item) => (
                                <div key={item.name} className="flex justify-between items-center text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                                        <span className="text-zinc-300">{item.name}</span>
                                    </div>
                                    <span className="font-semibold text-zinc-400">{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* DETAILS ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 4. BOOKS IN PROGRESS */}
                <div className="bg-[#0f0f12] border border-zinc-800/60 rounded-xl p-6">
                    <h2 className="text-[15px] font-semibold text-zinc-300 mb-6">Books in Progress</h2>
                    {booksInProgress.length === 0 ? (
                        <div className="py-12 flex flex-col items-center justify-center text-center">
                            <BookOpen className="text-zinc-800 w-12 h-12 mb-3" />
                            <p className="text-zinc-500 text-sm font-medium">No books in progress.</p>
                            <p className="text-zinc-600 text-xs mt-1">Start reading a book to see it here!</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {booksInProgress.map((book, i) => (
                                <div key={i} className="flex flex-col gap-2">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <h4 className="text-sm font-medium text-zinc-200 line-clamp-1">{book.title}</h4>
                                            <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{book.author}</p>
                                        </div>
                                        <span className="text-xs font-semibold text-zinc-300 ml-4">{book.progress}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden shrink-0">
                                        <div 
                                            className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out" 
                                            style={{ width: `${book.progress}%` }} 
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 5. RECENT ACHIEVEMENTS & CURRENT PLAN */}
                <div className="space-y-6 flex flex-col">
                    {/* Achievements */}
                    <div className="bg-[#0f0f12] border border-zinc-800/60 rounded-xl p-6 flex-1">
                        <div className="flex items-center gap-2 mb-6">
                            <Award className="w-4 h-4 text-zinc-300" />
                            <h2 className="text-[15px] font-semibold text-zinc-300">Recent Achievements</h2>
                        </div>
                        
                        <div className="space-y-3">
                            {achievements.map((achievement, i) => (
                                <div key={i} className="bg-[#151518] rounded-lg p-4 flex items-center gap-4 border border-zinc-800/30">
                                    <achievement.icon className={`w-4 h-4 ${achievement.color}`} />
                                    <div>
                                        <h4 className="text-sm font-medium text-white">{achievement.title}</h4>
                                        <p className="text-[11px] text-zinc-500 mt-0.5">{achievement.subtitle}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Weekly Goals Miniature Block */}
                    <div className="bg-[#0f0f12] border border-zinc-800/60 rounded-xl p-6">
                         <div className="flex items-center justify-between">
                             <div>
                                <h3 className="text-sm font-bold text-white tracking-wide">Weekly Goal Status</h3>
                                <p className="text-xs text-zinc-500 mt-1">4 of 5 reading sessions completed</p>
                             </div>
                             <div className="h-10 w-10 border-2 border-zinc-800 rounded-full flex items-center justify-center relative">
                                  <svg className="w-10 h-10 absolute -rotate-90">
                                      <circle cx="20" cy="20" r="16" stroke="transparent" strokeWidth="2" fill="none" />
                                      <circle cx="20" cy="20" r="16" stroke="#2563eb" strokeWidth="2" fill="none" strokeDasharray="100" strokeDashoffset="20" strokeLinecap="round" className="transition-all duration-1000" />
                                  </svg>
                                  <span className="text-[10px] font-bold">80%</span>
                             </div>
                         </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
