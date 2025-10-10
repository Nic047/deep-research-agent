import { useEffect, useRef, useState } from "react";
import { UIMessage } from "@ai-sdk/react"; // adjust type if needed

export function useHasFirstToken(messages: UIMessage[], status: string) {
  const [hasFirstToken, setHasFirstToken] = useState(false);
  const previousMessagesLength = useRef(messages.length);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];

    // Reset hasFirstToken when user sends a new message
    if (messages.length > previousMessagesLength.current) {
      setHasFirstToken(false);
    }

    if (lastMessage?.role === "assistant") {
      const hasContent = lastMessage.parts.some(
        (part) => part.type === "text" && part.text.trim().length > 0
      );
      if (hasContent) setHasFirstToken(true);
    }

    previousMessagesLength.current = messages.length;
  }, [messages]);

  useEffect(() => {
    if (status === "submitted") setHasFirstToken(false);
  }, [status]);

  return hasFirstToken;
}
