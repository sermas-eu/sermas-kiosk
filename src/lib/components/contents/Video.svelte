<script lang="ts">
  import { type VideoContentDto } from "@sermas/toolkit";

  export let content: VideoContentDto;
</script>

<span class="video">
  <video controls autoplay>
    {#each content.sources as source}
      <source src={source} type={content.type} />
    {/each}
  </video>
</span>

<style>
</style>
