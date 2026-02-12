'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { getApiUrl } from '../../../lib/utils';
import { useParams } from 'next/navigation';
import { Send, Loader2, User } from 'lucide-react';

interface Message {
    id: number;
    content: string;
    created_at: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
}

export default function GroupChatPage() {
    const { token, user } = useAuth();
    const params = useParams();
    const id = params.id;

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const userScrolledUp = useRef(false);

    useEffect(() => {
        if (token && id) {
            fetchMessages();
            const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds
            return () => clearInterval(interval);
        }
    }, [token, id]);

    useEffect(() => {
        if (!userScrolledUp.current) {
            scrollToBottom();
        }
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
            // If user is within 100px of bottom, they consider "at bottom"
            const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
            userScrolledUp.current = !isAtBottom;
        }
    };

    const fetchMessages = async () => {
        try {
            const apiUrl = getApiUrl();
            const res = await fetch(`${apiUrl}/api/groups/${id}/messages`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (error) {
            console.error('Failed to fetch messages', error);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || sending) return;

        setSending(true);
        // Force scroll on send
        userScrolledUp.current = false;

        try {
            const apiUrl = getApiUrl();
            const res = await fetch(`${apiUrl}/api/groups/${id}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: input })
            });

            if (res.ok) {
                setInput('');
                fetchMessages();
                scrollToBottom();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex flex-col h-full relative">
            {/* Messages Area */}
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto space-y-4 pb-20"
            >
                {messages.length === 0 ? (
                    <div className="text-center py-10 text-zinc-500">
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = msg.user.id === user?.id;
                        const showAvatar = idx === 0 || messages[idx - 1].user.id !== msg.user.id;

                        return (
                            <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                                {/* Avatar */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${isMe ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400'} ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                                    {msg.user.name.charAt(0).toUpperCase()}
                                </div>

                                <div className={`max-w-[70%] space-y-1 ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                                    {showAvatar && !isMe && (
                                        <span className="text-xs text-zinc-500 ml-1">{msg.user.name}</span>
                                    )}
                                    <div className={`p-3 rounded-2xl text-sm ${isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-zinc-800 text-zinc-200 rounded-tl-none'}`}>
                                        {msg.content}
                                    </div>
                                    <span className="text-[10px] text-zinc-600 px-1">
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="sticky bottom-0 bg-black pt-4 border-t border-zinc-800 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <button
                    type="submit"
                    disabled={!input.trim() || sending}
                    className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all"
                >
                    {sending ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
                </button>
            </form>
        </div>
    );
}
