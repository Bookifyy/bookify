'use client';

import { useState } from 'react';
import { Loader2, Check, X } from 'lucide-react';
import { getApiUrl } from '../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

interface CollectionInvitationModalProps {
    isOpen: boolean;
    onClose: () => void;
    notificationId: string;
    collectionId: string;
    collectionName: string;
    invitedBy: string;
    onActionComplete: () => void;
}

export function CollectionInvitationModal({ 
    isOpen, 
    onClose, 
    notificationId, 
    collectionId, 
    collectionName, 
    invitedBy, 
    onActionComplete 
}: CollectionInvitationModalProps) {
    const { token } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleAction = async (action: 'accept' | 'reject') => {
        setLoading(true);
        try {
            if (action === 'accept') {
                // Instantly sync collection to localStorage since MVP doesn't have backend collection storage yet
                const saved = localStorage.getItem('bookify_collections');
                const collections = saved ? JSON.parse(saved) : [];
                
                if (!collections.find((c: { id: string }) => c.id === collectionId)) {
                    collections.push({
                        id: collectionId,
                        name: collectionName,
                        description: `Shared by ${invitedBy}`,
                        visibility: 'Group',
                        isSmart: false,
                        bookIds: [], // We don't have the book IDs sent via simple notification right now
                        notes: []
                    });
                    localStorage.setItem('bookify_collections', JSON.stringify(collections));
                }
            }

            // Mark notification as read via API
            const apiUrl = getApiUrl();
            const res = await fetch(`${apiUrl}/api/notifications/${notificationId}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                onActionComplete();
                onClose();
                router.refresh(); 
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
                <h2 className="text-xl font-bold text-white mb-2">Collection Invitation</h2>
                <p className="text-zinc-400 mb-6">
                    <span className="text-white font-semibold">{invitedBy}</span> invited you to view the collection <span className="text-[#0ea5e9] font-semibold">{collectionName}</span>.
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
                        className="flex-1 py-3 bg-[#0ea5e9] hover:bg-sky-400 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <><Check size={20} /> Accept</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
