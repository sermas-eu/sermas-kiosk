<script lang="ts">
  import { backgroundImageAndSoundStore } from "#lib/store.ts";
  import { type ImageContentDto } from "@sermas/toolkit";
  import { untrack } from "svelte";

  interface Props {
    img: ImageContentDto;
  }

  let { img }: Props = $props();
  $effect(() => {
    if (!img.isBackground) return;
    const src = img.src;
    // write only: the store is not a dependency of this effect
    untrack(() =>
      backgroundImageAndSoundStore.update((bg) => {
        if (bg.image !== "stream") bg.defaultImage = bg.image;
        bg.image = "stream";
        bg.messageImage = true;
        bg.urlImage = src;
        return bg;
      }),
    );
  });
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
