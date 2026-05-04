'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
    const [show, setShow] = useState(isOpen);

    useEffect(() => {
        setShow(isOpen);
    }, [isOpen]);

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />
            <div className="relative bg-card border border-border rounded-xl max-w-md w-full p-6 shadow-2xl scale-100 opacity-100 transition-all">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-foreground">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="space-y-4">
                    {children}
                </div>
            </div>
        </div>
    );
}
