'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookCard } from './components/BookCard';
import { resolveAssetUrl, getApiUrl } from './lib/utils';
import { Zap, ChevronRight, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Modal } from './components/Modal';
import { StatsFooter } from './components/StatsFooter';


// No mock data needed for books anymore

export default function Home() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [greeting, setGreeting] = useState('');
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [continueReading, setContinueReading] = useState<any[]>([]);
  const [modalBook, setModalBook] = useState<any | null>(null);
  const [recommendedSubject, setRecommendedSubject] = useState<{ name: string, books: any[] } | null>(null);
  const [editorsPicks, setEditorsPicks] = useState<any[]>([]);


  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    if (!token) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const apiUrl = getApiUrl();
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        };

        // 1. Fetch Generic Recommendations & Library in parallel
        const [booksRes, libraryRes] = await Promise.all([
          fetch(`${apiUrl}/api/books?limit=5`, { headers }),
          fetch(`${apiUrl}/api/library`, { headers })
        ]);

        if (booksRes.ok) {
          const data = await booksRes.json();
          setBooks(data.data || []);
        }

        let libraryData: any[] = [];
        if (libraryRes.ok) {
          libraryData = await libraryRes.json();
          setContinueReading(libraryData.slice(0, 5));
        }

        // 2. Infer Subject & Fetch Subject Recommendations
        if (libraryData.length > 0) {
          const subjects: Record<string, number> = {};
          let mostFrequentSubjectId = null;
          let maxCount = 0;

          libraryData.forEach((item: any) => {
            const subId = item.book?.subject_id;
            if (subId) {
              subjects[subId] = (subjects[subId] || 0) + 1;
              if (subjects[subId] > maxCount) {
                maxCount = subjects[subId];
                mostFrequentSubjectId = subId;
              }
            }
          });

          if (mostFrequentSubjectId) {
            const subjectRes = await fetch(`${apiUrl}/api/books?subject_id=${mostFrequentSubjectId}&limit=5`, { headers });
            if (subjectRes.ok) {
              const data = await subjectRes.json();
              if (data.data && data.data.length > 0) {
                setRecommendedSubject({
                  name: data.data[0].subject?.name || 'Related Topics',
                  books: data.data
                });
              }
            }
          }
        }

        // 3. Fetch Editors' Picks (Simulated with offset)
        const editorsRes = await fetch(`${apiUrl}/api/books?limit=4&page=2`, { headers });
        if (editorsRes.ok) {
          const data = await editorsRes.json();
          setEditorsPicks(data.data || []);
        }

      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();

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

      {/* "Because you studied..." Section */}
      {recommendedSubject && recommendedSubject.books.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Because you studied {recommendedSubject.name}</h2>
            <Link href="#" className="text-xs font-medium text-zinc-500 hover:text-white transition-colors flex items-center gap-1">
              See all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {recommendedSubject.books.map((book) => {
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
        </section>
      )}

      {/* Editors' Picks Section */}
      {editorsPicks.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Editors' Picks</h2>
            <Link href="#" className="text-xs font-medium text-zinc-500 hover:text-white transition-colors flex items-center gap-1">
              See all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {editorsPicks.map((book) => {
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
        </section>
      )}

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

      <StatsFooter booksCompleted={continueReading.filter(i => i.percentage_completed === '100.00').length} />
    </div>
  );
}

