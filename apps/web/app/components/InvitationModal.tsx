'use client';

import { useState } from 'react';
import { Loader2, Check, X } from 'lucide-react';
import { getApiUrl } from '../lib/utils';
import { useAuth } from '../../context/AuthContext';

interface InvitationModalProps {
    isOpen: boolean;
    onClose: () => void;
    notificationId: string;
    groupId: number;
    groupName: string;
    invitedBy: string;
    onActionComplete: () => void;
}

export function InvitationModal({ isOpen, onClose, notificationId, groupId, groupName, invitedBy, onActionComplete }: InvitationModalProps) {
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleAction = async (action: 'accept' | 'reject') => {
        setLoading(true);
        try {
            const apiUrl = getApiUrl();
            const res = await fetch(`${apiUrl}/api/groups/${groupId}/${action}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                // Mark notification as read
                await fetch(`${apiUrl}/api/notifications/${notificationId}/read`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                onActionComplete();
                onClose();
            } else {
                alert('Failed to process request');
            }
        } catch (error) {
            console.error(error);
            alert('Connection error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm shadow-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-2">Group Invitation</h2>
                <p className="text-zinc-400 mb-6">
                    <span className="text-white font-semibold">{invitedBy}</span> invited you to join <span className="text-indigo-400 font-semibold">{groupName}</span>.
                </p>

                <div className="flex gap-3">
                    <button
                        onClick={() => handleAction('reject')}
                        disabled={loading}
                        className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <><X size={20} /> Reject</>}
                    </button>
                    <button
                        onClick={() => handleAction('accept')}
                        disabled={loading}
                        className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <><Check size={20} /> Accept</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
