<script lang="ts">
  import { HumanMessage } from "@langchain/core/messages";
  import type { SubagentDiscoverySnapshot } from "@langchain/langgraph-sdk/stream";
  import { getStream } from "@langchain/svelte";

  import Conversation from "./Conversation.svelte";
  import SubagentDetail from "./SubagentDetail.svelte";

  const EXAMPLE_PROMPT =
    "Research LangGraph streaming, and separately calculate 42 * 17.";

  let {
    onRunSettled,
  }: {
    onRunSettled: () => void;
  } = $props();

  const stream = getStream();
  let content = $state(EXAMPLE_PROMPT);
  let openSubagentId = $state<string | null>(null);
  let textarea: HTMLTextAreaElement | undefined = $state();
  let wasLoading = $state(false);

  const subagents = $derived(
    [...stream.subagents.values()] as SubagentDiscoverySnapshot[]
  );
  const openSubagent = $derived(
    openSubagentId
      ? subagents.find((snapshot) => snapshot.id === openSubagentId)
      : undefined
  );

  $effect(() => {
    if (wasLoading && !stream.isLoading) onRunSettled();
    wasLoading = stream.isLoading;
  });

  function autoGrow() {
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  }

  function handleSubmit() {
    const nextContent = content.trim();
    if (nextContent.length === 0 || stream.isLoading) return;

    content = "";
    if (textarea) textarea.style.height = "auto";
    void stream.submit({
      messages: [new HumanMessage(nextContent)],
    });
  }
</script>

{#if openSubagent}
  <main class="chat-main">
    <nav aria-label="Breadcrumb" class="breadcrumb">
      <button
        class="crumb-link"
        onclick={() => (openSubagentId = null)}
        type="button"
      >
        Main chat
      </button>
      <span class="crumb-sep">/</span>
      <span class="crumb-current">{openSubagent.name}</span>
    </nav>
    <div class="conversation">
      <div class="conversation-inner">
        {#key openSubagent.namespace.join("/")}
          <SubagentDetail snapshot={openSubagent} />
        {/key}
      </div>
    </div>
  </main>
{:else}
  <main class="chat-main">
    <div class="conversation">
      <div class="conversation-inner">
        <Conversation onOpenSubagent={(id) => (openSubagentId = id)} />
      </div>
    </div>

    <div class="composer-bar">
      <form
        class="composer"
        onsubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
      >
        <textarea
          aria-label="Message"
          bind:this={textarea}
          bind:value={content}
          oninput={autoGrow}
          onkeydown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="Ask for research, a calculation, or both..."
          rows="1"
        ></textarea>
        <button disabled={content.trim() === "" || stream.isLoading} type="submit">
          Send
        </button>
      </form>
    </div>
  </main>
{/if}
