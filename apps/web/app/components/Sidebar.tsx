'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    // ... (imports)
    BookOpen,
    X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
    className?: string; // For mobile toggle classes
    onClose?: () => void;
}

const menuItems = [
    // ... (menu items)
];

export function Sidebar({ className, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    // Close sidebar on route change (for mobile)
    // Note: LayoutWrapper handles reset, but we can also use Link onClick

    return (
        <aside className={className || "fixed left-0 top-0 z-40 h-screen w-64 flex-col bg-black text-zinc-400 border-r border-zinc-900 hidden lg:flex"}>
            {/* Logo */}
            <div className="flex h-16 items-center justify-between px-6">
                <span className="text-xl font-bold text-white tracking-tight">Bookify</span>
                {onClose && (
                    <button onClick={onClose} className="lg:hidden text-zinc-400 hover:text-white">
                        <X size={24} />
                    </button>
                )}
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
                            onClick={onClose}
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

                {user?.roles?.some((r: any) => r.name === 'Admin') && (
                    <div className="pt-4 space-y-1">
                        <p className="px-3 text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2">Management</p>
                        <Link
                            href="/admin/books"
                            onClick={onClose}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${pathname === '/admin/books'
                                ? 'bg-zinc-900 text-white'
                                : 'hover:bg-zinc-900/50 hover:text-white'
                                }`}
                        >
                            <ShieldCheck size={20} className={pathname === '/admin/books' ? 'text-indigo-400' : ''} />
                            Admin Panel
                        </Link>
                    </div>
                )}
            </nav>

            {/* User Info & Logout */}
            <div className="p-4 border-t border-zinc-900 space-y-4">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white uppercase">
                        {user?.name?.[0] || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                        <p className="text-[10px] text-zinc-500 truncate">{user?.email}</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-500 hover:text-red-400 hover:bg-red-400/5 transition-all"
                >
                    <LogOut size={20} />
                    Sign Out
                </button>
                <div className="flex flex-col gap-1 text-[10px] text-zinc-600 px-2">
                    <span>Bookify v1.0.0</span>
                </div>
            </div>
        </aside>
    );
}
