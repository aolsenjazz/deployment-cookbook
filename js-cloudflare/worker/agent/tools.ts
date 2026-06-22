import { tool } from "langchain";
import { evaluate } from "mathjs";
import { z } from "zod";

export const searchWeb = tool(
  async ({ query }) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return JSON.stringify({
      results: [
        {
          title: `Result for: ${query}`,
          snippet:
            "LangGraph streaming sends token deltas on the messages channel " +
            "and tool lifecycle events on the tools channel.",
        },
      ],
    });
  },
  {
    name: "search_web",
    description: "Search the web for information about a topic.",
    schema: z.object({ query: z.string().describe("Search query.") }),
  }
);

// mathjs parses and evaluates without dynamic code generation, so it is safe
// on the Cloudflare Workers runtime (which disallows new Function / eval).
function evaluateExpression(expression: string): number {
  const normalized = expression
    .replace(/[×✕✖]/g, "*")
    .replace(/[÷]/g, "/")
    .replace(/[−–—]/g, "-");

  const result = evaluate(normalized);
  if (typeof result !== "number" || !Number.isFinite(result)) {
    throw new Error("Expression did not evaluate to a finite number.");
  }
  return result;
}

export const calculator = tool(
  async ({ expression }) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    try {
      return String(evaluateExpression(expression));
    } catch (error) {
      return `Error evaluating: ${expression} (${String(error)})`;
    }
  },
  {
    name: "calculator",
    description: "Evaluate a math expression.",
    schema: z.object({
      expression: z.string().describe("Math expression to evaluate."),
    }),
  }
);
