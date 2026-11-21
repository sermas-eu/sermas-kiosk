<script lang="ts">
  import { backgroundImageAndSoundStore } from "#lib/store.ts";
  import { untrack } from "svelte";
  import { type BackgroundAudioDto } from "@sermas/api-client";

  interface Props {
    content: BackgroundAudioDto;
  }

  let { content }: Props = $props();

  $effect(() => {
    const { src, type } = content;
    if (!src || !type) return;
    untrack(() =>
      backgroundImageAndSoundStore.update((bg) => ({
        ...bg,
        backgroundAudioUrl: src,
        backgroundAudioType: type,
        isBackgroundAudioPlaying: true,
      })),
    );
  });
</script>
