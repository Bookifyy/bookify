import { useState } from 'react';

interface CreateCollectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (collection: { name: string; description: string; visibility: string; isSmart?: boolean }) => void;
}

export function CreateCollectionModal({ isOpen, onClose, onCreate }: CreateCollectionModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [visibility, setVisibility] = useState<'Private' | 'Group' | 'Public'>('Private');
    const [isSmart, setIsSmart] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        onCreate({
            name: name.trim(),
            description: description.trim(),
            visibility,
            isSmart
        });
        
        // Reset
        setName('');
        setDescription('');
        setVisibility('Private');
        setIsSmart(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm">
            <div className="bg-[#0a0a0a] border border-border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-white mb-1">Create New Collection</h2>
                            <p className="text-sm text-muted-foreground">Organize your books into a curated collection</p>
                        </div>

                        <div className="space-y-5">
                            {/* Name */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-white">Collection Name <span className="text-muted-foreground">*</span></label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Spring 2024 Reading"
                                    className={`w-full bg-[#0a0a0a] border rounded-lg px-4 py-2.5 text-white transition-all placeholder:text-zinc-600 focus:outline-none focus:ring-1 ${
                                        name ? 'border-[#0ea5e9] ring-[#0ea5e9]' : 'border-border focus:border-[#0ea5e9] focus:ring-[#0ea5e9]'
                                    }`}
                                    autoFocus
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-white">Description</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="What's this collection about?"
                                    className="w-full bg-[#0a0a0a] border border-border rounded-lg px-4 py-2.5 text-white transition-all placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
                                />
                            </div>

                            {/* Visibility */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-white block">Visibility</label>
                                <div className="space-y-2">
                                    {(['Private', 'Group', 'Public'] as const).map((type) => {
                                        const isSelected = visibility === type;
                                        const descriptions = {
                                            Private: 'Only you can see this collection',
                                            Group: 'Share with specific people or groups',
                                            Public: 'Anyone can discover this collection'
                                        };
                                        return (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setVisibility(type)}
                                                className={`w-full flex items-center gap-4 p-3.5 rounded-xl border transition-all text-left ${
                                                    isSelected ? 'border-zinc-700 bg-card/30' : 'border-border/60 hover:border-zinc-700'
                                                }`}
                                            >
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                                    isSelected ? 'border-indigo-500' : 'border-zinc-600'
                                                }`}>
                                                    {isSelected && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                                                </div>
                                                <div>
                                                    <span className="text-sm font-medium text-white mr-2">{type}</span>
                                                    <span className="text-sm text-muted-foreground">{descriptions[type]}</span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Smart Collection Toggle */}
                            <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isSmart ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-border/60'}`}>
                                <div>
                                    <h4 className="text-sm font-medium text-white">Smart Collection</h4>
                                    <p className="text-xs text-muted-foreground mt-0.5">Auto-update based on rules</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsSmart(!isSmart)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        isSmart ? 'bg-indigo-600' : 'bg-zinc-700'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            isSmart ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-border flex justify-end gap-3 bg-[#0a0a0a]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-white border border-transparent hover:border-border transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!name.trim()}
                            className="px-5 py-2.5 rounded-lg text-sm font-medium bg-[#3730a3] hover:bg-indigo-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Create Collection
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
