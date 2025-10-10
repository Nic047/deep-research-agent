"use client";

import React, { useState, useEffect, useRef } from "react";
import { MainInput } from "./main-input";
import { useChat } from "@ai-sdk/react";
import MarkdownRenderer from "../helpers/MemoizedMarkdown";
import ScrollButton from "./scrollbutton";
import { toast } from "sonner";
import { useScrollToBottom } from "@/hooks/useScrollToBottom";
import { Spinner } from "../ui/spinner";
import { Button } from "../ui/button";
import { Copy, ThumbsDown, ThumbsUp } from "lucide-react";
import { TextShimmer } from "../ui/text-shimmer";

function MainChat() {
  const { messages, sendMessage, status, stop, error } = useChat({
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
  const [input, setInput] = useState("");
  const { messagesContainerRef, showScrollButton, scrollToBottom } =
    useScrollToBottom(messages.length);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFirstToken, setHasFirstToken] = useState(false);
  const previousMessagesLength = useRef(messages.length);

  // Track when first token arrives
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];

    // Reset hasFirstToken when user sends a new message (messages array grows)
    if (messages.length > previousMessagesLength.current) {
      setHasFirstToken(false);
    }

    // Check if last message is assistant and has content
    if (lastMessage?.role === "assistant") {
      const hasContent = lastMessage.parts.some((part) => {
        if (part.type === "text" && part.text.trim().length > 0) {
          return true;
        }
        return false;
      });

      if (hasContent) {
        setHasFirstToken(true);
      }
    }

    previousMessagesLength.current = messages.length;
  }, [messages]);

  // Reset hasFirstToken when status changes to submitted
  useEffect(() => {
    if (status === "submitted") {
      setHasFirstToken(false);
    }
  }, [status]);

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.currentTarget.value);
  };

  const handleFullScroll = () => {
    messagesContainerRef.current?.scrollTo({
      top: messagesContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  const handleSubmit = (event?: { preventDefault?: () => void }) => {
    setIsLoading(true);
    event?.preventDefault?.();
    handleFullScroll();
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput("");
    setIsLoading(false);
  };

  const lastMessage = messages[messages.length - 1];
  const isGenerating =
    status === "submitted" || (status === "streaming" && !hasFirstToken);
  const showLoader = isGenerating && lastMessage?.role === "assistant";

  return (
    <div className="flex flex-col h-[80vh] w-full bg-white dark:bg-gray-950 hide-scrollbar relative">
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
        className="flex-1 px-8 py-6 space-y-8 items-center justify-center hide-scrollbar overflow-auto"
      >
        {/* Empty state */}
        {messages.length === 0 ? (
          <div className="flex flex-row items-center justify-center relative top-[55vh] gap-x-10">
            <div className="bg-white border w-[198px] h-25 rounded-2xl flex items-center justify-center transition-transform duration-280 cursor-pointer active:scale-95">
              {/* <h2 className="text-black dark:text-white">New Chat 1</h2> */}
            </div>
            <div className="bg-white border w-[198px] h-25 rounded-2xl flex items-center justify-center  cursor-pointer transition-transform duration-280 active:scale-95">
              {/* <h2 className="text-black dark:text-white">New Chat 2</h2> */}
            </div>
            <div className="bg-white border w-[198px] h-25 rounded-2xl flex items-center justify-center cursor-pointertransition-transform duration-280 active:scale-95">
              {/* <h2 className="text-black dark:text-white">New Chat 1</h2> */}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, messageIndex) => {
              const isLastMessage = messageIndex === messages.length - 1;
              const showLoaderForThisMessage = showLoader && isLastMessage;

              return (
                <div
                  key={message.id}
                  className="space-y-2 animate-in fade-in slide-in-from-bottom-3 duration-300"
                >
                  <div className="text-[10px] font-medium tracking-widest uppercase">
                    {message.role === "assistant" && (
                      <div className="font-medium text-black bg-white border w-[82px] px-2 py-1 rounded-full">
                        Assistant
                      </div>
                    )}
                    {message.role === "user" && (
                      <div className="font-medium text-white bg-black px-2 py-1 w-[40px] rounded-full">
                        You
                      </div>
                    )}
                  </div>

                  {/* Show loader when generating but no tokens yet */}
                  {showLoaderForThisMessage && (
                    <div className="flex items-center gap-2 text-sm">
                      <TextShimmer duration={1} spread={2}>
                        Generating...
                      </TextShimmer>
                    </div>
                  )}

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
              );
            })}
          </>
        )}
        {messages.length > 0 && status === "ready" && (
          <div className="flex h-16 items-center justify-end">
            <div>
              <Button variant="ghost" className="p-0 m-0">
                <Copy size={10}></Copy>
              </Button>
            </div>
            <div>
              <Button variant="ghost" className="p-0 m-0">
                <ThumbsUp size={10}></ThumbsUp>
              </Button>
            </div>
            <div>
              <Button variant="ghost" className="p-0 m-0">
                <ThumbsDown size={10}></ThumbsDown>
              </Button>
            </div>
          </div>
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
