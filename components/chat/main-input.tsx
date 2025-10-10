"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, StopCircle } from "lucide-react";
import React from "react";
import { Spinner } from "../ui/spinner";

type MainInputProps = {
  input: string;
  handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (event?: { preventDefault?: () => void }) => void;
  isLoading?: boolean;
  stop: () => void;
  status: string;
};

export function MainInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  stop,
  status,
}: MainInputProps) {
  return (
    <div className="w-full px-8 py-4">
      {/* pre-made promts */}
      {/* <div className="w-30 h-10 bg-white border flex items-center justify-center text-black text-center rounded-2xl relative">
        Fuck you
      </div> */}
      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto flex flex-col gap-3"
      >
        <div className="relative">
          <Textarea
            placeholder="Ask me anything…"
            className="w-full h-24 resize-none bg-white dark:bg-gray-900 pr-12"
            disableFocusRing
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              } else if (e.key === "Escape" && status === "streaming") {
                e.preventDefault();
                stop();
              }
            }}
          />
          <Button
            type="submit"
            className="absolute bottom-2 right-2 h-8 w-8 p-0 hover:scale-[1.05] active:scale-[0.96]"
            disabled={isLoading}
          >
            {isLoading ? <Spinner /> : <ArrowUp />}
          </Button>
          {status === "streaming" && (
            <Button
              type="button"
              onClick={stop}
              className="absolute bottom-2 right-12 h-8 w-8 p-0"
              variant="outline"
            >
              <StopCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
