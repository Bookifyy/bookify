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
        <div className="relative z-10 w-full bg-background border border-border p-1 rounded-xl grid grid-cols-4 gap-1">
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`relative py-2.5 text-[14px] font-medium rounded-lg transition-all duration-200 focus:outline-none ${isActive
                            ? 'text-white'
                            : 'text-muted-foreground hover:text-muted-foreground'
                            }`}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 bg-card rounded-lg border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
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
