import { useState } from "react";

export function useClipboard(text: string) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
  };

  return { copied, copy };
}
