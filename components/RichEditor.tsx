"use client";

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Link2,
  List as ListBullet,
  ListOrdered,
  Underline,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExtension from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";

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
        ? "border-blue-500 bg-blue-50 text-blue-600 shadow-sm"
        : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600"
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
  placeholder = "Write something…",
  rows = 4,
  className = "",
  showCharCount = true,
}: RichEditorProps) {
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
          class: "text-blue-600 underline underline-offset-2",
        },
      }),
      TextAlign.configure({
        types: ["paragraph"],
      }),
      Placeholder.configure({
        placeholder,
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
          "min-h-[120px] w-full px-4 py-3 text-sm leading-6 text-slate-800 outline-none prose prose-sm max-w-none",
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

  const toggleLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const url = window.prompt("Insert URL", previousUrl ?? "https://");
    if (!url) {
      return;
    }
    editor.chain().focus().setLink({ href: url }).run();
  };

  const setAlignment = (alignment: Alignment) => {
    editor?.chain().focus().setTextAlign(alignment).run();
  };

  const minHeight = Math.max(1, rows) * 28;
  const isDisabled = !editor;

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl bg-white focus-within:border-blue-500 ${className}`}
    >
      <div className="flex flex-wrap gap-2">
        <ToolbarButton
          label="Bold"
          icon={<Bold className="h-4 w-4" />}
          active={editor?.isActive("bold")}
          disabled={isDisabled}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          label="Italic"
          icon={<Italic className="h-4 w-4" />}
          active={editor?.isActive("italic")}
          disabled={isDisabled}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          label="Underline"
          icon={<Underline className="h-4 w-4" />}
          active={editor?.isActive("underline")}
          disabled={isDisabled}
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
        />

        <span className="mx-2 hidden h-4 w-px bg-slate-200 sm:block" />

        <ToolbarButton
          label="Bulleted list"
          icon={<ListBullet className="h-4 w-4" />}
          active={editor?.isActive("bulletList")}
          disabled={isDisabled}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          label="Numbered list"
          icon={<ListOrdered className="h-4 w-4" />}
          active={editor?.isActive("orderedList")}
          disabled={isDisabled}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        />

        <span className="mx-2 hidden h-4 w-px bg-slate-200 sm:block" />

        <ToolbarButton
          label="Align left"
          icon={<AlignLeft className="h-4 w-4" />}
          active={editor?.isActive({ textAlign: "left" })}
          disabled={isDisabled}
          onClick={() => setAlignment("left")}
        />
        <ToolbarButton
          label="Align center"
          icon={<AlignCenter className="h-4 w-4" />}
          active={editor?.isActive({ textAlign: "center" })}
          disabled={isDisabled}
          onClick={() => setAlignment("center")}
        />
        <ToolbarButton
          label="Align right"
          icon={<AlignRight className="h-4 w-4" />}
          active={editor?.isActive({ textAlign: "right" })}
          disabled={isDisabled}
          onClick={() => setAlignment("right")}
        />

        <span className="mx-2 hidden h-4 w-px bg-slate-200 sm:block" />

        <ToolbarButton
          label={editor?.isActive("link") ? "Remove link" : "Insert link"}
          icon={<Link2 className="h-4 w-4" />}
          active={editor?.isActive("link")}
          disabled={isDisabled}
          onClick={toggleLink}
        />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white focus-within:ring-1">
        <EditorContent
          editor={editor}
          onClick={focusEditor}
          style={{ minHeight }}
        />
      </div>

      {showCharCount && (
        <div className="flex items-center justify-end pt-2 text-xs text-slate-500">
          {charCount} characters
        </div>
      )}
    </div>
  );
}
