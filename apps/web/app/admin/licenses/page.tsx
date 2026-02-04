'use client';

import { useState } from 'react';
import { Key, Copy, CheckCircle, XCircle, RefreshCw, Search, Plus } from 'lucide-react';

export default function LicensesPage() {
    const [searchTerm, setSearchTerm] = useState('');

    const licenses = [
        { id: 1, key: 'BK-2938-4829-1920', type: 'Institutional', organization: 'Harvard University', expiry: '2026-12-31', status: 'Active', seats: '500/1000' },
        { id: 2, key: 'BK-9921-0021-4821', type: 'Individual', organization: 'Personal', expiry: '2025-06-15', status: 'Active', seats: '1/1' },
        { id: 3, key: 'BK-1029-3847-5610', type: 'Institutional', organization: 'MIT Library', expiry: '2026-01-01', status: 'Active', seats: '240/500' },
        { id: 4, key: 'BK-5582-9918-2201', type: 'Institutional', organization: 'Stanford Utils', expiry: '2025-01-01', status: 'Expired', seats: '1000/1000' },
        { id: 5, key: 'BK-0012-3344-5566', type: 'Individual', organization: 'Personal', expiry: '2025-11-20', status: 'Active', seats: '1/1' },
    ];

    const filteredLicenses = licenses.filter(l =>
        l.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.key.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">License Management</h1>
                    <p className="text-zinc-400 text-sm">Manage access keys for institutions and premium users.</p>
                </div>

                <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search licenses..."
                            className="bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-600 outline-none w-full md:w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-indigo-500/20"
                    >
                        <Plus size={18} />
                        Generate Key
                    </button>
                </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-zinc-950/50 border-b border-zinc-800">
                            <tr>
                                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">License Key</th>
                                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Organization / Owner</th>
                                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Type</th>
                                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Usage</th>
                                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Expiry</th>
                                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {filteredLicenses.map(license => (
                                <tr key={license.id} className="group hover:bg-zinc-800/30 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-zinc-800 rounded text-zinc-400">
                                                <Key size={14} />
                                            </div>
                                            <span className="font-mono text-sm text-white">{license.key}</span>
                                            <button className="text-zinc-600 hover:text-white transition-colors" title="Copy Key">
                                                <Copy size={12} />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm font-medium text-zinc-300">{license.organization}</td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${license.type === 'Institutional'
                                                ? 'bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/20'
                                                : 'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20'
                                            }`}>
                                            {license.type}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-zinc-400">
                                        {license.seats}
                                    </td>
                                    <td className="p-4 text-sm text-zinc-400">
                                        {license.expiry}
                                    </td>
                                    <td className="p-4 text-right">
                                        {license.status === 'Active' ? (
                                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-green-500/10 text-green-400 ring-1 ring-green-500/20">
                                                <CheckCircle size={12} /> Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-red-500/10 text-red-400 ring-1 ring-red-500/20">
                                                <XCircle size={12} /> Expired
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
