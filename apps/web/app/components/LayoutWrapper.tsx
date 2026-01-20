'use client';

import { useAuth } from '../../context/AuthContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/onboarding'];

export function LayoutWrapper({ children }: { children: ReactNode }) {
    const { user, loading } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/verify-email');

    useEffect(() => {
        if (!loading && !user && !isPublicRoute) {
            router.push('/onboarding');
        } else if (!loading && user && pathname === '/onboarding') {
            router.push('/');
        }
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

    // Dashboard layout for logged in users on private routes
    if (user && !isPublicRoute) {
        return (
            <div className="flex min-h-screen">
                <Sidebar />
                <div className="flex flex-1 flex-col lg:pl-64">
                    <Header />
                    <main className="flex-1">
                        {children}
                    </main>
                </div>
            </div>
        );
    }

    // Simple layout for public routes
    return (
        <main className="flex-1 min-h-screen">
            {children}
        </main>
    );
}
