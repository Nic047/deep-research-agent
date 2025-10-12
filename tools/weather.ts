import { tool } from "ai";
import { z } from "zod";

export const weather = tool({
  description: "Get the weather in a location in Celsius",
  inputSchema: z.object({
    location: z.string().describe("The location to get the weather for"),
  }),
  execute: async ({ location }) => {
    const temperature = 72 + Math.floor(Math.random() * 21) - 10;
    return { location, temperature };
  },
});
