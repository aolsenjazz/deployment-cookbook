/**
 * Browser-side thread helpers for a Managed Deep Agent.
 *
 * The UI streams from a hosted Managed Deep Agent identified by
 * `LANGSMITH_MANAGED_AGENT_ID`. `Client.getLangGraphClient({ agentId })` from
 * `@langchain/managed-deepagents` returns a `@langchain/langgraph-sdk` client
 * that rewrites thread and run requests onto the `/v1/deepagents` routes, so
 * the rest of the UI uses the familiar LangGraph SDK surface.
 */

import { Client } from "@langchain/langgraph-sdk";
import { Client as ManagedClient } from "@langchain/managed-deepagents";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function readManagedAgentIdEnv(): string | undefined {
  return import.meta.env.LANGSMITH_MANAGED_AGENT_ID?.trim() || undefined;
}

/** Managed Deep Agent id (UUID) printed by `pnpm run deploy`. */
export function getManagedAgentId(): string | undefined {
  const value = readManagedAgentIdEnv();
  if (!value || !UUID_RE.test(value)) return undefined;
  return value;
}

/** Human-readable config error when the env var is set but not a UUID. */
export function getManagedAgentIdError(): string | undefined {
  const value = readManagedAgentIdEnv();
  if (!value || UUID_RE.test(value)) return undefined;
  return `LANGSMITH_MANAGED_AGENT_ID must be the UUID printed by \`pnpm run deploy\`, not the agent name. Got "${value}".`;
}

export function getApiKey(): string | undefined {
  return import.meta.env.LANGSMITH_API_KEY?.trim() || undefined;
}

/**
 * Build the LangGraph SDK client the UI streams from, bound to the hosted
 * Managed Deep Agent.
 *
 * NOTE: shipping a LangSmith API key to the browser is fine for a local demo,
 * but in production route requests through your own backend with a custom
 * `fetch` instead of exposing the key.
 */
export function createStreamClient(): Client {
  const agentId = getManagedAgentId();
  if (!agentId) {
    const configError = getManagedAgentIdError();
    throw new Error(
      configError ??
        "LANGSMITH_MANAGED_AGENT_ID is not set. Deploy with `pnpm run deploy` and set the printed agent id."
    );
  }
  return new ManagedClient({ apiKey: getApiKey() }).getLangGraphClient({
    agentId,
  });
}

/** Summary of a thread for the history sidebar. */
export type ThreadSummary = {
  id: string;
  title: string;
  updatedAt: string | null;
};

const UNTITLED = "New conversation";

function deriveTitle(values: unknown): string {
  if (typeof values !== "object" || values == null) return UNTITLED;
  const messages = (values as { messages?: unknown }).messages;
  if (!Array.isArray(messages)) return UNTITLED;
  for (const message of messages) {
    if (typeof message !== "object" || message == null) continue;
    const record = message as { type?: string; content?: unknown };
    if (record.type !== "human") continue;
    const { content } = record;
    const text =
      typeof content === "string"
        ? content
        : Array.isArray(content)
          ? content
              .map((block) =>
                typeof block === "object" &&
                block != null &&
                "text" in block &&
                typeof (block as { text?: unknown }).text === "string"
                  ? (block as { text: string }).text
                  : ""
              )
              .join("")
          : "";
    const trimmed = text.trim();
    if (trimmed) return trimmed.slice(0, 80);
  }
  return UNTITLED;
}

/**
 * Fetch threads, newest first.
 *
 * Managed Deep Agents (private preview) does not mirror the Agent Server's
 * thread-search and per-thread-state endpoints, so the history sidebar is
 * best-effort: search failures yield an empty list and titles fall back to
 * "New conversation".
 */
export async function fetchThreads(): Promise<ThreadSummary[]> {
  const client = createStreamClient();
  let threads: Awaited<ReturnType<typeof client.threads.search>>;
  try {
    threads = await client.threads.search({
      limit: 100,
      sortBy: "updated_at",
      sortOrder: "desc",
    });
  } catch {
    return [];
  }

  const summaries: ThreadSummary[] = [];
  for (const thread of threads) {
    let title = UNTITLED;
    try {
      const state = await client.threads.getState(thread.thread_id);
      title = deriveTitle(state.values);
    } catch {
      // Thread may have no checkpoint yet (or state is not exposed).
    }
    summaries.push({
      id: thread.thread_id,
      title,
      updatedAt: thread.updated_at ?? null,
    });
  }
  return summaries;
}

/** Create a thread on the hosted agent. */
export async function createThread(): Promise<string> {
  const thread = await createStreamClient().threads.create({});
  return thread.thread_id;
}

/** Delete a thread. Managed preview may not support deletion, so ignore failures. */
export async function deleteThread(threadId: string): Promise<void> {
  try {
    await createStreamClient().threads.delete(threadId);
  } catch {
    // Managed preview may not expose thread deletion.
  }
}
