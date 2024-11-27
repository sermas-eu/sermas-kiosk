<script lang="ts">
  import { type DialogueMessageDto } from "@sermas/toolkit";

  import DOMPurify from "dompurify";
  import { marked } from "marked";

  export let message: DialogueMessageDto;

  let content: string;

  const renderMarkdown = async (text: string) => {
    content = DOMPurify.sanitize(await marked.parse(text));
  };

  $: if (message && message.text) renderMarkdown(message.text);
</script>

<span class="message-{message.messageId || 'none'} subtitle"
  >{@html content}</span
>

<style>
  .subtitle {
  }
</style>
