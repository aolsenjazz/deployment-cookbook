<script lang="ts" module>
  import type { SubagentDiscoverySnapshot } from "@langchain/langgraph-sdk/stream";

  export type SubagentStatus = SubagentDiscoverySnapshot["status"];

  export type SubagentCard = {
    id: string;
    name: string;
    task?: string;
    status: SubagentStatus;
    openable: boolean;
  };
</script>

<script lang="ts">
  let {
    cards,
    onOpen,
  }: {
    cards: SubagentCard[];
    onOpen: (id: string) => void;
  } = $props();

  function statusLabel(status: SubagentStatus) {
    if (status === "running") return "Running";
    if (status === "complete") return "Complete";
    return "Error";
  }
</script>

{#if cards.length > 0}
  <div aria-label="Subagents" class="subagent-list">
    {#each cards as card (card.id)}
      <button
        class="subagent-chip"
        disabled={!card.openable}
        onclick={() => card.openable && onOpen(card.id)}
        type="button"
      >
        <span class="subagent-chip-head">
          <span class="subagent-chip-name">{card.name}</span>
          <span class={`subagent-status status-${card.status}`}>
            {statusLabel(card.status)}
          </span>
        </span>
        {#if card.task}
          <span class="subagent-chip-task">{card.task}</span>
        {/if}
      </button>
    {/each}
  </div>
{/if}
