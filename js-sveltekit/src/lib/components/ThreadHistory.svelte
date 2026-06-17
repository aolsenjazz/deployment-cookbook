<script lang="ts">
  import type { ThreadSummary } from "$lib/chat/threads-client";

  let {
    threads,
    activeThreadId,
    onSelect,
    onCreate,
    onDelete,
  }: {
    threads: ThreadSummary[];
    activeThreadId: string;
    onSelect: (threadId: string) => void;
    onCreate: () => void;
    onDelete: (threadId: string) => void;
  } = $props();

  function formatTime(updatedAt: string | null) {
    if (!updatedAt) return "";
    const date = new Date(updatedAt);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }
</script>

<aside aria-label="Thread history" class="sidebar">
  <div class="sidebar-head">
    <span class="eyebrow">History</span>
    <button class="new-thread" onclick={onCreate} type="button">+ New</button>
  </div>

  <ul class="thread-list">
    {#if threads.length === 0}
      <li class="thread-empty">No conversations yet.</li>
    {/if}

    {#each threads as thread (thread.id)}
      <li
        class:active={thread.id === activeThreadId}
        class="thread-item"
      >
        <button
          class="thread-open"
          onclick={() => onSelect(thread.id)}
          type="button"
        >
          <span class="thread-title">{thread.title}</span>
          <span class="thread-time">{formatTime(thread.updatedAt)}</span>
        </button>
        <button
          aria-label="Delete conversation"
          class="thread-delete"
          onclick={() => onDelete(thread.id)}
          type="button"
        >
          &times;
        </button>
      </li>
    {/each}
  </ul>
</aside>
