import { Client } from "@langchain/langgraph-sdk/client";

/** LangGraph SDK base URL. Route handlers live under `/api/threads/...`. */
export function getApiUrl(): string {
  return `${window.location.origin}/api`;
}

/** Summary of a thread for the history sidebar. */
export type ThreadSummary = {
  id: string;
  title: string;
  updatedAt: string | null;
};

/** Fetch every thread from the server, newest first. */
export async function fetchThreads(): Promise<ThreadSummary[]> {
  const response = await fetch(`${getApiUrl()}/threads`, { cache: "no-store" });
  if (!response.ok) return [];
  return (await response.json()) as ThreadSummary[];
}

async function ensureThreadExists(threadId: string) {
  const client = new Client({ apiUrl: getApiUrl() });
  try {
    await client.threads.getState(threadId);
  } catch (error) {
    const status = (error as { status?: number })?.status;
    if (status !== 404) throw error;
    await client.threads.updateState(threadId, { values: { messages: [] } });
  }
}

/** Mint a new thread and bootstrap its checkpoint on the server. */
export async function createThread(): Promise<string> {
  const id = crypto.randomUUID();
  await ensureThreadExists(id);
  return id;
}

/** Delete a thread on the server. */
export async function deleteThread(threadId: string): Promise<void> {
  await fetch(`${getApiUrl()}/threads/${threadId}`, { method: "DELETE" });
}
