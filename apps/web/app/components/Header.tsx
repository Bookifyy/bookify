'use client';

import { Search, Settings, User as UserIcon, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';

interface HeaderProps {
    onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
    const { user } = useAuth();

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-900 bg-black px-4 lg:px-8">
            <div className="flex items-center">
                {/* Mobile Menu Button */}
                <button
                    type="button"
                    className="mr-4 text-zinc-400 hover:text-white lg:hidden"
                    onClick={onMenuClick}
                >
                    <Menu size={24} />
                </button>

                {/* Brand */}
                <Link href="/" className="text-xl font-serif text-white tracking-wide">
                    Bookify
                </Link>
            </div>

            {/* Search Bar */}
            <div className="flex flex-1 max-w-xl mx-4">
                <div className="relative w-full">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-4 w-4 text-zinc-500" />
                    </div>
                    <input
                        type="text"
                        className="block w-full rounded-lg border border-zinc-800 bg-zinc-900 py-1.5 pl-10 pr-10 text-sm text-white placeholder-zinc-500 focus:border-zinc-700 focus:outline-none focus:ring-0 transition-colors"
                        placeholder="Search books, authors, topics"
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center">
                        <kbd className="hidden sm:inline-block rounded border border-zinc-700 px-1.5 text-[10px] font-medium text-zinc-600 bg-zinc-800">
                            /
                        </kbd>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-6 text-zinc-400">
                <button className="hover:text-white transition-colors flex items-center gap-2 text-xs font-medium uppercase tracking-wider">
                    <span className="hidden lg:inline">• Settings</span>
                </button>
                <button className="hover:text-white transition-colors flex items-center gap-2 text-xs font-medium uppercase tracking-wider">
                    <span className="hidden lg:inline">Profile</span>
                </button>
            </div>
        </header>
    );
}
