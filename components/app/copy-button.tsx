"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { btn } from "./ui";

/** Copies text and says so for a moment. */
export function CopyButton({
  text,
  label = "Copy",
  size = "default",
  onCopied,
}: {
  text: string;
  label?: string;
  size?: "default" | "small";
  onCopied?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={size === "small" ? btn.small : btn.secondary}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          onCopied?.();
          setTimeout(() => setCopied(false), 1600);
        } catch {
          // Clipboard blocked: the text is still on screen to select.
        }
      }}
    >
      {copied ? (
        <Check className="size-4" aria-hidden />
      ) : (
        <Copy className="size-4" aria-hidden />
      )}
      <span aria-live="polite">{copied ? "Copied" : label}</span>
    </button>
  );
}
