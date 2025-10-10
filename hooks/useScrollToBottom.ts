import { useRef, useState, useEffect, useCallback } from "react";

interface UseScrollToBottomOptions {
  threshold?: number;
  autoScrollThreshold?: number;
  autoScrollDelay?: number;
}

export function useScrollToBottom(
  messagesLength: number,
  options: UseScrollToBottomOptions = {}
) {
  const {
    threshold = 50,
    autoScrollThreshold = 100,
    autoScrollDelay = 100,
  } = options;

  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const checkScrollPosition = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < threshold;
    setShowScrollButton(!isAtBottom && messagesLength > 0);
  }, [messagesLength, threshold]);

  const scrollToBottom = useCallback(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  // Set up scroll event listener
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    container.addEventListener("scroll", checkScrollPosition);
    return () => container.removeEventListener("scroll", checkScrollPosition);
  }, [checkScrollPosition]);

  // Check scroll position when messages change
  useEffect(() => {
    checkScrollPosition();
  }, [checkScrollPosition]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesLength > 0) {
      const container = messagesContainerRef.current;
      if (container) {
        const { scrollTop, scrollHeight, clientHeight } = container;
        const isNearBottom =
          scrollHeight - scrollTop - clientHeight < autoScrollThreshold;

        if (isNearBottom) {
          // Auto-scroll to bottom if user is near bottom
          setTimeout(() => {
            container.scrollTo({
              top: container.scrollHeight,
              behavior: "smooth",
            });
          }, autoScrollDelay);
        }
      }
    }
  }, [messagesLength, autoScrollThreshold, autoScrollDelay]);

  return {
    messagesContainerRef,
    showScrollButton,
    scrollToBottom,
  };
}
