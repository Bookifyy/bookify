'use client';

import { useAuth } from '../../context/AuthContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, ReactNode } from 'react';

const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/onboarding'];

export function LayoutWrapper({ children }: { children: ReactNode }) {
    const { user, loading } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/verify-email');

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        if (!loading && !user && !isPublicRoute) {
            router.push('/onboarding');
        } else if (!loading && user && pathname === '/onboarding') {
            router.push('/');
        }
        // Close sidebar on route change
        setIsSidebarOpen(false);
    }, [user, loading, isPublicRoute, router, pathname]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-black">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
                    <p className="text-zinc-500 text-sm font-medium animate-pulse">Loading Bookify...</p>
                </div>
            </div>
        );
    }

    // If not logged in and on a private route, return null while redirecting
    if (!user && !isPublicRoute) {
        return null;
    }

    // Admin routes have their own layout
    if (pathname.startsWith('/admin')) {
        return <>{children}</>;
    }

    // Dashboard layout for logged in users on private routes
    if (user && !isPublicRoute) {
        return (
            <div className="flex min-h-screen relative">
                <Sidebar
                    className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-black transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                        }`}
                    onClose={() => setIsSidebarOpen(false)}
                />

                {/* Mobile Overlay */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                <div className="flex flex-1 flex-col lg:pl-0 pt-0 w-full min-h-screen">
                    <Header onMenuClick={() => setIsSidebarOpen(true)} />
                    <main className="flex-1 w-full max-w-[100vw] overflow-x-hidden">
                        {children}
                    </main>
                </div>
            </div>
        );
    }

    // Simple layout for public routes
    return (
        <main className="flex-1 min-h-screen w-full max-w-[100vw] overflow-x-hidden">
            {children}
        </main>
    );
}
