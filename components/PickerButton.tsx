"use client";

import { useState } from "react";
import { openDrivePicker } from "@/lib/picker";
import { ALLOWED_MIME_TYPES } from "@/lib/mime";

type PickerButtonProps = {
  accessToken: string;
  apiKey?: string;
  showFolders?: boolean;
  mimeTypes?: string[];
  onPicked: (doc: {
    id: string;
    name: string;
    mimeType: string;
    isFolder: boolean;
  }) => void;
  onError?: (message: string) => void;
};

export function PickerButton({
  accessToken,
  apiKey,
  showFolders = true,
  mimeTypes = ALLOWED_MIME_TYPES,
  onPicked,
  onError,
}: PickerButtonProps) {
  const [isOpening, setIsOpening] = useState(false);

  const handleOpen = async () => {
    if (!apiKey) {
      onError?.("Missing NEXT_PUBLIC_GOOGLE_API_KEY");
      return;
    }

    setIsOpening(true);
    try {
      await openDrivePicker({
        accessToken,
        developerKey: apiKey,
        showFolders,
        mimeTypes,
        onPicked,
      });
    } catch (error) {
      onError?.(
        error instanceof Error ? error.message : "Failed to open Google Picker",
      );
    } finally {
      setIsOpening(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleOpen}
      disabled={isOpening}
      className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:bg-slate-200"
    >
      {isOpening ? "Opening Picker…" : "Open Google Picker"}
    </button>
  );
}
