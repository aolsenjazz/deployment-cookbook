import "server-only";

import { MemorySaver } from "@langchain/langgraph";
import { createDeepAgent } from "deepagents";

import { calculator, searchWeb } from "./tools";
import { coordinatorModel, subagentModel } from "./model";

/**
 * In-memory checkpointer — the single source of truth for threads.
 *
 * Exported so the server can enumerate threads (via `checkpointer.storage`) and
 * delete them (`checkpointer.deleteThread`). It is process-local and volatile:
 * restarting the server clears every thread.
 */
export const checkpointer = new MemorySaver();

/**
 * A "deep agent" coordinator with two subagents.
 *
 * `createDeepAgent` gives the coordinator a built-in `task` tool that it uses
 * to delegate work to named subagents. Each delegated `task` call runs as a
 * namespaced sub-run, so the Agent Streaming Protocol relays its `messages`
 * and `tools` events under a subagent namespace. The `@langchain/react` SDK
 * surfaces those as `stream.subagents`, which the UI renders in dedicated
 * cards.
 *
 * Let'sThe agent is compiled with an in-memory `MemorySaver` checkpointer so the
 * backend can persist and rehydrate per-thread conversation state. Swap this
 * for a durable checkpointer (Postgres, SQLite, …) before deploying — see the
 * note in `lib/server/registry.ts`.
 */
export const agent = createDeepAgent({
  model: coordinatorModel,
  checkpointer,
  subagents: [
    {
      name: "researcher",
      description:
        "Researches a topic using the search_web tool and reports concise findings.",
      tools: [searchWeb],
      model: subagentModel,
      systemPrompt:
        "You are the researcher subagent. Use the search_web tool to look up " +
        "the requested topic, then summarize the findings in two or three " +
        "sentences. Always call search_web at least once before answering.",
    },
    {
      name: "math-whiz",
      description:
        "Performs calculations using the calculator tool and explains the result.",
      tools: [calculator],
      model: subagentModel,
      systemPrompt:
        "You are the math-whiz subagent. Use the calculator tool to evaluate " +
        "the requested expression, then state the result clearly. Always call " +
        "the calculator tool before answering.",
    },
  ],
  systemPrompt:
    "You are a helpful coordinator. When a request involves looking something " +
    "up, delegate it to the `researcher` subagent. When it involves math, " +
    "delegate it to the `math-whiz` subagent. You may run both subagents for a " +
    "single request. After the subagents respond, combine their results into a " +
    "short, clearly labeled final answer.",
});

/** The compiled agent type, re-exported for `useStreamContext<typeof agent>()`. */
export type Agent = typeof agent;
