'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import Link from 'next/link';

export default function VerifyEmailHandler({ params }: { params: Promise<{ id: string, hash: string }> }) {
    const { id, hash } = use(params);
    const { token } = useAuth();
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your email...');

    useEffect(() => {
        const verify = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

                // Need a token for this request according to the backend routes
                if (!token) {
                    setStatus('error');
                    setMessage('You must be logged in to verify your email. Please login and then click the verification link again.');
                    return;
                }

                const res = await fetch(`${apiUrl}/api/email/verify/${id}/${hash}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });

                const data = await res.json();

                if (res.ok) {
                    setStatus('success');
                    setMessage(data.message || 'Email verified successfully!');
                    // Redirect home after a short delay
                    setTimeout(() => router.push('/'), 2000);
                } else {
                    setStatus('error');
                    setMessage(data.message || 'Verification failed. The link might be expired or invalid.');
                }
            } catch (err) {
                setStatus('error');
                setMessage('An error occurred during verification.');
                console.error(err);
            }
        };

        verify();
    }, [id, hash, token, router]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-black">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center">

                    {status === 'loading' && (
                        <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                            <p className="text-zinc-600 dark:text-zinc-400">{message}</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="flex flex-col items-center">
                            <div className="rounded-full bg-green-100 p-3 mb-4 dark:bg-green-900/30">
                                <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Success!</h2>
                            <p className="text-zinc-600 dark:text-zinc-400">{message}</p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="flex flex-col items-center">
                            <div className="rounded-full bg-red-100 p-3 mb-4 dark:bg-red-900/30">
                                <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Verification Failed</h2>
                            <p className="text-zinc-600 dark:text-zinc-400 mb-6">{message}</p>
                            <Link
                                href="/verify-email"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Re-send verification email
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
