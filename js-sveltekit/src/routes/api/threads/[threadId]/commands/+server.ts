import type { Command, CommandResponse, ErrorResponse } from "@langchain/protocol";
import type { RequestHandler } from "./$types";
import { parseRunInput, startAgentRun } from "$lib/server/protocol/runs";

/** `POST /api/threads/:threadId/commands` -- handle Agent Protocol commands. */
export const POST: RequestHandler = async ({ request, params, platform }) => {
  const command = (await request.json()) as Command;
  if (command.method !== "run.start") {
    return Response.json({
      type: "error",
      id: command.id,
      error: "unknown_command",
      message: `Unsupported command: ${command.method}`,
    } satisfies ErrorResponse);
  }

  if (platform?.env.SESSIONS == null) {
    return Response.json(
      { error: "missing_binding", message: "Missing SESSIONS Durable Object binding." },
      { status: 500 }
    );
  }

  const runId = crypto.randomUUID();
  const run = startAgentRun(
    platform.env,
    params.threadId,
    parseRunInput(command),
    runId
  );
  platform.context.waitUntil(run);

  return Response.json({
    type: "success",
    id: command.id,
    result: { run_id: runId },
  } satisfies CommandResponse);
};
