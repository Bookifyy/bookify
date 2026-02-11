'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { getApiUrl } from '../../../lib/utils';
import { useParams } from 'next/navigation';
import { FileText, Plus, Trash2, Loader2, X } from 'lucide-react';

interface Note {
    id: number;
    title: string;
    content: string;
    created_at: string;
    user: {
        id: number;
        name: string;
    };
}

export default function GroupNotesPage() {
    const { token, user } = useAuth();
    const params = useParams();
    const id = params.id;

    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (token && id) fetchNotes();
    }, [token, id]);

    const fetchNotes = async () => {
        try {
            const apiUrl = getApiUrl();
            const res = await fetch(`${apiUrl}/api/groups/${id}/notes`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setNotes(data || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;

        setSubmitting(true);
        try {
            const apiUrl = getApiUrl();
            const res = await fetch(`${apiUrl}/api/groups/${id}/notes`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title, content })
            });

            if (res.ok) {
                const newNote = await res.json();
                setNotes([newNote, ...notes]);
                setShowModal(false);
                setTitle('');
                setContent('');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (noteId: number) => {
        if (!confirm('Are you sure you want to delete this note?')) return;
        try {
            const apiUrl = getApiUrl();
            const res = await fetch(`${apiUrl}/api/groups/${id}/notes/${noteId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setNotes(notes.filter(n => n.id !== noteId));
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-indigo-500" /></div>;

    return (
        <div className="space-y-6">
            <button
                onClick={() => setShowModal(true)}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
                <Plus size={20} />
                Create Note
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notes.length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-zinc-900/50 rounded-xl border border-zinc-800 border-dashed">
                        <FileText className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-white mb-1">No notes yet</h3>
                        <p className="text-zinc-500 text-sm">Share study notes with your group.</p>
                    </div>
                ) : (
                    notes.map(note => (
                        <div key={note.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col group hover:border-zinc-700 transition-colors">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="text-lg font-bold text-white line-clamp-1">{note.title}</h3>
                                {note.user.id === user?.id && (
                                    <button
                                        onClick={() => handleDelete(note.id)}
                                        className="text-zinc-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                            <p className="text-zinc-400 text-sm mb-4 line-clamp-3 flex-1 whitespace-pre-line">
                                {note.content}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-zinc-600 pt-3 border-t border-zinc-800/50">
                                <span className="font-medium text-zinc-500">{note.user.name}</span>
                                <span>•</span>
                                <span>{new Date(note.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create Note Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">Create Note</h2>
                            <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateNote} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2 text-white focus:border-indigo-500 outline-none"
                                    placeholder="Chapter 1 Summary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-1">Content</label>
                                <textarea
                                    required
                                    rows={5}
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                    className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2 text-white focus:border-indigo-500 outline-none resize-none"
                                    placeholder="Write your notes here..."
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-zinc-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold flex items-center gap-2"
                                >
                                    {submitting && <Loader2 className="animate-spin" size={16} />}
                                    Save Note
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
