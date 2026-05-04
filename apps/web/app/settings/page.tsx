'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getApiUrl } from '../lib/utils';
import { toast } from 'sonner';
import { 
    User, Palette, Bell, CreditCard, Shield, AlertTriangle, Loader2, Edit2
} from 'lucide-react';
import { ThemeProvider, useTheme } from '../../context/ThemeProvider';

// --- STABLE UI COMPONENTS ---
const SectionHeader = ({ icon: Icon, title, description }: any) => (
    <div className="mb-6">
        <div className="flex items-center gap-2 text-blue-500 mb-1">
            <Icon size={18} />
            <h2 className="text-[15px] font-semibold text-foreground">{title}</h2>
        </div>
        <p className="text-[13px] text-muted-foreground">{description}</p>
    </div>
);

const Card = ({ children, isDanger = false }: any) => (
    <div className={`bg-card text-foreground border ${isDanger ? 'border-red-900/50' : 'border-border'} rounded-xl p-6 shadow-sm`}>
        {children}
    </div>
);

const ToggleRow = ({ label, description, checked, onToggle }: any) => (
    <div className="flex items-center justify-between py-3">
        <div>
            <p className="text-[14px] font-medium text-foreground">{label}</p>
            {description && <p className="text-[12px] text-muted-foreground mt-0.5">{description}</p>}
        </div>
        <button 
            type="button"
            onClick={onToggle}
            className={`w-9 h-5 rounded-full relative transition-colors duration-200 ${checked ? 'bg-blue-600' : 'bg-muted-foreground/50'}`}
        >
            <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] transition-transform duration-200 ${checked ? 'translate-x-[20px]' : 'translate-x-[3px]'}`} />
        </button>
    </div>
);

export default function SettingsPage() {
    const { user, token, logout } = useAuth();
    const { theme: activeTheme, setTheme: setActiveTheme } = useTheme();
    
    // Core User State
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [university, setUniversity] = useState('UC Berkeley');

    // Dynamic Settings State
    const [theme, setTheme] = useState(activeTheme || 'dark');
    const [readerFontSize, setReaderFontSize] = useState('medium');
    const [language, setLanguage] = useState('english');
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(true);
    const [streakReminders, setStreakReminders] = useState(true);
    const [quizResults, setQuizResults] = useState(false);
    const [twoFactorAuth, setTwoFactorAuth] = useState(false);
    const [publicProfile, setPublicProfile] = useState(true);

    const [isSaving, setIsSaving] = useState(false);

    // Security Modal States
    const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSecurityLoading, setIsSecurityLoading] = useState(false);

    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

    useEffect(() => {
        if (user) {
            setFullName(user.name || '');
            setEmail(user.email || '');
            
            if (user.settings) {
                const s = typeof user.settings === 'string' ? JSON.parse(user.settings) : user.settings;
                if (s.theme !== undefined) {
                    // We DO NOT call setActiveTheme here because ThemeProvider manages it globally via localStorage
                    // We just sync our local form state with what the current active theme is.
                    setTheme(activeTheme || s.theme);
                }
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
    }, [user, setActiveTheme]);

    // Unified Master Save Function
    const saveSettings = async (e?: React.FormEvent) => {
        e?.preventDefault();
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
                toast.success('Settings securely updated 🚀');
                // Apply the theme globally and save implicitly to localStorage via ThemeProvider
                setActiveTheme(theme as 'dark'|'light');
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

    // --- SECURITY ACTIONS ---
    const handleDownloadData = () => {
        if (!user) return;
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast.error('Popup blocked. Please allow popups to download data.');
            return;
        }
        
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Bookify Data Export - ${user.name}</title>
                <style>
                    body { font-family: system-ui, sans-serif; padding: 40px; color: #333; line-height: 1.6; max-w: 800px; margin: 0 auto; }
                    h1 { color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
                    .section { margin-top: 30px; background: #f9fafb; padding: 25px; border-radius: 8px; border: 1px solid #e5e7eb; }
                    .item { margin-bottom: 12px; font-size: 15px; }
                    .label { font-weight: 600; color: #4b5563; display: inline-block; width: 140px; }
                </style>
            </head>
            <body>
                <h1>Bookify Account Data Export</h1>
                
                <div class="section">
                    <h2>Profile Information</h2>
                    <div class="item"><span class="label">Name:</span> ${user.name}</div>
                    <div class="item"><span class="label">Email:</span> ${user.email}</div>
                    <div class="item"><span class="label">Exported On:</span> ${new Date().toLocaleDateString()}</div>
                </div>

                <div class="section">
                    <h2>System Preferences</h2>
                    <div class="item"><span class="label">Theme:</span> ${user.settings?.theme || 'dark'}</div>
                    <div class="item"><span class="label">Language:</span> ${user.settings?.language || 'english'}</div>
                    <div class="item"><span class="label">Font Size:</span> ${user.settings?.readerFontSize || 'medium'}</div>
                    <div class="item"><span class="label">Public Profile:</span> ${user.settings?.public_profile === false ? 'No' : 'Yes'}</div>
                </div>
                
                <p style="margin-top: 50px; text-align: center; color: #6b7280; font-size: 13px;">
                    Generated securely from Bookify System Servers.
                </p>
                <script>
                    window.onload = function() { window.print(); window.close(); }
                </script>
            </body>
            </html>
        `;
        printWindow.document.write(html);
        printWindow.document.close();
        toast.success('Generated Data PDF 📦');
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) return toast.error('Passwords do not match');
        
        setIsSecurityLoading(true);
        try {
            const res = await fetch(`${getApiUrl()}/api/user/password`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ current_password: currentPassword, new_password: newPassword, new_password_confirmation: confirmPassword })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success('Password updated successfully 🔒');
                setPasswordModalOpen(false);
                setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
            } else {
                toast.error(data.message || 'Failed to update password');
            }
        } catch (err) {
            toast.error('Network error');
        } finally {
            setIsSecurityLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        setIsSecurityLoading(true);
        try {
            const res = await fetch(`${getApiUrl()}/api/user`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success('Account permanently deleted. Goodbye! 👋');
                setDeleteModalOpen(false);
                logout(); // Logs them out and pushes to home/login
            } else {
                toast.error('Failed to delete account');
            }
        } catch (err) {
            toast.error('Network error');
        } finally {
            setIsSecurityLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
               <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
               <p className="text-muted-foreground text-sm">Loading Preferences...</p>
            </div>
        );
    }

    const getTranslatedTitle = () => {
        if (language === 'spanish') return 'Configuración';
        if (language === 'french') return 'Paramètres';
        if (language === 'german') return 'Einstellungen';
        if (language === 'japanese') return '設定';
        if (language === 'chinese') return '设置';
        return 'Settings';
    };

    return (
        <div className="min-h-screen bg-background text-foreground p-8 pb-32 max-w-[800px] mx-auto space-y-8 font-sans transition-colors duration-200">
            <div className="flex items-center justify-between pb-6 border-b border-border">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">{getTranslatedTitle()}</h1>
                    <p className="text-muted-foreground mt-2">Manage your account preferences and application behaviors.</p>
                </div>
            </div>

            <form onSubmit={saveSettings} className="space-y-8">
                    {/* 1. ACCOUNT SECTION */}
                    <Card>
                        <SectionHeader icon={User} title="Account" description="Manage your account information" />
                        
                        <div className="space-y-4 pt-2">
                            <div>
                                <label className="block text-[13px] font-medium text-muted-foreground mb-1.5">Full Name</label>
                                <input 
                                    type="text" 
                                    value={fullName} 
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-[14px] text-foreground focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
                                    placeholder="Enter your name"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-[13px] font-medium text-muted-foreground mb-1.5">Email</label>
                                <input 
                                    type="email" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-[14px] text-foreground focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
                                    placeholder="Enter your email"
                                />
                            </div>

                            <div>
                                <label className="block text-[13px] font-medium text-muted-foreground mb-1.5">University</label>
                                <input 
                                    type="text" 
                                    value={university}
                                    onChange={(e) => setUniversity(e.target.value)}
                                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-[14px] text-foreground focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
                                    placeholder="Enter your university"
                                />
                            </div>

                            <div className="pt-4 flex items-center justify-between border-t border-border mt-6">
                                <div>
                                    <p className="text-[13px] font-medium text-foreground">Student Verification</p>
                                    <p className="text-[12px] text-muted-foreground">Verified • Expires Dec 2025</p>
                                </div>
                                <button type="button" className="px-4 py-1.5 border border-border hover:bg-muted rounded-lg text-[13px] font-medium transition-colors">
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
                                    <p className="text-[14px] font-medium text-foreground">Theme</p>
                                    <p className="text-[12px] text-muted-foreground mt-0.5">Choose your preferred theme</p>
                                </div>
                                <div className="flex bg-background border border-border p-1 rounded-lg">
                                    <button 
                                        type="button"
                                        onClick={() => setTheme('light')}
                                        className={`px-4 py-1 rounded-md text-[13px] font-medium transition-all ${theme === 'light' ? 'bg-primary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        Light
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setTheme('dark')}
                                        className={`px-4 py-1 rounded-md text-[13px] font-medium transition-all ${theme === 'dark' ? 'bg-primary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        Dark
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between py-3">
                                <div>
                                    <p className="text-[14px] font-medium text-foreground">Reader Font Size</p>
                                    <p className="text-[12px] text-muted-foreground mt-0.5">Adjust text size in reader</p>
                                </div>
                                <select 
                                    value={readerFontSize}
                                    onChange={(e) => setReaderFontSize(e.target.value)}
                                    className="bg-background border border-border text-[13px] rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer text-foreground"
                                >
                                    <option value="small">Small</option>
                                    <option value="medium">Medium</option>
                                    <option value="large">Large</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-between py-3">
                                <div>
                                    <p className="text-[14px] font-medium text-foreground">Language</p>
                                    <p className="text-[12px] text-muted-foreground mt-0.5">Choose your language</p>
                                </div>
                                <select 
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="bg-background border border-border text-[13px] rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer text-foreground"
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
                                onToggle={() => setEmailNotifications(!emailNotifications)}
                            />
                            <ToggleRow 
                                label="Push Notifications" 
                                description="Get notified about new content"
                                checked={pushNotifications} 
                                onToggle={() => setPushNotifications(!pushNotifications)}
                            />
                            <ToggleRow 
                                label="Streak Reminders" 
                                description="Daily reading streak alerts"
                                checked={streakReminders} 
                                onToggle={() => setStreakReminders(!streakReminders)}
                            />
                            <ToggleRow 
                                label="Quiz Results" 
                                description="Notify about quiz completions"
                                checked={quizResults} 
                                onToggle={() => setQuizResults(!quizResults)}
                            />
                        </div>
                    </Card>

                    {/* 4. PRIVACY & SECURITY SECTION */}
                    <Card>
                        <SectionHeader icon={Shield} title="Privacy & Security" description="Control your data and privacy" />
                        
                        <div className="space-y-1">
                            <ToggleRow 
                                label="Two-Factor Authentication" 
                                description="Add extra security to your account"
                                checked={twoFactorAuth} 
                                onToggle={() => setTwoFactorAuth(!twoFactorAuth)}
                            />
                            <ToggleRow 
                                label="Public Profile" 
                                description="Show your reading activity"
                                checked={publicProfile} 
                                onToggle={() => setPublicProfile(!publicProfile)}
                            />
                        </div>

                        <div className="space-y-4 pt-4 mt-2 border-t border-border">
                            <div className="flex items-center justify-between py-2">
                                <div>
                                    <p className="text-[14px] font-medium text-foreground">Change Password</p>
                                    <p className="text-[12px] text-muted-foreground mt-0.5">Last updated 3 months ago</p>
                                </div>
                                <button type="button" onClick={() => setPasswordModalOpen(true)} className="px-4 py-1.5 border border-border hover:bg-muted rounded-lg text-[13px] font-medium transition-colors">
                                    Change
                                </button>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <div>
                                    <p className="text-[14px] font-medium text-foreground">Download Your Data</p>
                                    <p className="text-[12px] text-muted-foreground mt-0.5">Export all your reading data</p>
                                </div>
                                <button type="button" onClick={handleDownloadData} className="px-4 py-1.5 border border-border hover:bg-muted rounded-lg text-[13px] font-medium transition-colors">
                                    Download
                                </button>
                            </div>
                        </div>
                    </Card>

                    {/* 5. DANGER ZONE */}
                    <Card isDanger={true}>
                        <div className="mb-4">
                            <div className="flex items-center gap-2 text-red-500 mb-1">
                                <AlertTriangle size={18} />
                                <h2 className="text-[15px] font-semibold">Danger Zone</h2>
                            </div>
                            <p className="text-[13px] text-muted-foreground">Irreversible account actions</p>
                        </div>

                        <div className="flex items-center justify-between py-2 pt-2">
                            <div>
                                <p className="text-[14px] font-medium text-foreground">Delete Account</p>
                                <p className="text-[12px] text-muted-foreground mt-0.5">Permanently delete your account and all data</p>
                            </div>
                            <button type="button" onClick={() => setDeleteModalOpen(true)} className="px-4 py-1.5 bg-red-950/20 text-red-600 border border-red-900/50 hover:bg-red-500 hover:text-white rounded-lg text-[13px] font-medium transition-colors">
                                Delete
                            </button>
                        </div>
                    </Card>

                    {/* MAIN SUBMIT BUTTON */}
                    <div className="flex justify-end pt-4 pb-12 sticky bottom-4 z-10">
                        <button 
                            type="submit" 
                            disabled={isSaving}
                            className="bg-primary hover:bg-blue-700 text-foreground font-medium py-3 px-8 rounded-full shadow-xl transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 size={18} className="animate-spin" /> : null}
                            {isSaving ? 'Saving Changes...' : 'Save All Changes'}
                        </button>
                    </div>
                </form>

            {/* PASSWORD MODAL */}
            {isPasswordModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/50 backdrop-blur-sm">
                    <form onSubmit={handlePasswordUpdate} className="bg-card border border-border rounded-xl w-full max-w-md shadow-2xl p-6 relative">
                        <button type="button" onClick={() => setPasswordModalOpen(false)} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">✕</button>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Shield size={20} /></div>
                            <h2 className="text-lg font-bold text-foreground">Change Password</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">Current Password</label>
                                <input type="password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">New Password</label>
                                <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} minLength={8} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">Confirm New Password</label>
                                <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} minLength={8} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-blue-500 outline-none" />
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end gap-3">
                            <button type="button" onClick={() => setPasswordModalOpen(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Cancel</button>
                            <button type="submit" disabled={isSecurityLoading} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                                {isSecurityLoading ? 'Updating...' : 'Update Password'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* DELETE ACCOUNT MODAL */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/50 backdrop-blur-sm">
                    <div className="bg-card border border-red-900/50 rounded-xl w-full max-w-md shadow-2xl p-6">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-900/20 text-red-500 mb-4 mx-auto">
                            <AlertTriangle size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-foreground text-center mb-2">Delete Account?</h2>
                        <p className="text-sm text-muted-foreground text-center mb-6">
                            This action cannot be undone. All your reading history, collections, notes, and profile data will be permanently erased.
                        </p>
                        <div className="flex gap-3">
                            <button type="button" onClick={() => setDeleteModalOpen(false)} className="flex-1 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors">
                                Cancel
                            </button>
                            <button type="button" onClick={handleDeleteAccount} disabled={isSecurityLoading} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                                {isSecurityLoading ? 'Deleting...' : 'Yes, Delete My Account'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
