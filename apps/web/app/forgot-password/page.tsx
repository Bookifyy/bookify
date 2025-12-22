'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);
        setError(null);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${apiUrl}/api/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            setStatus(data.message || 'Reset link sent to your email.');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-black">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                    Forgot your password?
                </h2>
                <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
                    No problem. Just let us know your email address and we will email you a password reset link.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {status && (
                            <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20">
                                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                    {status}
                                </p>
                            </div>
                        )}

                        {error && (
                            <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                                    {error}
                                </p>
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full appearance-none rounded-md border border-zinc-300 px-3 py-2 placeholder-zinc-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-400 disabled:opacity-50"
                            >
                                {loading ? 'Sending...' : 'Email Password Reset Link'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 flex items-center justify-center">
                        <Link
                            href="/login"
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                        >
                            Back to login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
