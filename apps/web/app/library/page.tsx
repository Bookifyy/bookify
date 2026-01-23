'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BookCard } from '../components/BookCard';
import { LibraryTabs } from '../components/LibraryTabs';
import { AddToCollectionModal } from '../components/AddToCollectionModal';
import { getApiUrl } from '../lib/utils';
import { Loader2, Library as LibraryIcon, Search, SlidersHorizontal, Plus, FolderOpen, Trash2, ArrowLeft } from 'lucide-react';

interface Book {
    id: number;
    title: string;
    author: string;
    cover_image: string;
}

interface LibraryItem {
    id: number;
    book: Book;
    percentage_completed: string;
    last_read_at: string;
}

interface Collection {
    id: string;
    name: string;
    bookIds: number[];
}

export default function LibraryPage() {
    const { token } = useAuth();
    const [books, setBooks] = useState<LibraryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'recent' | 'title' | 'author' | 'progress'>('recent');

    // Collections State (Mocked with LocalStorage)
    const [collections, setCollections] = useState<Collection[]>([]);
    const [showCreateCollection, setShowCreateCollection] = useState(false);
    const [newCollectionName, setNewCollectionName] = useState('');
    const [selectedBookForCollection, setSelectedBookForCollection] = useState<number | null>(null);
    const [viewingCollectionId, setViewingCollectionId] = useState<string | null>(null);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const apiUrl = getApiUrl();
                const res = await fetch(`${apiUrl}/api/library`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setBooks(data);
                }
            } catch (err) {
                console.error('Failed to fetch library books:', err);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchBooks();
    }, [token]);

    // Load Collections from LocalStorage
    useEffect(() => {
        const saved = localStorage.getItem('bookify_collections');
        if (saved) {
            try {
                setCollections(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse collections', e);
            }
        }
    }, []);

    // Save Collections to LocalStorage
    useEffect(() => {
        localStorage.setItem('bookify_collections', JSON.stringify(collections));
    }, [collections]);

    const handleCreateCollection = () => {
        if (!newCollectionName.trim()) return;
        const newCollection: Collection = {
            id: Date.now().toString(),
            name: newCollectionName,
            bookIds: []
        };
        setCollections([...collections, newCollection]);
        setNewCollectionName('');
        setShowCreateCollection(false);
    };

    const handleDeleteCollection = (id: string) => {
        if (confirm('Are you sure you want to delete this collection?')) {
            setCollections(collections.filter(c => c.id !== id));
            if (viewingCollectionId === id) setViewingCollectionId(null);
        }
    };

    const filteredBooks = useMemo(() => {
        let filtered = [...books];

        // 0. Viewing Collection Logic
        if (viewingCollectionId) {
            const collection = collections.find(c => c.id === viewingCollectionId);
            if (collection) {
                filtered = filtered.filter(item => collection.bookIds.includes(item.book.id));
            } else {
                return []; // Collection not found
            }
        }

        // 1. Search Filter
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(item =>
                item.book.title.toLowerCase().includes(lowerQuery) ||
                item.book.author.toLowerCase().includes(lowerQuery)
            );
        }

        // 2. Tab Filter (Only if NOT viewing a specific collection)
        if (!viewingCollectionId) {
            if (activeTab === 'downloaded') {
                filtered = filtered.filter(item => parseInt(item.id.toString()) % 2 === 0);
            } else if (activeTab === 'collections') {
                return []; // Rendered separately
            }
        }

        // 3. Sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'title':
                    return a.book.title.localeCompare(b.book.title);
                case 'author':
                    return a.book.author.localeCompare(b.book.author);
                case 'progress':
                    return parseFloat(b.percentage_completed) - parseFloat(a.percentage_completed);
                case 'recent':
                default:
                    return new Date(b.last_read_at).getTime() - new Date(a.last_read_at).getTime();
            }
        });

        return filtered;
    }, [books, searchQuery, activeTab, sortBy, viewingCollectionId, collections]);

    return (
        <div className="p-8 pb-32 space-y-8 max-w-[1400px] mx-auto text-zinc-300 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    {viewingCollectionId ? (
                        <div className="flex items-center gap-2">
                            <button onClick={() => setViewingCollectionId(null)} className="text-zinc-400 hover:text-white transition-colors">
                                <ArrowLeft size={24} />
                            </button>
                            <h1 className="text-3xl font-bold text-white tracking-tight">
                                {collections.find(c => c.id === viewingCollectionId)?.name}
                            </h1>
                        </div>
                    ) : (
                        <>
                            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">My Library</h1>
                            <p className="text-zinc-500 text-sm">Manage your reading collection and progress.</p>
                        </>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search books..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-zinc-900 border border-zinc-800 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 w-64 transition-colors"
                        />
                    </div>
                </div>
            </div>

            {/* Controls */}
            {!viewingCollectionId && (
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-zinc-800 pb-6">
                    <LibraryTabs activeTab={activeTab} onTabChange={setActiveTab} />

                    {activeTab !== 'collections' && (
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-zinc-900 px-3 py-2 rounded-lg border border-zinc-800">
                                <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Sort By</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as any)}
                                    className="bg-transparent text-sm text-white focus:outline-none cursor-pointer"
                                >
                                    <option value="recent">Recent Activity</option>
                                    <option value="title">Title (A-Z)</option>
                                    <option value="author">Author (A-Z)</option>
                                    <option value="progress">Progress %</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {activeTab === 'collections' && (
                        <button
                            onClick={() => setShowCreateCollection(true)}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            <Plus size={16} />
                            New Collection
                        </button>
                    )}
                </div>
            )}

            {/* Content Area */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <Loader2 className="animate-spin text-indigo-500" size={40} />
                    <p className="text-zinc-500 animate-pulse font-medium">Loading your library...</p>
                </div>
            ) : (
                <>
                    <AddToCollectionModal
                        bookId={selectedBookForCollection}
                        collections={collections}
                        onClose={() => setSelectedBookForCollection(null)}
                        onUpdateCollections={setCollections}
                    />

                    {/* Books Grid */}
                    {(activeTab !== 'collections' || viewingCollectionId) ? (
                        filteredBooks.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                                {filteredBooks.map((item) => (
                                    <div key={item.id} className="relative group">
                                        <BookCard
                                            id={item.book.id}
                                            title={item.book.title}
                                            author={item.book.author}
                                            coverImage={item.book.cover_image}
                                            progress={parseFloat(item.percentage_completed)}
                                        />
                                        {/* Add to Collection Button - Only show if created collections exist */}
                                        {collections.length > 0 && (
                                            <button
                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedBookForCollection(item.book.id); }}
                                                className="absolute top-2 right-2 bg-black/60 hover:bg-indigo-600 text-white p-1.5 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all z-10"
                                                title="Add to Collection"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 text-center">
                                <div className="bg-zinc-900/50 p-6 rounded-full mb-4">
                                    <LibraryIcon size={48} className="text-zinc-700" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">No books found</h3>
                                <p className="text-zinc-500 max-w-sm">
                                    {viewingCollectionId ? "This collection is empty." : "Try adjusting your search or filters."}
                                </p>
                            </div>
                        )
                    ) : (
                        // Collections View
                        <div>
                            {showCreateCollection && (
                                <div className="mb-8 bg-zinc-900/30 border border-zinc-800 p-6 rounded-2xl flex items-end gap-4 animate-in fade-in slide-in-from-top-4">
                                    <div className="flex-1 space-y-2">
                                        <label className="text-sm font-medium text-zinc-400">Collection Name</label>
                                        <input
                                            type="text"
                                            value={newCollectionName}
                                            onChange={(e) => setNewCollectionName(e.target.value)}
                                            placeholder="e.g. Summer Reads"
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                                            autoFocus
                                        />
                                    </div>
                                    <button
                                        onClick={handleCreateCollection}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                                    >
                                        Create
                                    </button>
                                    <button
                                        onClick={() => setShowCreateCollection(false)}
                                        className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}

                            {collections.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {collections.map((collection) => (
                                        <div
                                            key={collection.id}
                                            onClick={() => setViewingCollectionId(collection.id)}
                                            className="group bg-zinc-900/40 hover:bg-zinc-900/60 border border-zinc-800/50 hover:border-zinc-700 transition-all p-6 rounded-2xl cursor-pointer"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="bg-indigo-500/10 p-3 rounded-xl">
                                                    <FolderOpen className="text-indigo-400" size={24} />
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteCollection(collection.id); }}
                                                    className="text-zinc-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-2"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            <h3 className="text-lg font-semibold text-white mb-1">{collection.name}</h3>
                                            <p className="text-sm text-zinc-500">{collection.bookIds.length} books</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-24 text-center">
                                    <FolderOpen size={48} className="text-zinc-800 mb-4" />
                                    <h3 className="text-xl font-semibold text-white mb-2">No collections yet</h3>
                                    <p className="text-zinc-500 mb-6">Organize your books into custom collections.</p>
                                    <button
                                        onClick={() => setShowCreateCollection(true)}
                                        className="text-indigo-400 hover:text-indigo-300 font-medium"
                                    >
                                        Create your first collection
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
