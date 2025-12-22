'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [token, setToken] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');

    const [status, setStatus] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const t = searchParams.get('token');
        const e = searchParams.get('email');
        if (t) setToken(t);
        if (e) setEmail(e);
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);
        setError(null);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${apiUrl}/api/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    token,
                    email,
                    password,
                    password_confirmation: passwordConfirmation,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            setStatus(data.message || 'Your password has been reset!');

            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="space-y-6" onSubmit={handleSubmit}>
            {status && (
                <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20">
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                        {status} (Redirecting to login...)
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
                        required
                        readOnly
                        value={email}
                        className="block w-full appearance-none rounded-md border border-zinc-300 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400 sm:text-sm"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    New Password
                </label>
                <div className="mt-1">
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full appearance-none rounded-md border border-zinc-300 px-3 py-2 placeholder-zinc-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="password_confirmation" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Confirm New Password
                </label>
                <div className="mt-1">
                    <input
                        id="password_confirmation"
                        name="password_confirmation"
                        type="password"
                        required
                        value={passwordConfirmation}
                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                        className="block w-full appearance-none rounded-md border border-zinc-300 px-3 py-2 placeholder-zinc-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                    />
                </div>
            </div>

            <div>
                <button
                    type="submit"
                    disabled={loading || !!status}
                    className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-400 disabled:opacity-50"
                >
                    {loading ? 'Resetting...' : 'Reset Password'}
                </button>
            </div>
        </form>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-black">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                    Reset Password
                </h2>
                <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
                    Please enters your new password below.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <Suspense fallback={<p className="text-center text-zinc-500">Loading form...</p>}>
                        <ResetPasswordForm />
                    </Suspense>

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
