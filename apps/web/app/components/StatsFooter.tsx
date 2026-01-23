import { Clock, BookOpen, Zap } from 'lucide-react';

interface StatsFooterProps {
    booksCompleted: number;
}

export function StatsFooter({ booksCompleted }: StatsFooterProps) {
    // Mock data for now as per plan
    const minutesThisWeek = 847;
    const pagesPerHour = 32;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-t border-zinc-800 px-6 py-4 md:pl-72">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 md:gap-12">
                <div className="flex-1 w-full grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                        <p className="text-2xl font-bold text-white">{minutesThisWeek}</p>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Minutes this week</p>
                    </div>
                    <div className="space-y-1 border-l border-zinc-800 pl-4">
                        <p className="text-2xl font-bold text-white">{booksCompleted}</p>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Books completed</p>
                    </div>
                    <div className="space-y-1 border-l border-zinc-800 pl-4">
                        <p className="text-2xl font-bold text-white">{pagesPerHour}</p>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Pages/hour</p>
                    </div>
                </div>
                <div className="hidden md:flex items-center justify-center bg-blue-600 rounded-full p-2 shadow-lg shadow-blue-600/20">
                    <Zap size={20} className="text-white fill-white" />
                </div>
            </div>
        </div>
    );
}
