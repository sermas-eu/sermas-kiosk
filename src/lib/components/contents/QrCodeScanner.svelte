<script lang="ts">
  import { toolkit } from "$lib";
  import { sessionIdStore } from "$lib/store";
  import { QrcodeDetector, VideoDetection } from "@sermas/toolkit/detection";
  import { onDestroy, onMount } from "svelte";
    // import VideoDetection from "../VideoDetection.svelte";

  let appId: string;
  let sessionId: string | undefined;

  let video: HTMLVideoElement | undefined;
  let canvas: HTMLCanvasElement | undefined;

  const videoDetection = toolkit.getVideoDetection();
  let qrCodeDetector: QrcodeDetector
  
  document.getElementById('main-content-qr')?.remove();

  const start = async () => {
    const app = await toolkit.getApp();
    if (app) appId = app.appId;

    sessionId = $sessionIdStore;
    canvas = document.getElementById(
      "qrcode-scanner-overlay"
    ) as HTMLCanvasElement;
    video = document.getElementById("qrcode-scanner") as HTMLVideoElement;

    qrCodeDetector = new QrcodeDetector({
      detectionThreshold: 500,
    });

    await videoDetection.add(qrCodeDetector);

    await videoDetection.init({
      // default, overriden by each detector config
      detectionThreshold: 2000,
      render: true,
      canvas,
      camera: {
        video,
        width: 100,
        height: 100,
      },
    });
    videoDetection.toggleRender(true);
  };

  const stop = async () => {
    await videoDetection.remove(qrCodeDetector.getType());
  };

  onMount(start);
  onDestroy(stop);
</script>

<div id="main-content-qr">
  <video id="qrcode-scanner" autoplay muted width={"100%"} height={"100%"}></video>
  <canvas id="qrcode-scanner-overlay" width={0} height={0}></canvas>
</div>

<style>
  #main-content-qr {
    width: 100%;
    height: 100%;
    z-index: 1;
  }
  #qrcode-scanner-overlay {
    width: 0;
    height: 0;
  }
</style>
