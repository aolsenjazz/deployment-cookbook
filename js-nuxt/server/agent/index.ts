/**
 * Deep agent with delegating subagents.
 *
 * The Vue layer (`@langchain/vue`) discovers subagents from the `task` tool
 * lifecycle events that `deepagents` emits. By giving the coordinator no direct
 * tools and pushing the real capabilities into named subagents (`researcher`,
 * `math-whiz`), every lookup or calculation is delegated through the `task`
 * tool — which is exactly what surfaces as a subagent card in the UI.
 *
 * The agent is compiled with an in-memory `MemorySaver` checkpointer so the
 * Nitro backend can persist and rehydrate per-thread conversation state. The
 * checkpointer is the single source of truth for the thread list — see the
 * note in `server/utils/runtime.ts`.
 */

import { MemorySaver } from "@langchain/langgraph";
import { createDeepAgent } from "deepagents";

import { coordinatorModel, subagentModel } from "./model";
import { calculator, searchWeb } from "./tools";

/**
 * In-memory checkpointer — the single source of truth for threads.
 *
 * Exported so the server can enumerate threads (via `checkpointer.storage`) and
 * delete them (`checkpointer.deleteThread`). It is process-local and volatile:
 * restarting the server clears every thread.
 */
export const checkpointer = new MemorySaver();

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

export type Agent = typeof agent;
