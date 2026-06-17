<script lang="ts">
  import {
    stringifyArgs,
    type ToolCallStatus,
    type ToolCallView,
  } from "$lib/chat/message-helpers";

  let { call }: { call: ToolCallView } = $props();
  let open = $state(false);

  function statusLabel(status: ToolCallStatus) {
    if (status === "running") return "Running";
    if (status === "error") return "Error";
    return "Done";
  }
</script>

<div class={`toolcall status-${call.status}`}>
  <button
    aria-expanded={open}
    class="toolcall-head"
    onclick={() => (open = !open)}
    type="button"
  >
    <span class="toolcall-icon">
      <svg
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.6"
        viewBox="0 0 24 24"
      >
        <path d="M14.7 6.3a4 4 0 0 1-5.4 5.4L4 17v3h3l5.3-5.3a4 4 0 0 1 5.4-5.4l-2.7 2.7-1.4-1.4 2.7-2.7a4 4 0 0 0-1.6.4z" />
      </svg>
    </span>
    <span class="toolcall-name">{call.name}</span>
    <span class={`subagent-status status-${call.status}`}>
      {statusLabel(call.status)}
    </span>
    <span aria-hidden="true" class="toolcall-chevron">
      {open ? "v" : ">"}
    </span>
  </button>

  {#if open}
    <div class="toolcall-body">
      <div class="toolcall-section">
        <span>Input</span>
        <pre>{stringifyArgs(call.args)}</pre>
      </div>
      {#if call.output != null && call.output !== ""}
        <div class="toolcall-section">
          <span>Output</span>
          <pre>{call.output}</pre>
        </div>
      {/if}
    </div>
  {/if}
</div>
