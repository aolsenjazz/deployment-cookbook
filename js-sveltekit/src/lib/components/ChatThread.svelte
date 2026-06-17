<script lang="ts">
  import { HttpAgentServerAdapter, provideStream } from "@langchain/svelte";
  import { untrack } from "svelte";

  import { getApiUrl } from "$lib/chat/threads-client";
  import Chat from "./Chat.svelte";

  const props: {
    threadId: string;
    onRunSettled: () => void;
  } = $props();
  const threadId = untrack(() => props.threadId);
  const onRunSettled = untrack(() => props.onRunSettled);

  const transport = new HttpAgentServerAdapter({
    apiUrl: getApiUrl(),
    threadId,
    paths: {
      commands: `/threads/${threadId}/commands`,
      stream: `/threads/${threadId}/stream`,
    },
  });

  provideStream({ transport, threadId });
</script>

<Chat {onRunSettled} />
