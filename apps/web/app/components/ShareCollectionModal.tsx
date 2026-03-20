import { useState } from 'react';

interface ShareCollectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    collectionName: string;
}

const MOCK_USERS = [
    { id: '1', name: 'Emma Wilson', email: 'emma@example.com', avatar: 'E' },
    { id: '2', name: 'Michael Chen', email: 'michael@example.com', avatar: 'M' },
    { id: '3', name: 'Sarah Jenkins', email: 'sarah@example.com', avatar: 'S' }
];

export function ShareCollectionModal({ isOpen, onClose, collectionName }: ShareCollectionModalProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [role, setRole] = useState('Viewer');
    const [invitedUsers, setInvitedUsers] = useState<any[]>([]);

    if (!isOpen) return null;

    const filteredUsers = searchTerm.trim() 
        ? MOCK_USERS.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))
        : MOCK_USERS;

    const handleInvite = (user: any) => {
        if (!invitedUsers.find(u => u.id === user.id)) {
            setInvitedUsers([...invitedUsers, { ...user, role }]);
        }
        setSearchTerm('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#0a0a0a] border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
                <div className="p-6">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-white mb-1">Share Collection</h2>
                        <p className="text-sm text-zinc-400">Share "{collectionName}" with others</p>
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
                                        className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-lg px-4 py-2.5 text-white transition-all placeholder:text-zinc-600 focus:outline-none focus:border-[#0ea5e9]"
                                        autoFocus
                                    />
                                    
                                    {/* Dropdown Suggestions */}
                                    {searchTerm && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden z-10 shadow-xl">
                                            {filteredUsers.length > 0 ? (
                                                filteredUsers.map(user => (
                                                    <button
                                                        key={user.id}
                                                        onClick={() => handleInvite(user)}
                                                        className="w-full flex items-center gap-3 p-3 hover:bg-zinc-800/50 transition-colors text-left"
                                                    >
                                                        <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">
                                                            {user.avatar}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-white">{user.name}</p>
                                                            <p className="text-xs text-zinc-400">{user.email}</p>
                                                        </div>
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="p-4 text-sm text-zinc-500 text-center">No users found</div>
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
                                                <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">
                                                    {user.avatar}
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
                <div className="p-4 border-t border-zinc-800 flex justify-end bg-[#0a0a0a]">
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
