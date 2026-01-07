'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookCard } from './components/BookCard';
import { Zap, ChevronRight, LayoutGrid } from 'lucide-react';
import Link from 'next/link';

const mockContinueReading = [
  {
    id: 1,
    title: 'Calculus: Early Transcendentals',
    author: 'James Stewart',
    coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400',
    progress: 67,
  },
  {
    id: 2,
    title: 'The Quantum World',
    author: 'Kenneth W. Ford',
    coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=400',
    progress: 23,
  },
  {
    id: 3,
    title: 'Sapiens: A Brief History',
    author: 'Yuval Noah Harari',
    coverImage: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=400',
    progress: 89,
  },
  {
    id: 4,
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400',
    progress: 45,
  },
  {
    id: 5,
    title: 'Meditations',
    author: 'Marcus Aurelius',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400',
    progress: 12,
  },
];

const mockWeeklyMix = [
  {
    id: 3,
    title: 'Sapiens: A Brief History',
    author: 'Yuval Noah Harari',
    coverImage: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=400',
    progress: 89,
  },
  {
    id: 4,
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400',
    progress: 45,
  },
  {
    id: 5,
    title: 'Meditations',
    author: 'Marcus Aurelius',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400',
    progress: 12,
  },
];

export default function Home() {
  const { user, token } = useAuth();
  const [greeting, setGreeting] = useState('');
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    const fetchBooks = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${apiUrl}/api/books?limit=5`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        if (res.ok) {
          const data = await res.json();
          setBooks(data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch home books:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchBooks();
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

      {/* Recommended Section (Real Data) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recommended for You</h2>
          <Link href="/library" className="text-xs font-medium text-zinc-500 hover:text-white transition-colors flex items-center gap-1">
            See all <ChevronRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="space-y-4 animate-pulse">
                <div className="aspect-[2/3] w-full bg-zinc-800 rounded-md" />
                <div className="h-4 w-3/4 bg-zinc-800 rounded" />
                <div className="h-3 w-1/2 bg-zinc-800 rounded" />
              </div>
            ))}
          </div>
        ) : books.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {books.map((book) => (
              <BookCard
                key={book.id}
                id={book.id}
                title={book.title}
                author={book.author}
                coverImage={book.cover_image}
              />
            ))}
          </div>
        ) : (
          <div className="bg-zinc-900/30 rounded-xl py-12 text-center text-zinc-500 border border-zinc-800/50 border-dashed">
            Visit the Admin Panel to upload your first book!
          </div>
        )}
      </section>

      {/* Continue Reading (Mocked for now as we haven't implemented progress tracking yet) */}
      <section className="space-y-6 opacity-60 grayscale-[0.5]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 rounded p-1">
              <LayoutGrid size={14} className="text-white" />
            </div>
            <h2 className="text-lg font-semibold text-white">Your Weekly Study Mix (Demo)</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {mockWeeklyMix.map((book) => (
            <BookCard key={book.id} {...book} />
          ))}
        </div>
      </section>

    </div>
  );
}

