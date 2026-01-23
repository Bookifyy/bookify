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
        <div className="flex items-center gap-2 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800 w-fit">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none ${activeTab === tab.id ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                >
                    {activeTab === tab.id && (
                        <motion.div
                            layoutId="activeTab"
                            className="absolute inset-0 bg-zinc-800 rounded-lg"
                            initial={false}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            style={{ zIndex: -1 }}
                        />
                    )}
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
