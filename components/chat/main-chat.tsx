"use client";

import {
  useEffect,
  useRef,
  useState,
  useMemo,
  // ChangeEvent,
  // FormEvent,
} from "react";
import { UIMessage, useChat, UseChatHelpers } from "@ai-sdk/react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import {
  Check,
  Copy,
  ThumbsDown,
  ThumbsUp,
  Search,
  FileText,
  Loader2,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

/* ---------- TYPES ---------- */

interface TextPart {
  type: "text";
  text: string;
}

type ToolType = "tool-searchTool" | "tool-deepResearchTool" | "tool-weather";

interface ToolCallPart {
  type: ToolType;
  tool?: string;
  result: Record<string, unknown> & {
    results?: Source[];
    uniqueSources?: Source[];
    queriesExecuted?: string[];
    quickAnswers?: { query: string; answer: string }[];
    totalSourcesFound?: number;
    answer?: string;
  };
  args?: Record<string, unknown>;
}

interface Source {
  title?: string;
  url?: string;
  publishedDate?: string;
}

type MessagePart = TextPart | ToolCallPart;

interface Message {
  id: string;
  role: "user" | "assistant";
  parts: MessagePart[];
}

/* ---------- COMPONENT ---------- */

export default function MainChat() {
  const { messages, sendMessage, status, stop }: UseChatHelpers<UIMessage> =
    useChat({
      onError: (error) => toast.error(`Error: ${error.message}`),
    });

  const lastMessageRef = useRef<HTMLDivElement | null>(null);
  const [startAnimation, setStartAnimation] = useState(false);

  // Memoize latest assistant text to avoid unnecessary re-renders
  const latestMessageText = useMemo(() => {
    const lastMessage = messages[messages.length - 1];
    return (
      lastMessage?.parts.find((part): part is TextPart => part.type === "text")
        ?.text ?? ""
    );
  }, [messages]);

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

  const handleCopyResponse = async () => copy();

  const { scrollRef } = useAutoScroll({ offset: 20, smooth: true });

  const getToolCalls = (message: Message): ToolCallPart[] =>
    message.parts.filter(
      (part): part is ToolCallPart =>
        part.type.startsWith("tool-") && part.type !== "text"
    );

  const getSources = (message: Message): Source[] => {
    const toolCalls = getToolCalls(message);
    const sources: Source[] = [];
    toolCalls.forEach((tool) => {
      if (tool.result?.results) sources.push(...tool.result.results);
      if (tool.result?.uniqueSources)
        sources.push(...tool.result.uniqueSources);
    });
    return sources;
  };

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-black hide-scrollbar relative">
      {/* Header */}
      {messages.length === 0 && (
        <div className="px-8 py-6">
          <h1 className="text-3xl font-light tracking-tight">
            <span className="text-black dark:text-white">Welcome back, </span>
            <span className="text-gray-400 dark:text-gray-300">Guest</span>
          </h1>
        </div>
      )}

      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-4xl px-8 py-6">
          <div
            ref={scrollRef}
            className="space-y-8 hide-scrollbar overflow-auto h-full"
          >
            {messages.map((message, messageIndex) => {
              const isLastMessage = messageIndex === messages.length - 1;
              const showLoaderForThisMessage = showLoader && isLastMessage;
              const toolCalls = getToolCalls(message as Message);
              const sources = getSources(message as Message);

              return (
                <div
                  ref={isLastMessage ? lastMessageRef : null}
                  key={message.id}
                  className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300"
                >
                  {/* Role badge */}
                  <div className="text-[10px] font-medium tracking-widest uppercase">
                    {message.role === "assistant" && (
                      <div className="font-medium text-black bg-white border w-[82px] px-2 py-1 rounded-full">
                        Assistant
                      </div>
                    )}
                    {message.role === "user" && (
                      <div className="font-medium text-white dark:text-white bg-black dark:bg-gray-700 px-2 py-1 w-[40px] rounded-full">
                        You
                      </div>
                    )}
                  </div>

                  {/* Loader */}
                  {showLoaderForThisMessage && (
                    <div className="flex items-center gap-3 text-sm ">
                      <Loader2 className="animate-spin" size={16} />
                      <TextShimmer duration={1} spread={2}>
                        Thinking...
                      </TextShimmer>
                    </div>
                  )}

                  {/* Tool Calls */}
                  {toolCalls.length > 0 &&
                    toolCalls.map((tool, i) => {
                      const isSearch = tool.type === "tool-searchTool";
                      const isDeepResearch =
                        tool.type === "tool-deepResearchTool";
                      return (
                        <Accordion
                          key={`${message.id}-tool-${i}`}
                          type="single"
                          collapsible
                          className="border rounded-lg overflow-hidden bg-blue-50/50 dark:bg-blue-950/20"
                        >
                          <AccordionItem
                            value={`item-${i}`}
                            className="border-0"
                          >
                            <AccordionTrigger className="px-4 py-3 hover:no-underline">
                              <div className="flex items-center gap-3">
                                {isDeepResearch ? (
                                  <FileText
                                    className="text-blue-600"
                                    size={18}
                                  />
                                ) : (
                                  <Search className="text-blue-600" size={18} />
                                )}
                                <div className="text-left">
                                  <div className="font-medium text-sm">
                                    {isDeepResearch
                                      ? "Deep Research"
                                      : "Web Search"}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {isDeepResearch
                                      ? `${
                                          tool.result?.queriesExecuted
                                            ?.length ?? 0
                                        } queries, ${
                                          tool.result?.totalSourcesFound ?? 0
                                        } sources`
                                      : `Query: ${
                                          (
                                            tool.args?.searchQuery as string
                                          )?.slice(0, 60) ?? ""
                                        }...`}
                                  </div>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-4">
                              {/* Deep Research Details */}
                              {isDeepResearch &&
                                tool.result?.queriesExecuted && (
                                  <div className="space-y-3">
                                    <div>
                                      <h4 className="text-sm font-semibold mb-2">
                                        Queries Executed:
                                      </h4>
                                      <div className="flex flex-wrap gap-2">
                                        {tool.result.queriesExecuted.map(
                                          (q, idx) => (
                                            <Badge
                                              key={idx}
                                              variant="secondary"
                                              className="text-xs"
                                            >
                                              {q}
                                            </Badge>
                                          )
                                        )}
                                      </div>
                                    </div>
                                    {tool.result.quickAnswers &&
                                      tool.result.quickAnswers.length > 0 && (
                                        <div>
                                          <h4 className="text-sm font-semibold mb-2">
                                            Quick Insights:
                                          </h4>
                                          <div className="space-y-2">
                                            {tool.result.quickAnswers.map(
                                              (qa, idx) => (
                                                <div
                                                  key={idx}
                                                  className="text-xs bg-white dark:bg-gray-800 p-3 rounded border"
                                                >
                                                  <div className="font-medium text-blue-600 mb-1">
                                                    {qa.query}
                                                  </div>
                                                  <div className="text-gray-700 dark:text-gray-300">
                                                    {qa.answer}
                                                  </div>
                                                </div>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      )}
                                  </div>
                                )}

                              {/* Regular Search Details */}
                              {isSearch && tool.result?.answer && (
                                <div className="text-sm bg-white dark:bg-gray-800 p-3 rounded border mb-3">
                                  <div className="font-medium mb-1">
                                    Quick Answer:
                                  </div>
                                  <div className="text-gray-700 dark:text-gray-300">
                                    {tool.result.answer}
                                  </div>
                                </div>
                              )}

                              <details className="mt-3">
                                <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                                  View Raw Response
                                </summary>
                                <pre className="text-xs whitespace-pre-wrap mt-2 p-3 bg-gray-100 dark:bg-gray-900 rounded overflow-auto max-h-64">
                                  {JSON.stringify(tool, null, 2)}
                                </pre>
                              </details>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      );
                    })}

                  {/* Sources */}
                  {sources.length > 0 && (
                    <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <FileText size={16} />
                        Sources ({sources.length})
                      </h4>
                      <div className="space-y-2 max-h-64 overflow-auto">
                        {sources.slice(0, 10).map((source, idx) => (
                          <a
                            key={idx}
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-xs p-3 bg-white dark:bg-gray-800 rounded border hover:border-blue-400 hover:shadow-sm transition-all"
                          >
                            <div className="font-medium text-blue-600 hover:underline mb-1">
                              [{idx + 1}] {source.title}
                            </div>
                            <div className="text-gray-500 text-[10px] truncate">
                              {source.url}
                            </div>
                            {source.publishedDate && (
                              <div className="text-gray-400 text-[10px] mt-1">
                                {new Date(
                                  source.publishedDate
                                ).toLocaleDateString()}
                              </div>
                            )}
                          </a>
                        ))}
                        {sources.length > 10 && (
                          <div className="text-xs text-gray-500 text-center py-2">
                            + {sources.length - 10} more sources
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Message text */}
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    {message.parts.map((part, i) =>
                      part.type === "text" ? (
                        <div key={`${message.id}-${i}`}>
                          <Response>{part.text}</Response>
                        </div>
                      ) : null
                    )}
                  </div>
                </div>
              );
            })}

            {/* Copy + Feedback */}
            {messages.length > 0 && status === "ready" && (
              <div className="flex h-16 items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  className="relative w-8 h-8 p-0"
                  disabled={!latestMessageText.trim()}
                  onClick={handleCopyResponse}
                >
                  <Copy
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-250 ease-in-out ${
                      copied
                        ? "opacity-0 scale-90 pointer-events-none"
                        : "opacity-100 scale-100"
                    }`}
                    size={18}
                  />
                  <Check
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 ease-in-out -translate-y-1/2 transition-all duration-250 delay-150 ${
                      copied
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-90 pointer-events-none"
                    }`}
                    size={18}
                  />
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

      {/* Input */}
      <div className="sticky bottom-0 dark:bg-black py-4 border-t bg-white/80 backdrop-blur-xs">
        <div className="max-w-4xl mx-auto flex flex-col gap-4">
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
