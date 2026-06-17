import type { RequestHandler } from "./$types";
import { getAgent, getCheckpointer } from "$lib/server/protocol/registry";
import { listThreads } from "$lib/server/protocol/threads";

/** `GET /api/threads` -- list every thread known to the checkpointer. */
export const GET: RequestHandler = async () => {
  const threads = await listThreads(getAgent().graph, getCheckpointer());
  return Response.json(threads);
};
