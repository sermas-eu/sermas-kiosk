<script lang="ts">
  import { renderMarkdown } from "$lib/util";
  import { type TextContentDto } from "@sermas/toolkit";
  export let content: TextContentDto;

  let renderedContent: string;
  const renderText = async (text: string) => {
    renderedContent = await renderMarkdown(text);
  };
  $: if (content && content.text) renderText(content.text);
</script>

<span class="text content text-wrap">
  {@html renderedContent}
</span>

<style lang="scss">
  .text-wrap {
    text-align: left;
    cursor: auto;
    white-space: wrap;
  }
</style>
