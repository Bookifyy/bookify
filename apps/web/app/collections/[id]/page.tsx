'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, ListFilter, Plus, Share2, MoreHorizontal, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { BookCard } from '../../components/BookCard';
import { ShareCollectionModal } from '../../components/ShareCollectionModal';
import { getApiUrl } from '../../lib/utils';
import { useAuth } from '../../../context/AuthContext';

export default function CollectionDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { token } = useAuth();
    
    const [collection, setCollection] = useState<{ id: string; name: string; description?: string; visibility?: string; isSmart?: boolean; bookIds: number[] } | null>(null);
    const [books, setBooks] = useState<{ percentage_completed: string; book: { id: number; title: string; author: string; cover_image: string; } }[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'Activity' | 'Notes'>('Activity');
    const [showShareModal, setShowShareModal] = useState(false);

    // Feature States
    const [notes, setNotes] = useState<string[]>([]);
    const [newNote, setNewNote] = useState('');
    
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [sortBy, setSortBy] = useState('Recently Added');

    const [isSelectMode, setIsSelectMode] = useState(false);
    const [selectedBookIds, setSelectedBookIds] = useState<number[]>([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        const fetchCollectionData = async () => {
            try {
                // Load collection from local storage
                const saved = localStorage.getItem('bookify_collections');
                if (saved) {
                    const collections = JSON.parse(saved);
                    const current = collections.find((c: { id: string }) => c.id === params.id);
                    if (current) {
                        setCollection(current);

                        // Fetch books to populate the grid
                        if (current.bookIds && current.bookIds.length > 0 && token) {
                            const apiUrl = getApiUrl();
                            const idsParams = current.bookIds.join(',');

                            const [libRes, booksRes] = await Promise.all([
                                fetch(`${apiUrl}/api/library`, { headers: { 'Authorization': `Bearer ${token}` } }),
                                fetch(`${apiUrl}/api/books?ids=${idsParams}`, { headers: { 'Authorization': `Bearer ${token}` } })
                            ]);

                            if (libRes.ok && booksRes.ok) {
                                const libraryData = await libRes.json();
                                const booksData = await booksRes.json();
                                
                                // If returned paginated or direct array
                                const globalBooks = Array.isArray(booksData) ? booksData : (booksData.data || []);
                                
                                const mappedCollection = globalBooks.map((gb: { id: number; title: string; author: string; cover_image: string; }) => {
                                    // Check if user owns this book inside their library
                                    const owned = libraryData.find((lb: { book: { id: number }; percentage_completed: string }) => lb.book.id === gb.id);
                                    return {
                                        percentage_completed: owned ? owned.percentage_completed : "0",
                                        book: gb
                                    };
                                });

                                setBooks(mappedCollection);
                                setNotes(current.notes || []);
                            }
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to load collection details", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCollectionData();
    }, [params.id, token]);

    if (loading) {
        return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;
    }

    if (!collection) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
                <h2 className="text-xl font-medium mb-4">Collection not found</h2>
                <button onClick={() => router.push('/collections')} className="text-blue-500 hover:underline">
                    Return to Collections
                </button>
            </div>
        );
    }

    const handleAddNote = () => {
        if (!newNote.trim()) return;
        const updatedNotes = [...notes, newNote.trim()];
        setNotes(updatedNotes);
        setNewNote('');
        
        // Save back to localStorage
        const saved = localStorage.getItem('bookify_collections');
        if (saved && collection) {
            const collections = JSON.parse(saved);
            const index = collections.findIndex((c: { id: string }) => c.id === collection.id);
            if (index !== -1) {
                collections[index].notes = updatedNotes;
                localStorage.setItem('bookify_collections', JSON.stringify(collections));
            }
        }
    };

    const handleDeleteSelected = () => {
        if (selectedBookIds.length === 0) return;
        
        const updatedBooks = books.filter(b => !selectedBookIds.includes(b.book.id));
        setBooks(updatedBooks);
        
        // Save to localStorage
        const saved = localStorage.getItem('bookify_collections');
        if (saved && collection) {
            const collections = JSON.parse(saved);
            const index = collections.findIndex((c: { id: string }) => c.id === collection.id);
            if (index !== -1) {
                collections[index].bookIds = collections[index].bookIds.filter((id: number) => !selectedBookIds.includes(id));
                localStorage.setItem('bookify_collections', JSON.stringify(collections));
            }
        }
        
        setSelectedBookIds([]);
        setIsSelectMode(false);
        setShowDeleteConfirm(false);
    };

    const toggleSelection = (id: number) => {
        if (selectedBookIds.includes(id)) {
            setSelectedBookIds(selectedBookIds.filter(bid => bid !== id));
        } else {
            setSelectedBookIds([...selectedBookIds, id]);
        }
    };

    // Sort books logic based on `sortBy` state
    const sortedBooks = [...books].sort((a, b) => {
        if (sortBy === 'Title (A-Z)') return a.book.title.localeCompare(b.book.title);
        if (sortBy === 'Author (A-Z)') return a.book.author.localeCompare(b.book.author);
        if (sortBy === 'Progress') return (parseFloat(b.percentage_completed) || 0) - (parseFloat(a.percentage_completed) || 0);
        return 0; // 'Recently Added' default
    });


    return (
        <div className="min-h-screen bg-black text-zinc-300 flex">
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Topbar equivalent (for layout spacing/design) */}
                <div className="h-16 border-b border-zinc-900 px-6 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white font-medium">
                        Bookify
                    </div>
                    <div className="flex-1 max-w-xl px-8">
                        <div className="bg-zinc-900 border border-zinc-800 rounded-md px-4 py-1.5 flex items-center text-sm text-zinc-500">
                            Search books, authors, topics
                            <span className="ml-auto bg-black text-zinc-600 px-2 py-0.5 rounded text-xs border border-zinc-800">/</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm font-medium text-zinc-400">
                        <span className="cursor-pointer hover:text-white transition-colors">Settings</span>
                        <span className="cursor-pointer hover:text-white transition-colors">Profile</span>
                    </div>
                </div>

                <div className="p-8 pb-32">
                    {/* Header */}
                    <div className="mb-8">
                        <button 
                            onClick={() => router.push('/collections')}
                            className="flex items-center gap-3 text-white hover:text-zinc-300 transition-colors group mb-2"
                        >
                            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                            <h1 className="text-2xl font-medium tracking-wide">{collection.name}</h1>
                        </button>
                        <p className="text-zinc-400 text-sm ml-8 mb-4">
                            {collection.description || 'Your personalized collection'}
                        </p>
                        
                        <div className="flex items-center gap-4 ml-8 text-sm">
                            <span className="bg-[#0ea5e9] text-white px-2.5 py-0.5 rounded-full text-xs font-semibold lowercase">
                                {collection.visibility || 'private'}
                            </span>
                            <span className="text-zinc-400"><span className="text-white font-medium">{books.length}</span> items</span>
                            <span className="text-zinc-400 flex items-center gap-1.5">
                                <span className="text-white font-medium">1</span> members
                                <div className="w-5 h-5 rounded bg-zinc-800 text-zinc-300 flex items-center justify-center text-[10px] ml-1">
                                    Y
                                </div>
                                by You
                            </span>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between border-y border-zinc-900 py-3 mb-8 ml-8">
                        <div className="flex items-center gap-6">
                            {isSelectMode ? (
                                <>
                                    <button 
                                        onClick={() => {
                                            setIsSelectMode(false);
                                            setSelectedBookIds([]);
                                        }}
                                        className="flex items-center gap-2 text-sm font-medium text-white transition-colors"
                                    >
                                        <X size={16} /> Cancel
                                    </button>
                                    <button 
                                        onClick={() => setShowDeleteConfirm(true)}
                                        disabled={selectedBookIds.length === 0}
                                        className="flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Trash2 size={16} /> Delete
                                    </button>
                                </>
                            ) : (
                                <button 
                                    onClick={() => setIsSelectMode(true)}
                                    className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                                >
                                    <CheckCircle2 size={16} /> Select
                                </button>
                            )}

                            <div className="relative">
                                <button 
                                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                                    className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                                >
                                    <ListFilter size={16} /> Sort
                                </button>
                                {showSortDropdown && (
                                    <div className="absolute top-full left-0 mt-2 w-48 bg-[#0a0a0a] border border-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden py-1">
                                        {['Recently Added', 'Title (A-Z)', 'Author (A-Z)', 'Progress'].map((option) => (
                                            <button
                                                key={option}
                                                onClick={() => {
                                                    setSortBy(option);
                                                    setShowSortDropdown(false);
                                                }}
                                                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${sortBy === option ? 'text-white bg-zinc-900' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <Link href="/library" className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                                <Plus size={16} /> Add Items
                            </Link>
                        </div>
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => setShowShareModal(true)}
                                className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                            >
                                <Share2 size={16} /> Share
                            </button>
                            <button className="text-zinc-500 hover:text-zinc-300">
                                <MoreHorizontal size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Books Grid */}
                    <div className="ml-8">
                        {books.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                                {sortedBooks.map((item) => {
                                    const isSelected = selectedBookIds.includes(item.book.id);
                                    return (
                                        <div key={item.book.id} className="relative group">
                                            {isSelectMode && (
                                                <div 
                                                    className={`absolute top-2 right-2 z-20 w-6 h-6 rounded-md border-2 flex items-center justify-center pointer-events-none transition-colors ${
                                                        isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'bg-black/50 border-zinc-500'
                                                    }`}
                                                >
                                                    {isSelected && <CheckCircle2 size={14} />}
                                                </div>
                                            )}
                                            <div className={`${isSelected && isSelectMode ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-black rounded-md' : ''}`}>
                                                <BookCard
                                                    id={item.book.id}
                                                    title={item.book.title}
                                                    author={item.book.author}
                                                    coverImage={item.book.cover_image}
                                                    progress={parseFloat(item.percentage_completed) || 0}
                                                    isDownloaded={true}
                                                    onClick={(e) => {
                                                        if (isSelectMode) {
                                                            e.preventDefault();
                                                            toggleSelection(item.book.id);
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-20 border border-dashed border-zinc-900 rounded-2xl">
                                <p className="text-zinc-500 mb-4">No books in this collection yet.</p>
                                <Link href="/library" className="bg-zinc-900 hover:bg-zinc-800 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors">
                                    Add Books
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Sidebar - Activity */}
            <div className="w-[320px] border-l border-zinc-900 bg-black min-h-screen p-6 flex-shrink-0">
                <h3 className="text-[15px] font-medium text-white mb-4">Collection Activity</h3>
                
                <div className="flex items-center p-1 bg-zinc-900 rounded-xl mb-8">
                    <button 
                        onClick={() => setActiveTab('Activity')}
                        className={`flex-1 text-xs font-medium py-1.5 rounded-lg transition-colors ${activeTab === 'Activity' ? 'bg-[#18181b] text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        Activity
                    </button>
                    <button 
                        onClick={() => setActiveTab('Notes')}
                        className={`flex-1 text-xs font-medium py-1.5 rounded-lg transition-colors ${activeTab === 'Notes' ? 'bg-[#18181b] text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        Notes
                    </button>
                </div>

                {activeTab === 'Activity' && (
                    <div className="space-y-6">
                        {/* Mock Timeline */}
                        {books.length > 0 && (
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-zinc-300 leading-snug">
                                        You added <span className="font-medium text-white">{books[0].book.title}</span>
                                    </p>
                                    <p className="text-xs text-zinc-500 mt-1">Today</p>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                            </div>
                            <div>
                                <p className="text-sm text-zinc-300 leading-snug">
                                    {collection.description?.includes('Shared by') 
                                        ? `You were invited to this collection by ${collection.description.replace('Shared by ', '')}`
                                        : "You created this collection"}
                                </p>
                                <p className="text-xs text-zinc-500 mt-1">Sep 1</p>
                            </div>
                        </div>
                    </div>
                )}
                
                {activeTab === 'Notes' && (
                    <div className="flex flex-col h-[calc(100vh-140px)]">
                        <div className="flex-1 space-y-4 mb-4 overflow-y-auto pr-2">
                            {notes.length > 0 ? (
                                notes.map((note, index) => (
                                    <div key={index} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl text-sm text-zinc-300 leading-relaxed break-words shadow-sm">
                                        {note}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 opacity-60">
                                    <p className="text-zinc-500 text-sm">No notes added yet.</p>
                                </div>
                            )}
                        </div>
                        <div className="mt-auto pt-4 flex items-center">
                            <input
                                type="text"
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                onKeyDown={(e) => { 
                                    if(e.key === 'Enter') handleAddNote(); 
                                }}
                                placeholder="Write a note..."
                                className="w-full bg-black border border-zinc-800 focus:border-[#0ea5e9] rounded-xl px-4 py-3 text-sm text-white transition-colors focus:outline-none"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Custom Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#0a0a0a] border border-zinc-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                        <h3 className="text-lg font-bold text-white mb-2">Remove Items</h3>
                        <p className="text-zinc-400 text-sm mb-6">
                            Are you sure you want to remove the {selectedBookIds.length} selected items from this collection? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleDeleteSelected}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium shadow transition-colors"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ShareCollectionModal 
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                collectionId={collection.id}
                collectionName={collection.name}
            />
        </div>
    );
}
