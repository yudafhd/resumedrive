"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Underline,
} from "lucide-react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExtension from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { useTranslation } from "./providers/LanguageProvider";

type Alignment = "left" | "center" | "right";

type ToolbarButtonProps = {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
};

function ToolbarButton({
  label,
  icon,
  active,
  disabled,
  onClick,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-md border text-xs transition ${active
        ? "border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)] shadow-sm"
        : "border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
        } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
    >
      {icon}
    </button>
  );
}

type RichEditorProps = {
  value: string;
  onChange: (nextHtml: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  showCharCount?: boolean;
};

export function RichEditor({
  value,
  onChange,
  placeholder,
  rows = 4,
  className = "",
  showCharCount = true,
}: RichEditorProps) {
  const { t } = useTranslation();
  const resolvedPlaceholder = placeholder ?? t("richEditor.placeholder");
  const safeInitialValue = useMemo(() => value ?? "", [value]);
  const [charCount, setCharCount] = useState(0);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      UnderlineExtension,
      Link.configure({
        autolink: true,
        openOnClick: false,
        HTMLAttributes: {
          class: "text-[var(--color-primary)] underline underline-offset-2",
        },
      }),
      TextAlign.configure({
        types: ["paragraph"],
      }),
      Placeholder.configure({
        placeholder: resolvedPlaceholder,
        showOnlyCurrent: false,
        includeChildren: true,
      }),
    ],
    content: safeInitialValue,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      setCharCount(editor.getText().length);
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[120px] w-full px-4 py-3 text-sm leading-6 text-[var(--color-text-primary)] outline-none prose prose-sm max-w-none",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
    setCharCount(editor.getText().length);
  }, [editor, value]);

  const focusEditor = () => {
    editor?.chain().focus();
  };

  const setAlignment = (alignment: Alignment) => {
    editor?.chain().focus().setTextAlign(alignment).run();
  };

  const minHeight = Math.max(1, rows) * 28;
  const isDisabled = !editor;

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl focus-within:border-[var(--color-primary)] ${className}`}
    >
      <div className="flex flex-wrap gap-2">
        <ToolbarButton
          label={t("richEditor.bold")}
          icon={<Bold className="h-4 w-4" />}
          active={editor?.isActive("bold")}
          disabled={isDisabled}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          label={t("richEditor.italic")}
          icon={<Italic className="h-4 w-4" />}
          active={editor?.isActive("italic")}
          disabled={isDisabled}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          label={t("richEditor.underline")}
          icon={<Underline className="h-4 w-4" />}
          active={editor?.isActive("underline")}
          disabled={isDisabled}
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
        />
        <ToolbarButton
          label={t("richEditor.alignLeft")}
          icon={<AlignLeft className="h-4 w-4" />}
          active={editor?.isActive({ textAlign: "left" })}
          disabled={isDisabled}
          onClick={() => setAlignment("left")}
        />
        <ToolbarButton
          label={t("richEditor.alignCenter")}
          icon={<AlignCenter className="h-4 w-4" />}
          active={editor?.isActive({ textAlign: "center" })}
          disabled={isDisabled}
          onClick={() => setAlignment("center")}
        />
        <ToolbarButton
          label={t("richEditor.alignRight")}
          icon={<AlignRight className="h-4 w-4" />}
          active={editor?.isActive({ textAlign: "right" })}
          disabled={isDisabled}
          onClick={() => setAlignment("right")}
        />
      </div>

      <div className="rich-editor rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] focus-within:ring-1 focus-within:ring-[var(--color-primary)]">
        <EditorContent
          editor={editor}
          onClick={focusEditor}
          style={{ minHeight }}
        />
      </div>
      {showCharCount && (
        <div className="flex items-center justify-end pt-2 text-xs text-[var(--color-text-muted)]">
          {t("richEditor.characterCount", { count: charCount })}
        </div>
      )}
    </div>
  );
}
