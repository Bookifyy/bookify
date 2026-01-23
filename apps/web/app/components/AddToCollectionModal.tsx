import { useState, useEffect } from 'react';
import { X, Plus, Check } from 'lucide-react';

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
    const [localCollections, setLocalCollections] = useState<Collection[]>(collections);

    useEffect(() => {
        setLocalCollections(collections);
    }, [collections]);

    if (bookId === null) return null;

    const toggleBookInCollection = (collectionId: string) => {
        const updated = localCollections.map(c => {
            if (c.id === collectionId) {
                const bookIds = c.bookIds.includes(bookId)
                    ? c.bookIds.filter(id => id !== bookId)
                    : [...c.bookIds, bookId];
                return { ...c, bookIds };
            }
            return c;
        });
        setLocalCollections(updated);
        onUpdateCollections(updated);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                    <h3 className="font-semibold text-white">Add to Collection</h3>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
                    {localCollections.length > 0 ? (
                        localCollections.map(collection => {
                            const isAdded = collection.bookIds.includes(bookId);
                            return (
                                <button
                                    key={collection.id}
                                    onClick={() => toggleBookInCollection(collection.id)}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${isAdded
                                            ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-200'
                                            : 'bg-zinc-800/50 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                                        }`}
                                >
                                    <span className="font-medium">{collection.name}</span>
                                    {isAdded && <Check size={18} className="text-indigo-400" />}
                                </button>
                            );
                        })
                    ) : (
                        <p className="text-center text-zinc-500 py-4 text-sm">No collections created yet.</p>
                    )}
                </div>

                <div className="p-4 bg-zinc-950/50 border-t border-zinc-800">
                    <button onClick={onClose} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition-colors">
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
