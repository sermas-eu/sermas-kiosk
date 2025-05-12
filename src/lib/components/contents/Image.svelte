<script lang="ts">
  import { backgroundImageAndSoundStore } from "$lib/store";
  import { type ImageContentDto } from "@sermas/toolkit";
  import { get } from "svelte/store";

  export let img: ImageContentDto;
  $: if (img.isBackground) {
    if (get(backgroundImageAndSoundStore).image !== "stream") {
      $backgroundImageAndSoundStore.defaultImage = get(
        backgroundImageAndSoundStore,
      ).image;
    }
    $backgroundImageAndSoundStore.image = "stream";
    $backgroundImageAndSoundStore.messageImage = true;
    $backgroundImageAndSoundStore.urlImage = img.src;
  }
</script>

{#if !img.isBackground}
  <span class="image-wrapper is-flex is-justify-content-center">
    <span class="image" style="width: {img.width}px; height: {img.height}px;">
      <img src={img.src} alt={img.alt} width={img.width} height={img.height} />
    </span>
  </span>
{/if}

<style lang="scss">
</style>
