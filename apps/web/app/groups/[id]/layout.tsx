'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getApiUrl } from '../../lib/utils';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { ArrowLeft, MoreVertical, Users, MessageSquare, BookOpen, FileText, Settings } from 'lucide-react';

interface GroupDetail {
    id: number;
    name: string;
    description: string;
    privacy: 'invite_only' | 'open';
    members_count: number;
    owner_id: number;
    owner: {
        id: number;
        name: string;
    };
}

export default function GroupDetailLayout({ children }: { children: React.ReactNode }) {
    const { token, user } = useAuth();
    const params = useParams();
    const pathname = usePathname();
    const id = params.id;

    const [group, setGroup] = useState<GroupDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token && id) fetchGroupDetails();
    }, [token, id]);

    const fetchGroupDetails = async () => {
        try {
            const apiUrl = getApiUrl();
            const res = await fetch(`${apiUrl}/api/groups/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setGroup(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-zinc-500">Loading group...</div>;
    if (!group) return <div className="p-8 text-red-500">Group not found</div>;

    const tabs = [
        { name: 'Books', href: `/groups/${id}/books`, icon: BookOpen },
        { name: 'Chat', href: `/groups/${id}/chat`, icon: MessageSquare },
        { name: 'Notes', href: `/groups/${id}/notes`, icon: FileText },
        { name: 'Members', href: `/groups/${id}/members`, icon: Users },
    ];

    return (
        <div className="flex flex-col h-full">
            {/* Group Header */}
            <div className="border-b border-zinc-800 p-6 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <Link href="/groups" className="lg:hidden text-zinc-400 hover:text-white">
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className="text-2xl font-bold text-white">{group.name}</h1>
                        <span className={`
                            text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded
                            ${group.privacy === 'invite_only' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}
                        `}>
                            {group.privacy === 'invite_only' ? 'Private' : 'Public'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <Users size={14} />
                        <span>{group.members_count} members</span>
                        {group.owner_id === user?.id && (
                            <span className="text-indigo-400 ml-2 text-xs bg-indigo-500/10 px-2 py-0.5 rounded">You are Owner</span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
                        <MoreVertical size={20} />
                    </button>
                    {/* Invite Button could go here too */}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-zinc-800 px-6">
                {tabs.map(tab => {
                    const isActive = pathname?.includes(tab.href);
                    return (
                        <Link
                            key={tab.name}
                            href={tab.href}
                            className={`
                                flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors
                                ${isActive
                                    ? 'border-indigo-500 text-white'
                                    : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
                                }
                            `}
                        >
                            <tab.icon size={16} />
                            {tab.name}
                        </Link>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto bg-black p-6">
                {children}
            </div>
        </div>
    );
}
