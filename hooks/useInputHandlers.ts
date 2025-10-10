import { useState } from "react";

export function useInputHandlers(
  sendMessage: (data: { text: string }) => void,
  scrollToBottom: () => void
) {
  const [input, setInput] = useState("");

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.currentTarget.value);
  };

  const handleSubmit = (event?: { preventDefault?: () => void }) => {
    event?.preventDefault?.();
    if (!input.trim()) return;
    scrollToBottom();
    sendMessage({ text: input });
    setInput("");
  };

  return { input, handleInputChange, handleSubmit };
}
