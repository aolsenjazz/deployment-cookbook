<script lang="ts">
  import type { BaseMessage } from "@langchain/core/messages";
  import {
    formatToolArgs,
    getToolCalls,
    messageLabel,
    type ToolCallLike,
  } from "$lib/chat/message-helpers";

  let {
    message,
    toolCalls,
  }: {
    message: BaseMessage;
    toolCalls?: ToolCallLike[];
  } = $props();

  const calls = $derived(toolCalls ?? getToolCalls(message));
</script>

<div
  class={`message ${message.type === "human" ? "user" : ""} ${
    message.type === "tool" ? "tool" : ""
  }`}
>
  <span>{messageLabel(message)}</span>
  {#if calls.length > 0}
    <ul class="tool-call-list">
      {#each calls as toolCall, toolIndex (toolCall.id ?? toolIndex)}
        {@const args = formatToolArgs(toolCall.args ?? {})}
        <li>
          <strong>{toolCall.name}</strong>{args ? `(${args})` : ""}
        </li>
      {/each}
    </ul>
  {/if}
  {#if message.text}
    <p>{message.text}</p>
  {/if}
</div>
