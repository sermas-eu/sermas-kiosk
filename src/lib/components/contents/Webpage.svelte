<script lang="ts">
    import { type WebpageContentDto } from "@sermas/toolkit";
    export let content: WebpageContentDto;
</script>

<span class="webpage">
    <iframe title="webpage" src={content.url} />
</span>

<style>
    iframe {
        width: 100%;
        height: 480px;
    }
</style>
