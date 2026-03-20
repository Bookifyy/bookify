'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, ListFilter, Plus, Share2, MoreHorizontal } from 'lucide-react';
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
    const [books, setBooks] = useState<{ progress_percentage: number; book: { id: number; title: string; author: string; cover_image: string; } }[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'Activity' | 'Notes'>('Activity');
    const [showShareModal, setShowShareModal] = useState(false);

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
                            const res = await fetch(`${apiUrl}/api/library`, {
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            if (res.ok) {
                                const libraryData = await res.json();
                                // Filter library data to only books in this collection
                                const collectionBooks = libraryData.filter((b: { book: { id: number } }) => current.bookIds.includes(b.book.id));
                                setBooks(collectionBooks);
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
                            <button className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                                <CheckCircle2 size={16} /> Select
                            </button>
                            <button className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                                <ListFilter size={16} /> Sort
                            </button>
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
                                {books.map((item) => (
                                    <BookCard
                                        key={item.book.id}
                                        id={item.book.id}
                                        title={item.book.title}
                                        author={item.book.author}
                                        coverImage={item.book.cover_image}
                                        progress={item.progress_percentage || 0}
                                        isDownloaded={true}
                                    />
                                ))}
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
                                    You created this collection
                                </p>
                                <p className="text-xs text-zinc-500 mt-1">Sep 1</p>
                            </div>
                        </div>
                    </div>
                )}
                
                {activeTab === 'Notes' && (
                    <div className="text-center py-10">
                        <p className="text-zinc-500 text-sm">No notes added yet.</p>
                    </div>
                )}
            </div>

            <ShareCollectionModal 
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                collectionName={collection.name}
            />
        </div>
    );
}
