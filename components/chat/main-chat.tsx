"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";

import ScrollButton from "./scrollbutton";
import { toast } from "sonner";
import { useScrollToBottom } from "@/hooks/useScrollToBottom";
import { Button } from "../ui/button";
import { Check, Copy, ThumbsDown, ThumbsUp } from "lucide-react";
import { TextShimmer } from "../ui/text-shimmer";
import { useHasFirstToken } from "@/hooks/useHasFirstToken";
import { useInputHandlers } from "@/hooks/useInputHandlers";
import { MainInput } from "./main-input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useClipboard } from "@/hooks/useClipboard";
import { Response } from "../ai-elements/response";
import { useAutoScroll } from "@/hooks/use-auto-scroll";

export default function MainChat() {
  const { messages, sendMessage, status, stop } = useChat({
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const lastMessageRef = useRef<HTMLDivElement | null>(null);

  const latestMessageText =
    messages[messages.length - 1]?.parts.find((part) => part.type === "text")
      ?.text || "";

  const [startAnimation, setStartAnimation] = useState(false);
  const { copy, copied } = useClipboard(latestMessageText);

  useEffect(() => {
    setStartAnimation(true);
  }, []);

  const hasFirstToken = useHasFirstToken(messages, status);
  const { input, handleInputChange, handleSubmit } = useInputHandlers(
    sendMessage,
    () => {
      setTimeout(() => {
        lastMessageRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }, 50);
    }
  );

  const lastMessage = messages[messages.length - 1];
  const isGenerating =
    status === "submitted" || (status === "streaming" && !hasFirstToken);
  const showLoader = isGenerating && lastMessage?.role === "assistant";
  const handleCopyResponse = async () => {
    await copy();
  };

  const { scrollRef, isAtBottom, autoScrollEnabled, scrollToBottom } =
    useAutoScroll({
      offset: 20,
      smooth: true,
      // content: messages,
    });

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-gray-950 hide-scrollbar relative">
      {/* Header */}
      {messages.length === 0 && (
        <div className="px-8 py-6">
          <h1 className="text-3xl font-light tracking-tight">
            <span className="text-black dark:text-white">Welcome back, </span>
            <span className="text-gray-400 dark:text-gray-300">Guest</span>
          </h1>
        </div>
      )}

      {/* Chat Container - Centered and Narrower */}
      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-4xl px-8 py-6">
          {/* Messages Container */}
          <div
            ref={scrollRef}
            className="space-y-8 hide-scrollbar overflow-auto h-full"
          >
            {/* Empty state */}
            {messages.length === 0 ? (
              <div className="flex flex-col items-center w-full justify-center h-full">
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
                      ref={isLastMessage ? lastMessageRef : null} // <-- attach here
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
                        {message.parts.map((part, i) => {
                          switch (part.type) {
                            case "text":
                              return (
                                <div key={`${message.id}-${i}`}>
                                  <Response>{part.text}</Response>
                                </div>
                              );

                            case "tool-weather":
                            case "tool-searchTool":
                              return (
                                <Accordion
                                  key={`${message.id}-${i}`}
                                  type="single"
                                  collapsible
                                  className="my-3"
                                >
                                  <AccordionItem value={`item-${i}`}>
                                    <AccordionTrigger>
                                      {part.type === "tool-weather"
                                        ? "Weather Tool Call"
                                        : "Search Tool Call"}
                                    </AccordionTrigger>
                                    <AccordionContent className="border p-4 rounded-2xl">
                                      <pre className="text-xs whitespace-pre-wrap">
                                        {JSON.stringify(part, null, 2)}
                                      </pre>
                                    </AccordionContent>
                                  </AccordionItem>
                                </Accordion>
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

            {/* Action Buttons for last message */}
            {messages.length > 0 && status === "ready" && (
              <div className="flex h-16 items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  className="p-0 m-0"
                  disabled={!latestMessageText.trim()}
                  onClick={handleCopyResponse}
                >
                  {copied ? <Check size={10} /> : <Copy size={10} />}
                </Button>
                <Button variant="ghost" className="p-0 m-0">
                  <ThumbsUp size={10} />
                </Button>
                <Button variant="ghost" className="p-0 m-0">
                  <ThumbsDown size={10} />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scroll Button
      {showScrollButton && (
        <div className="absolute bottom-24 right-4 transition z-20">
          <ScrollButton onClick={scrollToBottom} />
        </div>
      )} */}

      {/* Input Container - Fixed at bottom */}
      <div className="sticky bottom-0  dark:bg-gray-950 py-4">
        <div className="max-w-4xl mx-auto">
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
    </div>
  );
}
