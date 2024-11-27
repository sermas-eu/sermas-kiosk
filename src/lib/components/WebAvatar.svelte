<script lang="ts">
  import { browser } from "$app/environment";
  import { toolkit } from "$lib";
  import {
    appConfigStore,
    appSettingsStore,
    avatarLoadedStore,
    avatarModelStore,
  } from "$lib/store";
  import { type RepositoryConfigDto } from "@sermas/toolkit";
  import {
    getAvatarDefaultConfig,
    type AvatarModelConfig,
  } from "@sermas/toolkit/avatar";
  import { AppSettings } from "@sermas/toolkit/dto";
  import { emitter } from "@sermas/toolkit/events";
  import {
    Logger,
    addGlobal,
    type PerformanceEvent,
  } from "@sermas/toolkit/utils";
  import { onDestroy, onMount } from "svelte";
  import Loader from "./Loader.svelte";

  let enableAudio: boolean;
  let enableAvatar: boolean;
  let enableAnimation: boolean;
  let enableMirrorMode: boolean;
  let avatar: string;
  let animation: string;
  let animationList: string[] = [];

  let mounted = false;
  let started = false;

  let rpmUrl: string | undefined = undefined;
  let rpmGender: string | undefined = undefined;

  let repository: RepositoryConfigDto;

  let background: string = "";
  let backgroundImageUrl: string = "";

  const logger = new Logger("WebAvatar");

  const updateSettings = (settings: AppSettings) => {
    background = settings.background;
    avatar = settings.avatar;

    enableAvatar = settings.enableAvatar;
    enableAnimation = settings.enableAnimation;
    enableMirrorMode = settings.enableMirrorMode;
    rpmUrl = settings.rpmUrl;
    rpmGender = settings.rpmGender;
    avatar = settings.avatar;
    animation = settings.animation;
    animationList = settings.animationList;
    enableAudio = settings.enableAudio;
  };

  $: if ($appSettingsStore) updateSettings($appSettingsStore);

  $: enableAudio, $avatarModelStore?.toggleAudio(enableAudio);
  $: enableAvatar ? start() : stop();
  $: enableAnimation ? enableAnim(true) : enableAnim();
  $: enableMirrorMode ? enableMirror(true) : enableMirror();
  $: avatar && repository, reload();
  $: rpmUrl || rpmGender, reload();
  $: animation, triggerAnimation(animation);
  $: background, setBackground(background);

  $: if ($appConfigStore) {
    // logger.debug("app config", $appConfigStore);
    repository = $appConfigStore.repository;
  }

  const onPerformance = (ev: PerformanceEvent) => {
    if (!$avatarModelStore) return;
    if (ev.status === "degraded") {
      logger.warn(`Performance degraded, stopping animations`);
      $avatarModelStore.setAnimationEnabled(false);
    }
    if (ev.status === "restored") {
      logger.log(`Performance restored, starting animations`);
      $avatarModelStore.setAnimationEnabled(true);
    }
  };

  const enableAnim = (enable = false) => {
    logger.debug(`Enable animation: ${enable}`);
    $avatarModelStore?.setAnimationEnabled(enable);
  };

  const toBase64 = (blob: Blob): Promise<string> => {
    const fileReaderInstance = new FileReader();
    fileReaderInstance.readAsDataURL(blob);
    return new Promise((resolve, reject) => {
      let done = false;
      fileReaderInstance.onload = () => {
        if (done) return;
        done = true;
        resolve(fileReaderInstance.result as string);
      };
      fileReaderInstance.onerror = (err) => {
        if (done) return;
        done = true;
        reject(err);
      };
    });
  };

  const setBackground = async (background: string) => {
    logger.debug(`Set background: ${background}`);
    let config = await toolkit.getAssetConfig("backgrounds", background);
    if (!config) return;
    const blob = await toolkit.getApi().getAsset(config.type, config.id);
    if (blob) {
      backgroundImageUrl = `${await toBase64(blob)}`;
    }
  };

  const enableMirror = (enable = false) => {
    logger.debug(`Enable mirror mode: ${enable}`);
    $avatarModelStore?.setMirrorModeEnabled(enable);
  };

  const triggerAnimation = (name: string) => {
    logger.debug(`Triggered animation: ${name}`);
    $avatarModelStore?.getAnimation()?.play("gesture", name);
  };

  const loadAvatarConfig = async (
    avatar: string
  ): Promise<AvatarModelConfig | null> => {
    logger.debug(`loading avatar ${avatar}`);

    let avatarConfig = await toolkit.getAvatarConfig(avatar);
    if (avatarConfig) return avatarConfig;

    logger.warn(`avatar ${avatar} not found, using defaults`);
    const repositoryDefaults = await toolkit.getRepositoryDefaults();
    if (repositoryDefaults) {
      return repositoryDefaults.avatars[0];
    }

    return getAvatarDefaultConfig();
  };

  const reload = async () => {
    logger.debug(`Reloading model ${avatar}`);
    //await new Promise(r => setTimeout(r, 500));
    await stop();
    toolkit.getUI().clear();
    await start();
  };

  const start = async () => {
    if (!browser || !mounted) return;
    if (!repository) return;
    if (!enableAvatar) return;
    if ($avatarModelStore) return;
    if (started) return;
    started = true;

    logger.debug(`start avatar`);

    let avatarConfig: AvatarModelConfig | null;

    if (rpmUrl) {
      logger.log("Load from RPM url");
      // load from RPM url
      avatarConfig = {
        id: "rpm",
        type: "avatars",
        modelType: "readyplayerme",
        path: rpmUrl,
        gender: rpmGender === "M" ? "M" : "F",
      };
    } else {
      logger.log("Load from repository");
      // load from repository
      if (!avatar) return;

      avatarConfig = await loadAvatarConfig(avatar);

      if (avatarConfig === null) {
        started = false;
        logger.warn(`Failed to load ${avatar} config`);
        return;
      }
    }

    $avatarModelStore = await toolkit.createWebAvatar(avatarConfig);

    toolkit?.emit("avatar.status", "ready");

    if (background) {
      setBackground(background);
    }

    if ($appSettingsStore.devMode) {
      animationList = Array.from(
        $avatarModelStore?.getAnimation()?.getAnimations("gesture") || [],
        (x: any) => x.name
      );
      toolkit.getSettings().save({ animationList });
    }

    addGlobal("Avatar", $avatarModelStore);

    emitter.on("performance", onPerformance);

    avatarLoadedStore.set(true);
  };

  const stop = async () => {
    if (!browser) return;
    logger.debug(`stop avatar`);
    if ($avatarModelStore) {
      await $avatarModelStore.destroy();
      $avatarModelStore = undefined;
    }
    emitter.off("performance", onPerformance);
    started = false;
    avatarLoadedStore.set(false);
  };

  onMount(() => {
    mounted = true;
    start();
  });
  onDestroy(stop);
</script>

{#if !$avatarLoadedStore}
  <Loader />
{/if}

<div
  id="web-avatar"
  class={$appSettingsStore.devMode ? "controls-enabled" : ""}
  style={"background-image: url(" + backgroundImageUrl + ");"}
>
  <!-- <div id="avatar-container"></div> -->
  <!-- <div id="background" style={'background-image: url(' + backgroundImageUrl + ');'}></div> -->
</div>
<div id="blendshape-controls" />

<style lang="scss">
  @import "../../variables.scss";


  #blendshape-controls {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 9999999;
    overflow-y: hidden;
    height: 100vh;
  }

  #web-avatar {
    width: 100%;
    height: 100%;
  }

  #web-avatar {
    // disable canvas mouse controls
    pointer-events: none;
    background-color: transparent;
  }

  #web-avatar {
    width: 100vw;
    height: 100vh;
    background-color: grey;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    // filter: blur(3px);
  }

  #web-avatar.controls-enabled {
    pointer-events: inherit;
  }
</style>
