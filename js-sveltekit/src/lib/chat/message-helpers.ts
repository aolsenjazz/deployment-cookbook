import { AIMessage, type BaseMessage } from "@langchain/core/messages";

export type ToolCallLike = {
  name: string;
  args?: Record<string, unknown>;
  id?: string;
};

export type ToolCallStatus = "running" | "complete" | "error";

export type ToolCallView = {
  id: string;
  name: string;
  args: Record<string, unknown>;
  output?: string;
  status: ToolCallStatus;
};

export function messageLabel(message: { type: string; name?: string }) {
  if (message.type === "human") return "You";
  if (message.type === "tool") return `Tool · ${message.name ?? "result"}`;
  if (message.type === "ai") return "Assistant";
  return message.type;
}

export function formatToolArgs(args: Record<string, unknown>) {
  const entries = Object.entries(args);
  if (entries.length === 0) return "";
  if (entries.length === 1) return String(entries[0]?.[1] ?? "");
  return JSON.stringify(args);
}

export function stringifyArgs(args: Record<string, unknown>) {
  try {
    return JSON.stringify(args, null, 2);
  } catch {
    return String(args);
  }
}

export function getToolCalls(message: BaseMessage): ToolCallLike[] {
  return AIMessage.isInstance(message)
    ? ((message.tool_calls ?? []) as ToolCallLike[])
    : [];
}

/**
 * Extract reasoning-summary text from an AI message.
 */
export function getReasoningText(message: BaseMessage): string {
  if (!AIMessage.isInstance(message)) return "";
  try {
    return message.contentBlocks
      .filter(
        (block): block is { type: "reasoning"; reasoning: string } =>
          (block as { type?: string })?.type === "reasoning"
      )
      .map((block) => block.reasoning)
      .join("")
      .trim();
  } catch {
    return "";
  }
}
