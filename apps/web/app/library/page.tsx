'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BookCard } from '../components/BookCard';
import { LibraryTabs } from '../components/LibraryTabs';
import { AddToCollectionModal } from '../components/AddToCollectionModal';
import { getApiUrl } from '../lib/utils';
import { Loader2, Library as LibraryIcon, Search, SlidersHorizontal, Plus, FolderOpen, Trash2, ArrowLeft, Grid, List as ListIcon } from 'lucide-react';

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
        <div className="min-h-screen bg-black text-zinc-300">
            {/* Top Bar - sticky under main header */}
            <div className="sticky top-16 z-20 bg-black border-b border-zinc-900 px-6 py-3 space-y-2">

                {/* Row 1: Title and Controls */}
                <div className="flex items-center justify-between">
                    <div>
                        {viewingCollectionId ? (
                            <div className="flex items-center gap-2">
                                <button onClick={() => setViewingCollectionId(null)} className="text-zinc-400 hover:text-white transition-colors">
                                    <ArrowLeft size={18} />
                                </button>
                                <h1 className="text-base font-medium text-white tracking-wide font-serif">
                                    {collections.find(c => c.id === viewingCollectionId)?.name}
                                </h1>
                            </div>
                        ) : (
                            <h1 className="text-base font-medium text-white tracking-wide font-serif">Your Library</h1>
                        )}
                    </div>

                    {!viewingCollectionId && (
                        <div className="flex items-center gap-1">
                            <button className="p-1.5 text-zinc-400 hover:text-white bg-zinc-900 rounded-md transition-colors">
                                <Grid size={14} />
                            </button>
                            <button className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-md transition-colors">
                                <ListIcon size={14} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Row 2: Sort Pills */}
                {!viewingCollectionId && (
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] text-zinc-500 font-medium">Sort by:</span>
                        <div className="flex items-center gap-1.5">
                            {(['recent', 'title', 'author', 'progress'] as const).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setSortBy(type as any)}
                                    className={`px-2.5 py-0.5 rounded-md text-[10px] font-medium transition-all border ${sortBy === type
                                        ? 'bg-blue-600 border-blue-600 text-white'
                                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                                        }`}
                                >
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="px-8 pb-32 max-w-[1600px] mx-auto mt-4">
                {/* Tabs - Full Width */}
                {!viewingCollectionId && <LibraryTabs activeTab={activeTab} onTabChange={setActiveTab} />}

                {/* Content Area */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <Loader2 className="animate-spin text-blue-600" size={32} />
                        <p className="text-zinc-600 text-sm font-medium tracking-wide animate-pulse">SYNCING LIBRARY...</p>
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
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-6 gap-y-10">
                                    {filteredBooks.map((item) => (
                                        <div key={item.id} className="relative group">
                                            <BookCard
                                                id={item.book.id}
                                                title={item.book.title}
                                                author={item.book.author}
                                                coverImage={item.book.cover_image}
                                                progress={parseFloat(item.percentage_completed)}
                                                isDownloaded={activeTab === 'downloaded'}
                                            />
                                            {/* Add to Collection Button */}
                                            {collections.length > 0 && (
                                                <button
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedBookForCollection(item.book.id); }}
                                                    className="absolute top-3 right-3 bg-black/40 hover:bg-blue-600 text-white p-1.5 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all z-20"
                                                    title="Add to Collection"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-32 text-center border border-dashed border-zinc-900 rounded-3xl bg-zinc-950/50">
                                    <div className="bg-zinc-900 p-4 rounded-full mb-4">
                                        <LibraryIcon size={32} className="text-zinc-700" />
                                    </div>
                                    <h3 className="text-lg font-medium text-white mb-1">No books found</h3>
                                    <p className="text-zinc-500 text-sm">
                                        {viewingCollectionId ? "This collection is empty." : "Your library is waiting for its first story."}
                                    </p>
                                </div>
                            )
                        ) : (
                            // Collections View
                            <div className="space-y-6">
                                {/* Create New Collection "Dropzone" */}
                                {!showCreateCollection && (
                                    <button
                                        onClick={() => setShowCreateCollection(true)}
                                        className="w-full h-32 border border-dashed border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/20 rounded-2xl flex flex-col items-center justify-center gap-2 text-zinc-500 hover:text-zinc-300 transition-all group"
                                    >
                                        <Plus size={24} className="group-hover:scale-110 transition-transform" />
                                        <span className="font-medium">Create New Collection</span>
                                    </button>
                                )}

                                {showCreateCollection && (
                                    <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-2xl flex items-end gap-4 animate-in fade-in slide-in-from-top-4">
                                        <div className="flex-1 space-y-2">
                                            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Collection Name</label>
                                            <input
                                                type="text"
                                                value={newCollectionName}
                                                onChange={(e) => setNewCollectionName(e.target.value)}
                                                placeholder="e.g. Summer Reads"
                                                className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-600 transition-colors"
                                                autoFocus
                                            />
                                        </div>
                                        <button
                                            onClick={handleCreateCollection}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors text-sm"
                                        >
                                            Create Collection
                                        </button>
                                        <button
                                            onClick={() => setShowCreateCollection(false)}
                                            className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white px-6 py-2.5 rounded-lg font-medium transition-colors text-sm"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}

                                {collections.length > 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {collections.map((collection) => (
                                            <div
                                                key={collection.id}
                                                onClick={() => setViewingCollectionId(collection.id)}
                                                className="group relative bg-zinc-900/20 hover:bg-zinc-900/40 border border-zinc-800/60 hover:border-zinc-700 transition-all p-5 rounded-xl cursor-pointer flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-4">
                                                    {/* Mock Avatar Stack */}
                                                    <div className="flex -space-x-3">
                                                        {[1, 2, 3].map(i => (
                                                            <div key={i} className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-black flex items-center justify-center">
                                                                <LibraryIcon size={14} className="text-zinc-600" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-base font-semibold text-white font-serif">{collection.name}</h3>
                                                        <p className="text-xs text-zinc-500 font-medium">{collection.bookIds.length} books</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <FolderOpen className="text-zinc-600 group-hover:text-blue-500 transition-colors" size={20} />
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteCollection(collection.id); }}
                                                        className="text-zinc-700 hover:text-red-500 transition-colors p-2 opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
