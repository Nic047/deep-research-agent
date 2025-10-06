"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";

export default function Page() {
  const [input, setInput] = useState("");

  const { messages, sendMessage } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  return (
    <div>
      <input
        value={input}
        onChange={(event) => {
          setInput(event.target.value);
        }}
        onKeyDown={async (event) => {
          if (event.key === "Enter") {
            sendMessage({
              parts: [{ type: "text", text: input }],
            });
          }
        }}
      />

      {messages.map((message, index) => (
        <div key={index}>
          {message.parts.map((part) => {
            if (part.type === "text") {
              return <div key={`${message.id}-text`}>{part.text}</div>;
            }
          })}
        </div>
      ))}
    </div>
  );
}
