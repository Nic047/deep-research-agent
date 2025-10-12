import { useEffect, useRef, useState } from "react";
import { UIMessage } from "@ai-sdk/react"; // adjust type if needed

export function useHasFirstToken(messages: UIMessage[], status: string) {
  const [hasFirstToken, setHasFirstToken] = useState(false);
  const previousMessagesLength = useRef(messages.length);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];

    // Only reset when user sends a new message
    if (
      messages.length > previousMessagesLength.current &&
      lastMessage?.role === "user"
    ) {
      if (hasFirstToken) setHasFirstToken(false);
    }

    // Set true only once per assistant message
    if (
      lastMessage?.role === "assistant" &&
      !hasFirstToken &&
      lastMessage.parts.some(
        (part) => part.type === "text" && part.text.trim().length > 0
      )
    ) {
      setHasFirstToken(true);
    }

    previousMessagesLength.current = messages.length;
  }, [messages, hasFirstToken]);

  useEffect(() => {
    if (status === "submitted" && hasFirstToken) {
      setHasFirstToken(false);
    }
  }, [status, hasFirstToken]);

  return hasFirstToken;
}
