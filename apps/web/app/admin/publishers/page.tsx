'use client';

import { useState } from 'react';
import { Building2, Search, Plus, MoreVertical, Mail, Globe, Phone } from 'lucide-react';

export default function PublishersPage() {
    const [searchTerm, setSearchTerm] = useState('');

    const publishers = [
        { id: 1, name: 'Penguin Random House', contact: 'contact@penguin.com', books: 124, status: 'Active', country: 'USA' },
        { id: 2, name: 'HarperCollins', contact: 'rights@harpercollins.com', books: 85, status: 'Active', country: 'UK' },
        { id: 3, name: 'Simon & Schuster', contact: 'info@simonandschuster.com', books: 62, status: 'Active', country: 'USA' },
        { id: 4, name: 'Macmillan Publishers', contact: 'support@macmillan.com', books: 45, status: 'Inactive', country: 'Germany' },
        { id: 5, name: 'Hachette Livre', contact: 'hachette@livre.fr', books: 91, status: 'Active', country: 'France' },
    ];

    const filteredPublishers = publishers.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Publisher Management</h1>
                    <p className="text-zinc-400 text-sm">Manage publishing partners and content sources.</p>
                </div>

                <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search publishers..."
                            className="bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-600 outline-none w-full md:w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-indigo-500/20"
                    >
                        <Plus size={18} />
                        Add Publisher
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPublishers.map((publisher) => (
                    <div key={publisher.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 group hover:border-zinc-700 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400">
                                <Building2 size={24} />
                            </div>
                            <button className="text-zinc-500 hover:text-white">
                                <MoreVertical size={20} />
                            </button>
                        </div>

                        <h3 className="text-lg font-bold text-white mb-1">{publisher.name}</h3>
                        <p className="text-xs text-zinc-500 mb-4">{publisher.country}</p>

                        <div className="space-y-2 mb-6">
                            <div className="flex items-center gap-2 text-sm text-zinc-400">
                                <Mail size={14} /> {publisher.contact}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-zinc-400">
                                <Globe size={14} /> Website available
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                            <div className="text-xs">
                                <span className="block text-zinc-500">Books</span>
                                <span className="font-bold text-white">{publisher.books}</span>
                            </div>
                            <div className="text-xs">
                                <span className="block text-zinc-500">Status</span>
                                <span className={`font-bold ${publisher.status === 'Active' ? 'text-green-500' : 'text-zinc-500'}`}>
                                    {publisher.status}
                                </span>
                            </div>
                            <button className="text-xs font-bold text-indigo-400 hover:text-indigo-300">View Details</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
