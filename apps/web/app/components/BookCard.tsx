'use client';

import { useState } from 'react';
import Link from 'next/link';
import { resolveAssetUrl } from '../lib/utils';
import { Download } from 'lucide-react';

interface BookCardProps {
    id: number;
    title: string;
    author: string;
    coverImage: string;
    progress?: number;
    isDownloaded?: boolean; // New prop for the icon
    onClick?: (e: React.MouseEvent) => void;
}

export function BookCard({ id, title, author, coverImage, progress, isDownloaded = true, onClick }: BookCardProps) {
    const [hasError, setHasError] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    if (hasError) return null;

    return (
        <Link
            href={`/books/${id}`}
            className={`block group cursor-pointer transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            onClick={onClick}
        >
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md bg-zinc-900 shadow-lg mb-3">
                <img
                    src={resolveAssetUrl(coverImage)}
                    alt={title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onLoad={() => setIsLoaded(true)}
                    onError={() => setHasError(true)}
                />

                {/* Download Icon Overlay */}
                <div className="absolute top-2 left-2 z-10">
                    <div className="bg-blue-600 rounded-full p-1 shadow-lg">
                        <Download size={10} className="text-white" strokeWidth={3} />
                    </div>
                </div>
            </div>

            <div className="space-y-1.5 px-0.5 mt-2">
                <h3 className="text-base font-bold text-white truncate font-serif tracking-wide leading-tight">{title}</h3>
                <p className="text-xs text-blue-500 font-medium truncate">{author}</p>

                {/* Progress Bar (Bottom) */}
                {progress !== undefined && (
                    <div className="flex items-center gap-2 pt-1.5">
                        <div className="flex-1 h-0.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-600"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <span className="text-[10px] font-medium text-zinc-500">{progress}%</span>
                    </div>
                )}
            </div>
        </Link>
    );
}
