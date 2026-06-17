<script lang="ts">
  import { AIMessage, type BaseMessage } from "@langchain/core/messages";
  import type { SubagentDiscoverySnapshot } from "@langchain/langgraph-sdk/stream";

  import {
    getReasoningText,
    getToolCalls,
    type ToolCallLike,
    type ToolCallView,
  } from "$lib/chat/message-helpers";
  import MessageBubble from "./MessageBubble.svelte";
  import MessageReasoning from "./MessageReasoning.svelte";
  import SubagentList, { type SubagentCard } from "./SubagentList.svelte";
  import ToolCall from "./ToolCall.svelte";

  const TASK_TOOL = "task";

  let {
    messages,
    isLoading,
    subagentsById = new Map<string, SubagentDiscoverySnapshot>(),
    onOpenSubagent,
  }: {
    messages: BaseMessage[];
    isLoading: boolean;
    subagentsById?: Map<string, SubagentDiscoverySnapshot>;
    onOpenSubagent?: (id: string) => void;
  } = $props();

  const resultsByCallId = $derived.by(() => {
    const map = new Map<string, BaseMessage>();
    for (const message of messages) {
      if (message.type !== "tool") continue;
      const id = (message as { tool_call_id?: unknown }).tool_call_id;
      if (typeof id === "string") map.set(id, message);
    }
    return map;
  });

  function subagentCards(tasks: ToolCallLike[]): SubagentCard[] {
    return tasks.map((call, index) => {
      const snapshot = call.id ? subagentsById.get(call.id) : undefined;
      const args = (call.args ?? {}) as Record<string, unknown>;
      return {
        id: call.id ?? `task-${index}`,
        name: snapshot?.name ?? String(args.subagent_type ?? "subagent"),
        task:
          snapshot?.taskInput ??
          (typeof args.description === "string" ? args.description : undefined),
        status: snapshot?.status ?? "running",
        openable: snapshot != null,
      };
    });
  }

  function toolCallView(
    call: ToolCallLike,
    messageIndex: number,
    callIndex: number
  ): ToolCallView {
    const result = call.id ? resultsByCallId.get(call.id) : undefined;
    const errored = (result as { status?: string } | undefined)?.status === "error";
    return {
      id: call.id ?? `${messageIndex}-${callIndex}`,
      name: call.name,
      args: call.args ?? {},
      output: result?.text,
      status: result ? (errored ? "error" : "complete") : isLoading
        ? "running"
        : "complete",
    };
  }
</script>

{#each messages as message, index (message.id ?? index)}
  {#if message.type !== "tool"}
    {#if AIMessage.isInstance(message)}
      {@const reasoning = getReasoningText(message)}
      {@const calls = getToolCalls(message)}
      {@const tasks = calls.filter((call) => call.name === TASK_TOOL)}
      {@const chipCalls = onOpenSubagent
        ? calls.filter((call) => call.name !== TASK_TOOL)
        : calls}

      {#if reasoning}
        {@const reasoningActive =
          isLoading &&
          index === messages.length - 1 &&
          !message.text?.trim() &&
          calls.length === 0}
        <MessageReasoning active={reasoningActive} {reasoning} />
      {/if}

      {#if message.text?.trim()}
        <MessageBubble {message} toolCalls={[]} />
      {/if}

      {#if onOpenSubagent && tasks.length > 0}
        <SubagentList
          cards={subagentCards(tasks)}
          onOpen={onOpenSubagent}
        />
      {/if}

      {#each chipCalls as call, callIndex (call.id ?? `${index}-${callIndex}`)}
        <ToolCall call={toolCallView(call, index, callIndex)} />
      {/each}
    {:else}
      <MessageBubble {message} />
    {/if}
  {/if}
{/each}
