<script lang="ts">
  import { renderMarkdown } from "#lib/util.ts";
  import { type TextContentDto } from "@sermas/toolkit";
  interface Props {
    content: TextContentDto;
  }

  let { content }: Props = $props();

  let renderedContent: string = $state()!;
  const renderText = async (text: string) => {
    renderedContent = await renderMarkdown(text);
  };
  $effect(() => {
    if (content && content.text) renderText(content.text);
  });
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
