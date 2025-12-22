'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    Library,
    FileText,
    GraduationCap,
    Users,
    LayoutGrid,
    BarChart3,
    Moon,
    Sun,
    User as UserIcon,
    Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const menuItems = [
    { icon: Home, label: 'Discover', href: '/' },
    { icon: Library, label: 'Library', href: '/library' },
    { icon: FileText, label: 'Notes', href: '/notes' },
    { icon: GraduationCap, label: 'Quizzes', href: '/quizzes' },
    { icon: Users, label: 'Groups', href: '/groups' },
    { icon: LayoutGrid, label: 'Collections', href: '/collections' },
    { icon: BarChart3, label: 'Dashboard', href: '/dashboard' },
];

export function Sidebar() {
    const pathname = usePathname();
    const { user } = useAuth();

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 flex-col bg-black text-zinc-400 border-r border-zinc-900 hidden lg:flex">
            {/* Logo */}
            <div className="flex h-16 items-center px-6">
                <span className="text-xl font-bold text-white tracking-tight">Bookify</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-4">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive
                                ? 'bg-zinc-900 text-white'
                                : 'hover:bg-zinc-900/50 hover:text-white'
                                }`}
                        >
                            <Icon size={20} className={isActive ? 'text-indigo-400' : ''} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer Info */}
            <div className="p-4 border-t border-zinc-900">
                <div className="flex flex-col gap-1 text-[10px] text-zinc-600">
                    <span>Bookify v0.4.0</span>
                    <span>Month-1 Prototype</span>
                </div>
            </div>
        </aside>
    );
}
