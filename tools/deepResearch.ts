import { tool } from "ai";
import { z } from "zod";
import { tavily } from "@tavily/core";

// Multi-query deep research tool - LLM provides the queries
export const deepResearchTool = tool({
  description:
    "Conduct deep research by executing multiple search queries in parallel. You must provide an array of diverse search queries to cover different aspects of the topic. Returns aggregated results from all queries with deduplication.",
  inputSchema: z.object({
    queries: z
      .array(z.string())
      .min(3)
      .max(10)
      .describe(
        "Array of diverse search queries to execute in parallel. Each query should cover a different aspect or angle of the research topic."
      ),
    searchDepth: z
      .enum(["basic", "advanced"])
      .default("advanced")
      .describe("Search depth for all queries"),
    maxResultsPerQuery: z
      .number()
      .default(10)
      .describe("Maximum results per individual query (5-10)"),
  }),
  execute: async ({ queries, searchDepth, maxResultsPerQuery }) => {
    try {
      const tvly = tavily({
        apiKey: process.env.TAVILY_API_KEY!,
      });

      // Execute all searches in parallel
      const searchPromises = queries.map((query) =>
        tvly
          .search(query, {
            searchDepth: searchDepth,
            includeAnswer: true,
            includeRawContent: "text",
            maxResults: Math.min(maxResultsPerQuery, 10),
          })
          .then((response) => ({
            query,
            response,
          }))
      );

      const searchResults = await Promise.all(searchPromises);

      // Aggregate all results
      const allResults = searchResults.flatMap(({ query, response }) =>
        response.results.map((result) => ({
          sourceQuery: query,
          title: result.title,
          url: result.url,
          content: result.content,
          rawContent: result.rawContent || result.content,
          score: result.score,
          publishedDate: result.publishedDate || null,
        }))
      );

      // Deduplicate by URL
      const uniqueResults = Array.from(
        new Map(allResults.map((item) => [item.url, item])).values()
      );

      // Collect all AI-generated quick answers
      const quickAnswers = searchResults
        .map(({ query, response }) => ({
          query,
          answer: response.answer,
        }))
        .filter((item) => item.answer !== null && item.answer !== undefined);

      return {
        queriesExecuted: queries,
        totalSourcesFound: uniqueResults.length,
        uniqueSources: uniqueResults.sort((a, b) => b.score - a.score),
        quickAnswers,
        executionTime: searchResults.reduce(
          (sum, { response }) => sum + (response.responseTime || 0),
          0
        ),
      };
    } catch (error) {
      console.error("Deep research error:", error);
      throw new Error(
        `Deep research failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },
});
