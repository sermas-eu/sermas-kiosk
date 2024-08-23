<script lang="ts">
  import { browser } from "$app/environment";
  import { appSettingsStore } from "$lib/store";
  import type { AudioClassificationValue } from "@sermas/toolkit";
  import type { AudioDetection } from "@sermas/toolkit/detection";
  import { SpeechDetectionEvent } from "@sermas/toolkit/detection";
  import { Logger } from "@sermas/toolkit/utils";
  import { onDestroy, onMount } from "svelte";

  import { toolkit } from "$lib";
  import type { AvatarAudioPlaybackStatus } from "@sermas/toolkit/avatar";
  import { sendStatus } from "@sermas/toolkit/events";

  const logger = new Logger("microphone");

  let enableMic: boolean;

  let started = false;
  let mounted = false;

  $: enableMic ? start() : stop();

  $: if ($appSettingsStore && $appSettingsStore.enableMic !== enableMic) {
    enableMic = $appSettingsStore.enableMic ? true : false;
  }

  let detection: AudioDetection | undefined;

  const onPlaybackChange = async (ev: AvatarAudioPlaybackStatus) => {
    const speechEnd = ev.status === "ended";
    if (speechEnd) {
      detection?.restore();
    } else {
      detection?.pause();
    }
    sendStatus(speechEnd ? "Microphone started" : "Microphone stopped");
  };

  const onButtonStartSession = async (ev: any) => {
    // if (ev.op === "started") {}
  };

  const onDetection = async (ev: SpeechDetectionEvent) => {
    logger.debug(`Speech detected`);
  };

  const onAudioClassification = async (
    detections: AudioClassificationValue[],
  ) => {
    logger.debug(
      `Audio classification ${detections.map((d) => `${d.value}: ${d.probability}%`)}`,
    );
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
      detection.on("speech", onDetection);
      detection.on("classification", onAudioClassification);
      await detection.start();
    }

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

    started = false;
  };

  onDestroy(stop);
  onMount(() => {
    mounted = true;
    start();
  });
</script>
