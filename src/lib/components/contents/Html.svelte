<script lang="ts">
    import { sanitizeHtml } from "#lib/util.ts";
    import { type HtmlContentDto } from "@sermas/toolkit";

    interface Props {
        content: HtmlContentDto;
    }

    let { content }: Props = $props();
</script>

<span class="html">
    {@html sanitizeHtml(content.html)}
</span>

<style>
</style>
