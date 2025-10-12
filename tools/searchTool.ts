import { tool } from "ai";
import { z } from "zod";
import { tavily } from "@tavily/core";

export const searchTool = tool({
  description:
    "Perform a real web search and extract detailed content for comprehensive analysis.",
  inputSchema: z.object({
    searchQuery: z.string().describe("The topic or query to research deeply"),
    resultCount: z
      .number()
      .default(20)
      .describe("How many top search results to extract"),
  }),
  execute: async ({ searchQuery, resultCount }) => {
    try {
      const tvly = tavily({
        apiKey: process.env.TAVILY_API_KEY!,
      });

      // Step 1: Get search results (with URLs)
      const searchResponse = await tvly.search(searchQuery, {
        searchDepth: "advanced",
        includeAnswer: false, // we’ll generate our own later
        includeRawContent: "text",
      });

      const urls = searchResponse.results
        .slice(0, resultCount)
        .map((r) => r.url)
        .filter((u) => !!u);

      if (urls.length === 0) {
        throw new Error("No URLs found for extraction");
      }

      // Step 2: Extract full content from each page
      const extractionResponse = await tvly.extract(urls);

      return {
        query: searchQuery,
        resultCount: urls.length,
        sources: extractionResponse.results.map((page) => ({
          url: page.url,
          title: searchQuery,
          fullContent: page.rawContent.slice(0, 30000), // cut to avoid overloading
        })),
      };
    } catch (error) {
      console.error("Deep Tavily search error:", error);
      throw new Error(
        `Deep search failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },
});
