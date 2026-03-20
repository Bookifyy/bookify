import { useState, useEffect, useRef } from 'react';
import { X, Loader2, Send, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getApiUrl } from '../lib/utils';
import { toast } from 'sonner';

interface ShareCollectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    collectionId: string;
    collectionName: string;
    bookIds: number[];
}

export function ShareCollectionModal({ isOpen, onClose, collectionId, collectionName, bookIds }: ShareCollectionModalProps) {
    const { token } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [role, setRole] = useState('Viewer');
    const [invitedUsers, setInvitedUsers] = useState<{ id: string; name: string; email: string; role: string; type: 'db' | 'email' }[]>([]);
    
    const [searchResults, setSearchResults] = useState<{ id: string; name: string; email: string }[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);

    // Email Validations
    const isEmailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(searchTerm);

    useEffect(() => {
        if (!searchTerm.trim()) {
            setSearchResults([]);
            return;
        }

        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        searchTimeout.current = setTimeout(async () => {
            if (!token) return;
            setIsSearching(true);
            try {
                const res = await fetch(`${getApiUrl()}/api/users/search?query=${encodeURIComponent(searchTerm)}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setSearchResults(data);
                }
            } catch (err) {
                console.error("Failed to search users", err);
            } finally {
                setIsSearching(false);
            }
        }, 400); // 400ms debounce

        return () => {
            if (searchTimeout.current) clearTimeout(searchTimeout.current);
        };
    }, [searchTerm, token]);

    if (!isOpen) return null;

    const handleInviteDBUser = async (user: { id: string; name: string; email: string }) => {
        if (!invitedUsers.find(u => u.id === user.id)) {
            setInvitedUsers(prev => [...prev, { ...user, role, type: 'db' }]);
            
            // Post notification to backend
            try {
                const res = await fetch(`${getApiUrl()}/api/collections/share`, {
                    method: 'POST',
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        user_id: user.id,
                        collection_id: collectionId,
                        collection_name: collectionName,
                        book_ids: bookIds
                    })
                });
                if (res.ok) {
                    toast.success(`Invitation sent to ${user.name}`);
                } else {
                    toast.error("Failed to send invitation");
                }
            } catch (err) {
                console.error("Failed to post share invite", err);
                toast.error("Network error");
            }
        }
        setSearchTerm('');
    };

    const handleInviteEmail = async () => {
        if (!isEmailFormat) return;
        
        // Mock ID for purely UI purposes
        const mockId = `email_${Date.now()}`;
        setInvitedUsers(prev => [...prev, { id: mockId, name: searchTerm, email: searchTerm, role: role, type: 'email' }]);
        
        // Attempt email API
        try {
            const res = await fetch(`${getApiUrl()}/api/collections/share-email`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: searchTerm,
                    collection_name: collectionName
                })
            });
            if (res.ok) {
                toast.success(`Email invite sent to ${searchTerm}`);
            } else {
                toast.error("Failed to send email invite");
            }
        } catch (err) {
            console.error("Failed to post email invite", err);
            toast.error("Network error");
        }
        setSearchTerm('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#0a0a0a] border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
                <div className="p-6">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-white mb-1">Share Collection</h2>
                        <p className="text-sm text-zinc-400">Share &quot;{collectionName}&quot; with others</p>
                    </div>

                    <div className="space-y-6">
                        {/* Search and Invite Section */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-white block">Invite Users</label>
                            
                            <div className="flex gap-3">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search by name or email..."
                                        className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-lg px-4 py-2.5 pr-10 text-white transition-all placeholder:text-zinc-600 focus:outline-none focus:border-[#0ea5e9]"
                                        autoFocus
                                    />
                                    {searchTerm && (
                                        <button 
                                            onClick={() => setSearchTerm('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                    
                                    {/* Dropdown Suggestions */}
                                    {searchTerm && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden z-10 shadow-xl max-h-[300px] overflow-y-auto">
                                            {isSearching ? (
                                                <div className="p-4 flex items-center justify-center text-zinc-500">
                                                    <Loader2 size={16} className="animate-spin" />
                                                </div>
                                            ) : (
                                                <>
                                                    {searchResults.length > 0 ? (
                                                        searchResults.map(user => (
                                                            <button
                                                                key={user.id}
                                                                onClick={() => handleInviteDBUser(user)}
                                                                className="w-full flex items-center gap-3 p-3 hover:bg-zinc-800/50 transition-colors text-left"
                                                            >
                                                                <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold uppercase">
                                                                    {user.name.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-medium text-white">{user.name}</p>
                                                                    <p className="text-xs text-zinc-400">{user.email}</p>
                                                                </div>
                                                            </button>
                                                        ))
                                                    ) : (
                                                        !isEmailFormat && <div className="p-4 text-sm text-zinc-500 text-center">No users found</div>
                                                    )}
                                                    
                                                    {/* Email Invite Option */}
                                                    {isEmailFormat && (
                                                        <button 
                                                            onClick={handleInviteEmail}
                                                            className="w-full flex items-center gap-3 p-3 hover:bg-zinc-800/50 transition-colors border-t border-zinc-800"
                                                        >
                                                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                                                                <Send size={14} />
                                                            </div>
                                                            <div className="text-left">
                                                                <p className="text-sm font-medium text-white">Send Email Invite</p>
                                                                <p className="text-xs text-emerald-500">{searchTerm}</p>
                                                            </div>
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <select 
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="bg-[#0a0a0a] border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#0ea5e9]"
                                >
                                    <option value="Viewer">Viewer</option>
                                    <option value="Editor">Editor</option>
                                    <option value="Owner">Owner</option>
                                </select>
                            </div>

                            <ul className="text-xs text-zinc-500 space-y-1.5 mt-3 pl-1">
                                <li><span className="font-medium text-zinc-300">Viewer:</span> Can view collection and items</li>
                                <li><span className="font-medium text-zinc-300">Editor:</span> Can add, remove, and organize items</li>
                                <li><span className="font-medium text-zinc-300">Owner:</span> Full control including deletion</li>
                            </ul>
                        </div>

                        {/* Allowed Users List */}
                        {invitedUsers.length > 0 && (
                            <div className="pt-6 border-t border-zinc-900">
                                <h4 className="text-sm font-medium text-white mb-3">People with access</h4>
                                <div className="space-y-3">
                                    {invitedUsers.map(user => (
                                        <div key={user.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${user.type === 'db' ? 'bg-blue-500/20 text-blue-400 uppercase' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                                    {user.type === 'db' ? user.name.charAt(0) : '@'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-white">{user.name}</p>
                                                    <p className="text-xs text-zinc-500">{user.email}</p>
                                                </div>
                                            </div>
                                            <span className="text-xs font-medium text-zinc-400">{user.role}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-zinc-800 flex justify-end gap-3 bg-[#0a0a0a]">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-lg text-sm font-medium text-zinc-300 hover:text-white border border-transparent hover:border-zinc-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-lg text-sm font-medium bg-[#3730a3] hover:bg-indigo-600 text-white transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
