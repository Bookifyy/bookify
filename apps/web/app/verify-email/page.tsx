'use client';

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';

export default function VerifyEmailPage() {
    const { user, token } = useAuth();
    const [status, setStatus] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleResend = async () => {
        setLoading(true);
        setStatus(null);
        setError(null);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${apiUrl}/api/email/resend`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Failed to resend verification email.');
            }

            setStatus('A fresh verification link has been sent to your email address.');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
                <p className="text-zinc-500">Please <Link href="/login" className="text-indigo-600 underline">login</Link> to view this page.</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-black">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                    Verify your email
                </h2>
                <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
                    Thanks for signing up! Before getting started, could you verify your email address by clicking on the link we just emailed to you?
                </p>
                <p className="mt-2 text-center text-xs font-medium text-zinc-500">
                    Sent to: <span className="text-zinc-900 dark:text-zinc-100">{user.email}</span>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">

                    {status && (
                        <div className="mb-6 rounded-md bg-green-50 p-4 dark:bg-green-900/20">
                            <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                {status}
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                            <p className="text-sm font-medium text-red-800 dark:text-red-200">
                                {error}
                            </p>
                        </div>
                    )}

                    <div className="space-y-4 text-center">
                        <button
                            onClick={handleResend}
                            disabled={loading}
                            className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-400 disabled:opacity-50"
                        >
                            {loading ? 'Resending...' : 'Resend Verification Email'}
                        </button>

                        <button
                            onClick={() => window.location.reload()}
                            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                        >
                            Already verified? Refresh page
                        </button>
                    </div>

                    <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                        <Link
                            href="/"
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                        >
                            Back to Home
                        </Link>

                        <button
                            type="button"
                            className="text-sm font-medium text-red-600 hover:text-red-500 dark:text-red-400"
                        >
                            Log Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
