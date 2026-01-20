'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';

const slides = [
    {
        id: 1,
        image: '/onboarding/slide1.png',
        title: "Discover Books You'll Love",
        description: "Explore thousands of titles with personalized recommendations tailored just for you",
    },
    {
        id: 2,
        image: '/onboarding/slide2.png',
        title: "Join Reading Groups & Share Notes",
        description: "Connect with fellow readers, share insights, and grow together in a vibrant community",
    },
    {
        id: 3,
        image: '/onboarding/slide3.png',
        title: "Track Your Progress Anytime",
        description: "Monitor your reading goals, quiz results, and achievements across all your devices",
    },
];

export default function OnboardingPage() {
    const router = useRouter();
    const [currentSlide, setCurrentSlide] = useState(0);

    const handleNext = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(prev => prev + 1);
        } else {
            router.push('/login');
        }
    };

    const handleSkip = () => {
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
            {/* Top Bar */}
            <div className="flex justify-between items-center p-6 z-10">
                <h1 className="text-xl font-serif tracking-tight">Bookify</h1>
                <button
                    onClick={handleSkip}
                    className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                >
                    Skip
                </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 pb-24 max-w-md mx-auto w-full text-center z-10">

                {/* Carousel Image */}
                <div className="relative w-full aspect-square mb-12">
                    {slides.map((slide, index) => (
                        <div
                            key={slide.id}
                            className={`absolute inset-0 transition-all duration-500 ease-in-out transform ${index === currentSlide
                                ? 'opacity-100 translate-x-0 scale-100'
                                : index < currentSlide
                                    ? 'opacity-0 -translate-x-full scale-95'
                                    : 'opacity-0 translate-x-full scale-95'
                                }`}
                        >
                            <Image
                                src={slide.image}
                                alt={slide.title}
                                fill
                                className="object-contain"
                                priority={index === 0}
                            />
                        </div>
                    ))}
                </div>

                {/* Text Content */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-serif font-medium tracking-tight">
                        {slides[currentSlide].title}
                    </h2>
                    <p className="text-zinc-400 text-sm leading-relaxed px-4">
                        {slides[currentSlide].description}
                    </p>
                </div>

                {/* Dots Indicator */}
                <div className="flex items-center gap-2 mt-8">
                    {slides.map((_, index) => (
                        <div
                            key={index}
                            className={`h-1.5 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-6 bg-indigo-500' : 'w-1.5 bg-zinc-800'
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/90 to-transparent z-20">
                <button
                    onClick={handleNext}
                    className="w-full bg-blue-700 hover:bg-blue-600 active:scale-[0.98] transition-all text-white font-medium py-3.5 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
                >
                    <span>{currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}</span>
                    {currentSlide !== slides.length - 1 && <ChevronRight size={16} />}
                </button>
            </div>

            {/* Background Ambience */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-900/10 blur-[100px] rounded-full pointer-events-none" />
        </div>
    );
}
