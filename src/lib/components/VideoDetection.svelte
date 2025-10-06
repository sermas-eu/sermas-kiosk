<script lang="ts">
  import { browser } from "$app/environment";
  import { toolkit } from "$lib";
  import { appSettingsStore, sessionIdStore } from "$lib/store";
  import {
    HumanDetector,
    QrcodeDetector,
    type HumanDetectionResult,
  } from "@sermas/toolkit/detection";
  import { AppSettings } from "@sermas/toolkit/dto";

  import type { FaceLandmarkDetectorResult } from "@sermas/toolkit/detection";
  import { HolisticDetector } from "@sermas/toolkit/detection";
  import { emitter, sendStatus } from "@sermas/toolkit/events";
  import { Logger, type PerformanceEvent } from "@sermas/toolkit/utils";
  import { onDestroy, onMount } from "svelte";

  const logger = new Logger("VideoDetection");

  const ENABLE_HUMAN_DETECTOR = true;

  let enableTestFaces: boolean;
  let sessionId: string | undefined;
  let testFace: string;
  let enableVideoDetection: boolean;
  let showVideo = false;
  let mirrorMode: boolean;
  let detectorFaceLandmarker: boolean;
  let detectorHuman: boolean;
  let qrcode: boolean;

  const S_KEY = "KeyS";
  let blendShapeLog = false;
  let mounted = false;
  let started = false;

  const videoDetection = toolkit.getVideoDetection();
  let faceLandmarkerModule: any;

  let appId: string;

  let video: HTMLVideoElement | undefined;
  let canvas: HTMLCanvasElement | undefined;

  let isDevMode = false;

  const width = 640;
  const height = 480;

  const updateSettings = (settings: AppSettings) => {
    isDevMode = settings.devMode;
    showVideo = settings.showVideo;
    enableTestFaces = settings.enableTestFaces;
    testFace = settings.testFace;
    enableVideoDetection = settings.enableVideoDetection;
    showVideo = settings.showVideo;
    mirrorMode = settings.enableMirrorMode;
    detectorFaceLandmarker = settings.detectorFaceLandmarker;
    detectorHuman = settings.detectorHuman;
    qrcode = settings.qrcode;
  };

  $: if ($appSettingsStore) updateSettings($appSettingsStore);

  $: if (showVideo !== undefined && enableVideoDetection && videoDetection)
    videoDetection.toggleRender(showVideo);

  $: if (mirrorMode !== undefined && videoDetection && browser)
    toggleMirrorMode();

  $: if (detectorFaceLandmarker !== undefined && videoDetection && browser)
    toggleFaceLandmarker();

  $: if (detectorHuman !== undefined && videoDetection && browser)
    toggleHuman();

  $: if (qrcode !== undefined && videoDetection && browser) toggleQrcode();

  const createHuman = () =>
    new HumanDetector(
      {
        detectionThreshold: 1000,
      },
      () =>
        new Worker(
          new URL("@sermas/toolkit/detectors/human.worker", import.meta.url),
          { type: "module" },
        ),
    );

  const toggleHuman = () => {
    // let's wait for holistic to be part of @mediapipe/tasks-vision
    // see https://github.com/google/mediapipe/issues/2506

    if (!ENABLE_HUMAN_DETECTOR) {
      logger.warn(`Human detector disabled`);
      return;
    }

    if (detectorHuman) {
      videoDetection.add(createHuman());
    } else {
      videoDetection.remove("human");
    }
  };

  const loadFaceLandmarker = async () => {
    if (faceLandmarkerModule) return;
    faceLandmarkerModule = await import(
      "@sermas/toolkit/detectors/face-landmarker"
    );
  };

  const toggleFaceLandmarker = async () => {
    if (detectorFaceLandmarker) {
      await loadFaceLandmarker();
      videoDetection.add(new faceLandmarkerModule.FaceLandmarkDetector());
    } else {
      videoDetection.remove("faceLandmark");
    }
  };

  const toggleQrcode = () => {
    if (qrcode) {
      videoDetection.add(
        new QrcodeDetector({
          detectionThreshold: 1000,
        }),
      );
    } else {
      videoDetection.remove("qrcode");
    }
  };

  const toggleMirrorMode = () => {
    // let's wait for holistic to be part of @mediapipe/tasks-vision
    // see https://github.com/google/mediapipe/issues/2506
    if (mirrorMode) {
      videoDetection.add(new HolisticDetector());
    } else {
      videoDetection.remove("holistic_v1");
    }
  };

  const onPerformance = async (ev: PerformanceEvent) => {
    // if (ev.status === "degraded") {
    //   logger.warn("Disabling video detecions");
    //   enableVideoDetection = false;
    //   return;
    // }
  };

  const onXRSession = async (ev: "start" | "stop" | "error") => {
    logger.log(`XR session ${ev} event, toggle video detection`);
    if (ev === "start" || ev === "stop") {
      enableVideoDetection = ev !== "start";
    }
  };

  const handleSaveFaceLandmarks = () => {
    window.removeEventListener("keydown", logFaceBlendshapes);
    if (isDevMode) {
      logger.warn(`[DEV] Use ${S_KEY} to print face blendshapes`);
      window.addEventListener("keydown", logFaceBlendshapes);
    }
  };

  const setTestFace = (testFace: string) => {
    logger.debug(`Set test face ${testFace}`);
    emitter.emit("avatar.face", null, testFace);
  };

  $: enableVideoDetection ? start() : stop();

  $: if (enableVideoDetection && detectorFaceLandmarker && isDevMode)
    handleSaveFaceLandmarks();

  $: if (testFace) setTestFace(testFace);

  const start = async () => {
    if (!browser) return;
    if (!enableVideoDetection) return;
    if (!mounted) return;
    if (started) return;
    started = true;
    logger.debug("Start video");

    const app = await toolkit.getApp();
    if (app) appId = app.appId;

    sessionId = $sessionIdStore;
    canvas = document.getElementById("overlay") as HTMLCanvasElement;
    video = document.getElementById("inputVideo") as HTMLVideoElement;

    await init(video);
  };

  const stop = async () => {
    showVideo = false;
    if (!browser) return;
    if (enableVideoDetection) return;
    if (!started) return;
    logger.debug(`Stop video`);

    if (videoDetection) await videoDetection.destroy();
    started = false;
  };

  onMount(() => {
    mounted = true;

    // track FPS drops
    emitter.on("performance", onPerformance);
    emitter.on("xr.session", onXRSession);

    start();
  });

  onDestroy(() => {
    emitter.off("performance", onPerformance);
    emitter.off("xr.session", onXRSession);

    window.removeEventListener("keypress", logFaceBlendshapes);

    stop();
  });

  const init = async (video: HTMLVideoElement) => {
    sendStatus("Loading video detector");

    // videoDetection.add(createHuman());

    // const faceLandmarker = await import(
    //   "@sermas/toolkit/detection/video/mediapipe/v2/face-landmarker"
    // );
    // videoDetection.add(new faceLandmarker.FaceLandmarkDetector());

    await videoDetection.init({
      // default, overriden by each detector config
      detectionThreshold: 2000,
      render: showVideo,
      canvas,
      camera: {
        video,
        width,
        height,
      },
    });
    sendStatus("");

    videoDetection.on("faceLandmark", (result: FaceLandmarkDetectorResult) => {
      if (!result.faceBlendshapes || !result.faceBlendshapes.length) return;

      // const blendShapesList: string[] = result.faceBlendshapes[0].categories.map(b => b.categoryName)
      // logger.debug(blendShapesList);

      // print face blendshape to log on keypress
      if (blendShapeLog) {
        logger.log(JSON.stringify(result.faceBlendshapes[0].categories));
        blendShapeLog = false;
      }

      if (!enableTestFaces) {
        toolkit.emit("avatar.face", result.faceBlendshapes[0].categories);
      }
    });

    videoDetection.on("holistic_v1", (ev: HumanDetectionResult) => {
      toolkit.emit("detection.pose", ev);
    });
  };

  const logFaceBlendshapes = (ev: KeyboardEvent) => {
    if (ev.code !== S_KEY) return;
    blendShapeLog = !blendShapeLog;
  };
</script>

<div id="main-content" class={!showVideo ? "invisible" : ""}>
  <video id="inputVideo" autoplay muted {width} {height} />
  <canvas id="overlay" {width} {height} />
</div>

<style>
  #main-content {
    position: fixed;
    right: 15px;
    top: 20px;
    width: 640px;
    height: 480px;
    z-index: 10;
  }

  #inputVideo,
  #overlay {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
  }
  #overlay {
    z-index: 2;
    background-color: rgba(255, 0, 0, 0.1);
  }
  .invisible {
    visibility: hidden;
  }
</style>
