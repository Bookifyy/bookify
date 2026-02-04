'use client';

import { Settings, Bell, Lock, Globe, Database, Moon } from 'lucide-react';

export default function AdminSettingsPage() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">System Settings</h1>
                    <p className="text-zinc-400 text-sm">Configure platform defaults and security policies.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* General Settings */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
                            <Globe size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-white">General Configuration</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-zinc-950/50 rounded-xl border border-zinc-800">
                            <div>
                                <p className="text-sm font-medium text-white">Platform Name</p>
                                <p className="text-xs text-zinc-500">Bookify</p>
                            </div>
                            <button className="text-xs text-indigo-400 font-bold hover:text-indigo-300">Edit</button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-zinc-950/50 rounded-xl border border-zinc-800">
                            <div>
                                <p className="text-sm font-medium text-white">Maintenance Mode</p>
                                <p className="text-xs text-zinc-500">Disabled</p>
                            </div>
                            <div className="w-10 h-5 bg-zinc-700 rounded-full relative cursor-pointer">
                                <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                            <Bell size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-white">Notifications</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-zinc-400 text-sm">Email Alerts (System)</span>
                            <input type="checkbox" checked readOnly className="h-4 w-4 bg-zinc-800 border-zinc-700 rounded text-indigo-600 focus:ring-indigo-500" />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-zinc-400 text-sm">New Signup Notification</span>
                            <input type="checkbox" checked readOnly className="h-4 w-4 bg-zinc-800 border-zinc-700 rounded text-indigo-600 focus:ring-indigo-500" />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-zinc-400 text-sm">Report Suspicious Activity</span>
                            <input type="checkbox" checked readOnly className="h-4 w-4 bg-zinc-800 border-zinc-700 rounded text-indigo-600 focus:ring-indigo-500" />
                        </div>
                    </div>
                </div>

                {/* Security */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-red-500/10 text-red-500 rounded-lg">
                            <Lock size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-white">Security</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-zinc-950/50 rounded-xl border border-zinc-800">
                            <div>
                                <p className="text-sm font-medium text-white">Minimum Password Length</p>
                                <p className="text-xs text-zinc-500">8 Characters</p>
                            </div>
                            <button className="text-xs text-indigo-400 font-bold hover:text-indigo-300">Edit</button>
                        </div>
                        <button className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-bold transition-colors">
                            Manage API Keys
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
