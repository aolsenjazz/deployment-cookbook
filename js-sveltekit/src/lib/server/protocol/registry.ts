import { agent, checkpointer } from "$lib/server/agent";

/** The shared, compiled agent and its checkpointer. */
export function getAgent() {
  return agent;
}

/** The shared checkpointer -- the single source of truth for threads. */
export function getCheckpointer() {
  return checkpointer;
}

/** Resolve the per-thread Durable Object stub for SSE replay. */
export function getSessionStub(env: App.Platform["env"], threadId: string) {
  const sessions = env.SESSIONS;
  if (sessions == null) {
    throw new Error("Missing SESSIONS Durable Object binding.");
  }
  const id = sessions.idFromName(threadId);
  return sessions.get(id);
}

/** Delete a thread: remove its session and its checkpointed state. */
export async function deleteThread(
  env: App.Platform["env"],
  threadId: string
): Promise<void> {
  await checkpointer.deleteThread(threadId);
  const stub = getSessionStub(env, threadId);
  await stub.fetch(new Request("https://session/clear", { method: "POST" }));
}
