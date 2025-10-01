import React, { useEffect } from 'react';

export default function Modal({ open, onClose, title, children, wide = false }) {
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
        if (open) document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50">
            {/* overlay */}
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />

            {/* centered container with padding; panel gets max height and scrolls inside */}
            <div className="absolute inset-0 flex items-start justify-center p-4 md:p-8">
                <div className="w-[95vw] max-w-5xl bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden max-h-full flex flex-col">
                    {/* header */}
                    <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 shrink-0">
                        <h3 className="text-base md:text-lg font-semibold">{title}</h3>
                        <button
                            onClick={onClose}
                            className="h-8 px-3 rounded-md border border-gray-300 bg-white hover:bg-gray-50"
                        >
                            닫기
                        </button>
                    </div>

                    {/* scrollable content */}
                    <div className={`p-4 md:p-6 overflow-y-auto flex-1 ${wide ? '' : ''}`}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
