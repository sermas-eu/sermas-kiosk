<script lang="ts">
  import { browser } from "$app/environment";
  import { appSettingsStore } from "$lib/store";
  import type {
    AudioDetection,
    SpeechSampleResult,
  } from "@sermas/toolkit/detection";
  import { Logger } from "@sermas/toolkit/utils";
  import { onDestroy, onMount } from "svelte";

  import { toolkit } from "$lib";

  const logger = new Logger("microphone");

  let enableMic: boolean;
  let pushToTalkEnabled: boolean;

  let started = false;
  let mounted = false;

  let avatarSpeaking = false;

  $: enableMic ? start(): stop();

  $: if ($appSettingsStore && $appSettingsStore.enableMic !== enableMic) {
    enableMic = $appSettingsStore.enableMic ? true : false;
  }

  $: if ($appSettingsStore && $appSettingsStore.pushToTalkEnabled !== pushToTalkEnabled) {
    pushToTalkEnabled = $appSettingsStore.pushToTalkEnabled ? true : false;
    if (pushToTalkEnabled) pause();
  }

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

  const onAvatarSpeakingChanged = async (isSpeaking: boolean) => {
    avatarSpeaking = isSpeaking;
  };

  const onUserSpeechClassification = (detection: { speech: boolean }) => {
    if (detection.speech) {
      if (!avatarSpeaking) {
        // pause the avatar and await for a STOP/CONTINUE depending on the backend audio detection
        logger.debug(`User speech detected, pausing avatar`);
        toolkit.getAvatar()?.getHandler()?.pauseSpeech();
      }
    } else {
      logger.debug(`User not speaking, resuming avatar`);
      toolkit.getAvatar()?.getHandler()?.resumeSpeech();
    }

    // notify UI of speaking status
    toolkit?.getUI()?.userSpeaking({
      status: "completed",
    });
  };

  const onUserSpeaking = (sample: SpeechSampleResult) => {
    if (sample.isSpeaking && avatarSpeaking) {
      logger.debug("Possible user speaking, pause avatar");
      toolkit.getAvatar()?.getHandler()?.pauseSpeech();
    }

    // notify UI of speaking status
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
    toolkit.on("ui.avatar.speaking", onAvatarSpeakingChanged);
  };

  export const stop = async () => {
    if (enableMic && !pushToTalkEnabled) return;
    if (!started) return;

    detection?.stop();
    detection = undefined;

    toolkit.off("ui.avatar.speaking", onAvatarSpeakingChanged);
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
</script>
