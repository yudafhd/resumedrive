"use client";

import Link from "next/link";
import { ChangeEvent, useRef } from "react";
import { GoogleSignInButton } from "./GoogleSignInButton";

type HeaderBarProps = {
    activeTab: "editor" | "preview";
    onTabChange: (value: "editor" | "preview") => void;
    onToggleLeft: () => void;
    onSave: () => void;
    onImport: (event: ChangeEvent<HTMLInputElement>) => void;
    onDownloadJson: () => void;
    onDownloadPdf: () => void;
};

export function HeaderBar({
    activeTab,
    onTabChange,
    onToggleLeft,
    onSave,
    onImport,
    onDownloadJson,
    onDownloadPdf,
}: HeaderBarProps) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const triggerImport = () => fileInputRef.current?.click();

    const tabClasses = (isActive: boolean) =>
        [
            "px-3 py-1.5 text-sm font-semibold rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
            isActive
                ? "bg-blue-600 text-white"
                : "text-slate-700 hover:text-blue-700",
        ].join(" ");

    return (
        <div className="sticky top-0 z-40 bg-[var(--surface)] border-b border-[var(--border)] px-4 sm:px-6">
            <div className="h-16 flex items-center justify-between gap-3">
                {/* Left cluster: drawer toggle (md-), brand */}
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        aria-label="Open left panel"
                        onClick={onToggleLeft}
                        className="inline-flex items-center justify-center rounded-md p-2 text-slate-600 hover:bg-slate-100 md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>

                    <Link
                        href="/"
                        aria-label="Resume Drive home"
                        className="text-sm font-extrabold tracking-wider text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    >
                        RESUME DRIVE
                    </Link>
                </div>

                {/* Center: segmented control (tabs) */}
                <div
                    role="tablist"
                    aria-label="View mode"
                    className="flex items-center rounded-full border border-[var(--border)] bg-[var(--surface-subtle)] p-1"
                >
                    <button
                        role="tab"
                        aria-selected={activeTab === "editor"}
                        type="button"
                        onClick={() => onTabChange("editor")}
                        className={tabClasses(activeTab === "editor")}
                    >
                        Editor
                    </button>
                    <button
                        role="tab"
                        aria-selected={activeTab === "preview"}
                        type="button"
                        onClick={() => onTabChange("preview")}
                        className={tabClasses(activeTab === "preview")}
                    >
                        Preview
                    </button>
                </div>
            </div>
        </div>
    );
}

export default HeaderBar;
