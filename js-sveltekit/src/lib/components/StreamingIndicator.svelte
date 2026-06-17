<script lang="ts" module>
  import type { BaseMessage } from "@langchain/core/messages";

  export function shouldShowTypingIndicator(
    messages: BaseMessage[],
    isLoading: boolean
  ) {
    if (!isLoading) return false;

    const last = messages.at(-1);
    if (!last) return true;
    if (last.type === "human" || last.type === "tool") return true;
    if (last.type === "ai" && !last.text?.trim()) return true;
    return false;
  }
</script>

<script lang="ts">
  import TypingDots from "./TypingDots.svelte";
</script>

<div aria-label="Loading response" class="streaming-indicator" role="status">
  <TypingDots />
</div>
