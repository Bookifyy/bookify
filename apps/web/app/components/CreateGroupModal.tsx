'use client';

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getApiUrl } from '../lib/utils';
import { Loader2, X, Lock, Globe } from 'lucide-react';
import { Modal } from './Modal'; // Assuming we can reuse Modal or create a simple one here

export function CreateGroupModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
    const { token } = useAuth();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [privacy, setPrivacy] = useState<'invite_only' | 'open'>('invite_only');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const apiUrl = getApiUrl();
            const res = await fetch(`${apiUrl}/api/groups`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, description, privacy })
            });

            if (res.ok) {
                // const group = await res.json();
                onSuccess();
                onClose();
                setName('');
                setDescription('');
                setPrivacy('invite_only');
            } else {
                let errorMessage = `Error ${res.status}: ${res.statusText}`;
                try {
                    const data = await res.json();
                    errorMessage = data.message || errorMessage;
                } catch (e) {
                    console.error('Failed to parse error response', e);
                }
                setError(errorMessage);
            }
        } catch (err) {
            console.error('Group creation error:', err);
            setError('Connection failed. Please check your network or server logs.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                    <h2 className="text-xl font-bold text-white">Create Group</h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Group Name</label>
                        <input
                            type="text"
                            required
                            maxLength={60}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            placeholder="e.g., Advanced Mathematics Study Group"
                        />
                        <div className="text-right text-xs text-zinc-600">
                            {name.length}/60 characters
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Description (Optional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            placeholder="What is this group about?"
                            rows={3}
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-medium text-zinc-300">Privacy</label>

                        <label className={`
                            flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all
                            ${privacy === 'invite_only'
                                ? 'bg-indigo-600/10 border-indigo-500/50'
                                : 'bg-black border-zinc-800 hover:bg-zinc-900'
                            }
                        `}>
                            <input
                                type="radio"
                                name="privacy"
                                value="invite_only"
                                checked={privacy === 'invite_only'}
                                onChange={() => setPrivacy('invite_only')}
                                className="mt-1 w-4 h-4 accent-indigo-500"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <Lock size={16} className={privacy === 'invite_only' ? 'text-indigo-400' : 'text-zinc-500'} />
                                    <span className={`font-bold ${privacy === 'invite_only' ? 'text-white' : 'text-zinc-300'}`}>
                                        Invite Only
                                    </span>
                                </div>
                                <p className="text-sm text-zinc-500">Only invited members can join.</p>
                            </div>
                        </label>

                        <label className={`
                            flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all
                            ${privacy === 'open'
                                ? 'bg-teal-500/10 border-teal-500/50'
                                : 'bg-black border-zinc-800 hover:bg-zinc-900'
                            }
                        `}>
                            <input
                                type="radio"
                                name="privacy"
                                value="open"
                                checked={privacy === 'open'}
                                onChange={() => setPrivacy('open')}
                                className="mt-1 w-4 h-4 accent-teal-500"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <Globe size={16} className={privacy === 'open' ? 'text-teal-400' : 'text-zinc-500'} />
                                    <span className={`font-bold ${privacy === 'open' ? 'text-white' : 'text-zinc-300'}`}>
                                        Open by Link
                                    </span>
                                </div>
                                <p className="text-sm text-zinc-500">Anyone with the link can join.</p>
                            </div>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 className="animate-spin" size={20} />}
                        {loading ? 'Creating...' : 'Create Group'}
                    </button>
                </form>
            </div>
        </div>
    );
}
