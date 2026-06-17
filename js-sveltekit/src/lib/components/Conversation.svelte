<script lang="ts">
  import type { SubagentDiscoverySnapshot } from "@langchain/langgraph-sdk/stream";
  import { getStream } from "@langchain/svelte";

  import MessageThread from "./MessageThread.svelte";
  import StreamingIndicator, {
    shouldShowTypingIndicator,
  } from "./StreamingIndicator.svelte";

  let {
    onOpenSubagent,
  }: {
    onOpenSubagent: (id: string) => void;
  } = $props();

  const stream = getStream();
  const messages = $derived(stream.messages.filter((message) => message != null));
  const subagentsById = $derived.by(() => {
    const map = new Map<string, SubagentDiscoverySnapshot>();
    for (const snapshot of stream.subagents.values()) {
      map.set(snapshot.id, snapshot);
    }
    return map;
  });
  const showTypingIndicator = $derived(
    shouldShowTypingIndicator(messages, stream.isLoading)
  );
</script>

{#if messages.length === 0 && !stream.error}
  <div class="empty-state">
    Ask a question below. The coordinator will delegate to its subagents and
    stream tokens, tool calls, and results.
  </div>
{/if}

<MessageThread
  isLoading={stream.isLoading}
  {messages}
  {onOpenSubagent}
  {subagentsById}
/>

{#if showTypingIndicator}
  <StreamingIndicator />
{/if}

{#if messages.length === 0 && !stream.isLoading && stream.error}
  <div class="error">
    Could not reach the agent API. Make sure the dev server is running and
    <code>OPENAI_API_KEY</code> is set, then try again.
  </div>
{/if}
