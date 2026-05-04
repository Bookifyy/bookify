'use client';

import { useState, useEffect } from 'react';
import { Layers, MoreVertical, Lock, Users, Clock, Globe, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { CreateCollectionModal } from '../components/CreateCollectionModal';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { getApiUrl, resolveAssetUrl } from '../lib/utils';
import { toast } from 'sonner';

interface LocalCollection {
    id: string;
    name: string;
    bookIds: number[];
    isSmart: boolean;
}

const MOCK_IMAGES = [
    'https://images.unsplash.com/photo-1544822688-c5f41d328e67?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80'
];

export default function CollectionsPage() {
    const { token } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'my' | 'smart'>('my');
    const [collections, setCollections] = useState<LocalCollection[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [libraryBooks, setLibraryBooks] = useState<{ book: { id: number; cover_image: string } }[]>([]);
    
    const fetchCollections = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${getApiUrl()}/api/collections`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setCollections(await res.json());
            }
        } catch (err) {
            console.error("Failed fetching collections", err);
        }
    };

    useEffect(() => {
        fetchCollections();
    }, [token]);

    useEffect(() => {
        const fetchLibrary = async () => {
            if (!token) return;
            try {
                const res = await fetch(`${getApiUrl()}/api/library`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    setLibraryBooks(await res.json());
                }
            } catch (err) {
                console.error("Failed fetching collection covers", err);
            }
        };
        fetchLibrary();
    }, [token]);

    const getImages = (id: string, bookIds: number[]) => {
        if (libraryBooks.length > 0 && bookIds.length > 0) {
            const covers = libraryBooks
                .filter(item => bookIds.includes(item.book.id))
                .map(item => item.book.cover_image)
                .filter(Boolean);
            
            if (covers.length > 0) {
                return covers.slice(0, 3).map(c => resolveAssetUrl(c));
            }
        }

        const count = Math.min(Math.max(bookIds.length, 1), 3);
        const idNum = parseInt(id.replace(/\D/g, '')) || 0;
        const result = [];
        for(let i=0; i<count; i++) {
            result.push(MOCK_IMAGES[(idNum + i) % MOCK_IMAGES.length]);
        }
        return result;
    };

    const handleCreateCollection = async (data: { name: string; description: string; visibility: string; isSmart?: boolean }) => {
        try {
            const res = await fetch(`${getApiUrl()}/api/collections`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            if (res.ok) {
                const newCollection = await res.json();
                setCollections([...collections, newCollection]);
                setShowCreateModal(false);
                toast.success("Collection created successfully!");
                router.push('/collections/' + newCollection.id);
            } else {
                toast.error("Failed to create collection");
            }
        } catch (err) {
            console.error("Network error creating collection", err);
            toast.error("Network error");
        }
    };

    return (
        <div className="min-h-screen bg-background text-muted-foreground pb-20">
            {/* Header Area */}
            <div className="border-b border-border bg-background pt-6 pb-4 px-8 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center border border-blue-500/20">
                            <Layers className="text-blue-500" size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-medium text-foreground tracking-wide">Collections</h1>
                            <p className="text-sm text-muted-foreground mt-0.5">Curated playlists and smart collections</p>
                        </div>
                    </div>
                    {/* Create Collection Button */}
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="p-2 sm:px-4 sm:py-2.5 bg-[#3730A3] hover:bg-indigo-600 text-white rounded-lg flex items-center justify-center gap-2 transition-all font-medium text-sm border border-indigo-500/30 whitespace-nowrap"
                    >
                        <span className="opacity-70 text-base mb-0.5 leading-none">+</span>
                        <span>New Collection</span>
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 mt-6">
                {/* Tabs */}
                <div className="p-1.5 bg-card rounded-full flex items-center mb-8 border border-border shadow-sm hover:shadow-md dark:shadow-none transition-shadow duration-300">
                    <button
                        onClick={() => setActiveTab('my')}
                        className={`flex-1 py-3 text-sm font-medium rounded-full transition-all ${
                            activeTab === 'my'
                                ? 'bg-[#18181b] text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-muted-foreground'
                        }`}
                    >
                        My Collections
                    </button>
                    <button
                        onClick={() => setActiveTab('smart')}
                        className={`flex-1 py-3 text-sm font-medium rounded-full transition-all ${
                            activeTab === 'smart'
                                ? 'bg-[#18181b] text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-muted-foreground'
                        }`}
                    >
                        Smart Collections
                    </button>
                </div>

                {/* Grid */}
                {(() => {
                    const displayCollections = collections.filter(c => activeTab === 'smart' ? c.isSmart : !c.isSmart);
                    
                    if (displayCollections.length > 0) {
                        return (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {displayCollections.map((collection) => {
                                    const images = getImages(collection.id, collection.bookIds);
                                    return (
                                        <Link
                                            key={collection.id}
                                            href={`/collections/${collection.id}`}
                                            className="bg-[#0a0a0a] border border-border rounded-2xl overflow-hidden group hover:border-zinc-700 transition-colors flex flex-col block"
                                        >
                                            {/* Image Layout */}
                                            <div className="relative h-56 bg-card border-b border-border overflow-hidden shadow-sm hover:shadow-md dark:shadow-none transition-shadow duration-300">
                                                {images.length === 1 && (
                                                    <div className="relative w-full h-full">
                                                        <img src={images[0]} alt={collection.name} className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                                    </div>
                                                )}
                                                {images.length === 2 && (
                                                    <div className="grid grid-cols-2 h-full gap-0.5 bg-background">
                                                        <img src={images[0]} alt={collection.name} className="w-full h-full object-cover" />
                                                        <img src={images[1]} alt={collection.name} className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                                    </div>
                                                )}
                                                {images.length >= 3 && (
                                                    <div className="grid grid-cols-2 h-full gap-0.5 bg-background">
                                                        <div className="h-full">
                                                            <img src={images[0]} alt={collection.name} className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="grid grid-rows-2 gap-0.5 h-full">
                                                            <img src={images[1]} alt={collection.name} className="w-full h-full object-cover" />
                                                            <img src={images[2]} alt={collection.name} className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                                    </div>
                                                )}

                                                {/* Item Count Badge */}
                                                <div className="absolute bottom-3 left-4 bg-background/80 backdrop-blur-md text-foreground px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide">
                                                    {collection.bookIds.length} items
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="p-5 flex-1 flex flex-col">
                                                <div className="flex items-start justify-between gap-4 mb-2">
                                                    <h3 className="font-serif text-lg font-medium text-foreground line-clamp-1 leading-snug">
                                                        {collection.name}
                                                    </h3>
                                                    <button className="text-muted-foreground hover:text-foreground transition-colors p-1 -mr-1">
                                                        <MoreVertical size={16} />
                                                    </button>
                                                </div>
                                                <p className="text-sm text-muted-foreground mb-5 line-clamp-2 leading-relaxed">
                                                    Your personalized collection
                                                </p>

                                                <div className="flex items-center gap-3 mt-auto">
                                                    {/* Default Status Badge */}
                                                    <div className="flex items-center gap-1.5 bg-[#0ea5e9] text-foreground px-3 py-1 rounded-full text-xs font-semibold">
                                                        <Lock size={12} className="text-yellow-300" />
                                                        <span>Private</span>
                                                    </div>
                                                </div>

                                                {/* Footer */}
                                                <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/60">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-black bg-zinc-300">
                                                            Y
                                                        </div>
                                                        <span className="text-xs text-muted-foreground">
                                                            by <span className="text-muted-foreground font-medium">You</span>
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                                                        <Clock size={12} />
                                                        <span>Updated</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        );
                    }

                    return activeTab === 'my' ? (
                        <div className="py-20 flex flex-col items-center justify-center text-center border border-dashed border-border rounded-3xl">
                            <div className="bg-card p-4 rounded-full mb-4 shadow-sm hover:shadow-md dark:shadow-none transition-shadow duration-300">
                                <BookOpen size={32} className="text-zinc-700" />
                            </div>
                            <h3 className="text-lg font-medium text-foreground mb-2 font-serif">No collections yet</h3>
                            <p className="text-muted-foreground text-sm max-w-md">
                                You haven't created any collections yet. Go to your Library to create your first collection and organize your books!
                            </p>
                        </div>
                    ) : (
                        <div className="py-20 flex flex-col items-center justify-center text-center border border-dashed border-border rounded-3xl">
                            <div className="w-16 h-16 bg-card rounded-2xl flex items-center justify-center mb-4 border border-border shadow-sm hover:shadow-md dark:shadow-none transition-shadow duration-300">
                                <Layers className="text-muted-foreground" size={32} />
                            </div>
                            <h3 className="text-lg font-medium text-foreground mb-2 font-serif">Smart Collections</h3>
                            <p className="text-muted-foreground text-sm max-w-md">
                                Smart collections automatically organize your books based on tags, reading status, and authors. You haven't created any yet!
                            </p>
                        </div>
                    );
                })()}
            </div>
            
            <CreateCollectionModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreate={handleCreateCollection}
            />
        </div>
    );
}
