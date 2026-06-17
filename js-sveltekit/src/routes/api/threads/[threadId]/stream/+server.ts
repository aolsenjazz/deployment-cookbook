import type { SubscribeParams } from "@langchain/protocol";
import type { RequestHandler } from "./$types";
import { getSessionStub } from "$lib/server/protocol/registry";

/** `POST /api/threads/:threadId/stream` -- open a filtered SSE subscription. */
export const POST: RequestHandler = async ({ request, params, platform }) => {
  const subscribeParams = (await request.json()) as SubscribeParams;
  const env = platform?.env;
  if (env?.SESSIONS == null) {
    return new Response("Missing SESSIONS Durable Object binding.", {
      status: 500,
    });
  }

  const stub = getSessionStub(env, params.threadId);
  return stub.fetch(
    new Request("https://session/stream", {
      method: "POST",
      body: JSON.stringify(subscribeParams),
    })
  );
};
