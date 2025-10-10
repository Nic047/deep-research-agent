// app/api/chat/route.ts
import { openai } from "@ai-sdk/openai";
import { streamText, convertToModelMessages } from "ai";
import { weather } from "@/tools/weather";
import { searchTool } from "@/tools/searchTool";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages) {
      return new Response(JSON.stringify({ error: "No messages provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const aiMessages = convertToModelMessages(messages);

    const result = streamText({
      model: openai("gpt-5-nano"),
      system: `
You are a friendly assistant.
When asked about the weather, call the "weather" tool automatically.
When asked about other topics, call "searchTool" if needed.
After receiving tool results, always respond naturally in plain text,
summarizing information clearly for the user. When displaying code, make sure to use right syntax and always use Markdown.
      `,
      messages: aiMessages,
      tools: {
        weather,
        searchTool,
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal Server Error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
