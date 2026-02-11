'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { getApiUrl } from '../../../lib/utils';
import { useParams } from 'next/navigation';
import { Plus, User, Shield, UserX, Loader2 } from 'lucide-react';
import { InviteMemberModal } from '../../../components/InviteMemberModal';

interface GroupMember {
    id: number;
    user: {
        id: number;
        name: string;
        email: string;
    };
    role: 'owner' | 'admin' | 'member';
    joined_at: string;
}

export default function GroupMembersPage() {
    const { token, user } = useAuth();
    const params = useParams();
    const id = params.id;

    const [members, setMembers] = useState<GroupMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [showInviteModal, setShowInviteModal] = useState(false);

    useEffect(() => {
        if (token && id) fetchMembers();
    }, [token, id]);

    const fetchMembers = async () => {
        try {
            const apiUrl = getApiUrl();
            const res = await fetch(`${apiUrl}/api/groups/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMembers(data.members || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-indigo-500" /></div>;

    const currentUserRole = members.find(m => m.user.id === user?.id)?.role;
    const canInvite = true; // For now allow everyone, later maybe restrict

    return (
        <div className="space-y-6">
            <button
                onClick={() => setShowInviteModal(true)}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
                <Plus size={20} />
                Invite Members
            </button>

            <div className="space-y-4">
                {members.map(member => (
                    <div key={member.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-white">
                            {member.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-white truncate">{member.user.name}</h3>
                                {member.role === 'owner' && <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded uppercase tracking-wide">Owner</span>}
                                {member.user.id === user?.id && <span className="text-[10px] bg-zinc-700 text-zinc-300 px-1.5 py-0.5 rounded uppercase tracking-wide">You</span>}
                            </div>
                            <p className="text-sm text-zinc-400 truncate">{member.user.email}</p>
                        </div>

                        {/* Actions (Kick, Promote) if admin */}
                        {currentUserRole === 'owner' && member.role !== 'owner' && (
                            <button className="p-2 text-zinc-600 hover:text-red-500 transition-colors tooltip" title="Remove Member">
                                <UserX size={18} />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <InviteMemberModal
                isOpen={showInviteModal}
                onClose={() => setShowInviteModal(false)}
                groupId={Number(id)}
            />
        </div>
    );
}
