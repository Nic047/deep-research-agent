import { useState } from "react";

export function useClipboard(text: string) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copy = async () => {
    try {
      setError(null);
      await navigator.clipboard.writeText(text);
      setCopied(true);
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError("Failed to copy to clipboard");
      setCopied(false);
      console.error("Clipboard copy failed:", err);
    }
  };

  return { copied, copy, error };
}
