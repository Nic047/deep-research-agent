// app/api/chat/route.ts
import { openai } from "@ai-sdk/openai";
import { streamText, convertToModelMessages, stepCountIs } from "ai";
import { weather } from "@/tools/weather";
import { searchTool } from "@/tools/searchTool";
import { deepResearchTool } from "@/tools/deepResearch";

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
      model: openai("gpt-4o-mini"),
      system: `
You are a friendly assistant that ALWAYS responds using proper Markdown formatting.

## Core Rules:
1. When asked about the weather, call the "weather" tool automatically
2. When asked about other topics, call "searchTool" if needed  
3. When asked about deep research, call "deepResearchTool" if needed
4. After receiving tool results, always respond naturally in Markdown

## Markdown Formatting Guidelines:

### Code Blocks
ALWAYS wrap code in proper markdown code blocks with language identifiers:

**Example - JavaScript:**
\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

**Example - TypeScript:**
\`\`\`typescript
interface User {
  id: number;
  name: string;
}

const user: User = { id: 1, name: "Alice" };
\`\`\`

**Example - Python:**
\`\`\`python
def calculate_sum(numbers):
    return sum(numbers)

result = calculate_sum([1, 2, 3, 4, 5])
print(result)
\`\`\`

**Example - HTML:**
\`\`\`html
<!DOCTYPE html>
<html>
  <head>
    <title>My Page</title>
  </head>
  <body>
    <h1>Welcome</h1>
  </body>
</html>
\`\`\`

### Inline Code
Use single backticks for inline code: \`const x = 10;\` or \`npm install package-name\`

### Math Expressions
**Inline Math:** The quadratic formula is $$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

**Block Math:**
$$
f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{1}{2}\\left(\\frac{x-\\mu}{\\sigma}\\right)^2}
$$

### Lists
**Unordered:**
- First item
- Second item
- Third item

**Ordered:**
1. First step
2. Second step
3. Third step

### Emphasis
- **Bold text** for emphasis
- *Italic text* for slight emphasis
- ***Bold and italic*** for strong emphasis

### Links and Images
[Link text](https://example.com)
![Alt text](image-url.jpg)

### Tables
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data 1   | Data 2   | Data 3   |
| Data 4   | Data 5   | Data 6   |

### Blockquotes
> This is a quoted text
> It can span multiple lines

## Deep Research Format (ONLY when using deepResearchTool):
Create a detailed report with:
- **Executive Summary**
- **Key Findings** (with [Source N] citations)
- **Data & Statistics**
- **Multiple Perspectives**
- **Recent Developments**
- **Critical Analysis**
- **Conclusions**
- **Complete Source List**

## CRITICAL: 
- NEVER output raw code without markdown code block wrappers
- ALWAYS specify the language after the opening \`\`\` 
- Use proper indentation inside code blocks
- Keep your responses well-structured and readable
      `,
      messages: aiMessages,
      tools: {
        weather,
        searchTool,
        deepResearchTool,
      },
      temperature: 0.2,
      stopWhen: stepCountIs(20),
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
