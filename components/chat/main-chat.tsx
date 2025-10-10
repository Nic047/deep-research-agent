"use client";

import { useEffect, useState } from "react";
import { useChat } from "@ai-sdk/react";
import MarkdownRenderer from "../helpers/MemoizedMarkdown";
import ScrollButton from "./scrollbutton";
import { toast } from "sonner";
import { useScrollToBottom } from "@/hooks/useScrollToBottom";
import { Button } from "../ui/button";
import { Copy, ThumbsDown, ThumbsUp } from "lucide-react";
import { TextShimmer } from "../ui/text-shimmer";
import { useHasFirstToken } from "@/hooks/useHasFirstToken";
import { useInputHandlers } from "@/hooks/useInputHandlers";
import { MainInput } from "./main-input";
import { UIMessage } from "@ai-sdk/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

function MainChat() {
  const { messages, sendMessage, status, stop, error } = useChat({
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
  const [startAnimation, setStartAnimation] = useState(false);

  useEffect(() => {
    setStartAnimation(true);
  }, []);

  const { messagesContainerRef, showScrollButton, scrollToBottom } =
    useScrollToBottom(messages.length);

  const hasFirstToken = useHasFirstToken(messages, status);
  const { input, handleInputChange, handleSubmit } = useInputHandlers(
    sendMessage,
    () =>
      messagesContainerRef.current?.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      })
  );

  const lastMessage = messages[messages.length - 1];
  const isGenerating =
    status === "submitted" || (status === "streaming" && !hasFirstToken);
  const showLoader = isGenerating && lastMessage?.role === "assistant";

  // Helper to render message parts
  const renderMessageParts = (message: UIMessage) =>
    message.parts.map((part, i) => {
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
            <Accordion key={`${message.id}-${i}`} type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>Weather Tool Call</AccordionTrigger>
                <AccordionContent className="border p-4 rounded-2xl my-2">
                  <pre>{JSON.stringify(part, null, 2)}</pre>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          );
        case "tool-searchTool":
          return (
            <Accordion key={`${message.id}-${i}`} type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>Search Tool Call</AccordionTrigger>
                <AccordionContent className="border p-4 rounded-2xl my-2">
                  <pre>{JSON.stringify(part, null, 2)}</pre>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          );
        default:
          return null;
      }
    });

  return (
    <div className="flex flex-col h-[80vh] w-full bg-white dark:bg-gray-950 hide-scrollbar relative">
      {/* Header */}
      {messages.length === 0 && (
        <div className="px-8 py-6">
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
          <div className="flex flex-col items-center w-full justify-center relative top-[52vh]">
            <div className="flex flex-row gap-6">
              {[0, 1, 2].map((n) => (
                <div
                  key={n}
                  className={`bg-white border w-[198px] cursor-pointer active:scale-95 h-28 rounded-2xl flex items-center justify-center transition-all duration-300 ease-in-out
                ${
                  startAnimation
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
                  style={{ transitionDelay: `${n * 80}ms` }}
                ></div>
              ))}
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
                  {/* Role badge */}
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

                  {/* Loader */}
                  {showLoaderForThisMessage && (
                    <div className="flex items-center gap-2 text-sm">
                      <TextShimmer duration={1} spread={2}>
                        Generating...
                      </TextShimmer>
                    </div>
                  )}

                  {/* Message parts */}
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    {renderMessageParts(message)}
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* Action Buttons for last message */}
        {messages.length > 0 && status === "ready" && (
          <div className="flex h-16 items-center justify-end gap-2">
            {[Copy, ThumbsUp, ThumbsDown].map((Icon, i) => (
              <Button key={i} variant="ghost" className="p-0 m-0">
                <Icon size={10} />
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Error Display
      {error && (
        <div className="px-8 py-4 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
          <div className="text-red-600 dark:text-red-400 text-sm">
            Error: {error.message || "Something went wrong. Please try again."}
          </div>
        </div>
      )} */}

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
