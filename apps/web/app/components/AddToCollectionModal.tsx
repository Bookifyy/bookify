import { useState, useEffect } from 'react';
import { X, Plus, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { getApiUrl } from '../lib/utils';
import { toast } from 'sonner';

interface Collection {
    id: string;
    name: string;
    bookIds: number[];
}

interface AddToCollectionModalProps {
    bookId: number | null;
    collections: Collection[];
    onClose: () => void;
    onUpdateCollections: (updatedCollections: Collection[]) => void;
}

export function AddToCollectionModal({ bookId, collections, onClose, onUpdateCollections }: AddToCollectionModalProps) {
    const { token } = useAuth();
    const router = useRouter();
    const [localCollections, setLocalCollections] = useState<Collection[]>(collections);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        setLocalCollections(collections);
    }, [collections]);

    if (bookId === null) return null;

    const filteredCollections = localCollections.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleBookInCollection = async (collectionId: string) => {
        if (!token) return;
        const targetCollection = localCollections.find(c => c.id === collectionId);
        if (!targetCollection) return;

        const isAdded = targetCollection.bookIds.includes(bookId);
        const method = isAdded ? 'DELETE' : 'POST';
        const url = isAdded 
            ? `${getApiUrl()}/api/collections/${collectionId}/books/${bookId}`
            : `${getApiUrl()}/api/collections/${collectionId}/books`;

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: isAdded ? undefined : JSON.stringify({ book_id: bookId })
            });

            if (res.ok) {
                const updated = localCollections.map(c => {
                    if (c.id === collectionId) {
                        const bookIds = isAdded
                            ? c.bookIds.filter(id => id !== bookId)
                            : [...c.bookIds, bookId];
                        return { ...c, bookIds };
                    }
                    return c;
                });
                setLocalCollections(updated);
                onUpdateCollections(updated);
                toast.success(isAdded ? "Removed from collection" : "Added to collection");
                if (!isAdded) {
                    router.push(`/collections/${collectionId}`);
                }
            } else {
                toast.error("Action failed.");
            }
        } catch (err) {
            console.error("Failed to toggle book in collection", err);
            toast.error("Network error.");
        }
    };

    const handleCreateNew = async () => {
        if (!searchQuery.trim() || !token) return;
        
        try {
            // First create the collection
            const colRes = await fetch(`${getApiUrl()}/api/collections`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: searchQuery,
                    description: '',
                    visibility: 'Private'
                })
            });
            
            if (colRes.ok) {
                const newCollection = await colRes.json();
                
                // Then immediately add this book to it
                await fetch(`${getApiUrl()}/api/collections/${newCollection.id}/books`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ book_id: bookId })
                });
                
                newCollection.bookIds = [bookId]; // Optimistically update
                const updated = [...localCollections, newCollection];
                setLocalCollections(updated);
                onUpdateCollections(updated);
                setSearchQuery('');
                toast.success("Collection created & book added!");
                router.push(`/collections/${newCollection.id}`);
            } else {
                toast.error("Failed to create collection");
            }
        } catch (err) {
            console.error("Failed creating collection and adding book", err);
            toast.error("Network error.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm">
            <div className="bg-[#121212] border border-border rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="p-5 border-b border-border flex items-center justify-between">
                    <h3 className="font-semibold text-white">Add to Collection</h3>
                    <button onClick={onClose} className="text-muted-foreground hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Input Area */}
                <div className="p-5 border-b border-border/50">
                    <input
                        type="text"
                        placeholder="Search or create collection..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#1f1f1f] border-none rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-muted-foreground"
                    />
                </div>

                {/* Collection List */}
                <div className="p-5 max-h-[40vh] overflow-y-auto space-y-2">
                    {filteredCollections.length > 0 ? (
                        filteredCollections.map(collection => {
                            const isAdded = collection.bookIds.includes(bookId);
                            return (
                                <button
                                    key={collection.id}
                                    onClick={() => toggleBookInCollection(collection.id)}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${isAdded
                                            ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-200'
                                            : 'bg-zinc-800/30 border-border/50 text-muted-foreground hover:bg-zinc-800 hover:border-zinc-700'
                                        }`}
                                >
                                    <span className="font-medium">{collection.name}</span>
                                    {isAdded && <Check size={18} className="text-indigo-400" />}
                                </button>
                            );
                        })
                    ) : (
                        <div className="text-center py-2">
                            <p className="text-muted-foreground text-sm mb-3">No collections match &quot;{searchQuery}&quot;</p>
                            {searchQuery.trim() && (
                                <button 
                                    onClick={handleCreateNew}
                                    className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center justify-center gap-2 mx-auto"
                                >
                                    <Plus size={16} /> Create &quot;{searchQuery}&quot;
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                <div className="p-5 bg-[#0a0a0a] border-t border-border flex gap-3">
                    <button 
                        onClick={onClose} 
                        className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-muted-foreground font-medium py-2.5 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onClose} 
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-xl transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
