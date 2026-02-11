'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getApiUrl } from '../lib/utils';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { Plus, Users, Search, MoreVertical, Loader2 } from 'lucide-react';

interface Group {
    id: number;
    name: string;
    members_count: number;
    updated_at: string;
}

export default function GroupsLayout({ children }: { children: React.ReactNode }) {
    const { token } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const params = useParams();

    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        if (token) fetchGroups();
    }, [token]);

    const fetchGroups = async () => {
        try {
            const apiUrl = getApiUrl();
            const res = await fetch(`${apiUrl}/api/groups`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setGroups(data);
            }
        } catch (error) {
            console.error('Failed to fetch groups', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredGroups = groups.filter(g =>
        g.name.toLowerCase().includes(search.toLowerCase())
    );

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = (now.getTime() - date.getTime()) / 1000; // seconds

        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
        return date.toLocaleDateString();
    };

    const isGroupSelected = !!params.id;

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden">
            {/* Secondary Sidebar - Group List 
                Mobile: Hidden if group selected
                Desktop: Always visible
            */}
            <div className={`
                w-full lg:w-80 border-r border-zinc-800 bg-black flex-col flex-shrink-0
                ${isGroupSelected ? 'hidden lg:flex' : 'flex'}
            `}>
                <div className="p-4 border-b border-zinc-800">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white">Groups</h2>
                        {/* <button 
                            onClick={() => setShowCreateModal(true)}
                            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
                        >
                            <Plus size={20} />
                        </button> */}
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search groups..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {loading ? (
                        <div className="flex justify-center p-4">
                            <Loader2 className="animate-spin text-indigo-500" />
                        </div>
                    ) : filteredGroups.length === 0 ? (
                        <div className="text-center p-4 text-zinc-500 text-sm">
                            No groups found.
                        </div>
                    ) : (
                        filteredGroups.map(group => {
                            const isActive = pathname?.startsWith(`/groups/${group.id}`);
                            return (
                                <Link
                                    key={group.id}
                                    href={`/groups/${group.id}`}
                                    className={`
                                        block p-3 rounded-lg transition-colors border
                                        ${isActive
                                            ? 'bg-zinc-900 border-indigo-500/50'
                                            : 'border-transparent hover:bg-zinc-900'
                                        }
                                    `}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`
                                            w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-white
                                            ${isActive ? 'bg-indigo-600' : 'bg-zinc-800'}
                                        `}>
                                            <Users size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <h3 className={`font-medium truncate ${isActive ? 'text-white' : 'text-zinc-300'}`}>
                                                    {group.name}
                                                </h3>
                                                {/* Notification Badge if needed */}
                                                {/* <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">3</span> */}
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
                                                <span className="flex items-center gap-1">
                                                    <Users size={12} /> {group.members_count || 0}
                                                </span>
                                                <span>•</span>
                                                <span>{formatTime(group.updated_at)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Main Content Area 
                Mobile: Hidden if NO group selected (show list instead)
                Desktop: Always visible (shows Empty State if no group)
            */}
            <div className={`
                flex-1 flex-col bg-black overflow-hidden relative
                ${!isGroupSelected ? 'hidden lg:flex' : 'flex'}
            `}>
                {children}

                {/* Create Group Modal Trigger (Floating Action Button style or in empty state?) 
                    The design shows "Create Group" button in the empty state main area.
                */}
            </div>

            {/* Modals will go here later */}
        </div>
    );
}
