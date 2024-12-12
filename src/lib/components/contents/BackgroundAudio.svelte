<script lang="ts">
  import { backgroundImageAndSoundStore } from "$lib/store";
  import { type BackgroundAudioDto } from "@sermas/api-client";

  export let content: BackgroundAudioDto;

  $: if (content.src && content.type) {
    $backgroundImageAndSoundStore.backgroudAudioUrl = content.src;
    $backgroundImageAndSoundStore.backgroudAudioType = content.type;
    $backgroundImageAndSoundStore.isBackgroudAudioPlaying = true;
  }
</script>
