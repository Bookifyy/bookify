'use client';

import { useState } from 'react';
import { Users, Plus } from 'lucide-react';
import { CreateGroupModal } from '../components/CreateGroupModal'; // Will create this component

export default function GroupsPage() {
    const [showCreateModal, setShowCreateModal] = useState(false);

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-6">
                <Users size={32} className="text-zinc-600" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">No group selected</h1>
            <p className="text-zinc-400 mb-8 max-w-sm">
                Choose a group from the left to see its books and chat, or create a new community.
            </p>
            <button
                onClick={() => setShowCreateModal(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2"
            >
                <Plus size={20} />
                Create Group
            </button>

            <CreateGroupModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => {
                    // Refresh groups list logic needed here (context or event?)
                    // For now simple reload or window.dispatchEvent
                    window.location.reload();
                }}
            />
        </div>
    );
}
