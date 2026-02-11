'use client';

import { FileText } from 'lucide-react';

export default function GroupNotesPage() {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-6">
                <FileText size={32} className="text-zinc-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Shared Notes</h3>
            <p className="text-zinc-400 max-w-sm">
                Collaborative notes feature is coming soon. You'll be able to share your book notes with the group.
            </p>
        </div>
    );
}
