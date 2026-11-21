<script lang="ts">
    import { type LinkContentDto } from "@sermas/toolkit";

    interface Props {
        content: LinkContentDto;
    }

    let { content }: Props = $props();
</script>

<span class="link">
    <a href={content.url}>{content.label || content.url}</a>
</span>

<style>
</style>
