<script lang="ts">
  import { browser } from "$app/environment";
  import { appSettingsStore } from "$lib/store";
  import type { AudioDetection } from "@sermas/toolkit/detection";
  import { Logger } from "@sermas/toolkit/utils";
  import { onDestroy, onMount } from "svelte";

  import { toolkit } from "$lib";
  import type { AvatarAudioPlaybackStatus } from "@sermas/toolkit/avatar";
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

  const onPlaybackChange = async (ev: AvatarAudioPlaybackStatus) => {
    avatarSpeaking = ev.status !== "ended";
    // if (avatarSpeechEnded) {
    //   detection?.restore();
    // } else {
    //   detection?.pause();
    // }
  };

  const onSpeechDetected = (detection: { speech: boolean }) => {
    // console.warn("onSpeech --------", detection);
    if (detection.speech) {
      toolkit.getUI().stopAvatarSpeech();
    } else {
      toolkit.getAvatar()?.getHandler()?.resumeSpeech();
    }
  };
  const onSpeaking = (userSpeaking: boolean, speechLength: number) => {
    // logger.debug(
    //   `avatarSpeaking=${avatarSpeaking} speechLength=${speechLength} userSpeaking=${userSpeaking}`,
    // );
    if (speechLength > 1000) {
      toolkit.getAvatar()?.getHandler()?.pauseSpeech();
    } else {
      toolkit.getAvatar()?.getHandler()?.resumeSpeech();
    }
    if (userSpeaking) {
      sendStatus("Listening...");
    } else {
      sendStatus("");
    }
  };

  const onButtonStartSession = async (ev: any) => {
    // if (ev.op === "started") {}
  };

  // const onDetection = async (ev: SpeechDetectionEvent) => {
  //   logger.debug(`Speech detected`);
  // };

  // const onAudioClassification = async (
  //   detections: AudioClassificationValue[],
  // ) => {
  //   logger.debug(
  //     `Audio classification ${detections.map((d) => `${d.value}: ${d.probability}%`)}`,
  //   );
  // };

  const start = async () => {
    if (!browser) return;
    if (!enableMic) return;
    if (started) return;
    if (!mounted) return;
    started = true;

    if (!detection) {
      logger.debug(`Load audio detection`);
      detection = toolkit.getAudioDetection();

      // detection.on("speech", onDetection);
      // detection.on("classification", onAudioClassification);

      detection.on("speaking", onSpeaking);
      await detection.start();

      const vadOption = detection.getVADConfig();
      logger.debug(`VAD config: ${JSON.stringify(vadOption)}`);
    }

    toolkit.on("detection.speech", onSpeechDetected);
    toolkit.on("avatar.speech", onPlaybackChange);
    toolkit.on("ui.button.session", onButtonStartSession);
  };

  const stop = async () => {
    if (enableMic) return;
    if (!started) return;

    detection?.stop();
    detection = undefined;

    toolkit.off("avatar.speech", onPlaybackChange);
    toolkit.off("ui.button.session", onButtonStartSession);

    toolkit.off("detection.speech", onSpeechDetected);

    started = false;
  };

  onDestroy(stop);
  onMount(() => {
    mounted = true;
    start();
  });
</script>
