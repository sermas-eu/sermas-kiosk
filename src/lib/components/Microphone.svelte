<script lang="ts">
  import { browser } from "$app/env";
  import { appSettingsStore } from "#lib/store.ts";
  import type {
    AudioDetection,
    SpeechSampleResult,
  } from "@sermas/toolkit/detection";
  import { Logger } from "@sermas/toolkit/utils";
  import { onDestroy, onMount, untrack } from "svelte";

  import { toolkit } from "#lib";

  const logger = new Logger("microphone");

  // undefined until the app settings are loaded
  let enableMic: boolean | undefined = $derived(
    $appSettingsStore ? !!$appSettingsStore.enableMic : undefined,
  );
  let pushToTalkEnabled: boolean | undefined = $derived(
    $appSettingsStore ? !!$appSettingsStore.pushToTalkEnabled : undefined,
  );

  let started = false;
  let mounted = false;

  let detection: AudioDetection | undefined;

  export const pause = () => {
    if (detection) {
      detection.pause();
    }
  };

  export const restore = () => {
    if (detection) {
      detection.restore();
    }
  };

  // talking over the avatar (barge-in) is handled by the toolkit's audio
  // detection: it lowers the avatar's voice and the API answers STOP or CONTINUE.
  // Here only the UI is told.
  const onUserSpeechClassification = () => {
    toolkit?.getUI()?.userSpeaking({
      status: "completed",
    });
  };

  const onUserSpeaking = (sample: SpeechSampleResult) => {
    toolkit?.getUI()?.userSpeaking({
      status: sample.isSpeaking ? "speaking" : "noise",
    });
  };

  export const start = async () => {
    if (!browser) return;
    if (!enableMic) return;
    if (started) return;
    if (!mounted) return;
    
    if (!detection) {
      logger.debug(`Load audio detection`);
      detection = toolkit.getAudioDetection();

      detection.on("speaking", onUserSpeaking);
      await detection.start();
      
      if ($appSettingsStore.pushToTalkEnabled) {
        logger.debug(`Push to talk enabled, pausing detection`);
        detection.pause();
      }
    }
    started = true;
    
    toolkit.on("detection.speech", onUserSpeechClassification);
  };

  export const stop = async () => {
    if (enableMic && !pushToTalkEnabled) return;
    if (!started) return;

    detection?.stop();
    detection = undefined;

    toolkit.off("detection.speech", onUserSpeechClassification);

    started = false;
  };

  onDestroy(() => {
    stop();
    mounted = false;
  });
  onMount(() => {
    mounted = true;
    start();
  });
  // pre: like the former `$:`, the first run happens before onMount (a no-op
  // there, since start() needs `mounted`); only enableMic is a dependency
  $effect.pre(() => {
    const on = enableMic;
    untrack(() => (on ? start() : stop()));
  });
  $effect.pre(() => {
    if (pushToTalkEnabled) untrack(pause);
  });
</script>
