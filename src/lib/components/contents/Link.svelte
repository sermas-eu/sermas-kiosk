<script lang="ts">
    import { type LinkContentDto } from "@sermas/toolkit";

    export let content: LinkContentDto;
</script>

<span class="link">
    <a href={content.url}>{content.label || content.url}</a>
</span>

<style>
</style>
