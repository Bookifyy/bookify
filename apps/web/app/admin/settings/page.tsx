'use client';

import { Settings, Bell, Lock, Globe, Database, Moon } from 'lucide-react';

export default function AdminSettingsPage() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">System Settings</h1>
                    <p className="text-muted-foreground text-sm">Configure platform defaults and security policies.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* General Settings */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md dark:shadow-none transition-shadow duration-300">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
                            <Globe size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">General Configuration</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-background/50 rounded-xl border border-border">
                            <div>
                                <p className="text-sm font-medium text-foreground">Platform Name</p>
                                <p className="text-xs text-muted-foreground">Bookify</p>
                            </div>
                            <button className="text-xs text-indigo-400 font-bold hover:text-indigo-300">Edit</button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-background/50 rounded-xl border border-border">
                            <div>
                                <p className="text-sm font-medium text-foreground">Maintenance Mode</p>
                                <p className="text-xs text-muted-foreground">Disabled</p>
                            </div>
                            <div className="w-10 h-5 bg-zinc-700 rounded-full relative cursor-pointer">
                                <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md dark:shadow-none transition-shadow duration-300">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                            <Bell size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">Notifications</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-sm">Email Alerts (System)</span>
                            <input type="checkbox" checked readOnly className="h-4 w-4 bg-muted border-zinc-700 rounded text-indigo-600 focus:ring-indigo-500" />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-sm">New Signup Notification</span>
                            <input type="checkbox" checked readOnly className="h-4 w-4 bg-muted border-zinc-700 rounded text-indigo-600 focus:ring-indigo-500" />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-sm">Report Suspicious Activity</span>
                            <input type="checkbox" checked readOnly className="h-4 w-4 bg-muted border-zinc-700 rounded text-indigo-600 focus:ring-indigo-500" />
                        </div>
                    </div>
                </div>

                {/* Security */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md dark:shadow-none transition-shadow duration-300">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-red-500/10 text-red-500 rounded-lg">
                            <Lock size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">Security</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-background/50 rounded-xl border border-border">
                            <div>
                                <p className="text-sm font-medium text-foreground">Minimum Password Length</p>
                                <p className="text-xs text-muted-foreground">8 Characters</p>
                            </div>
                            <button className="text-xs text-indigo-400 font-bold hover:text-indigo-300">Edit</button>
                        </div>
                        <button className="w-full py-2 bg-muted hover:bg-zinc-700 text-foreground rounded-lg text-sm font-bold transition-colors">
                            Manage API Keys
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
