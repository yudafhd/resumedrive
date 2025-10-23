"use client";

import { ReactNode } from "react";

type WorkspaceSplitPaneProps = {
    activeTab: "editor" | "preview";
    editor: ReactNode;
    preview: ReactNode;
};

function cx(...classes: Array<string | false>) {
    return classes.filter(Boolean).join(" ");
}

export function WorkspaceSplitPane({ activeTab, editor, preview }: WorkspaceSplitPaneProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
            <section
                aria-label="Editor"
                className={cx(
                    "lg:col-span-7",
                    activeTab === "editor" ? "block" : "hidden",
                    "lg:block"
                )}
            >
                {editor}
            </section>
            <section
                aria-label="Preview"
                className={cx(
                    "lg:col-span-5 lg:border-l lg:pl-6 lg:border-[var(--border)]",
                    activeTab === "preview" ? "block" : "hidden",
                    "lg:block"
                )}
            >
                {preview}
            </section>
        </div>
    );
}

export default WorkspaceSplitPane;