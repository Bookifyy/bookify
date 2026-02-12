'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getApiUrl } from '../lib/utils';
import Link from 'next/link';

interface Notification {
    id: string;
    type: string;
    data: any;
    read_at: string | null;
    created_at: string;
}

import { InvitationModal } from './InvitationModal';

export function NotificationBell() {
    const { token } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [inviteModal, setInviteModal] = useState<{ isOpen: boolean; notificationId: string; groupId: number; groupName: string; invitedBy: string } | null>(null);

    useEffect(() => {
        if (token) fetchNotifications();
        const interval = setInterval(() => {
            if (token) fetchNotifications();
        }, 30000);
        return () => clearInterval(interval);
    }, [token]);

    const fetchNotifications = async () => {
        try {
            const apiUrl = getApiUrl();
            const res = await fetch(`${apiUrl}/api/notifications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
                setUnreadCount(data.filter((n: Notification) => !n.read_at).length);
            }
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            const apiUrl = getApiUrl();
            await fetch(`${apiUrl}/api/notifications/${id}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n =>
                n.id === id ? { ...n, read_at: new Date().toISOString() } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error(error);
        }
    };

    const clearAll = async () => {
        try {
            const apiUrl = getApiUrl();
            await fetch(`${apiUrl}/api/notifications`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setNotifications([]);
            setUnreadCount(0);
        } catch (error) {
            console.error(error);
        }
    };

    const handleNotificationClick = (n: Notification) => {
        if (!n.read_at) markAsRead(n.id);

        if (n.type === 'group_invite') {
            setInviteModal({
                isOpen: true,
                notificationId: n.id,
                groupId: n.data.group_id,
                groupName: n.data.group_name,
                invitedBy: n.data.invited_by
            });
            setIsOpen(false);
        } else {
            setIsOpen(false);
        }
    };

    const getNotificationContent = (n: Notification) => {
        switch (n.type) {
            case 'group_invite':
                return {
                    text: `Invited you to group "${n.data.group_name}"`,
                    href: '#', // Handle click manually
                    user: n.data.invited_by,
                    subtext: 'Click to accept or reject'
                };
            case 'new_message':
                return {
                    text: `Sent a message in "${n.data.group_name}"`,
                    subtext: n.data.message_preview,
                    href: `/groups/${n.data.group_id}/chat`,
                    user: n.data.sender_name
                };
            case 'book_added':
                return {
                    text: `Added "${n.data.book_title}" to "${n.data.group_name}"`,
                    href: `/groups/${n.data.group_id}/books`,
                    user: n.data.added_by
                };
            case 'book_started':
                return {
                    text: `Started reading "${n.data.book_title}" in "${n.data.group_name}"`,
                    href: `/groups/${n.data.group_id}/books`,
                    user: n.data.user_name
                };
            case 'invite_accepted':
                return {
                    text: `Accepted your invite to "${n.data.group_name}"`,
                    href: `/groups/${n.data.group_id}/members`,
                    user: n.data.user_name
                };
            case 'invite_rejected':
                return {
                    text: `Declined your invited to "${n.data.group_name}"`,
                    href: `/groups/${n.data.group_id}/members`,
                    user: n.data.user_name
                };
            case 'member_removed':
                return {
                    text: `You have been removed from "${n.data.group_name}"`,
                    href: '#',
                    user: 'System', // or n.data.removed_by
                    subtext: `Removed by ${n.data.removed_by}`
                };
            case 'member_left_group':
                return {
                    text: `Left the group "${n.data.group_name}"`,
                    href: `/groups/${n.data.group_id}/members`,
                    user: n.data.user_name
                };
            default:
                return { text: 'New notification', href: '#' };
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-zinc-400 hover:text-white transition-colors"
                title="Notifications"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 border border-black"></span>
                )}
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden">
                        <div className="p-3 border-b border-zinc-800 flex justify-between items-center">
                            <h3 className="font-semibold text-white text-sm">Notifications</h3>
                            <div className="flex gap-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={fetchNotifications}
                                        className="text-[10px] text-indigo-400 hover:text-indigo-300"
                                    >
                                        Refresh
                                    </button>
                                )}
                                {notifications.length > 0 && (
                                    <button
                                        onClick={clearAll}
                                        className="text-[10px] text-zinc-400 hover:text-white"
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-4 text-center text-zinc-500 text-xs">
                                    No notifications
                                </div>
                            ) : (
                                notifications.map(n => {
                                    const { text, href, user, subtext } = getNotificationContent(n);
                                    return (
                                        <Link
                                            key={n.id}
                                            href={href}
                                            onClick={(e) => {
                                                if (n.type === 'group_invite') {
                                                    e.preventDefault();
                                                    handleNotificationClick(n);
                                                } else {
                                                    handleNotificationClick(n);
                                                }
                                            }}
                                            className={`
                                                block p-3 hover:bg-zinc-800/50 transition-colors border-b border-zinc-800/50 last:border-0
                                                ${!n.read_at ? 'bg-indigo-500/5' : ''}
                                            `}
                                        >
                                            <div className="flex gap-3">
                                                <div className="mt-1 h-2 w-2 rounded-full bg-indigo-500 flex-shrink-0 opacity-0"
                                                    style={{ opacity: !n.read_at ? 1 : 0 }}
                                                />
                                                <div>
                                                    <p className="text-xs text-zinc-300">
                                                        <span className="font-bold text-white">{user}</span> {text}
                                                    </p>
                                                    {subtext && (
                                                        <p className="text-[10px] text-zinc-500 mt-1 truncate max-w-[200px]">
                                                            "{subtext}"
                                                        </p>
                                                    )}
                                                    <p className="text-[10px] text-zinc-600 mt-1">
                                                        {new Date(n.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </>
            )}

            {inviteModal && (
                <InvitationModal
                    isOpen={inviteModal.isOpen}
                    onClose={() => setInviteModal(null)}
                    notificationId={inviteModal.notificationId}
                    groupId={inviteModal.groupId}
                    groupName={inviteModal.groupName}
                    invitedBy={inviteModal.invitedBy}
                    onActionComplete={fetchNotifications}
                />
            )}
        </div>
    );
}
