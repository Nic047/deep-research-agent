import { tool } from "ai";
import { z } from "zod";

export const searchTool = tool({
  description:
    "Simulate a web search. Returns realistic, varied mock search results for testing and offline usage.",
  inputSchema: z.object({
    searchQuery: z.string().describe("The topic or query to search for"),
    maxResults: z
      .number()
      .default(5)
      .describe("Maximum number of search results to return"),
  }),
  execute: async ({ searchQuery, maxResults }) => {
    // generate fake but believable results instantly
    const results = Array.from({ length: maxResults }).map((_, i) => {
      const titleOptions = [
        `Deep Analysis: ${searchQuery}`,
        `${searchQuery} – What Experts Say`,
        `New Study About ${searchQuery}`,
        `Everything You Need to Know About ${searchQuery}`,
        `Breaking News: ${searchQuery} Update`,
      ];

      const snippetOptions = [
        `Researchers found surprising insights regarding ${searchQuery}.`,
        `Experts debate the long-term impact of ${searchQuery}.`,
        `${searchQuery} continues to shape global trends in 2025.`,
        `Learn how ${searchQuery} is transforming industries.`,
        `A comprehensive overview of ${searchQuery} and related developments.`,
      ];

      const sources = [
        "Reuters",
        "BBC",
        "TechCrunch",
        "Wired",
        "Nature",
        "NYTimes",
      ];

      return {
        title: titleOptions[i % titleOptions.length],
        url: `https://example.com/${encodeURIComponent(searchQuery)}-${i}`,
        snippet:
          snippetOptions[Math.floor(Math.random() * snippetOptions.length)],
        source: sources[Math.floor(Math.random() * sources.length)],
        published_date: new Date(
          Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 30)
        ).toISOString(), // random date within last 30 days
      };
    });

    return {
      count: results.length,
      results,
      note: `Mock search results generated for query "${searchQuery}"`,
    };
  },
});
