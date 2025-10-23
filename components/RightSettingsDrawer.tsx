"use client";

import { ReactNode } from "react";

type RightSettingsDrawerProps = {
    open: boolean;
    onClose: () => void;
    children: ReactNode;
};

export function RightSettingsDrawer({ open, onClose, children }: RightSettingsDrawerProps) {
    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-50 bg-black/30 transition-opacity ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                aria-hidden={!open}
                onClick={onClose}
            />
            {/* Panel */}
            <aside
                role="dialog"
                aria-modal="true"
                aria-label="Settings"
                className={`fixed inset-y-0 right-0 w-full sm:w-[420px] bg-[var(--surface)] shadow-xl border-l border-[var(--border)] z-50 transition-transform ${open ? "translate-x-0" : "translate-x-full"}`}
            >
                <div className="flex h-14 items-center justify-between border-b border-[var(--border)] px-4">
                    <h2 className="text-sm font-semibold text-slate-900">Settings</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close settings"
                        className="inline-flex items-center justify-center rounded-md p-2 text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>
                <div className="h-[calc(100vh-56px)] overflow-auto p-4 sm:p-6">{children}</div>
            </aside>
        </>
    );
}

export default RightSettingsDrawer;