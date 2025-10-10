"use client";

import React, { useState } from "react";
import { MainInput } from "./main-input";
import { useChat } from "@ai-sdk/react";
import MarkdownRenderer from "../helpers/MemoizedMarkdown";
import ScrollButton from "./scrollbutton";
import { toast } from "sonner";
import { useScrollToBottom } from "@/hooks/useScrollToBottom";

function MainChat() {
  const { messages, sendMessage, status, stop, error } = useChat({
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
  const [input, setInput] = useState("");
  const { messagesContainerRef, showScrollButton, scrollToBottom } =
    useScrollToBottom(messages.length);

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.currentTarget.value);
  };

  const handleSubmit = (event?: { preventDefault?: () => void }) => {
    event?.preventDefault?.();
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput("");
  };

  return (
    <div className="flex flex-col h-[90vh] w-full bg-white dark:bg-gray-950 hide-scrollbar relative">
      {/* Header */}
      {messages.length === 0 && (
        <div className="px-8 py-6 ">
          <h1 className="text-3xl font-light tracking-tight">
            <span className="text-black dark:text-white">Welcome back, </span>
            <span className="text-gray-400 dark:text-gray-300">Nicolae</span>
          </h1>
        </div>
      )}

      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 px-8 py-6 space-y-8 items-center justify-center hide-scrollbar overflow-auto pb-32"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            {/* Empty state */}
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className="space-y-2 animate-in fade-in slide-in-from-bottom-3 duration-300"
            >
              <div className="text-[10px] font-medium tracking-widest uppercase text-gray-400 dark:text-gray-500">
                {message.role === "assistant" && "Assistant"}
              </div>
              <div className="text-[10px] font-bold tracking-widest uppercase text-gray-800 dark:text-gray-200 ">
                {message.role === "user" && "You"}
              </div>

              <div className="prose prose-sm max-w-none dark:prose-invert">
                {message.parts.map((part, i) => {
                  switch (part.type) {
                    case "text":
                      return (
                        <div
                          key={`${message.id}-${i}`}
                          className={`${
                            message.role === "user"
                              ? "text-black dark:text-white font-normal"
                              : "text-gray-700 dark:text-gray-300 font-light"
                          }`}
                        >
                          <MarkdownRenderer content={part.text} />
                        </div>
                      );
                    case "tool-weather":
                      return (
                        <div
                          key={`${message.id}-${i}`}
                          className="my-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                        >
                          <div className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">
                            🌤️ Weather Tool
                          </div>
                          <pre className="text-xs text-blue-600 dark:text-blue-400 font-mono overflow-x-auto">
                            {JSON.stringify(part, null, 2)}
                          </pre>
                        </div>
                      );
                    case "tool-searchTool":
                      return (
                        <div
                          key={`${message.id}-${i}`}
                          className="my-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                        >
                          <div className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">
                            Search Tool
                          </div>
                          <pre className="text-xs text-blue-600 dark:text-blue-400 font-mono overflow-x-auto">
                            {JSON.stringify(part, null, 2)}
                          </pre>
                        </div>
                      );
                    default:
                      return null;
                  }
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-8 py-4 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
          <div className="text-red-600 dark:text-red-400 text-sm">
            Error: {error.message || "Something went wrong. Please try again."}
          </div>
        </div>
      )}

      {/* Scroll Button */}
      {showScrollButton && (
        <div className="fixed bottom-24 left-1/2 transition z-20">
          <ScrollButton onClick={scrollToBottom} />
        </div>
      )}

      {/* Fixed Input Container */}
      <div className="fixed bottom-0 left-0 right-0 z-10 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
        <MainInput
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isLoading={status === "submitted"}
          stop={stop}
          status={status}
        />
      </div>
    </div>
  );
}

export default MainChat;
