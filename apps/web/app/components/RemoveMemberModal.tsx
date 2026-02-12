'use client';

import { useState } from 'react';
import { Loader2, AlertTriangle, X } from 'lucide-react';
import { getApiUrl } from '../lib/utils';
import { useAuth } from '../../context/AuthContext';

interface RemoveMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    groupId: number;
    userId: number;
    userName: string;
    onMemberRemoved: () => void;
}

export function RemoveMemberModal({ isOpen, onClose, groupId, userId, userName, onMemberRemoved }: RemoveMemberModalProps) {
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleRemove = async () => {
        setLoading(true);
        try {
            const apiUrl = getApiUrl();
            const res = await fetch(`${apiUrl}/api/groups/${groupId}/members/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                onMemberRemoved();
                onClose();
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to remove member');
            }
        } catch (error) {
            console.error(error);
            alert('Connection failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm shadow-2xl p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="text-red-500" size={24} />
                    </div>

                    <h2 className="text-xl font-bold text-white mb-2">Remove Member?</h2>
                    <p className="text-zinc-400 mb-6">
                        Are you sure you want to remove <span className="text-white font-semibold">{userName}</span> from the group? This action cannot be undone.
                    </p>

                    <div className="flex gap-3 w-full">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleRemove}
                            disabled={loading}
                            className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Remove'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
