'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookCard } from './components/BookCard';
import { resolveAssetUrl, getApiUrl } from './lib/utils';
import { Zap, ChevronRight, LayoutGrid } from 'lucide-react';
import Link from 'next/link';


// No mock data needed for books anymore

export default function Home() {
  const { user, token } = useAuth();
  const [greeting, setGreeting] = useState('');
  const [loading, setLoading] = useState(true);
  const [continueReading, setContinueReading] = useState<any[]>([]);


  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    const fetchLibrary = async () => {
      try {
        const apiUrl = getApiUrl();
        const res = await fetch(`${apiUrl}/api/library`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        if (res.ok) {
          const data = await res.json();
          setContinueReading(data.slice(0, 5));
        }
      } catch (err) {
        console.error('Failed to fetch library:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchLibrary();
    }
  }, [token]);

  return (
    <div className="p-8 pb-16 space-y-12 max-w-[1400px] mx-auto">
      {/* Welcome Section */}
      <section className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
          <Zap size={14} className="text-yellow-500 fill-yellow-500" />
          <span>12 day streak</span>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">{greeting}, {user?.name || 'Reader'}</h1>
        <p className="text-sm text-zinc-500">Keep your streak going</p>
      </section>

      {/* Continue Reading Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 rounded p-1">
              <LayoutGrid size={14} className="text-white" />
            </div>
            <h2 className="text-lg font-semibold text-white">Continue Reading</h2>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-4 animate-pulse">
                <div className="aspect-[2/3] w-full bg-zinc-800 rounded-md" />
                <div className="h-4 w-3/4 bg-zinc-800 rounded" />
                <div className="h-3 w-1/2 bg-zinc-800 rounded" />
              </div>
            ))}
          </div>
        ) : continueReading.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {continueReading.map((item) => (
              <BookCard
                key={item.id}
                id={item.book.id}
                title={item.book.title}
                author={item.book.author}
                coverImage={item.book.cover_image}
                progress={parseFloat(item.percentage_completed)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-zinc-900/30 rounded-xl py-12 text-center text-zinc-500 border border-zinc-800/50 border-dashed">
            <p className="mb-4">You haven't started reading any books yet.</p>
            <Link
              href="/library"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors text-sm font-medium"
            >
              Browse Library <ChevronRight size={16} />
            </Link>
          </div>
        )}
      </section>


    </div>
  );
}

