<script lang="ts">
  let { className = "typing-dots" }: { className?: string } = $props();
</script>

<span aria-hidden="true" class={className}>
  <span></span>
  <span></span>
  <span></span>
</span>
