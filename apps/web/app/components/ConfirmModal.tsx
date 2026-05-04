'use client';

import { X, AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDestructive = false
}: ConfirmModalProps) {

    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl scale-100 animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col items-center text-center gap-4">
                    <div className={`p-4 rounded-full ${isDestructive ? 'bg-red-500/10 text-red-500' : 'bg-indigo-500/10 text-indigo-500'}`}>
                        <AlertTriangle size={32} />
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-foreground">{title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {message}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 w-full mt-4">
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 bg-muted hover:bg-zinc-700 text-foreground font-medium rounded-xl transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`flex-1 py-2.5 font-bold text-foreground rounded-xl transition-colors shadow-lg ${isDestructive
                                    ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20'
                                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'
                                }`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
