import { motion } from 'framer-motion';

interface LibraryTabsProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const tabs = [
    { id: 'all', label: 'All Books' },
    { id: 'owned', label: 'Owned' },
    { id: 'downloaded', label: 'Downloaded' },
    { id: 'collections', label: 'Collections' },
];

export function LibraryTabs({ activeTab, onTabChange }: LibraryTabsProps) {
    return (
        <div className="relative z-10 w-full bg-zinc-950 border border-zinc-900 p-1 rounded-xl grid grid-cols-4 gap-1 mb-6">
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`relative py-2 text-[13px] font-medium rounded-lg transition-all duration-200 focus:outline-none ${isActive
                            ? 'text-white'
                            : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 bg-zinc-900 rounded-lg border border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.3)]"
                                initial={false}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                style={{ zIndex: -1 }}
                            />
                        )}
                        <span className="relative z-10">{tab.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
