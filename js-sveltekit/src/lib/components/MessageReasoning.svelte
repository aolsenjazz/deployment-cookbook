<script lang="ts">
  import TypingDots from "./TypingDots.svelte";

  let { reasoning, active }: { reasoning: string; active: boolean } = $props();
  let open = $state(false);

  $effect(() => {
    open = active;
  });
</script>

<div class={`reasoning ${open ? "open" : ""}`}>
  <button
    aria-expanded={open}
    class="reasoning-toggle"
    onclick={() => (open = !open)}
    type="button"
  >
    <span aria-hidden="true" class="reasoning-caret">&gt;</span>
    <span aria-hidden="true" class="reasoning-icon">
      <svg
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.6"
        viewBox="0 0 24 24"
      >
        <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
        <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
        <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
        <path d="M6 18a4 4 0 0 1-1.967-.516" />
        <path d="M19.967 17.484A4 4 0 0 1 18 18" />
      </svg>
    </span>
    <span class="reasoning-label">Thinking</span>
    {#if active}
      <TypingDots className="inline-dots reasoning-dots" />
    {/if}
  </button>
  {#if open}
    <p class="reasoning-text">{reasoning}</p>
  {/if}
</div>
