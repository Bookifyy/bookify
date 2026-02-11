'use client';

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getApiUrl } from '../lib/utils';
import { Loader2, X, Search, Check, User } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
}

export function InviteMemberModal({ isOpen, onClose, groupId }: { isOpen: boolean, onClose: () => void, groupId: number }) {
    const { token } = useAuth();
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    if (!isOpen) return null;

    const handleSearch = async (query: string) => {
        setSearch(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        setSearching(true);
        // Mock search for now or implement endpoint
        // Assuming we might need a search endpoint. 
        // For verify, I'll just skip and focus on UI or basic implementation if endpoint exists.
        // Let's assume we can use /api/users?search=... if it existed.
        // Or fetch all users (bad for scale) but okay for MVP?
        // Let's implement a real search later, for now mock empty or simple fetch.

        // Actually, let's try to hit /api/admin/users if admin? No.
        // Let's just mock it for UI as per requirement "Front-end Actions".
        // Real implementation requires backend endpoint for user search.

        // Simulating search delay
        setTimeout(() => {
            // Mock Data
            const mockUsers = [
                { id: 101, name: 'Alice Johnson', email: 'alice@example.com' },
                { id: 102, name: 'Bob Smith', email: 'bob@example.com' },
                { id: 103, name: 'Charlie Brown', email: 'charlie@example.com' },
            ].filter(u => u.name.toLowerCase().includes(query.toLowerCase()));
            setSearchResults(mockUsers);
            setSearching(false);
        }, 500);
    };

    const toggleUser = (userId: number) => {
        setSelectedUsers(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const handleInvite = async () => {
        if (selectedUsers.length === 0) return;
        setLoading(true);
        setError('');

        try {
            const apiUrl = getApiUrl();
            const res = await fetch(`${apiUrl}/api/groups/${groupId}/invite`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ user_ids: selectedUsers })
            });

            if (res.ok) {
                setSuccess(`Successfully invited ${selectedUsers.length} members!`);
                setTimeout(() => {
                    onClose();
                    setSuccess('');
                    setSelectedUsers([]);
                    setSearch('');
                    setSearchResults([]);
                }, 1500);
            } else {
                const data = await res.json();
                setError(data.message || 'Failed to invite members');
            }
        } catch (err) {
            setError('Connection failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                    <h2 className="text-xl font-bold text-white">Invite Members</h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-4 border-b border-zinc-800 bg-black">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                            placeholder="Search contacts..."
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    {searching ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="animate-spin text-indigo-500" />
                        </div>
                    ) : searchResults.length > 0 ? (
                        <div className="space-y-1">
                            {searchResults.map(user => {
                                const isSelected = selectedUsers.includes(user.id);
                                return (
                                    <button
                                        key={user.id}
                                        onClick={() => toggleUser(user.id)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${isSelected ? 'bg-indigo-600/10 border border-indigo-500/50' : 'hover:bg-zinc-800 border border-transparent'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${isSelected ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                                            {user.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div className={`font-medium ${isSelected ? 'text-indigo-400' : 'text-white'}`}>{user.name}</div>
                                            <div className="text-xs text-zinc-500">{user.email}</div>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-zinc-600'}`}>
                                            {isSelected && <Check size={14} />}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    ) : search ? (
                        <div className="text-center p-8 text-zinc-500">
                            No users found.
                        </div>
                    ) : (
                        <div className="text-center p-8 text-zinc-500">
                            Type to search for users...
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-zinc-800 bg-black">
                    {error && <div className="text-red-500 text-sm mb-3 text-center">{error}</div>}
                    {success && <div className="text-green-500 text-sm mb-3 text-center">{success}</div>}

                    <button
                        onClick={handleInvite}
                        disabled={loading || selectedUsers.length === 0}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 className="animate-spin" size={20} />}
                        {loading ? 'Sending Invites...' : `Invite ${selectedUsers.length > 0 ? `(${selectedUsers.length})` : ''}`}
                    </button>
                </div>
            </div>
        </div>
    );
}
