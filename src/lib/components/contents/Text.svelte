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

<span class="text">
    {@html renderedContent}
</span>

<style>
    :global(ul) {
        list-style: revert;
    }
    :global(li) {
        padding: revert;
    }
</style>
