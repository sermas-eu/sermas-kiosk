<script lang="ts">
  import { backgroundImageAndSoundStore } from "#lib/store.ts";
  import { type BackgroundAudioDto } from "@sermas/api-client";

  export let content: BackgroundAudioDto;

  $: if (content.src && content.type) {
    $backgroundImageAndSoundStore.backgroundAudioUrl = content.src;
    $backgroundImageAndSoundStore.backgroundAudioType = content.type;
    $backgroundImageAndSoundStore.isBackgroundAudioPlaying = true;
  }
</script>
