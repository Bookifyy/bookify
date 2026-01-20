'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookCard } from './components/BookCard';
import { resolveAssetUrl, getApiUrl } from './lib/utils';
import { Zap, ChevronRight, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Modal } from './components/Modal';

// No mock data needed for books anymore

export default function Home() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [greeting, setGreeting] = useState('');
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [continueReading, setContinueReading] = useState<any[]>([]);
  const [modalBook, setModalBook] = useState<any | null>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    const fetchBooks = async () => {
      try {
        const apiUrl = getApiUrl();
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
      }
    };

    if (token) {
      fetchBooks();
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
            {books.map((book) => {
              const isStarted = continueReading.some(item => item.book?.id === book.id);
              return (
                <BookCard
                  key={book.id}
                  id={book.id}
                  title={book.title}
                  author={book.author}
                  coverImage={book.cover_image}
                  onClick={isStarted ? (e) => {
                    e.preventDefault();
                    setModalBook(book);
                  } : undefined}
                />
              );
            })}
          </div>
        ) : (
          <div className="bg-zinc-900/30 rounded-xl py-12 text-center text-zinc-500 border border-zinc-800/50 border-dashed">
            Visit the Admin Panel to upload your first book!
          </div>
        )}
      </section>

      {/* Continue Reading Section */}
      {continueReading.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 rounded p-1">
                <LayoutGrid size={14} className="text-white" />
              </div>
              <h2 className="text-lg font-semibold text-white">Continue Reading</h2>
            </div>
          </div>
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
        </section>
      )}

      {/* Modal for Already Started Books */}
      <Modal
        isOpen={!!modalBook}
        onClose={() => setModalBook(null)}
        title="Already Started"
      >
        <div className="space-y-6">
          <p className="text-zinc-300">
            You have already started reading <span className="font-bold text-white">{modalBook?.title}</span>.
          </p>
          <p className="text-zinc-400 text-sm">
            Check your Library or the Continue Reading section to pick up exactly where you left off.
          </p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => router.push('/library')}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              Go to Library
            </button>
            <button
              onClick={() => setModalBook(null)}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 rounded-lg transition-colors border border-zinc-700"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

