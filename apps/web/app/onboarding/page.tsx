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
    BarChart3
} from 'lucide-react';

export default function OnboardingPage() {
    const router = useRouter();

    const handleStart = () => {
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-indigo-500/30 overflow-x-hidden">
            {/* Background Ambience */}
            <div className="fixed top-0 left-1/4 w-[800px] h-[800px] bg-indigo-900/20 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 -z-10" />
            <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-900/10 blur-[100px] rounded-full pointer-events-none translate-y-1/3 -z-10" />

            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-24">
                
                {/* Header */}
                <div className="flex items-center justify-between mb-16">
                    <h1 className="text-2xl font-serif tracking-tight text-white flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/20">
                            B
                        </div>
                        Bookify
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    
                    {/* Left Content Column */}
                    <div className="space-y-10 z-10">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium">
                                <Sparkles size={14} />
                                <span>The Future of Digital Learning</span>
                            </div>
                            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-sans font-bold tracking-tight text-white leading-[1.1]">
                                Master your studies with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Adaptive AI.</span>
                            </h2>
                            <p className="text-lg text-zinc-400 leading-relaxed max-w-xl">
                                Bookify is a secure digital learning platform and subscription service providing you with protected access to educational content, textbooks, and interactive study tools.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            {/* Core Values */}
                            <div className="space-y-6">
                                <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Core Features</h3>
                                <ul className="space-y-4">
                                    <li className="flex gap-3">
                                        <div className="mt-1 bg-zinc-900 p-1.5 rounded-md text-emerald-400"><ShieldCheck size={16} /></div>
                                        <div>
                                            <p className="text-zinc-200 font-medium">Secure Content</p>
                                            <p className="text-sm text-zinc-500">Protected delivery publishers trust</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="mt-1 bg-zinc-900 p-1.5 rounded-md text-blue-400"><BookOpen size={16} /></div>
                                        <div>
                                            <p className="text-zinc-200 font-medium">Interactive Reading</p>
                                            <p className="text-sm text-zinc-500">Highlighting and collaborative notes</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="mt-1 bg-zinc-900 p-1.5 rounded-md text-orange-400"><LineChart size={16} /></div>
                                        <div>
                                            <p className="text-zinc-200 font-medium">Progress Tracking</p>
                                            <p className="text-sm text-zinc-500">Stay motivated and hit goals</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="mt-1 bg-zinc-900 p-1.5 rounded-md text-zinc-400"><Smartphone size={16} /></div>
                                        <div>
                                            <p className="text-zinc-200 font-medium">Anywhere Access</p>
                                            <p className="text-sm text-zinc-500">Cross-device web accessibility</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>

                            {/* AI Intelligence */}
                            <div className="space-y-6">
                                <h3 className="text-sm font-semibold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                                    <BrainCircuit size={16} /> AI Intelligence
                                </h3>
                                <ul className="space-y-4">
                                    <li className="flex gap-3">
                                        <div className="mt-1 bg-indigo-950/50 p-1.5 rounded-md text-indigo-400"><BrainCircuit size={16} /></div>
                                        <div>
                                            <p className="text-zinc-200 font-medium">Adaptive Plans</p>
                                            <p className="text-sm text-zinc-500">Tailors precisely to your style</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="mt-1 bg-indigo-950/50 p-1.5 rounded-md text-indigo-400"><FileQuestion size={16} /></div>
                                        <div>
                                            <p className="text-zinc-200 font-medium">Smart Practice</p>
                                            <p className="text-sm text-zinc-500">Generated tests & assignments</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="mt-1 bg-indigo-950/50 p-1.5 rounded-md text-indigo-400"><Sparkles size={16} /></div>
                                        <div>
                                            <p className="text-zinc-200 font-medium">Active Recall</p>
                                            <p className="text-sm text-zinc-500">Flashcards & spaced repetition</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="mt-1 bg-indigo-950/50 p-1.5 rounded-md text-indigo-400"><BarChart3 size={16} /></div>
                                        <div>
                                            <p className="text-zinc-200 font-medium">Deep Analytics</p>
                                            <p className="text-sm text-zinc-500">Understand your learning curves</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="pt-8">
                            <button
                                onClick={handleStart}
                                className="group w-full sm:w-auto bg-white hover:bg-zinc-100 text-zinc-950 px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-white/5"
                            >
                                Get Started
                                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <p className="mt-4 text-sm text-zinc-500 text-center sm:text-left">
                                Join thousands of students already learning smarter.
                            </p>
                        </div>
                    </div>

                    {/* Right Image Column */}
                    <div className="relative w-full aspect-square lg:aspect-auto lg:h-[700px] flex items-center justify-center z-10">
                        {/* Decorative background glow for image */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-[40px] blur-3xl opacity-50" />
                        
                        <div className="relative w-full h-full max-h-[600px] max-w-[600px] bg-zinc-900/50 backdrop-blur-sm border border-white/10 rounded-[32px] overflow-hidden shadow-2xl p-4">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none" />
                            <Image
                                src="/onboarding-hero.png"
                                alt="Bookify Adaptive AI Learning"
                                fill
                                className="object-cover rounded-3xl"
                                priority
                            />
                            
                            {/* Glass overlay subtle accents */}
                            <div className="absolute top-8 left-8 right-8 flex justify-between">
                                <div className="h-2 w-20 bg-white/20 rounded-full backdrop-blur-md" />
                                <div className="h-2 w-8 bg-indigo-400/50 rounded-full backdrop-blur-md" />
                            </div>
                            <div className="absolute bottom-8 left-8 right-8 flex gap-2">
                                <div className="h-12 w-full bg-zinc-950/40 backdrop-blur-md rounded-xl border border-white/10" />
                                <div className="h-12 w-16 bg-indigo-500/20 backdrop-blur-md rounded-xl border border-indigo-500/20 shrink-0" />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
