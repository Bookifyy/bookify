'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

interface User {
    id: number;
    name: string;
    email: string;
    roles: { name: string }[];
}

export default function AdminDashboard() {
    const { user, token, loading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login');
                return;
            }

            const isAdmin = user.roles?.some(r => r.name === 'Admin');
            if (!isAdmin) {
                router.push('/'); // Redirect non-admins
                return;
            }

            fetchUsers();
        }
    }, [user, loading, router]);

    const fetchUsers = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${apiUrl}/api/admin/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (!res.ok) throw new Error('Failed to fetch users');

            const data = await res.json();
            setUsers(data);
        } catch (err: any) {
            setError(err.message);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="min-h-screen bg-zinc-50 p-8 dark:bg-black">
            <div className="mx-auto max-w-7xl">
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-8">Admin Dashboard</h1>

                {error && (
                    <div className="bg-red-50 text-red-800 p-4 rounded-md mb-6">
                        {error}
                    </div>
                )}

                <div className="bg-white shadow-sm ring-1 ring-zinc-900/5 sm:rounded-xl dark:bg-zinc-900 dark:ring-zinc-800 overflow-hidden">
                    <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                        <thead>
                            <tr>
                                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100 sm:pl-6">ID</th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">Name</th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">Email</th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">Roles</th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {users.map((u) => (
                                <tr key={u.id}>
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-zinc-900 dark:text-zinc-100 sm:pl-6">{u.id}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-zinc-500 dark:text-zinc-400">{u.name}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-zinc-500 dark:text-zinc-400">{u.email}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                                        {u.roles.map(r => (
                                            <span key={r.name} className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10 mr-1 dark:bg-indigo-400/10 dark:text-indigo-400 dark:ring-indigo-400/30">
                                                {r.name}
                                            </span>
                                        ))}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                                        <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">Edit</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
