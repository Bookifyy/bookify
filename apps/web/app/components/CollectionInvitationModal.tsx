'use client';

import { useState } from 'react';
import { Loader2, Check, X } from 'lucide-react';
import { getApiUrl } from '../lib/utils';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

interface CollectionInvitationModalProps {
    isOpen: boolean;
    onClose: () => void;
    notificationId: string;
    collectionId: string;
    collectionName: string;
    invitedBy: string;
    bookIds: number[];
    onActionComplete: () => void;
}

export function CollectionInvitationModal({ 
    isOpen, 
    onClose, 
    notificationId, 
    collectionId, 
    collectionName, 
    invitedBy, 
    bookIds,
    onActionComplete 
}: CollectionInvitationModalProps) {
    const { token } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleAction = async (action: 'accept' | 'reject') => {
        setLoading(true);
        try {
            const apiUrl = getApiUrl();
            
            if (action === 'accept') {
                // Post to the backend to register as a collection member natively
                await fetch(`${apiUrl}/api/collections/${collectionId}/accept`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }

            // Mark notification as read via API
            const res = await fetch(`${apiUrl}/api/notifications/${notificationId}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                toast.success(action === 'accept' ? 'Successfully joined collection!' : 'Invitation declined');
                onActionComplete();
                onClose();
                router.refresh(); 
            } else {
                toast.error('Failed to process request');
            }
        } catch (error) {
            console.error(error);
            toast.error('Connection error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <div className="bg-card border border-border rounded-2xl w-full max-w-sm shadow-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-2">Collection Invitation</h2>
                <p className="text-muted-foreground mb-6">
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
