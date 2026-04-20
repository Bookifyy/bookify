'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { Play, Star, ArrowLeft, ChevronDown, BookOpen, Clock, Heart, Headphones } from 'lucide-react';
import { resolveAssetUrl, getApiUrl } from '../../lib/utils';
import Link from 'next/link';

interface Book {
    id: number;
    title: string;
    author: string;
    description: string;
    cover_image: string;
    subject: { name: string };
    is_premium: boolean;
    edition?: string;
    format?: string;
    print_length?: number;
    publication_date?: string;
    accessibility?: string;
    language?: string;
    publisher?: string;
    price?: number;
    author_bio?: string;
    author_image?: string;
    author_license?: string;
    progress?: {
        current_page: number;
        total_pages: number;
        percentage_completed: number;
    };
}

export default function BookDetailPage() {
    const { id } = useParams();
    const { token } = useAuth();
    const router = useRouter();
    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);
    const [addingToLibrary, setAddingToLibrary] = useState(false);
    const [expandedDesc, setExpandedDesc] = useState(false);

    useEffect(() => {
        const apiUrl = getApiUrl();
        fetch(`${apiUrl}/api/books/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        })
            .then(res => res.json())
            .then(data => {
                setBook(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id, token]);

    const addToLibrary = async () => {
        if (!token || !book) return;
        setAddingToLibrary(true);
        try {
            const apiUrl = getApiUrl();
            const res = await fetch(`${apiUrl}/api/library/add`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ book_id: book.id })
            });

            if (res.ok) {
                alert('Added to your library!');
            }
        } catch (err) {
            console.error('Failed to add to library:', err);
        } finally {
            setAddingToLibrary(false);
        }
    };

    if (loading) return <div className="p-8 min-h-screen text-muted-foreground flex justify-center items-center">Loading book details...</div>;
    if (!book) return <div className="p-8 min-h-screen text-red-500 flex justify-center items-center">Book not found.</div>;

    const price = book.price ? Number(book.price).toFixed(2) : '0.00';
    const isContinuing = book.progress && book.progress.percentage_completed > 0;

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            {/* Top Navigation Back */}
            <div className="max-w-[1400px] mx-auto px-4 pt-4">
                 <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-indigo-400 transition-colors">
                    <ArrowLeft size={16} /> Back to Library
                </button>
            </div>

            <div className="max-w-[1400px] mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[1fr_2.5fr_1fr] gap-8 xl:gap-12">
                
                {/* LEFT COLUMN: Cover & Author */}
                <div className="space-y-6 flex flex-col items-center lg:items-start max-w-sm mx-auto lg:mx-0 w-full">
                    {/* Book Cover */}
                    <div className="w-full relative rounded-md overflow-hidden shadow-2xl border border-border group bg-card transition-all">
                        {book.cover_image ? (
                            <img
                                src={resolveAssetUrl(book.cover_image)}
                                alt={book.title}
                                className="w-full h-auto object-contain cursor-pointer"
                            />
                        ) : (
                            <div className="w-full aspect-[2/3] bg-zinc-800 flex items-center justify-center">
                                <BookOpen className="text-zinc-600" size={60} />
                            </div>
                        )}
                    </div>

                    {/* Action Buttons underneath cover */}
                    <div className="grid grid-cols-2 gap-2 w-full">
                        <button className="flex flex-col items-center justify-center border border-border rounded-md py-2 hover:bg-muted transition-colors">
                            <BookOpen size={16} className="mb-1 text-muted-foreground" />
                            <span className="text-xs font-semibold">Read sample</span>
                        </button>
                        <button className="flex flex-col items-center justify-center border border-border rounded-md py-2 hover:bg-muted transition-colors">
                            <Headphones size={16} className="mb-1 text-muted-foreground" />
                            <span className="text-xs font-semibold">Audible sample</span>
                        </button>
                    </div>

                    {/* Follow the Author */}
                    <div className="w-full pt-4 border-t border-border">
                        <h3 className="font-bold text-sm mb-4 flex items-center gap-1">Follow the author</h3>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 rounded-full bg-indigo-500/20 overflow-hidden border border-border flex items-center justify-center shrink-0">
                                {book.author_image ? (
                                    <img src={resolveAssetUrl(book.author_image)} alt={book.author} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-indigo-500 font-bold text-xl">{book.author[0]}</span>
                                )}
                            </div>
                            <div>
                                <p className="font-bold text-sm hover:underline cursor-pointer text-indigo-400">{book.author}</p>
                                {book.author_license && (
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{book.author_license}</p>
                                )}
                            </div>
                        </div>
                        {book.author_bio && (
                            <p className="text-xs text-muted-foreground line-clamp-3 hover:line-clamp-none cursor-pointer mb-3">
                                {book.author_bio}
                            </p>
                        )}
                        <button className="w-full py-1.5 border border-border rounded-full text-xs font-semibold hover:bg-muted transition-colors">
                            Follow
                        </button>
                    </div>
                </div>

                {/* MIDDLE COLUMN: Details & Information */}
                <div className="space-y-4">
                    <h1 className="text-3xl md:text-4xl font-bold font-serif leading-tight">{book.title}</h1>
                    <div className="text-sm text-muted-foreground">
                        {book.edition && <span className="mr-2 font-medium">{book.edition}</span>}
                        by <span className="text-indigo-400 hover:underline cursor-pointer">{book.author}</span> (Author) 
                        <span className="mx-2">|</span> 
                        Format: <span className="font-medium text-foreground">{book.format || 'Kindle Edition'}</span>
                    </div>

                    {/* Ratings */}
                    <div className="flex items-center gap-1 text-yellow-500">
                        <Star size={16} fill="currentColor" />
                        <Star size={16} fill="currentColor" />
                        <Star size={16} fill="currentColor" />
                        <Star size={16} fill="currentColor" />
                        <Star size={16} fill="currentColor" className="opacity-50" />
                        <span className="text-sm text-foreground ml-1">4.4</span>
                        <ChevronDown size={14} className="text-muted-foreground ml-1 mr-2" />
                        <span className="text-sm text-indigo-400 hover:underline cursor-pointer">(3,108 ratings)</span>
                    </div>

                    {/* Charts / Awards */}
                    <div className="flex items-center gap-3 mt-2">
                        <span className="bg-indigo-600 text-white text-[10px] font-bold uppercase px-2 py-1 rounded">Bookify Choice</span>
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{book.subject?.name} • Top 10</span>
                    </div>

                    <div className="py-2 border-b border-border"></div>

                    {/* Formats Grid Row */}
                    <div className="hidden md:grid grid-cols-4 gap-2 pt-2">
                        <div className="border border-indigo-500 bg-indigo-500/10 p-2 rounded-md flex flex-col justify-center relative cursor-pointer group">
                            <div className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-bold px-1 rounded-bl">Deal</div>
                            <span className="text-xs font-bold text-foreground group-hover:text-indigo-400 transition-colors">Kindle Edition</span>
                            <span className="text-sm font-bold text-red-500">EUR {price}</span>
                        </div>
                        <div className="border border-border p-2 rounded-md flex flex-col justify-center cursor-pointer hover:bg-muted transition-colors">
                            <span className="text-xs font-bold text-muted-foreground">Audiobook</span>
                            <span className="text-sm font-bold text-foreground">EUR 0.00</span>
                        </div>
                        <div className="border border-border p-2 rounded-md flex flex-col justify-center cursor-pointer hover:bg-muted transition-colors">
                            <span className="text-xs font-bold text-muted-foreground">Hardcover</span>
                            <span className="text-sm font-bold text-foreground">EUR 14.72</span>
                        </div>
                        <div className="border border-border p-2 rounded-md flex flex-col justify-center cursor-pointer hover:bg-muted transition-colors">
                            <span className="text-xs font-bold text-muted-foreground">Paperback</span>
                            <span className="text-sm font-bold text-foreground">EUR 10.32</span>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="pt-6 relative">
                        <h3 className="font-bold text-sm uppercase tracking-wider mb-3 text-muted-foreground">About the book</h3>
                        <p className={`text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed ${!expandedDesc && 'line-clamp-5'}`}>
                            {book.description || "No description provided."}
                        </p>
                        <button 
                            onClick={() => setExpandedDesc(!expandedDesc)}
                            className="text-sm text-indigo-400 hover:underline font-semibold mt-2 flex items-center gap-1"
                        >
                            {expandedDesc ? 'Read less' : 'Read more'} <ChevronDown size={14} className={expandedDesc ? "rotate-180" : ""} />
                        </button>
                    </div>

                    <div className="mt-8 border-t border-border pt-6">
                        <p className="text-sm italic font-medium">A beautifully written story... Endlessly dazzling.</p>
                        <p className="text-xs mt-2 text-muted-foreground">- Readers Love {book.title}</p>
                    </div>

                    {/* Product Details Bar */}
                    <div className="mt-8 border-t border-border pt-6">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div className="flex flex-col items-center justify-center p-3 text-center gap-2">
                                <FileTextIcon size={20} className="text-muted-foreground" />
                                <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-bold">Print Length</span>
                                <span className="text-sm font-semibold">{book.print_length || 'Unknown'} pages</span>
                            </div>
                            <div className="flex flex-col items-center justify-center p-3 text-center gap-2">
                                <GlobeIcon size={20} className="text-muted-foreground" />
                                <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-bold">Language</span>
                                <span className="text-sm font-semibold">{book.language || 'English'}</span>
                            </div>
                            <div className="flex flex-col items-center justify-center p-3 text-center gap-2">
                                <BuildingIcon size={20} className="text-muted-foreground" />
                                <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-bold">Publisher</span>
                                <span className="text-sm font-semibold">{book.publisher || 'Independent'}</span>
                            </div>
                            <div className="flex flex-col items-center justify-center p-3 text-center gap-2">
                                <AccessibilityIcon size={20} className="text-muted-foreground" />
                                <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-bold">Accessibility</span>
                                <span className="text-sm font-semibold text-indigo-400 hover:underline cursor-pointer">{book.accessibility || 'Learn More'}</span>
                            </div>
                            <div className="flex flex-col items-center justify-center p-3 text-center gap-2">
                                <CalendarIcon size={20} className="text-muted-foreground" />
                                <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-bold">Publication Date</span>
                                <span className="text-sm font-semibold">{book.publication_date || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Action Buy Box */}
                <div className="space-y-6">
                    <div className="border border-border bg-card rounded-xl shadow-lg p-5">
                        <div className="flex items-center gap-2 text-sm font-bold mb-4">
                            {book.is_premium ? (
                                <span className="bg-red-500 text-white px-2 py-0.5 rounded text-[10px] uppercase">Premium Content</span>
                            ) : (
                                <span className="bg-green-500 text-white px-2 py-0.5 rounded text-[10px] uppercase">Free with Plan</span>
                            )}
                        </div>

                        <div className="flex items-baseline gap-1 mb-6">
                            <span className="text-sm text-foreground font-semibold">EUR</span>
                            <span className="text-3xl font-bold">{price.split('.')[0]}</span>
                            <span className="text-lg font-bold">.{price.split('.')[1]}</span>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => router.push(`/books/${id}/read`)}
                                className="w-full bg-[#FFD814] hover:bg-[#F7CA00] text-black font-bold py-3 px-4 rounded-full transition-colors flex items-center justify-center gap-2 shadow-sm"
                            >
                                <Play size={18} fill="currentColor" />
                                {isContinuing ? 'Continue Reading' : 'Start Reading'}
                            </button>
                            <p className="text-[11px] text-center text-muted-foreground px-2">
                                You are choosing to read this book via your platform plan. By clicking above, you agree to the Terms of Use.
                            </p>
                        </div>
                        
                        <div className="my-5 border-t border-border"></div>
                        
                        <div className="space-y-3">
                            <button
                                onClick={addToLibrary}
                                disabled={addingToLibrary}
                                className="w-full bg-background hover:bg-muted border border-border text-foreground font-bold py-2.5 px-4 rounded-full transition-colors flex items-center justify-center gap-2 text-sm"
                            >
                                {addingToLibrary ? 'Adding...' : <><Heart size={16} /> Add to Collection</>}
                            </button>
                        </div>

                        {/* Upsell box */}
                        <div className="mt-5 p-3 border border-border rounded-lg bg-background/50 flex items-start gap-3">
                            <input type="checkbox" className="mt-1 rounded bg-background border-border text-indigo-600 focus:ring-0" />
                            <div className="text-xs">
                                <span className="font-semibold">Add audiobook</span> for EUR 11.02.
                                <p className="text-muted-foreground mt-0.5 line-through">EUR 16.66</p>
                            </div>
                        </div>
                    </div>

                    {/* Secondary Box */}
                    <div className="border border-border bg-card rounded-xl p-5">
                        <h4 className="font-bold text-sm mb-2 text-foreground">Gift this book</h4>
                        <p className="text-xs text-muted-foreground mb-4">Give as a gift or purchase for a group.</p>
                        <button className="w-full border border-border hover:bg-muted text-foreground text-sm font-semibold py-2 rounded-full transition-colors">
                            Buy for others
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}

// Simple Icon Components to match details bar
function FileTextIcon(props: any) {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>
}
function GlobeIcon(props: any) {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
}
function BuildingIcon(props: any) {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>
}
function AccessibilityIcon(props: any) {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="16" cy="4" r="1"></circle><path d="m18 19 1-7-6 1"></path><path d="m5 8 3-3 5.5 3-2.36 3.5"></path><path d="M4.24 14.5a5 5 0 0 0 6.88 6"></path><path d="M13.76 17.5a5 5 0 0 0-6.88-6"></path></svg>
}
function CalendarIcon(props: any) {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
}
