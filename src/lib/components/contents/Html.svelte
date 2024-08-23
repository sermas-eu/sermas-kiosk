<script lang="ts">
    import { type HtmlContentDto } from "@sermas/toolkit";

    export let content: HtmlContentDto;
</script>

<span class="html">
    {@html content.html}
</span>

<style>
</style>
