<script lang="ts">
  import type { BaseMessage } from "@langchain/core/messages";
  import type { SubagentDiscoverySnapshot } from "@langchain/langgraph-sdk/stream";
  import { getStream, useMessages } from "@langchain/svelte";

  import MessageThread from "./MessageThread.svelte";
  import StreamingIndicator from "./StreamingIndicator.svelte";

  const props: {
    snapshot: SubagentDiscoverySnapshot;
  } = $props();

  const stream = getStream();
  // The detail panel remounts when the namespace changes, so keep this
  // selector target stable while status/output updates stream in.
  // svelte-ignore state_referenced_locally
  const scopedMessages = useMessages(stream, {
    namespace: [...props.snapshot.namespace],
  });
  const visibleMessages = $derived(
    omitTaskHumanMessage(scopedMessages.current, props.snapshot.taskInput)
  );

  function omitTaskHumanMessage(
    messages: BaseMessage[],
    taskInput?: string
  ): BaseMessage[] {
    const task = taskInput?.trim();
    if (!task) return messages;
    return messages.filter(
      (message) => message.type !== "human" || message.text?.trim() !== task
    );
  }
</script>

{#if props.snapshot.taskInput}
  <div class="subagent-prompt">
    <span>Task</span>
    <p>{props.snapshot.taskInput}</p>
  </div>
{/if}

<MessageThread
  isLoading={props.snapshot.status === "running"}
  messages={visibleMessages}
/>

{#if props.snapshot.status === "running" && visibleMessages.length === 0}
  <StreamingIndicator />
{/if}
