'use client';

import { useState } from 'react';
import { Layers, MoreVertical, Lock, Users, Clock, Globe } from 'lucide-react';

interface Collection {
    id: string;
    title: string;
    description: string;
    images: string[];
    itemCount: number;
    badge: {
        type: 'Private' | 'Public' | 'Group';
        icon: any;
    };
    members?: number;
    creator: {
        initial: string;
        name: string;
    };
    updatedAt: string;
}

const COLLECTIONS: Collection[] = [
    {
        id: '1',
        title: 'Fall Semester 2024',
        description: 'My reading list for the fall semester',
        images: [
            'https://images.unsplash.com/photo-1544822688-c5f41d328e67?auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&q=80'
        ],
        itemCount: 3,
        badge: { type: 'Private', icon: Lock },
        creator: { initial: 'Y', name: 'You' },
        updatedAt: 'Updated'
    },
    {
        id: '2',
        title: 'Classic Literature',
        description: 'Timeless works of fiction',
        images: [
            'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80'
        ],
        itemCount: 2,
        badge: { type: 'Public', icon: Globe },
        members: 3,
        creator: { initial: 'M', name: 'You' },
        updatedAt: 'Updated'
    },
    {
        id: '3',
        title: 'Philosophy Reading Group',
        description: 'Shared collection for our weekly philosophy discussions',
        images: [
            'https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&q=80'
        ],
        itemCount: 1,
        badge: { type: 'Group', icon: Users },
        members: 3,
        creator: { initial: 'A', name: 'Emma Wilson' },
        updatedAt: 'Updated'
    }
];

export default function CollectionsPage() {
    const [activeTab, setActiveTab] = useState<'my' | 'smart'>('my');

    return (
        <div className="min-h-screen bg-black text-zinc-300 pb-20">
            {/* Header Area */}
            <div className="border-b border-zinc-900 bg-black pt-6 pb-4 px-8 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center border border-blue-500/20">
                            <Layers className="text-blue-500" size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-medium text-white tracking-wide">Collections</h1>
                            <p className="text-sm text-zinc-400 mt-0.5">Curated playlists and smart collections</p>
                        </div>
                    </div>
                    <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors text-sm shadow-sm">
                        New Collection
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 mt-6">
                {/* Tabs */}
                <div className="p-1.5 bg-zinc-900 rounded-full flex items-center mb-8 border border-zinc-800">
                    <button
                        onClick={() => setActiveTab('my')}
                        className={`flex-1 py-3 text-sm font-medium rounded-full transition-all ${
                            activeTab === 'my'
                                ? 'bg-[#18181b] text-white shadow-sm'
                                : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                    >
                        My Collections
                    </button>
                    <button
                        onClick={() => setActiveTab('smart')}
                        className={`flex-1 py-3 text-sm font-medium rounded-full transition-all ${
                            activeTab === 'smart'
                                ? 'bg-[#18181b] text-white shadow-sm'
                                : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                    >
                        Smart Collections
                    </button>
                </div>

                {/* Grid */}
                {activeTab === 'my' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {COLLECTIONS.map((collection) => (
                            <div
                                key={collection.id}
                                className="bg-[#0a0a0a] border border-zinc-800 rounded-2xl overflow-hidden group hover:border-zinc-700 transition-colors flex flex-col"
                            >
                                {/* Image Layout */}
                                <div className="relative h-56 bg-zinc-900 border-b border-zinc-800 overflow-hidden">
                                    {collection.images.length === 1 && (
                                        <div className="relative w-full h-full">
                                            <img
                                                src={collection.images[0]}
                                                alt={collection.title}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        </div>
                                    )}
                                    {collection.images.length === 2 && (
                                        <div className="grid grid-cols-2 h-full gap-0.5 bg-zinc-950">
                                            <img
                                                src={collection.images[0]}
                                                alt={collection.title}
                                                className="w-full h-full object-cover"
                                            />
                                            <img
                                                src={collection.images[1]}
                                                alt={collection.title}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        </div>
                                    )}
                                    {collection.images.length >= 3 && (
                                        <div className="grid grid-cols-2 h-full gap-0.5 bg-zinc-950">
                                            <div className="h-full">
                                                <img
                                                    src={collection.images[0]}
                                                    alt={collection.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="grid grid-rows-2 gap-0.5 h-full">
                                                <img
                                                    src={collection.images[1]}
                                                    alt={collection.title}
                                                    className="w-full h-full object-cover"
                                                />
                                                <img
                                                    src={collection.images[2]}
                                                    alt={collection.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        </div>
                                    )}

                                    {/* Item Count Badge */}
                                    <div className="absolute bottom-3 left-4 bg-black/80 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide">
                                        {collection.itemCount} items
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex items-start justify-between gap-4 mb-2">
                                        <h3 className="font-serif text-lg font-medium text-white line-clamp-1 leading-snug">
                                            {collection.title}
                                        </h3>
                                        <button className="text-zinc-500 hover:text-white transition-colors p-1 -mr-1">
                                            <MoreVertical size={16} />
                                        </button>
                                    </div>
                                    <p className="text-sm text-zinc-400 mb-5 line-clamp-2 leading-relaxed">
                                        {collection.description}
                                    </p>

                                    <div className="flex items-center gap-3 mt-auto">
                                        {/* Status Badge */}
                                        <div className="flex items-center gap-1.5 bg-[#0ea5e9] text-white px-3 py-1 rounded-full text-xs font-semibold">
                                            {collection.badge.type === 'Private' && <Lock size={12} className="text-yellow-300" />}
                                            {collection.badge.type === 'Public' && <Globe size={12} />}
                                            {collection.badge.type === 'Group' && <Users size={12} />}
                                            <span>{collection.badge.type}</span>
                                        </div>

                                        {/* Members */}
                                        {collection.members && (
                                            <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-medium">
                                                <Users size={14} className="text-zinc-500" />
                                                <span>{collection.members} members</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-800/60">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-black bg-zinc-300`}>
                                                {collection.creator.initial}
                                            </div>
                                            <span className="text-xs text-zinc-400">
                                                by <span className="text-zinc-300 font-medium">{collection.creator.name}</span>
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
                                            <Clock size={12} />
                                            <span>{collection.updatedAt}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'smart' && (
                    <div className="py-20 flex flex-col items-center justify-center text-center border border-dashed border-zinc-800 rounded-3xl">
                        <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-4 border border-zinc-800">
                            <Layers className="text-zinc-500" size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2 font-serif">Smart Collections</h3>
                        <p className="text-zinc-500 text-sm max-w-md">
                            Smart collections automatically organize your books based on tags, reading status, and authors.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
