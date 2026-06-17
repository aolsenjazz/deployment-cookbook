<script lang="ts">
  import { onMount } from "svelte";

  import {
    type ThreadSummary,
    createThread,
    deleteThread,
    fetchThreads,
  } from "$lib/chat/threads-client";
  import ChatThread from "./ChatThread.svelte";
  import ThemeIcon from "./ThemeIcon.svelte";
  import ThreadHistory from "./ThreadHistory.svelte";

  let mounted = $state(false);
  let theme = $state<"dark" | "light">("dark");
  let threads = $state<ThreadSummary[]>([]);
  let threadId = $state("");

  async function refreshThreads() {
    threads = await fetchThreads();
  }

  onMount(() => {
    void (async () => {
      const list = await fetchThreads();
      if (list.length > 0) {
        threads = list;
        threadId = list[0].id;
      } else {
        const id = await createThread();
        threads = await fetchThreads();
        threadId = id;
      }
      mounted = true;
    })();
  });

  function handleSelect(id: string) {
    if (id !== threadId) threadId = id;
  }

  async function handleCreate() {
    const id = await createThread();
    await refreshThreads();
    threadId = id;
  }

  async function handleDelete(id: string) {
    await deleteThread(id);
    const list = await fetchThreads();
    threads = list;
    if (id !== threadId) return;
    if (list.length > 0) {
      threadId = list[0].id;
    } else {
      const freshId = await createThread();
      threads = await fetchThreads();
      threadId = freshId;
    }
  }
</script>

<div class={`app-shell ${theme === "light" ? "light" : ""}`}>
  <button
    aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    class="theme-toggle"
    onclick={() => (theme = theme === "dark" ? "light" : "dark")}
    type="button"
  >
    <ThemeIcon name={theme === "dark" ? "sun" : "moon"} />
  </button>

  {#if !mounted || !threadId}
    <div class="empty-state center">Preparing chat...</div>
  {:else}
    <ThreadHistory
      activeThreadId={threadId}
      onCreate={handleCreate}
      onDelete={handleDelete}
      onSelect={handleSelect}
      {threads}
    />

    {#key threadId}
      <ChatThread {threadId} onRunSettled={refreshThreads} />
    {/key}
  {/if}
</div>
