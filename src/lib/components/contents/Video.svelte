<script lang="ts">
  import { type VideoContentDto } from "@sermas/toolkit";

  export let content: VideoContentDto;
</script>

<span class="video">
  <!-- svelte-ignore a11y-media-has-caption -->
  <video controls autoplay>
    {#each content.sources as source}
      <source src={source} type={content.type} />
    {/each}
  </video>
</span>

<style>
</style>
