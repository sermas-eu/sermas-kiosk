<script lang="ts">
    import { type HtmlContentDto } from "@sermas/toolkit";

    interface Props {
        content: HtmlContentDto;
    }

    let { content }: Props = $props();
</script>

<span class="html">
    {@html content.html}
</span>

<style>
</style>
