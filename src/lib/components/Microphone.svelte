<script lang="ts">
  import { browser } from "$app/environment";
  import { appSettingsStore } from "$lib/store";
  import type { AudioDetection } from "@sermas/toolkit/detection";
  import { Logger } from "@sermas/toolkit/utils";
  import { onDestroy, onMount } from "svelte";

  import { toolkit } from "$lib";
  import { sendStatus } from "@sermas/toolkit/events";

  const logger = new Logger("microphone");

  let enableMic: boolean;

  let started = false;
  let mounted = false;

  let avatarSpeaking = false;

  $: enableMic ? start() : stop();

  $: if ($appSettingsStore && $appSettingsStore.enableMic !== enableMic) {
    enableMic = $appSettingsStore.enableMic ? true : false;
  }

  let detection: AudioDetection | undefined;

  const onAvatarSpeakingChanged = async (isSpeaking: boolean) => {
    avatarSpeaking = isSpeaking;
  };

  const onSpeechDetected = (detection: { speech: boolean }) => {
    if (detection.speech) {
      // toolkit.getAvatar()?.getHandler()?.pauseSpeech();
      toolkit.getAvatar()?.getHandler()?.stopSpeech();
    } else {
      toolkit.getAvatar()?.getHandler()?.resumeSpeech();
    }

    // notify UI of speaking status
    toolkit?.getUI()?.userSpeaking({
      status: "completed",
    });
  };
  const onSpeaking = (userSpeaking: boolean, speechLength: number) => {
    const isSpeaking = userSpeaking && speechLength > 1000;
    if (isSpeaking) {
      toolkit.getAvatar()?.getHandler()?.pauseSpeech();
    } else {
      toolkit.getAvatar()?.getHandler()?.resumeSpeech();
    }
    if (userSpeaking) {
      sendStatus("Listening...");

      // notify UI of speaking status
      toolkit?.getUI()?.userSpeaking({
        status: isSpeaking ? "speaking" : "noise",
      });
    } else {
      sendStatus("");
    }
  };

  const start = async () => {
    if (!browser) return;
    if (!enableMic) return;
    if (started) return;
    if (!mounted) return;
    started = true;

    if (!detection) {
      logger.debug(`Load audio detection`);
      detection = toolkit.getAudioDetection();

      detection.on("speaking", onSpeaking);
      await detection.start();

      const vadOption = detection.getVADConfig();
      logger.debug(`VAD config: ${JSON.stringify(vadOption)}`);
    }

    toolkit.on("detection.speech", onSpeechDetected);
    toolkit.on("ui.avatar.speaking", onAvatarSpeakingChanged);
  };

  const stop = async () => {
    if (enableMic) return;
    if (!started) return;

    detection?.stop();
    detection = undefined;

    toolkit.off("ui.avatar.speaking", onAvatarSpeakingChanged);
    toolkit.off("detection.speech", onSpeechDetected);

    started = false;
  };

  onDestroy(stop);
  onMount(() => {
    mounted = true;
    start();
  });
</script>
