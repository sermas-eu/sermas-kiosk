<script lang="ts">
    import { sanitizeHtml } from "#lib/util.ts";
    import { type HtmlContentDto } from "@sermas/toolkit";

    export let content: HtmlContentDto;
</script>

<span class="html">
    {@html sanitizeHtml(content.html)}
</span>

<style>
</style>
