'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Search, Ban, Trash2, Edit2, CheckCircle, ShieldAlert, MoreVertical } from 'lucide-react';
import { ConfirmModal } from '../../components/ConfirmModal';

interface User {
    id: number;
    name: string;
    email: string;
    roles: { name: string }[];
    created_at: string;
    is_active?: boolean;
}

export default function AdminUsersPage() {
    const { token } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');

    // Modal State
    const [banModalOpen, setBanModalOpen] = useState(false);
    const [userToBan, setUserToBan] = useState<User | null>(null);

    useEffect(() => {
        if (token) fetchUsers();
    }, [token]);

    const fetchUsers = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${apiUrl}/api/admin/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            if (!res.ok) throw new Error('Failed to fetch users');
            const data = await res.json();
            setUsers(data);
            setLoading(false);
        } catch (err: any) {
            console.error(err);
            setError('Failed to load users. Showing demo data.');
            // Fallback mock data
            setUsers([
                { id: 1, name: 'Admin User', email: 'admin@bookify.com', roles: [{ name: 'Admin' }], created_at: new Date().toISOString(), is_active: true },
                { id: 2, name: 'John Doe', email: 'john@example.com', roles: [{ name: 'User' }], created_at: new Date().toISOString(), is_active: true },
                { id: 3, name: 'Jane Smith', email: 'jane@example.com', roles: [{ name: 'User' }], created_at: new Date().toISOString(), is_active: true },
            ]);
            setLoading(false);
        }
    };

    const confirmBan = (user: User) => {
        setUserToBan(user);
        setBanModalOpen(true);
    };

    const handleBanUser = async () => {
        if (!userToBan) return;

        // Placeholder for API call
        // In a real implementation: await fetch(`/api/admin/users/${userToBan.id}/ban`, ...)

        console.log(`Banning user: ${userToBan.email}`);

        // Simulating UI update
        // setUsers(users.map(u => u.id === userToBan.id ? { ...u, is_active: !u.is_active } : u));

        setBanModalOpen(false);
        setUserToBan(null);
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <ConfirmModal
                isOpen={banModalOpen}
                onClose={() => setBanModalOpen(false)}
                onConfirm={handleBanUser}
                title="Ban User Access?"
                message={`Are you sure you want to ban ${userToBan?.name}? They will lose access to the platform immediately.`}
                confirmText="Ban User"
                isDestructive={true}
            />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">User Management</h1>
                    <p className="text-zinc-400 text-sm">Manage user access, roles, and status.</p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-600 outline-none w-full md:w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {error && <div className="p-4 bg-red-500/10 text-red-500 rounded-xl text-sm border border-red-500/20">{error}</div>}

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-zinc-950/50 border-b border-zinc-800">
                            <tr>
                                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">User</th>
                                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Role</th>
                                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Joined</th>
                                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {loading ? (
                                <tr><td colSpan={5} className="p-8 text-center text-zinc-500">Loading users...</td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-zinc-500">No users found.</td></tr>
                            ) : (
                                filteredUsers.map(user => (
                                    <tr key={user.id} className="group hover:bg-zinc-800/30 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-sm">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white text-sm">{user.name}</p>
                                                    <p className="text-xs text-zinc-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {user.roles.map(r => (
                                                <span key={r.name} className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${r.name === 'Admin'
                                                    ? 'bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/20'
                                                    : 'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20'
                                                    }`}>
                                                    {r.name}
                                                </span>
                                            ))}
                                        </td>
                                        <td className="p-4">
                                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-green-500/10 text-green-400 ring-1 ring-green-500/20">
                                                <CheckCircle size={12} /> Active
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-zinc-400">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors" title="Edit">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => confirmBan(user)}
                                                    className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-400 hover:text-red-500 transition-colors"
                                                    title="Ban User"
                                                >
                                                    <Ban size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
