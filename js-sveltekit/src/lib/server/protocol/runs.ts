import type { ProtocolEvent } from "@langchain/langgraph/stream";
import type { ReactAgent } from "langchain";

import { getAgent, getSessionStub } from "./registry";
import { isRecord, sanitizeForJson } from "./serialize";

// `ReactAgent<any>` accepts both `createAgent` results and DeepAgent instances.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyReactAgent = ReactAgent<any>;

type AgentRunInput = Parameters<AnyReactAgent["streamEvents"]>[0];

function sanitizeEvent(event: ProtocolEvent): ProtocolEvent {
  const params = event.params as Record<string, unknown>;
  const sanitizedParams: Record<string, unknown> = {
    ...params,
    data: sanitizeForJson(params.data),
  };
  if ("interrupts" in params) {
    sanitizedParams.interrupts = sanitizeForJson(params.interrupts);
  }
  return { ...event, params: sanitizedParams } as ProtocolEvent;
}

function serializeError(error: unknown): unknown {
  if (error instanceof AggregateError) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      errors: error.errors.map(serializeError),
    };
  }
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: serializeError(error.cause),
    };
  }
  return error;
}

/**
 * Start an agent run on the Worker and fan protocol events into the thread's
 * Durable Object for SSE replay.
 */
export async function startAgentRun(
  env: App.Platform["env"],
  threadId: string,
  input: unknown,
  runId: string
) {
  const stub = getSessionStub(env, threadId);
  const activeAgent = getAgent() as AnyReactAgent;

  const run = await activeAgent.streamEvents(input as AgentRunInput, {
    version: "v3",
    configurable: { thread_id: threadId, run_id: runId },
  });

  try {
    for await (const rawEvent of run) {
      const event = sanitizeEvent({
        ...(rawEvent as ProtocolEvent),
        type: "event",
      } as ProtocolEvent);
      await stub.fetch(
        new Request("https://session/publish", {
          method: "POST",
          body: JSON.stringify(event),
        })
      );
    }
  } catch (error) {
    console.error("Agent run failed", serializeError(error));
  }
}

/** Parse the `run.start` command payload accepted by `/commands`. */
export function parseRunInput(command: { params?: unknown }): AgentRunInput | undefined {
  if (!isRecord(command.params)) return undefined;
  return command.params.input as AgentRunInput;
}
