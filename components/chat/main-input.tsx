"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, StopCircle, Mic } from "lucide-react";
import { useEffect } from "react";
import { Spinner } from "../ui/spinner";
import { useTranscription } from "@/hooks/useTranscription";

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
  const { isRecording, transcribedText, startRecording, stopRecording } =
    useTranscription();

  useEffect(() => {
    if (transcribedText) {
      // Autofill transcription into the chat input
      handleInputChange({
        currentTarget: { value: transcribedText },
      } as React.ChangeEvent<HTMLTextAreaElement>);
    }
  }, [transcribedText]);

  return (
    <div className="w-full px-8 py-4">
      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto flex flex-col gap-3"
      >
        <div className="relative">
          <Textarea
            placeholder="Ask me anything…"
            className="w-full h-24 resize-none bg-white dark:bg-gray-900 pr-20" // more padding-right
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

          {/* Right-side button group */}
          <div className="absolute bottom-2 right-2 flex items-center gap-2">
            {/* Mic button */}
            <Button
              type="button"
              variant="ghost"
              onClick={isRecording ? stopRecording : startRecording}
              className="h-8 w-8 p-0 hover:bg-black bg-black hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
            >
              {isRecording ? (
                <Spinner className="text-white" />
              ) : (
                <Mic className="w-4 h-4 text-white" />
              )}
            </Button>

            {/* Submit or Stop button */}
            {status === "ready" && (
              <Button
                type="submit"
                className="h-8 w-8 p-0 hover:scale-[1.02] active:scale-[0.98]"
                disabled={isLoading}
              >
                <ArrowUp className="h-4 w-4 text-white" />
              </Button>
            )}

            {status === "streaming" && (
              <Button
                type="button"
                onClick={stop}
                className="h-8 w-8 p-0 hover:scale-[1.02] active:scale-[0.98]"
                variant="outline"
              >
                <StopCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
