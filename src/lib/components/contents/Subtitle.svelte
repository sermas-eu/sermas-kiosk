<script lang="ts">
  import { type DialogueActor } from "@sermas/toolkit/dto";

  import DOMPurify from "dompurify";
  import { marked } from "marked";

  export let content;
  export let actor: DialogueActor | null;

  let mex: string;

  const renderMarkdown = async (text: string) => {
    mex = DOMPurify.sanitize(await marked.parse(text));
  };

  $: if (content && content.text) renderMarkdown(content.text);
</script>

<span class="message-{content.messageId || 'none'} subtitle">
  {@html mex}
</span>

<style>
  .subtitle {
  }
</style>
