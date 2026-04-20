'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { Play, Star, ArrowLeft, ChevronDown, BookOpen, Clock, Heart, Headphones, X } from 'lucide-react';
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
    author_linkedin?: string;
    rating?: number;
    review_count?: number;
    isbn?: string;
    file_size?: string;
    screen_reader?: string;
    enhanced_typesetting?: string;
    x_ray?: string;
    word_wise?: string;
    page_flip?: string;
    accessibility_conformance?: string;
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
    const [showAccessibility, setShowAccessibility] = useState(false);

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
                        <button onClick={() => router.push(`/books/${id}/read`)} className="flex flex-col items-center justify-center border border-border rounded-md py-2 hover:bg-muted transition-colors">
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
                                {book.author_linkedin ? (
                                    <a href={book.author_linkedin} target="_blank" rel="noopener noreferrer" className="font-bold text-sm hover:underline cursor-pointer text-indigo-400">{book.author}</a>
                                ) : (
                                    <p className="font-bold text-sm hover:underline cursor-pointer text-indigo-400">{book.author}</p>
                                )}
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
                        <button 
                            onClick={() => book.author_linkedin ? window.open(book.author_linkedin, '_blank') : null}
                            className="w-full py-1.5 border border-border rounded-full text-xs font-semibold hover:bg-muted transition-colors"
                        >
                            Follow
                        </button>
                    </div>
                </div>

                {/* MIDDLE COLUMN: Details & Information */}
                <div className="space-y-4">
                    <h1 className="text-3xl md:text-4xl font-bold font-serif leading-tight">{book.title}</h1>
                    <div className="text-sm text-muted-foreground">
                        {book.edition && <span className="mr-2 font-medium">{book.edition}</span>}
                        by {book.author_linkedin ? <a href={book.author_linkedin} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline cursor-pointer font-medium">{book.author}</a> : <span className="text-indigo-400 hover:underline cursor-pointer font-medium">{book.author}</span>} (Author) 
                        <span className="mx-2">|</span> 
                        Format: <span className="font-medium text-foreground">{book.format || 'Bookify Edition'}</span>
                    </div>

                    {/* Ratings */}
                    <div className="flex items-center gap-1 text-yellow-500 mt-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={16} fill={i < Math.floor(book.rating || 4.5) ? "currentColor" : "none"} className={i >= Math.floor(book.rating || 4.5) ? "opacity-50" : ""} />
                        ))}
                        <span className="text-sm text-foreground ml-1">{book.rating || 4.5}</span>
                        <ChevronDown size={14} className="text-muted-foreground ml-1 mr-2" />
                        <span className="text-sm text-indigo-400 hover:underline cursor-pointer">({book.review_count?.toLocaleString() || '0'} ratings)</span>
                    </div>

                    {/* Charts / Awards */}
                    <div className="flex items-center gap-3 mt-2">
                        <span className="bg-indigo-600 text-white text-[10px] font-bold uppercase px-2 py-1 rounded">Bookify Choice</span>
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{book.subject?.name} • Top 10</span>
                    </div>

                    <div className="py-2 border-b border-border"></div>

                    {/* Formats Grid Row */}
                    <div className="grid grid-cols-2 gap-2 pt-2 md:w-2/3">
                        <div className="border border-indigo-500 bg-indigo-500/10 p-2 rounded-md flex flex-col justify-center relative cursor-pointer group">
                            <div className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-bold px-1 rounded-bl">Deal</div>
                            <span className="text-xs font-bold text-foreground group-hover:text-indigo-400 transition-colors">{book.format || 'Bookify Edition'}</span>
                            <span className="text-sm font-bold text-red-500">USD {price}</span>
                        </div>
                        <div className="border border-border p-2 rounded-md flex flex-col justify-center cursor-pointer hover:bg-muted transition-colors">
                            <span className="text-xs font-bold text-muted-foreground">Audiobook</span>
                            <span className="text-sm font-bold text-foreground">USD {book.price ? (Number(book.price) * 0.8).toFixed(2) : '0.00'}</span>
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
                        <h2 className="font-bold text-lg mb-4">Product details</h2>
                        <ul className="text-sm space-y-2 text-foreground/90">
                            <li><span className="font-bold pr-1">ASIN :</span> {book.isbn ? `B0${book.isbn.substring(0,8).toUpperCase()}` : 'B0DK2YSB8M'}</li>
                            <li><span className="font-bold pr-1">Publisher :</span> {book.publisher || 'Independent'}</li>
                            <li>
                                <span className="font-bold pr-1">Accessibility :</span> 
                                <span onClick={() => setShowAccessibility(!showAccessibility)} className="text-indigo-400 hover:underline cursor-pointer select-none">
                                    {book.accessibility || 'Learn more'} <ChevronDown className={`inline ml-1 w-3 h-3 text-muted-foreground transition-transform ${showAccessibility ? 'rotate-180' : ''}`} />
                                </span>
                                {showAccessibility && (
                                    <div className="mt-4 mb-4 border border-border rounded-lg bg-card p-5 shadow-lg relative">
                                        <button onClick={() => setShowAccessibility(false)} className="absolute top-3 right-3 text-muted-foreground hover:text-white"><X size={16} /></button>
                                        <h3 className="font-bold text-sm mb-4 pr-6">Accessibility features for this Bookify book (as provided by the publisher)</h3>
                                        
                                        <div className="space-y-4 text-xs">
                                            <div className="border-b border-border pb-3">
                                                <h4 className="font-bold text-sm">Visual adjustments</h4>
                                                <p className="mt-1">Appearance can be modified.</p>
                                                <ul className="list-disc pl-5 mt-1 text-muted-foreground">
                                                    <li>The text of this Bookify book can be adjusted (e.g. size, font, color, margins, spacing, alignment).</li>
                                                </ul>
                                            </div>
                                            <div className="border-b border-border pb-3">
                                                <h4 className="font-bold text-sm">Nonvisual reading</h4>
                                                <p className="mt-1">Readable in read aloud and Braille.</p>
                                                <ul className="list-disc pl-5 mt-1 text-muted-foreground">
                                                    <li>The text of this book is accessible to screen readers.</li>
                                                </ul>
                                            </div>
                                            <div className="border-b border-border pb-3">
                                                <h4 className="font-bold text-sm">Hazards</h4>
                                                <p className="mt-1">This book contains no hazards.</p>
                                            </div>
                                            {book.accessibility_conformance && (
                                                <div className="border-b border-border pb-3">
                                                    <h4 className="font-bold text-sm">Conformance</h4>
                                                    <p className="mt-1">This publication contains a conformance claim that it meets the following standards:</p>
                                                    <ul className="list-disc pl-5 mt-1 text-muted-foreground">
                                                        {book.accessibility_conformance.split(',').map((c, i) => <li key={i}>{c.trim()}</li>)}
                                                    </ul>
                                                </div>
                                            )}
                                            <div>
                                                <h4 className="font-bold text-sm">Navigation</h4>
                                                <p className="mt-1">This book contains:</p>
                                                <ul className="list-disc pl-5 mt-1 text-muted-foreground">
                                                    <li>A table of contents</li>
                                                    <li>Real page numbers</li>
                                                    <li>Heading markup</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </li>
                            <li><span className="font-bold pr-1">Publication date :</span> {book.publication_date ? new Date(book.publication_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}</li>
                            <li><span className="font-bold pr-1">Language :</span> {book.language || 'English'}</li>
                            <li><span className="font-bold pr-1">File size :</span> {book.file_size || '2.5 MB'}</li>
                            <li><span className="font-bold pr-1">Screen Reader :</span> {book.screen_reader || 'Supported'}</li>
                            <li><span className="font-bold pr-1">Enhanced typesetting :</span> <span className="text-indigo-400 hover:underline cursor-pointer">{book.enhanced_typesetting || 'Enabled'}</span><ChevronDown className="inline ml-1 w-3 h-3 text-muted-foreground" /></li>
                            <li><span className="font-bold pr-1">X-Ray :</span> {book.x_ray || 'Not Enabled'}</li>
                            <li><span className="font-bold pr-1">Word Wise :</span> <span className="text-indigo-400 hover:underline cursor-pointer">{book.word_wise || 'Enabled'}</span><ChevronDown className="inline ml-1 w-3 h-3 text-muted-foreground" /></li>
                            <li><span className="font-bold pr-1">Print length :</span> <span className="text-indigo-400 hover:underline cursor-pointer">{book.print_length || 'Unknown'} pages</span><ChevronDown className="inline ml-1 w-3 h-3 text-muted-foreground" /></li>
                            <li><span className="font-bold pr-1">ISBN-13 :</span> {book.isbn || '000-0000000000'}</li>
                            <li><span className="font-bold pr-1">Page Flip :</span> <span className="text-indigo-400 hover:underline cursor-pointer">{book.page_flip || 'Enabled'}</span><ChevronDown className="inline ml-1 w-3 h-3 text-muted-foreground" /></li>
                            <li className="flex items-center gap-1 pt-2">
                                <span className="font-bold">Customer reviews:</span> 
                                <span className="text-yellow-500 flex items-center mx-1">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star key={i} size={14} fill={i < Math.floor(book.rating || 4.5) ? "currentColor" : "none"} className={i >= Math.floor(book.rating || 4.5) ? "opacity-50" : ""} />
                                    ))}
                                </span>
                                <span>{book.rating || 4.5}</span>
                                <span className="text-indigo-400 hover:underline cursor-pointer ml-1">({book.review_count?.toLocaleString() || '0'})</span>
                            </li>
                        </ul>
                    </div>

                    {/* About the Author Block */}
                    <div className="mt-10 border-t border-border pt-8">
                        <h2 className="font-bold text-xl mb-4">About the author</h2>
                        <p className="text-sm text-foreground/80 mb-6">Follow authors to get new release updates, plus improved recommendations.</p>
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                            <div className="flex flex-col items-center max-w-[120px] text-center shrink-0">
                                <div className="w-24 h-24 rounded-full overflow-hidden mb-3 bg-indigo-500/10 border border-border">
                                    {book.author_image ? (
                                        <img src={resolveAssetUrl(book.author_image)} alt={book.author} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center font-bold text-4xl text-indigo-500">{book.author[0]}</div>
                                    )}
                                </div>
                                <button onClick={() => book.author_linkedin ? window.open(book.author_linkedin, '_blank') : null} className="w-full py-1.5 border border-border rounded-full text-xs font-semibold hover:bg-muted transition-colors">
                                    Follow
                                </button>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-indigo-400 cursor-pointer hover:underline" onClick={() => book.author_linkedin ? window.open(book.author_linkedin, '_blank') : null}>{book.author}</h3>
                                <p className="text-sm mt-3 text-foreground/90">
                                    {book.author_bio || "Discover more of the author's books, see similar authors, read book recommendations and more."}
                                </p>
                            </div>
                        </div>

                        {/* Rate Feedback */}
                        <div className="mt-12 flex flex-col items-center justify-center border-t border-border pt-8 relative">
                            <button className="absolute top-8 right-2 text-muted-foreground hover:text-white"><X size={16} /></button>
                            <h4 className="font-bold text-sm mb-6">Rate today's book shopping experience</h4>
                            <div className="flex items-center gap-2 md:gap-4 lg:gap-8 min-w-[280px] justify-between">
                                {['Very poor', 'Poor', 'Neutral', 'Good', 'Great'].map((label, idx) => (
                                    <div key={label} className="relative flex flex-col items-center w-12">
                                        {idx > 0 && <div className="absolute top-2.5 -left-12 w-12 h-[1px] bg-border z-0"></div>}
                                        <button className="relative z-10 w-5 h-5 rounded-full border-2 border-border bg-background hover:border-indigo-500 transition-colors mb-2"></button>
                                        <span className="text-[10px] text-muted-foreground font-medium text-center absolute -bottom-4 whitespace-nowrap">{label}</span>
                                    </div>
                                ))}
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
                            <span className="text-sm text-foreground font-semibold">USD</span>
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
                                <span className="font-semibold">Add audiobook</span> for USD {(Number(price) * 0.8).toFixed(2)}.
                                <p className="text-muted-foreground mt-0.5 line-through">USD {(Number(price) * 1.5).toFixed(2)}</p>
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


