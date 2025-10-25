"use client";

import Link from "next/link";
import LanguageToggle from "./LanguageToggle";
import { useTranslation } from "./providers/LanguageProvider";

type HeaderBarProps = {
    activeTab: "editor" | "preview";
    onTabChange: (value: "editor" | "preview") => void;
    onToggleLeft: () => void;
};

export function HeaderBar({
    activeTab,
    onTabChange,
    onToggleLeft,
}: HeaderBarProps) {
    const { t } = useTranslation();

    const tabClasses = (isActive: boolean) =>
        [
            "px-3 py-1.5 text-sm font-semibold rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring-color)] focus-visible:ring-offset-[var(--focus-ring-offset)] transition-all",
            isActive
                ? "bg-[var(--color-primary)] text-[var(--color-text-inverse)]"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]",
        ].join(" ");

    return (
        <header className="top-0 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
                {/* Left cluster: drawer toggle (md-), brand */}
                <div className="flex items-center gap-2">
                    <Link
                        href="/"
                        aria-label="Resume Drive home"
                        className="flex items-center rounded-[var(--radius-md)] px-1 py-1 text-[var(--color-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring-color)] focus-visible:ring-offset-[var(--focus-ring-offset)] transition-all"
                    >
                        {/* <Image
                            src="/resumedrive.png"
                            alt="Resume Drive logo"
                            width={32}
                            height={32}
                            priority
                            className="!hidden md:!inline h-8 w-8 rounded-md"
                        /> */}
                        <span className="ml-2 text-md sm:text-lg font-extrabold tracking-wider">
                            RESUME DRIVE
                        </span>
                    </Link>
                </div>

                {/* Center: segmented control (tabs) */}
                <div
                    role="tablist"
                    aria-label="View mode"
                    className="flex items-center text-xs gap-1 rounded-full"
                >
                    <button
                        role="tab"
                        aria-selected={activeTab === "editor"}
                        type="button"
                        onClick={() => onTabChange("editor")}
                        className={tabClasses(activeTab === "editor")}
                    >
                        {t("header.editorTab")}
                    </button>

                    <button
                        role="tab"
                        aria-selected={activeTab === "preview"}
                        type="button"
                        onClick={() => onTabChange("preview")}
                        className={tabClasses(activeTab === "preview")}
                    >
                        {t("header.previewTab")}
                    </button>
                    <button
                        type="button"
                        aria-label={t("header.openLeftPanel")}
                        onClick={onToggleLeft}
                        className="inline-flex items-center justify-center rounded-[var(--radius-md)] p-3 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring-color)] focus-visible:ring-offset-[var(--focus-ring-offset)] transition-all min-h-[44px] min-w-[44px]"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>

                </div>

                <div className="hidden items-center gap-2 md:flex">
                    <LanguageToggle />

                </div>
            </div>
        </header>
    );
}

export default HeaderBar;
