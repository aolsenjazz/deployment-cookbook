import type { RequestHandler } from "./$types";
import { deleteThread } from "$lib/server/protocol/registry";

/** `DELETE /api/threads/:threadId` -- drop a thread's session and checkpoints. */
export const DELETE: RequestHandler = async ({ params, platform }) => {
  const env = platform?.env;
  if (env?.SESSIONS == null) {
    return new Response("Missing SESSIONS Durable Object binding.", {
      status: 500,
    });
  }

  await deleteThread(env, params.threadId);
  return new Response(null, { status: 204 });
};
