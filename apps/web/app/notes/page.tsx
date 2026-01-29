'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getApiUrl } from '../lib/utils';
import {
    Search,
    Filter,
    SortAsc,
    BookOpen,
    Highlighter,
    FileText,
    Bookmark,
    MoreVertical,
    Calendar,
    ChevronDown,
    Trash2
} from 'lucide-react';
import Link from 'next/link';

interface Book {
    id: number;
    title: string;
    cover_image?: string;
}

interface BaseItem {
    id: number;
    book_id: number;
    page_number: number;
    created_at: string;
    book?: Book;
    type: 'note' | 'highlight' | 'bookmark';
}

interface NoteItem extends BaseItem {
    type: 'note';
    content: string;
    color: string;
}

interface HighlightItem extends BaseItem {
    type: 'highlight';
    text_content: string;
    title?: string;
    color: string;
}

interface BookmarkItem extends BaseItem {
    type: 'bookmark';
    title?: string;
}

type ReadingItem = NoteItem | HighlightItem | BookmarkItem;

export default function NotesPage() {
    const { token } = useAuth();
    const [items, setItems] = useState<ReadingItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'note' | 'highlight' | 'bookmark'>('all');
    const [filterBook, setFilterBook] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'page'>('recent');

    useEffect(() => {
        const fetchData = async () => {
            if (!token) return;
            try {
                const apiUrl = getApiUrl();
                const res = await fetch(`${apiUrl}/api/reading-features`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    const combined = [
                        ...data.notes,
                        ...data.highlights,
                        ...data.bookmarks
                    ];
                    setItems(combined);
                }
            } catch (error) {
                console.error("Failed to fetch notes:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token]);

    const stats = useMemo(() => {
        return {
            total: items.length,
            highlights: items.filter(i => i.type === 'highlight').length,
            notes: items.filter(i => i.type === 'note').length,
            bookmarks: items.filter(i => i.type === 'bookmark').length,
        };
    }, [items]);

    const uniqueBooks = useMemo(() => {
        const books = new Map<number, string>();
        items.forEach(item => {
            if (item.book) {
                books.set(item.book.id, item.book.title);
            }
        });
        return Array.from(books.entries());
    }, [items]);

    const filteredItems = useMemo(() => {
        return items
            .filter(item => {
                // Search filter
                const searchLower = searchQuery.toLowerCase();
                const contentMatch =
                    (item.type === 'note' && item.content.toLowerCase().includes(searchLower)) ||
                    (item.type === 'highlight' && (item.text_content.toLowerCase().includes(searchLower) || item.title?.toLowerCase().includes(searchLower))) ||
                    (item.type === 'bookmark' && item.title?.toLowerCase().includes(searchLower));
                const bookMatch = item.book?.title.toLowerCase().includes(searchLower);

                if (searchQuery && !contentMatch && !bookMatch) return false;

                // Type filter
                if (filterType !== 'all' && item.type !== filterType) return false;

                // Book filter
                if (filterBook !== 'all' && item.book?.id.toString() !== filterBook) return false;

                return true;
            })
            .sort((a, b) => {
                if (sortBy === 'recent') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                if (sortBy === 'page') return a.page_number - b.page_number;
                return 0;
            });
    }, [items, searchQuery, filterType, filterBook, sortBy]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    const getItemColor = (item: ReadingItem) => {
        if (item.type === 'bookmark') return 'bg-indigo-500';
        // @ts-ignore - color exists on note/highlight
        const color = item.color || 'yellow';
        const map: Record<string, string> = {
            yellow: 'bg-yellow-500',
            green: 'bg-green-500',
            blue: 'bg-blue-500',
            red: 'bg-red-500',
        };
        return map[color] || 'bg-yellow-500';
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Notes & Highlights</h1>
                <p className="text-zinc-400">All your book notes, highlights, and bookmarks in one place</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-indigo-400">
                        <FileText size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">{stats.total}</div>
                        <div className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Total</div>
                    </div>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-yellow-400">
                        <Highlighter size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">{stats.highlights}</div>
                        <div className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Highlights</div>
                    </div>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-blue-400">
                        <FileText size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">{stats.notes}</div>
                        <div className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Notes</div>
                    </div>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-indigo-400">
                        <Bookmark size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">{stats.bookmarks}</div>
                        <div className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Bookmarks</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search notes, highlights, or bookmarks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                    <select
                        value={filterBook}
                        onChange={(e) => setFilterBook(e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500 appearance-none min-w-[150px]"
                    >
                        <option value="all">All Books</option>
                        {uniqueBooks.map(([id, title]) => (
                            <option key={id} value={id}>{title}</option>
                        ))}
                    </select>

                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as any)}
                        className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500 appearance-none min-w-[120px]"
                    >
                        <option value="all">All Types</option>
                        <option value="highlight">Highlights</option>
                        <option value="note">Notes</option>
                        <option value="bookmark">Bookmarks</option>
                    </select>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500 appearance-none min-w-[120px]"
                    >
                        <option value="recent">Most Recent</option>
                        <option value="oldest">Oldest</option>
                        <option value="page">By Page</option>
                    </select>
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mb-4"></div>
                        <p>Loading your notes...</p>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">
                        <FileText size={48} className="mb-4 opacity-50" />
                        <p className="text-lg font-medium text-zinc-400">No items found</p>
                        <p className="text-sm">Try adjusting your filters or search query.</p>
                    </div>
                ) : (
                    filteredItems.map((item) => (
                        <div key={`${item.type}-${item.id}`} className="bg-zinc-900/30 border border-zinc-800 hover:border-zinc-700 transition-colors rounded-2xl p-6 group">
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-3 flex-1">
                                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                                        {item.book && (
                                            <span className="font-medium text-indigo-400">{item.book.title}</span>
                                        )}
                                        <span>•</span>
                                        <span>Page {item.page_number}</span>
                                        <span>•</span>
                                        <span>{formatDate(item.created_at)}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold ${item.type === 'highlight' ? 'bg-yellow-500/10 text-yellow-500' :
                                            item.type === 'note' ? 'bg-blue-500/10 text-blue-500' :
                                                'bg-indigo-500/10 text-indigo-500'
                                            }`}>
                                            {item.type}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    {item.type === 'highlight' && (
                                        <div className="space-y-2">
                                            {item.title && <h3 className="text-white font-medium">{item.title}</h3>}
                                            <blockquote className="pl-4 border-l-2 border-zinc-700 text-zinc-300 italic">
                                                "{item.text_content}"
                                            </blockquote>
                                        </div>
                                    )}

                                    {item.type === 'note' && (
                                        <p className="text-zinc-300 whitespace-pre-wrap">{item.content}</p>
                                    )}

                                    {item.type === 'bookmark' && (
                                        <div className="flex items-center gap-2 text-white font-medium">
                                            <Bookmark size={16} className="text-indigo-500" />
                                            {item.title || `Bookmark on page ${item.page_number}`}
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Link
                                        href={`/books/${item.book_id}/read`}
                                        className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                                        title="Go to book"
                                    >
                                        <BookOpen size={18} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
