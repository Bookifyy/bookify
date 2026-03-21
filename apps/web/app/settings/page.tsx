'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getApiUrl } from '../lib/utils';
import { toast } from 'sonner';
import { 
    User, 
    Palette, 
    Bell, 
    CreditCard, 
    Shield, 
    AlertTriangle,
    Loader2
} from 'lucide-react';

export default function SettingsPage() {
    const { user, token, checkAuth } = useAuth();
    
    // Core User State
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    
    // Dynamic Settings State
    const [theme, setTheme] = useState('dark');
    const [readerFontSize, setReaderFontSize] = useState('medium');
    const [language, setLanguage] = useState('english');
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(true);
    const [streakReminders, setStreakReminders] = useState(true);
    const [quizResults, setQuizResults] = useState(false);
    const [twoFactorAuth, setTwoFactorAuth] = useState(false);
    const [publicProfile, setPublicProfile] = useState(true);

    const [isSaving, setIsSaving] = useState(false);

    // Initialize state when user loads
    useEffect(() => {
        if (user) {
            setFullName(user.name || '');
            setEmail(user.email || '');
            
            if (user.settings) {
                const s = typeof user.settings === 'string' ? JSON.parse(user.settings) : user.settings;
                if (s.theme !== undefined) setTheme(s.theme);
                if (s.readerFontSize !== undefined) setReaderFontSize(s.readerFontSize);
                if (s.language !== undefined) setLanguage(s.language);
                if (s.emailNotifications !== undefined) setEmailNotifications(s.emailNotifications);
                if (s.pushNotifications !== undefined) setPushNotifications(s.pushNotifications);
                if (s.streakReminders !== undefined) setStreakReminders(s.streakReminders);
                if (s.quizResults !== undefined) setQuizResults(s.quizResults);
                if (s.twoFactorAuth !== undefined) setTwoFactorAuth(s.twoFactorAuth);
                if (s.publicProfile !== undefined) setPublicProfile(s.publicProfile);
            }
        }
    }, [user]);

    // Unified Save Function
    const saveSettings = async (overrides = {}) => {
        if (!token) return;
        setIsSaving(true);
        
        try {
            const payload = {
                name: fullName,
                email: email,
                theme,
                readerFontSize,
                language,
                emailNotifications,
                pushNotifications,
                streakReminders,
                quizResults,
                twoFactorAuth,
                publicProfile,
                ...overrides // Allow immediate override for toggles
            };

            const res = await fetch(`${getApiUrl()}/api/user/settings`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success('Settings updated securely');
                checkAuth(); // refresh user context if name changed
            } else {
                toast.error('Failed to save settings');
            }
        } catch (err) {
            console.error('Error saving settings', err);
            toast.error('Network error saving settings');
        } finally {
            setIsSaving(false);
        }
    };

    // Helper to toggle booleans and instantly save
    const toggleSetting = (setter: any, currentValue: boolean, key: string) => {
        const newValue = !currentValue;
        setter(newValue);
        saveSettings({ [key]: newValue });
    };

    // Helper to change selects and instantly save
    const changeSetting = (setter: any, newValue: string, key: string) => {
        setter(newValue);
        saveSettings({ [key]: newValue });
    };

    // --- REUSABLE UI COMPONENTS ---
    const SectionHeader = ({ icon: Icon, title, description }: any) => (
        <div className="mb-6">
            <div className="flex items-center gap-2 text-blue-500 mb-1">
                <Icon size={18} />
                <h2 className="text-[15px] font-semibold text-white">{title}</h2>
            </div>
            <p className="text-[13px] text-zinc-400">{description}</p>
        </div>
    );

    const Card = ({ children, isDanger = false }: any) => (
        <div className={`bg-[#0A0A0B] border ${isDanger ? 'border-red-900/50' : 'border-zinc-800/80'} rounded-xl p-6 shadow-sm`}>
            {children}
        </div>
    );

    const ToggleRow = ({ label, description, checked, onToggle }: any) => (
        <div className="flex items-center justify-between py-3">
            <div>
                <p className="text-[14px] font-medium text-zinc-200">{label}</p>
                {description && <p className="text-[12px] text-zinc-500 mt-0.5">{description}</p>}
            </div>
            <button 
                onClick={onToggle}
                className={`w-9 h-5 rounded-full relative transition-colors duration-200 ${checked ? 'bg-blue-600' : 'bg-zinc-700'}`}
            >
                <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] transition-transform duration-200 ${checked ? 'translate-x-[20px]' : 'translate-x-[3px]'}`} />
            </button>
        </div>
    );

    if (!user) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8">
               <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
               <p className="text-zinc-500 text-sm">Loading Preferences...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-8 pb-32">
            <div className="max-w-3xl mx-auto space-y-8 mt-4">
                
                {/* PAGE HEADER */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Settings</h1>
                    <p className="text-zinc-400 text-sm">Manage your account and preferences</p>
                </div>

                {/* 1. ACCOUNT SECTION */}
                <Card>
                    <SectionHeader icon={User} title="Account" description="Manage your account information" />
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[13px] font-medium text-zinc-300 mb-1.5">Full Name</label>
                            <input 
                                type="text" 
                                value={fullName} 
                                onChange={(e) => setFullName(e.target.value)}
                                onBlur={() => saveSettings()}
                                className="w-full bg-[#121214] border border-zinc-800 rounded-lg px-4 py-2 text-[14px] text-white focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-[13px] font-medium text-zinc-300 mb-1.5">Email</label>
                            <input 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)}
                                onBlur={() => saveSettings()}
                                className="w-full bg-[#121214] border border-zinc-800 rounded-lg px-4 py-2 text-[14px] text-zinc-300 focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-[13px] font-medium text-zinc-300 mb-1.5">University</label>
                            <input 
                                type="text" 
                                defaultValue="UC Berkeley"
                                className="w-full bg-[#121214] border border-zinc-800 rounded-lg px-4 py-2 text-[14px] text-zinc-300 focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>

                        <div className="pt-4 flex items-center justify-between border-t border-zinc-800/80 mt-6">
                            <div>
                                <p className="text-[13px] font-medium text-zinc-200">Student Verification</p>
                                <p className="text-[12px] text-zinc-500">Verified • Expires Dec 2025</p>
                            </div>
                            <button className="px-4 py-1.5 border border-zinc-700 hover:border-zinc-500 rounded-lg text-[13px] font-medium transition-colors">
                                Renew
                            </button>
                        </div>
                    </div>
                </Card>

                {/* 2. APPEARANCE SECTION */}
                <Card>
                    <SectionHeader icon={Palette} title="Appearance" description="Customize how Bookify looks" />
                    
                    <div className="space-y-2">
                        <div className="flex items-center justify-between py-3">
                            <div>
                                <p className="text-[14px] font-medium text-zinc-200">Theme</p>
                                <p className="text-[12px] text-zinc-500 mt-0.5">Choose your preferred theme</p>
                            </div>
                            <div className="flex bg-[#121214] border border-zinc-800 p-1 rounded-lg">
                                <button 
                                    onClick={() => changeSetting(setTheme, 'light', 'theme')}
                                    className={`px-4 py-1 rounded-md text-[13px] font-medium transition-all ${theme === 'light' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    Light
                                </button>
                                <button 
                                    onClick={() => changeSetting(setTheme, 'dark', 'theme')}
                                    className={`px-4 py-1 rounded-md text-[13px] font-medium transition-all ${theme === 'dark' ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    Dark
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between py-3">
                            <div>
                                <p className="text-[14px] font-medium text-zinc-200">Reader Font Size</p>
                                <p className="text-[12px] text-zinc-500 mt-0.5">Adjust text size in reader</p>
                            </div>
                            <select 
                                value={readerFontSize}
                                onChange={(e) => changeSetting(setReaderFontSize, e.target.value, 'readerFontSize')}
                                className="bg-[#121214] border border-zinc-800 text-[13px] rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer text-zinc-200"
                            >
                                <option value="small">Small</option>
                                <option value="medium">Medium</option>
                                <option value="large">Large</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-between py-3">
                            <div>
                                <p className="text-[14px] font-medium text-zinc-200">Language</p>
                                <p className="text-[12px] text-zinc-500 mt-0.5">Choose your language</p>
                            </div>
                            <select 
                                value={language}
                                onChange={(e) => changeSetting(setLanguage, e.target.value, 'language')}
                                className="bg-[#121214] border border-zinc-800 text-[13px] rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer text-zinc-200"
                            >
                                <option value="english">English</option>
                                <option value="spanish">Spanish</option>
                                <option value="french">French</option>
                            </select>
                        </div>
                    </div>
                </Card>

                {/* 3. NOTIFICATIONS SECTION */}
                <Card>
                    <SectionHeader icon={Bell} title="Notifications" description="Manage how you receive updates" />
                    <div className="space-y-1">
                        <ToggleRow 
                            label="Email Notifications" 
                            description="Receive reading reminders"
                            checked={emailNotifications} 
                            onToggle={() => toggleSetting(setEmailNotifications, emailNotifications, 'emailNotifications')}
                        />
                        <ToggleRow 
                            label="Push Notifications" 
                            description="Get notified about new content"
                            checked={pushNotifications} 
                            onToggle={() => toggleSetting(setPushNotifications, pushNotifications, 'pushNotifications')}
                        />
                        <ToggleRow 
                            label="Streak Reminders" 
                            description="Daily reading streak alerts"
                            checked={streakReminders} 
                            onToggle={() => toggleSetting(setStreakReminders, streakReminders, 'streakReminders')}
                        />
                        <ToggleRow 
                            label="Quiz Results" 
                            description="Notify about quiz completions"
                            checked={quizResults} 
                            onToggle={() => toggleSetting(setQuizResults, quizResults, 'quizResults')}
                        />
                    </div>
                </Card>

                {/* 4. BILLING SECTION */}
                <Card>
                    <SectionHeader icon={CreditCard} title="Billing" description="Manage your subscription and payment" />
                    
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-2">
                            <div>
                                <p className="text-[14px] font-medium text-zinc-200">Current Plan</p>
                                <p className="text-[13px] text-zinc-400 mt-0.5">Student Pro • $4.99/month</p>
                            </div>
                            <button className="px-4 py-1.5 border border-zinc-700 hover:border-zinc-500 rounded-lg text-[13px] font-medium transition-colors">
                                Upgrade
                            </button>
                        </div>
                        
                        <div className="flex items-center justify-between py-2">
                            <div>
                                <p className="text-[14px] font-medium text-zinc-200">Payment Method</p>
                                <p className="text-[13px] text-zinc-400 mt-0.5">•••• •••• •••• 4242</p>
                            </div>
                            <button className="px-4 py-1.5 border border-zinc-700 hover:border-zinc-500 rounded-lg text-[13px] font-medium transition-colors">
                                Update
                            </button>
                        </div>

                        <div className="flex items-center justify-between py-2">
                            <div>
                                <p className="text-[14px] font-medium text-zinc-200">Next Billing Date</p>
                                <p className="text-[13px] text-zinc-400 mt-0.5">November 18, 2025</p>
                            </div>
                            <button className="text-[13px] font-medium text-blue-500 hover:text-blue-400 transition-colors">
                                View Invoice
                            </button>
                        </div>
                    </div>
                </Card>

                {/* 5. PRIVACY & SECURITY SECTION */}
                <Card>
                    <SectionHeader icon={Shield} title="Privacy & Security" description="Control your data and privacy" />
                    
                    <div className="space-y-1">
                        <ToggleRow 
                            label="Two-Factor Authentication" 
                            description="Add extra security to your account"
                            checked={twoFactorAuth} 
                            onToggle={() => toggleSetting(setTwoFactorAuth, twoFactorAuth, 'twoFactorAuth')}
                        />
                        <ToggleRow 
                            label="Public Profile" 
                            description="Show your reading activity"
                            checked={publicProfile} 
                            onToggle={() => toggleSetting(setPublicProfile, publicProfile, 'publicProfile')}
                        />
                    </div>

                    <div className="space-y-4 pt-4 mt-2">
                        <div className="flex items-center justify-between py-2 border-t border-zinc-800/80 pt-6">
                            <div>
                                <p className="text-[14px] font-medium text-zinc-200">Change Password</p>
                                <p className="text-[12px] text-zinc-500 mt-0.5">Last updated 3 months ago</p>
                            </div>
                            <button className="px-4 py-1.5 border border-zinc-700 hover:border-zinc-500 rounded-lg text-[13px] font-medium transition-colors">
                                Change
                            </button>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <div>
                                <p className="text-[14px] font-medium text-zinc-200">Download Your Data</p>
                                <p className="text-[12px] text-zinc-500 mt-0.5">Export all your reading data</p>
                            </div>
                            <button className="px-4 py-1.5 border border-zinc-700 hover:border-zinc-500 rounded-lg text-[13px] font-medium transition-colors">
                                Download
                            </button>
                        </div>
                    </div>
                </Card>

                {/* 6. DANGER ZONE */}
                <Card isDanger={true}>
                    <div className="mb-4">
                        <div className="flex items-center gap-2 text-red-500 mb-1">
                            <AlertTriangle size={18} />
                            <h2 className="text-[15px] font-semibold">Danger Zone</h2>
                        </div>
                        <p className="text-[13px] text-zinc-400">Irreversible account actions</p>
                    </div>

                    <div className="flex items-center justify-between py-2 pt-2">
                        <div>
                            <p className="text-[14px] font-medium text-zinc-200">Delete Account</p>
                            <p className="text-[12px] text-zinc-500 mt-0.5">Permanently delete your account and all data</p>
                        </div>
                        <button className="px-4 py-1.5 bg-red-950/30 text-red-500 border border-red-900/50 hover:bg-red-900/20 rounded-lg text-[13px] font-medium transition-colors">
                            Delete
                        </button>
                    </div>
                </Card>

            </div>
        </div>
    );
}
