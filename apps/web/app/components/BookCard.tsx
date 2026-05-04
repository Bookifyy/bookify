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
            className={`block group cursor-pointer transition-all duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} bg-card rounded-xl overflow-hidden border border-border hover:shadow-md hover:border-foreground/20 flex flex-col`}
            onClick={onClick}
        >
            <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted">
                <img
                    src={resolveAssetUrl(coverImage)}
                    alt={title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onLoad={() => setIsLoaded(true)}
                    onError={() => setHasError(true)}
                />

                {/* Download Icon Overlay */}
                <div className="absolute top-2 left-2 z-10 transition-opacity duration-300">
                    <div className="bg-blue-600 rounded-full p-1 shadow-lg border border-blue-500/30">
                        <Download size={10} className="text-white" strokeWidth={3} />
                    </div>
                </div>
            </div>

            <div className="p-3.5 flex-1 flex flex-col justify-between">
                <div>
                    <h3 className="text-[14px] font-bold text-foreground line-clamp-1 font-serif tracking-normal leading-tight group-hover:text-blue-600 transition-colors">{title}</h3>
                    <p className="text-[11px] text-muted-foreground font-medium line-clamp-1 mt-0.5">{author}</p>
                </div>

                {/* Progress Bar (Bottom) */}
                {progress !== undefined && (
                    <div className="flex items-center gap-2 mt-4">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-600 rounded-full"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <span className="text-[10px] font-medium text-muted-foreground tabular-nums leading-none">{progress}%</span>
                    </div>
                )}
            </div>
        </Link>
    );
}
