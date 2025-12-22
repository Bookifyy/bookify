'use client';

import Image from 'next/image';
import Link from 'next/link';

interface BookCardProps {
    id: number;
    title: string;
    author: string;
    coverImage: string;
    progress?: number;
}

export function BookCard({ id, title, author, coverImage, progress }: BookCardProps) {
    return (
        <Link href={`/books/${id}`} className="block group cursor-pointer">
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md bg-zinc-800 shadow-lg transition-transform duration-300 group-hover:-translate-y-1">
                <img
                    src={coverImage}
                    alt={title}
                    className="h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-80"
                />
                {progress !== undefined && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-700">
                        <div
                            className="h-full bg-indigo-500 transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}
            </div>
            <div className="mt-4 space-y-1">
                <h3 className="text-sm font-semibold text-white truncate">{title}</h3>
                <p className="text-xs text-zinc-500 truncate">{author}</p>
                {progress !== undefined && (
                    <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-600 rounded-full"
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
