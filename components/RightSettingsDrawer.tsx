"use client";

import { ReactNode, useEffect } from "react";
import { useTranslation } from "./providers/LanguageProvider";

type RightSettingsDrawerProps = {
    open: boolean;
    onClose: () => void;
    children: ReactNode;
};

export function RightSettingsDrawer({ open, onClose, children }: RightSettingsDrawerProps) {
    const { t } = useTranslation();

    // Lock body scroll when the drawer is open
    useEffect(() => {
        if (!open) return;

        const { style } = document.body;
        const scrollY = window.scrollY;
        const prevPosition = style.position;
        const prevTop = style.top;
        const prevWidth = style.width;
        const prevPaddingRight = style.paddingRight;

        // Compensate for scrollbar to avoid layout shift
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

        style.position = "fixed";
        style.top = `-${scrollY}px`;
        style.width = "100%";
        if (scrollbarWidth > 0) {
            style.paddingRight = `${scrollbarWidth}px`;
        }

        return () => {
            style.position = prevPosition;
            style.top = prevTop;
            style.width = prevWidth;
            style.paddingRight = prevPaddingRight;
            window.scrollTo(0, scrollY);
        };
    }, [open]);
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
                aria-label={t("drawer.settingsTitle")}
                className={`fixed inset-y-0 right-0 w-full sm:w-[420px] bg-[var(--surface)] shadow-xl border-l border-[var(--border)] z-50 transition-transform ${open ? "translate-x-0" : "translate-x-full"}`}
            >
                <div className="flex h-14 items-center justify-between border-b border-[var(--border)] px-4">
                    <h2 className="text-sm font-semibold text-slate-900">{t("drawer.settingsTitle")}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label={t("drawer.closeSettings")}
                        className="inline-flex items-center justify-center rounded-md p-2 text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 btn btn-ghost focus-ring"
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
