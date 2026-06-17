<script lang="ts">
  import "../app.css";

  let { children } = $props();
</script>

<svelte:head>
  <title>LangChain Deep Agent · SvelteKit</title>
  <meta
    name="description"
    content="Deploying a LangChain deep agent with SvelteKit: streaming chat, subagents, and per-thread history."
  />
</svelte:head>

{@render children()}
