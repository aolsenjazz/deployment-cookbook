/**
 * Process-local runtime that owns the compiled agent and one
 * {@link LocalThreadSession} per thread id.
 *
 * In the React/Vite reference this lived in a standalone Hono `CustomServer`.
 * Under Nuxt the Agent Streaming Protocol is served by Nitro route handlers, so
 * the shared agent + session registry is a module singleton instead.
 *
 * The agent's in-memory `MemorySaver` checkpointer is the single source of
 * truth for threads: the server enumerates threads from it (`GET /api/threads`)
 * and deletes them through it ({@link deleteThread}).
 *
 * NOTE: This is in-memory and process-local. A serverless/multi-instance
 * deployment needs a durable checkpointer (Postgres, SQLite, …) and a shared
 * session/replay store. The wiring here stays the same; only the checkpointer
 * in `server/agent/index.ts` and this store change.
 */

import type { MemorySaver } from "@langchain/langgraph";

import { agent, checkpointer, type Agent } from "../agent";
import { LocalThreadSession } from "./session";

const sessions = new Map<string, LocalThreadSession>();

export function getAgent(): Agent {
  return agent;
}

/** The shared checkpointer — the single source of truth for threads. */
export function getCheckpointer(): MemorySaver {
  return checkpointer;
}

/** Get or create the process-local session for a thread. */
export function getThreadSession(threadId: string): LocalThreadSession {
  let session = sessions.get(threadId);
  if (session == null) {
    session = new LocalThreadSession(agent, threadId);
    sessions.set(threadId, session);
  }
  return session;
}

/** Delete a thread: remove its session and its checkpointed state. */
export async function deleteThread(threadId: string): Promise<void> {
  sessions.delete(threadId);
  await checkpointer.deleteThread(threadId);
}
