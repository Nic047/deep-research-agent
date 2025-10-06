import { NextRequest } from "next/server";
import { streamText } from "ai";

export async function POST(request: NextRequest) {
  const result = streamText({
    model: "openai/gpt-4.1",
    prompt: "Invent a new holiday and describe its traditions.",
  });

  return result;
}
