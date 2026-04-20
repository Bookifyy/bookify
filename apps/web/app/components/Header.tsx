'use client';

import { useState } from 'react';
import { Search, Menu, Settings, Moon, Sun, Home, Library, FileText, GraduationCap, Users, Layers, BarChart3, ShieldCheck, LogOut, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeProvider';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NotificationBell } from './NotificationBell';

const menuItems = [
    { icon: Home, label: 'Discover', href: '/' },
    { icon: Library, label: 'Library', href: '/library' },
    { icon: FileText, label: 'Notes', href: '/notes' },
    { icon: GraduationCap, label: 'Quizzes', href: '/quizzes' },
    { icon: Users, label: 'Groups', href: '/groups' },
    { icon: Layers, label: 'Collections', href: '/collections' },
    { icon: BarChart3, label: 'Dashboard', href: '/dashboard' },
];

export function Header() {
    const { user, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    const isAdmin = user?.roles?.some((r: any) => r.name === 'Admin');

    return (
        <header className="sticky top-0 z-50 flex flex-col border-b border-border bg-nav transition-colors duration-200">
            {/* Top Bar */}
            <div className="flex h-16 items-center justify-between px-4 lg:px-8">
                <div className="flex items-center gap-4">
                    {/* Mobile Menu Toggle */}
                    <button
                        type="button"
                        className="text-muted-foreground hover:text-white lg:hidden"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    {/* Brand */}
                    <Link href="/" className="text-2xl font-serif font-bold text-white tracking-wide flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <span className="font-sans text-xl text-white">B</span>
                        </div>
                        <span className="hidden sm:inline-block">Bookify</span>
                    </Link>
                </div>

                {/* Search Bar - Hidden on small screens, can be expanded or modal */}
                <div className="hidden md:flex flex-1 max-w-xl mx-8">
                    <div className="relative w-full group">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-indigo-400 transition-colors" />
                        </div>
                        <input
                            type="text"
                            className="block w-full rounded-full border border-border/50 bg-background/50 py-2 pl-10 pr-10 text-sm text-foreground placeholder-muted-foreground focus:border-indigo-500/50 focus:bg-background focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all backdrop-blur-sm"
                            placeholder="Search books, authors, topics..."
                        />
                        <div className="absolute inset-y-0 right-3 flex items-center">
                            <kbd className="hidden sm:inline-block rounded border border-border/50 px-1.5 text-[10px] font-medium text-muted-foreground bg-muted/50">
                                /
                            </kbd>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 sm:gap-4 text-muted-foreground relative">
                    <button
                        onClick={toggleTheme}
                        className="p-2 hover:text-white hover:bg-white/5 transition-colors rounded-full"
                        aria-label="Toggle Dark Mode"
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    
                    <div className="hidden sm:block">
                        <NotificationBell />
                    </div>

                    <div className="w-px h-6 bg-border mx-1 hidden sm:block"></div>
                    
                    {/* Profile Dropdown Logic */}
                    <div className="relative">
                        <button 
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-2 hover:bg-white/5 p-1.5 rounded-full lg:rounded-xl transition-colors focus:outline-none"
                        >
                            <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm font-bold uppercase transition-transform hover:scale-105">
                                {user?.name?.[0] || 'U'}
                            </div>
                            <div className="hidden lg:flex flex-col items-start pr-1">
                                <span className="text-xs font-semibold text-white leading-tight">{user?.name?.split(' ')[0]}</span>
                                <span className="text-[10px] text-muted-foreground leading-tight">Member</span>
                            </div>
                            <ChevronDown size={14} className="hidden lg:block text-muted-foreground" />
                        </button>

                        {/* Profile Menu Dropdown */}
                        {isProfileOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                                <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-xl z-50 py-2 animate-in slide-in-from-top-2">
                                    <div className="px-4 py-2 border-b border-border/50 mb-2">
                                        <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                                    </div>
                                    <Link href="/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-white/5 transition-colors">
                                        <Settings size={16} className="text-muted-foreground" />
                                        Settings
                                    </Link>
                                    {isAdmin && (
                                        <Link href="/admin" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-indigo-400 hover:bg-white/5 transition-colors">
                                            <ShieldCheck size={16} />
                                            Admin Panel
                                        </Link>
                                    )}
                                    <div className="my-2 border-t border-border/50"></div>
                                    <button onClick={() => { logout(); setIsProfileOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-400/10 transition-colors">
                                        <LogOut size={16} />
                                        Sign Out
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Nav Tier - Desktop ONLY (Mobile has accordion menu) */}
            <div className="hidden lg:flex items-center px-4 lg:px-8 bg-card/30 backdrop-blur-md">
                <nav className="flex gap-2">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 ${
                                    isActive
                                        ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border hover:bg-white/5'
                                }`}
                            >
                                <Icon size={18} className={isActive ? 'text-indigo-400' : 'text-muted-foreground opacity-70'} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="lg:hidden border-t border-border bg-nav flex flex-col absolute top-16 left-0 right-0 z-40 shadow-xl max-h-[calc(100vh-4rem)] overflow-y-auto">
                    {/* Mobile Search */}
                    <div className="p-4 border-b border-border/50">
                        <div className="relative w-full">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Search className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <input
                                type="text"
                                className="block w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm text-foreground placeholder-muted-foreground"
                                placeholder="Search..."
                            />
                        </div>
                    </div>

                    <nav className="p-2 space-y-1">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                                        isActive
                                            ? 'bg-indigo-500/10 text-indigo-400'
                                            : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                                    }`}
                                >
                                    <Icon size={20} className={isActive ? 'text-indigo-400' : ''} />
                                    {item.label}
                                </Link>
                            );
                        })}
                        
                        {isAdmin && (
                            <>
                                <div className="mx-4 my-2 h-px bg-border/50"></div>
                                <Link
                                    href="/admin"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                                >
                                    <ShieldCheck size={20} />
                                    Admin Panel
                                </Link>
                            </>
                        )}
                        
                    </nav>
                    
                    {/* Mobile Profile Actions */}
                    <div className="mt-auto p-4 border-t border-border/50 bg-card/50">
                         <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-lg border border-indigo-500/30">
                                {user?.name?.[0] || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                             <Link
                                href="/settings"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-background border border-border text-xs font-medium hover:bg-muted transition-colors"
                            >
                                <Settings size={16} />
                                Settings
                            </Link>
                            <button
                                onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-medium hover:bg-red-500/20 transition-colors"
                            >
                                <LogOut size={16} />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
