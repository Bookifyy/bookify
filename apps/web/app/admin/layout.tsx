'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    LayoutDashboard,
    Users,
    BookOpen,
    FileText,
    CreditCard,
    BarChart3,
    Shield,
    Settings,
    Activity,
    FileCheck,
    AlertTriangle,
    LogOut,
    Menu,
    X,
    Building2,
    Lock
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Protect Admin Route
    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login');
                return;
            }
            const isAdmin = user.roles?.some(r => r.name === 'Admin');
            if (!isAdmin) {
                router.push('/');
            }
        }
    }, [user, loading, router]);

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500">Loading admin panel...</div>;
    if (!user || !user.roles?.some(r => r.name === 'Admin')) return null;

    const navigation = [
        {
            category: 'Overview',
            items: [
                { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
                { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
                { name: 'Revenue', href: '/admin/revenue', icon: CreditCard },
            ]
        },
        {
            category: 'Management',
            items: [
                { name: 'Users', href: '/admin/users', icon: Users },
                { name: 'Books', href: '/admin/books', icon: BookOpen },
                { name: 'Publishers', href: '/admin/publishers', icon: Building2 },
                { name: 'Licenses', href: '/admin/licenses', icon: FileText },
                { name: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
            ]
        },
        {
            category: 'System',
            items: [
                { name: 'Approvals', href: '/admin/approvals', icon: FileCheck },
                { name: 'Activity', href: '/admin/activity', icon: Activity },
                { name: 'Audit Logs', href: '/admin/audit', icon: FileText },
                { name: 'Security', href: '/admin/security', icon: Lock },
                { name: 'Settings', href: '/admin/settings', icon: Settings },
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-black text-zinc-100 flex">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-zinc-900 border-r border-zinc-800 
                transform transition-transform duration-200 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-serif font-bold text-xl tracking-tighter text-white">
                        <span className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center font-sans text-lg">B</span>
                        <span>Bookify Admin</span>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-zinc-400">
                        <X size={24} />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
                    {navigation.map((section) => (
                        <div key={section.category}>
                            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 px-2">
                                {section.category}
                            </h3>
                            <div className="space-y-1">
                                {section.items.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            onClick={() => setIsSidebarOpen(false)}
                                            className={`
                                                flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors
                                                ${isActive
                                                    ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]'
                                                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}
                                            `}
                                        >
                                            <item.icon size={18} />
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                <div className="p-4 border-t border-zinc-800">
                    <div className="bg-zinc-950 rounded-xl p-4 mb-2 border border-zinc-800">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-xs">
                                {user?.name?.charAt(0) || 'A'}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                                <p className="text-xs text-zinc-500 truncate">Administrator</p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="w-full flex items-center justify-center gap-2 text-xs font-bold text-red-500 hover:bg-red-500/10 py-2 rounded-lg transition-colors"
                        >
                            <LogOut size={14} />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
                {/* Mobile Header */}
                <header className="lg:hidden h-16 border-b border-zinc-800 flex items-center px-4 bg-zinc-900 sticky top-0 z-30">
                    <button onClick={() => setIsSidebarOpen(true)} className="text-zinc-400">
                        <Menu size={24} />
                    </button>
                    <span className="ml-4 font-bold text-white">Admin Panel</span>
                </header>

                <div className="p-4 md:p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
