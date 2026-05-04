'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
    ChevronRight, 
    ShieldCheck, 
    BookOpen, 
    LineChart, 
    Smartphone, 
    BrainCircuit, 
    FileQuestion, 
    Sparkles, 
    BarChart3,
    MessageCircleQuestion,
    Home,
    Moon,
    Sun,
    CreditCard
} from 'lucide-react';
import { useTheme } from '../../context/ThemeProvider';

export default function OnboardingPage() {
    const router = useRouter();
    const { theme, setTheme } = useTheme();

    const handleStart = () => {
        router.push('/login');
    };

    const handleHome = () => {
        router.push('/');
    };

    const handleSupport = () => {
        router.push('/#chat');
    };

    const handlePlans = () => {
        router.push('/plans');
    };

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-background text-slate-900 dark:text-zinc-100 selection:bg-indigo-500/30 font-sans transition-colors duration-300">
            {/* Global Ambient Backgrounds */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-indigo-300/20 dark:bg-indigo-900/10 blur-[120px] rounded-full -translate-y-1/2 transition-colors duration-500" />
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-300/20 dark:bg-purple-900/10 blur-[120px] rounded-full translate-y-1/3 transition-colors duration-500" />
            </div>

            {/* Navigation Bar */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-black/5 dark:border-white/5 bg-white/70 dark:bg-background/60 backdrop-blur-xl transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
                    {/* Logo Area */}
                    <div className="flex items-center gap-3 cursor-pointer" onClick={handleHome}>
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/20">
                            B
                        </div>
                        <span className="text-xl font-serif tracking-tight text-slate-900 dark:text-foreground hidden sm:block">Bookify</span>
                    </div>

                    {/* Nav Links */}
                    <div className="flex items-center gap-2 sm:gap-6">
                        <button 
                            onClick={handleHome}
                            className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-muted-foreground hover:text-indigo-600 dark:hover:text-foreground transition-colors px-3 py-2"
                        >
                            <Home size={16} /> Home
                        </button>
                        <button 
                            onClick={handlePlans}
                            className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-muted-foreground hover:text-indigo-600 dark:hover:text-foreground transition-colors px-3 py-2"
                        >
                            <CreditCard size={16} /> Plans
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

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 text-slate-600 dark:text-muted-foreground hover:text-indigo-600 dark:hover:text-foreground transition-colors rounded-full hover:bg-background/5 dark:hover:bg-white/5"
                            aria-label="Toggle Dark Mode"
                        >
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>

                        <button
                            onClick={handleStart}
                            className="bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-zinc-100 text-white dark:text-zinc-950 px-5 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-black/5 dark:shadow-white/5"
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content Wrapper (padding top for fixed nav) */}
            <main className="pt-20">
                
                {/* SECTION 1: HERO */}
                <section className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-32 flex flex-col lg:flex-row items-center gap-16 min-h-[90vh]">
                    {/* Hero Text */}
                    <div className="flex-1 space-y-10 z-10 w-full">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-sm font-medium">
                                <Sparkles size={14} />
                                <span>The Future of Digital Learning</span>
                            </div>
                            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-sans font-bold tracking-tight text-slate-900 dark:text-foreground leading-[1.1]">
                                Master your studies with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400">interactive learning.</span>
                            </h1>
                            <p className="text-xl text-slate-600 dark:text-muted-foreground leading-relaxed max-w-2xl">
                                Bookify is a secure digital learning platform and subscription service providing you with protected access to educational content, textbooks, and interactive study tools.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <button
                                onClick={handleStart}
                                className="group bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl shadow-indigo-600/20"
                            >
                                Start Learning Now
                                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* Hero Image */}
                    <div className="flex-1 relative w-full aspect-square lg:aspect-auto lg:h-[600px] flex items-center justify-center z-10">
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-400/20 to-purple-400/20 dark:from-indigo-500/20 dark:to-purple-500/20 rounded-[40px] blur-[80px] opacity-60" />
                        
                        <div className="relative w-full h-full max-h-[500px] max-w-[500px] bg-white/50 dark:bg-card/50 backdrop-blur-sm border border-black/5 dark:border-white/10 rounded-[32px] overflow-hidden shadow-2xl p-4 transition-colors duration-300">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 dark:from-indigo-500/10 to-transparent pointer-events-none" />
                            <Image
                                src="/onboarding-hero.png"
                                alt="Bookify Adaptive AI Learning"
                                fill
                                className="object-cover rounded-3xl"
                                priority
                            />
                        </div>
                    </div>
                </section>

                {/* SECTION 2: CORE VALUE PROPOSITION */}
                <section className="bg-white/50 dark:bg-card/30 border-y border-black/5 dark:border-white/5 relative transition-colors duration-300 shadow-sm hover:shadow-md dark:shadow-none transition-shadow duration-300">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
                        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-foreground">Everything you need to succeed</h2>
                            <p className="text-slate-600 dark:text-muted-foreground text-lg">A unified platform designed specifically for students and publishers to bridge the gap in digital learning.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <div className="bg-white dark:bg-card/50 border border-black/5 dark:border-white/5 p-8 rounded-3xl space-y-6 hover:bg-slate-50 dark:hover:bg-card transition-colors shadow-sm dark:shadow-none">
                                <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                    <ShieldCheck size={28} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-foreground">Secure Content</h3>
                                    <p className="text-slate-600 dark:text-muted-foreground leading-relaxed">Protected delivery that publishers can trust, ensuring educational material is safely distributed.</p>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-card/50 border border-black/5 dark:border-white/5 p-8 rounded-3xl space-y-6 hover:bg-slate-50 dark:hover:bg-card transition-colors shadow-sm dark:shadow-none">
                                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                                    <BookOpen size={28} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-foreground">Interactive Reading</h3>
                                    <p className="text-slate-600 dark:text-muted-foreground leading-relaxed">Access school books (PDF/EPUB) with immersive highlighting and note-taking capabilities.</p>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-card/50 border border-black/5 dark:border-white/5 p-8 rounded-3xl space-y-6 hover:bg-slate-50 dark:hover:bg-card transition-colors shadow-sm dark:shadow-none">
                                <div className="w-14 h-14 bg-orange-100 dark:bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-600 dark:text-orange-400">
                                    <LineChart size={28} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-foreground">Progress Tracking</h3>
                                    <p className="text-slate-600 dark:text-muted-foreground leading-relaxed">Stay motivated by watching your reading progress grow and hitting your goals daily.</p>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-card/50 border border-black/5 dark:border-white/5 p-8 rounded-3xl space-y-6 hover:bg-slate-50 dark:hover:bg-card transition-colors shadow-sm dark:shadow-none">
                                <div className="w-14 h-14 bg-purple-100 dark:bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400">
                                    <Smartphone size={28} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-foreground">Platform Agnostic</h3>
                                    <p className="text-slate-600 dark:text-muted-foreground leading-relaxed">Cross-device web accessibility lets you study gracefully wherever you are.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION 3: ADAPTIVE AI */}
                <section className="max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-32">
                    <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
                        
                        {/* Text Content */}
                        <div className="flex-1 space-y-10">
                            <div className="space-y-4">
                                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-foreground">Powered by Intelligence</h2>
                                <p className="text-slate-600 dark:text-muted-foreground text-lg leading-relaxed">
                                   Bookify doesn&apos;t just store your books. Our adaptive AI ecosystem actively assists with your studying and memorization process.
                                </p>
                            </div>

                            <ul className="space-y-8">
                                <li className="flex gap-4">
                                    <div className="mt-1 bg-indigo-100 dark:bg-indigo-500/10 p-2.5 rounded-xl text-indigo-600 dark:text-indigo-400 shrink-0">
                                        <BrainCircuit size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-medium mb-1 text-slate-900 dark:text-foreground">Adaptive Learning Plans</h4>
                                        <p className="text-slate-600 dark:text-muted-foreground text-base">Automatically adapts the course structure and plan precisely to match your unique learning style.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <div className="mt-1 bg-indigo-100 dark:bg-indigo-500/10 p-2.5 rounded-xl text-indigo-600 dark:text-indigo-400 shrink-0">
                                        <FileQuestion size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-medium mb-1 text-slate-900 dark:text-foreground">Generated Assignments</h4>
                                        <p className="text-slate-600 dark:text-muted-foreground text-base">Dynamic generation of practice assignments and exam questions based on your weak points.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <div className="mt-1 bg-indigo-100 dark:bg-indigo-500/10 p-2.5 rounded-xl text-indigo-600 dark:text-indigo-400 shrink-0">
                                        <Sparkles size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-medium mb-1 text-slate-900 dark:text-foreground">Active Study Assistance</h4>
                                        <p className="text-slate-600 dark:text-muted-foreground text-base">Utilizes auto-generated flashcards, spaced repetition rules, and smart explanations for concepts.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <div className="mt-1 bg-indigo-100 dark:bg-indigo-500/10 p-2.5 rounded-xl text-indigo-600 dark:text-indigo-400 shrink-0">
                                        <BarChart3 size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-medium mb-1 text-slate-900 dark:text-foreground">Learning Analytics</h4>
                                        <p className="text-slate-600 dark:text-muted-foreground text-base">Provides detailed insights and learning analytics straight to the user dashboard.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        {/* Abstract AI Visual */}
                        <div className="flex-1 relative w-full aspect-square border border-black/5 dark:border-white/10 rounded-[40px] bg-white dark:bg-card/20 overflow-hidden flex flex-col items-center justify-center p-8 shadow-xl dark:shadow-none transition-colors duration-300">
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-100/50 dark:via-indigo-950/20 to-indigo-200/50 dark:to-indigo-900/40" />
                            
                            <div className="relative z-10 w-full max-w-sm space-y-4">
                                {/* Mockup of analytics card */}
                                <div className="bg-white/80 dark:bg-card/80 backdrop-blur-xl border border-black/5 dark:border-white/10 p-6 rounded-2xl shadow-xl dark:shadow-2xl translate-x-8 transition-colors duration-300">
                                    <div className="h-4 w-24 bg-indigo-500/30 rounded-full mb-4" />
                                    <div className="space-y-2">
                                        <div className="h-2 w-full bg-slate-200 dark:bg-muted rounded-full" />
                                        <div className="h-2 w-4/5 bg-slate-200 dark:bg-muted rounded-full" />
                                        <div className="h-2 w-full bg-slate-200 dark:bg-muted rounded-full" />
                                    </div>
                                </div>
                                {/* Mockup of flashcard */}
                                <div className="bg-indigo-600 border border-white/20 p-8 rounded-2xl shadow-xl dark:shadow-2xl -translate-x-8 -translate-y-4">
                                    <div className="h-4 w-32 bg-white/20 rounded-full mx-auto mb-6" />
                                    <div className="h-2 w-full bg-white/10 rounded-full" />
                                </div>
                            </div>
                        </div>

                    </div>
                </section>

                {/* FINAL CTA */}
                <section className="border-t border-black/5 dark:border-white/5 bg-gradient-to-b from-slate-50 dark:from-zinc-950 to-indigo-50 dark:to-indigo-950/20 transition-colors duration-300">
                    <div className="max-w-4xl mx-auto px-6 py-24 text-center space-y-8">
                        <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-foreground">Ready to transform your learning?</h2>
                        <p className="text-xl text-slate-600 dark:text-muted-foreground">Join Bookify today and get instant access to premium tools and adaptive AI intelligence.</p>
                        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={handlePlans}
                                className="w-full sm:w-auto bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-zinc-100 text-white dark:text-zinc-950 px-8 py-4 rounded-xl font-semibold text-lg transition-all active:scale-[0.98] shadow-lg shadow-black/10 dark:shadow-white/5"
                            >
                                View Pricing Plans
                            </button>
                            <button
                                onClick={handleSupport}
                                className="w-full sm:w-auto bg-white dark:bg-card border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-muted text-slate-900 dark:text-foreground px-8 py-4 rounded-xl font-semibold text-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm"
                            >
                                <MessageCircleQuestion size={20} />
                                Talk to Assistant
                            </button>
                        </div>
                    </div>
                </section>

            </main>
        </div>
    );
}
