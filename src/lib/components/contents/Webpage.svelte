<script lang="ts">
    import { type WebpageContentDto } from "@sermas/toolkit";
    interface Props {
        content: WebpageContentDto;
    }

    let { content }: Props = $props();
</script>

<span class="webpage">
    <iframe title="webpage" src={content.url}></iframe>
</span>

<style>
    iframe {
        width: 100%;
        height: 480px;
    }
</style>
