<script lang="ts">
    import { type VideoContentDto } from "@sermas/toolkit";

    interface Props {
        content: VideoContentDto;
    }

    let { content }: Props = $props();
</script>

<span class="video">
    <video>
        {#each content.sources as source}
            <source src={source} />
        {/each}
    </video>
</span>

<style>
</style>
