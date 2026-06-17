import type { RequestHandler } from "./$types";
import { getAgent } from "$lib/server/protocol/registry";
import {
  ThreadNotFoundError,
  getThreadState,
  updateThreadState,
} from "$lib/server/protocol/threads";

/** `GET /api/threads/:threadId/state` -- read checkpointed thread state. */
export const GET: RequestHandler = async ({ params }) => {
  try {
    const state = await getThreadState(getAgent().graph, params.threadId);
    return Response.json(state);
  } catch (error) {
    if (error instanceof ThreadNotFoundError) {
      return Response.json(
        { error: "not_found", message: error.message },
        { status: 404 }
      );
    }
    throw error;
  }
};

/** `POST /api/threads/:threadId/state` -- create or update thread state. */
export const POST: RequestHandler = async ({ request, params }) => {
  const body = (await request.json().catch(() => ({}))) as {
    values?: Record<string, unknown> | null;
    checkpoint?: Record<string, unknown> | null;
    as_node?: string;
  };
  try {
    const state = await updateThreadState(getAgent().graph, params.threadId, {
      values: body.values ?? null,
      checkpoint: body.checkpoint ?? null,
      asNode: body.as_node,
    });
    return Response.json(state);
  } catch (error) {
    return Response.json(
      { error: "invalid_state_update", message: String(error) },
      { status: 422 }
    );
  }
};
