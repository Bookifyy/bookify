'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

export default function Home() {
  const { user, logout } = useAuth();
  const [data, setData] = useState<{ version: string; db_connection: string } | null>(null);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    fetch(`${apiUrl}/api/version`)
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.error('Failed to fetch backend:', err));
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold tracking-tight text-black dark:text-white sm:text-6xl">
          Welcome to Bookify
        </h1>
        <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Your journey to better reading starts here.
        </p>

        {user ? (
          <div className="mt-8 flex flex-col gap-4">
            <p className="text-xl font-medium text-indigo-600 dark:text-indigo-400">
              Hello, {user.name}!
            </p>
            <button
              onClick={logout}
              className="rounded-md bg-zinc-900 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Log out
            </button>
          </div>
        ) : (
          <div className="mt-8 flex gap-4">
            <Link
              href="/login"
              className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold leading-6 text-zinc-900 dark:text-zinc-100"
            >
              Register <span aria-hidden="true">→</span>
            </Link>
          </div>
        )}

        <div className="mt-10 flex flex-col items-center gap-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">System Status</h2>
            {data ? (
              <div className="mt-4 flex flex-col gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  <span className="text-zinc-600 dark:text-zinc-400">Backend:</span>
                  <span className="font-mono text-zinc-900 dark:text-zinc-100">v{data.version}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${data.db_connection === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span className="text-zinc-600 dark:text-zinc-400">Database:</span>
                  <span className="font-mono text-zinc-900 dark:text-zinc-100">{data.db_connection}</span>
                </div>
              </div>
            ) : (
              <p className="mt-4 animate-pulse text-sm text-zinc-500">Connecting to backend ({process.env.NEXT_PUBLIC_API_URL || 'local'})...</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
