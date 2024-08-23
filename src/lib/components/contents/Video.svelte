<script lang="ts">
    import { type VideoContentDto } from "@sermas/toolkit";

    export let content: VideoContentDto;
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
