'use client';

import { useRouter } from 'next/navigation';
import { 
    Home, 
    MessageCircleQuestion, 
    Moon, 
    Sun, 
    Check, 
    CreditCard
} from 'lucide-react';
import { useTheme } from '../../context/ThemeProvider';

export default function PlansPage() {
    const router = useRouter();
    const { theme, setTheme } = useTheme();

    const handleHome = () => {
        router.push('/onboarding');
    };

    const handleSupport = () => {
        router.push('/#chat');
    };

    const handleSubscribe = () => {
        router.push('/register');
    };

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-background text-slate-900 dark:text-zinc-100 selection:bg-indigo-500/30 font-sans transition-colors duration-300">
            {/* Global Ambient Backgrounds */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-indigo-300/20 dark:bg-indigo-900/10 blur-[120px] rounded-full -translate-y-1/2 transition-colors duration-500" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-300/20 dark:bg-purple-900/10 blur-[120px] rounded-full translate-y-1/3 transition-colors duration-500" />
            </div>

            {/* Navigation Bar */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-black/5 dark:border-white/5 bg-white/70 dark:bg-background/60 backdrop-blur-xl transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={handleHome}>
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/20">
                            B
                        </div>
                        <span className="text-xl font-serif tracking-tight text-slate-900 dark:text-foreground hidden sm:block">Bookify</span>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-6">
                        <button 
                            onClick={handleHome}
                            className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-muted-foreground hover:text-indigo-600 dark:hover:text-foreground transition-colors px-3 py-2"
                        >
                            <Home size={16} /> Home
                        </button>
                        <button 
                            onClick={handleSupport}
                            className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-muted-foreground hover:text-indigo-600 dark:hover:text-foreground transition-colors px-3 py-2"
                        >
                            <MessageCircleQuestion size={16} />
                            <span className="hidden sm:inline">Talk to our assistant</span>
                            <span className="sm:hidden">Support</span>
                        </button>

                        <div className="w-px h-6 bg-background/10 dark:bg-white/10 mx-1 hidden sm:block" />

                        <button
                            onClick={toggleTheme}
                            className="p-2 text-slate-600 dark:text-muted-foreground hover:text-indigo-600 dark:hover:text-foreground transition-colors rounded-full hover:bg-background/5 dark:hover:bg-white/5"
                            aria-label="Toggle Dark Mode"
                        >
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content Wrapper */}
            <main className="pt-32 pb-24">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    
                    {/* Header */}
                    <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-sm font-medium">
                            <CreditCard size={14} />
                            <span>Simple Pricing Plans</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-foreground">
                            Invest in your education
                        </h1>
                        <p className="text-xl text-slate-600 dark:text-muted-foreground">
                            Choose the plan that best fits your learning velocity. Upgrade or downgrade at any time.
                        </p>
                    </div>

                    {/* Pricing Tiers Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        
                        {/* BASIC LEARNER */}
                        <div className="bg-white dark:bg-card/50 border border-black/5 dark:border-white/5 rounded-3xl p-8 flex flex-col shadow-lg shadow-black/5 dark:shadow-none transition-colors duration-300">
                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-foreground mb-2">Basic Learner</h3>
                                <p className="text-slate-500 dark:text-muted-foreground text-sm">Perfect for individuals starting to organize their study materials.</p>
                            </div>
                            <div className="mb-8">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-extrabold text-slate-900 dark:text-foreground">$X</span>
                                    <span className="text-slate-500 dark:text-muted-foreground font-medium">/month</span>
                                </div>
                            </div>
                            <button onClick={handleSubscribe} className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-900 dark:text-foreground font-semibold py-3.5 rounded-xl transition-colors mb-8">
                                Get Started
                            </button>
                            <div className="space-y-4 flex-1">
                                <div className="text-sm font-medium text-slate-900 dark:text-foreground mb-4">What's included:</div>
                                <ul className="space-y-3">
                                    <li className="flex gap-3 text-slate-600 dark:text-muted-foreground text-sm">
                                        <Check size={18} className="text-emerald-500 shrink-0" />
                                        <span>Secure School Books Access (PDF/EPUB)</span>
                                    </li>
                                    <li className="flex gap-3 text-slate-600 dark:text-muted-foreground text-sm">
                                        <Check size={18} className="text-emerald-500 shrink-0" />
                                        <span>Basic Highlighting & Note Taking</span>
                                    </li>
                                    <li className="flex gap-3 text-slate-600 dark:text-muted-foreground text-sm">
                                        <Check size={18} className="text-emerald-500 shrink-0" />
                                        <span>Cross-Device Web Interface</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* AI PRO (Highlighted) */}
                        <div className="bg-slate-900 dark:bg-muted/80 border-2 border-indigo-500 rounded-3xl p-8 flex flex-col shadow-2xl shadow-indigo-500/20 relative transform md:-translate-y-4 transition-colors duration-300">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                Most Popular
                            </div>
                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-foreground mb-2">AI Pro</h3>
                                <p className="text-slate-400 dark:text-muted-foreground text-sm">Unlock the full adaptive AI suite and study 3x faster.</p>
                            </div>
                            <div className="mb-8">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-extrabold text-foreground">$XX</span>
                                    <span className="text-slate-400 dark:text-muted-foreground font-medium">/month</span>
                                </div>
                            </div>
                            <button onClick={handleSubscribe} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 rounded-xl transition-colors mb-8 shadow-lg shadow-indigo-600/20">
                                Upgrade to Pro
                            </button>
                            <div className="space-y-4 flex-1">
                                <div className="text-sm font-medium text-foreground mb-4">Everything in Basic, plus:</div>
                                <ul className="space-y-3">
                                    <li className="flex gap-3 text-slate-300 dark:text-foreground text-sm">
                                        <Check size={18} className="text-indigo-400 shrink-0" />
                                        <span className="font-medium text-foreground">Adaptive Learning Plans</span>
                                    </li>
                                    <li className="flex gap-3 text-slate-300 dark:text-foreground text-sm">
                                        <Check size={18} className="text-indigo-400 shrink-0" />
                                        <span>AI Generated Practice & Exams</span>
                                    </li>
                                    <li className="flex gap-3 text-slate-300 dark:text-foreground text-sm">
                                        <Check size={18} className="text-indigo-400 shrink-0" />
                                        <span>Active Memorization Setup (Spaced Repetition)</span>
                                    </li>
                                    <li className="flex gap-3 text-slate-300 dark:text-foreground text-sm">
                                        <Check size={18} className="text-indigo-400 shrink-0" />
                                        <span>Deep Learning Analytics & Statistics</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* INSTITUTION */}
                        <div className="bg-white dark:bg-card/50 border border-black/5 dark:border-white/5 rounded-3xl p-8 flex flex-col shadow-lg shadow-black/5 dark:shadow-none transition-colors duration-300">
                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-foreground mb-2">Institution</h3>
                                <p className="text-slate-500 dark:text-muted-foreground text-sm">For schools and classes requiring bulk registration and governance.</p>
                            </div>
                            <div className="mb-8">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-extrabold text-slate-900 dark:text-foreground">Custom</span>
                                </div>
                            </div>
                            <button onClick={handleSupport} className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-900 dark:text-foreground font-semibold py-3.5 rounded-xl transition-colors mb-8">
                                Contact Sales
                            </button>
                            <div className="space-y-4 flex-1">
                                <div className="text-sm font-medium text-slate-900 dark:text-foreground mb-4">Enterprise benefits:</div>
                                <ul className="space-y-3">
                                    <li className="flex gap-3 text-slate-600 dark:text-muted-foreground text-sm">
                                        <Check size={18} className="text-emerald-500 shrink-0" />
                                        <span>Admin Level Governance & Roles</span>
                                    </li>
                                    <li className="flex gap-3 text-slate-600 dark:text-muted-foreground text-sm">
                                        <Check size={18} className="text-emerald-500 shrink-0" />
                                        <span>Bulk Student Account Invites</span>
                                    </li>
                                    <li className="flex gap-3 text-slate-600 dark:text-muted-foreground text-sm">
                                        <Check size={18} className="text-emerald-500 shrink-0" />
                                        <span>Classroom & Group Progress Tracking</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
