<script lang="ts">
  import { browser } from "$app/environment";
  import { toolkit } from "$lib";
  import {
    appConfigStore,
    appSettingsStore,
    avatarLoadedStore,
  } from "$lib/store";
  import { type RepositoryConfigDto } from "@sermas/toolkit";
  import {
    AvatarModel,
    getAvatarDefaultConfig,
    type AvatarModelConfig,
  } from "@sermas/toolkit/avatar";
  import { AppSettings } from "@sermas/toolkit/dto";
  import { emitter, sendStatus } from "@sermas/toolkit/events";
  import {
    Logger,
    addGlobal,
    type PerformanceEvent,
  } from "@sermas/toolkit/utils";
  import { onDestroy, onMount } from "svelte";
  import Loader from "./Loader.svelte";
  import SessionHelpers from "./contents/SessionHelpers.svelte";

  let xrSupported: boolean = false;
  let enableAudio: boolean;
  let enableAvatar: boolean;
  let enableAnimation: boolean;
  let enableMirrorMode: boolean;
  let avatar: string;
  let animation: string;
  let animationList: string[] = [];

  let avatarModel: AvatarModel | undefined;

  let mounted = false;
  let started = false;

  let rpmUrl: string | undefined = undefined;
  let rpmGender: string | undefined = undefined;

  let repository: RepositoryConfigDto;

  let background: string = "";

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

  $: enableAudio, avatarModel?.toggleAudio(enableAudio);
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
    if (!avatarModel) return;
    if (ev.status === "degraded") {
      logger.warn(`Performance degraded, stopping animations`);
      avatarModel.setAnimationEnabled(false);
    }
    if (ev.status === "restored") {
      logger.log(`Performance restored, starting animations`);
      avatarModel.setAnimationEnabled(true);
    }
  };

  const enableAnim = (enable = false) => {
    logger.debug(`Enable animation: ${enable}`);
    avatarModel?.setAnimationEnabled(enable);
  };

  const setBackground = async (background: string) => {
    logger.debug(`Set background: ${background}`);
    await avatarModel?.setBackground(background);
  };

  const enableMirror = (enable = false) => {
    logger.debug(`Enable mirror mode: ${enable}`);
    avatarModel?.setMirrorModeEnabled(enable);
  };

  const triggerAnimation = (name: string) => {
    logger.debug(`Triggered animation: ${name}`);
    avatarModel?.getAnimation()?.play("gesture", name);
  };

  const loadAvatarConfig = async (
    avatar: string,
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
    await start();
  };

  const start = async () => {
    if (!browser || !mounted) return;
    if (!repository) return;
    if (!enableAvatar) return;
    if (avatarModel) return;
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

    avatarModel = await toolkit.createWebAvatar(avatarConfig);

    toolkit?.emit("avatar.status", "ready");

    xrSupported = (await avatarModel?.getXR().isSupported()) || false;

    if (background) {
      setBackground(background);
    }

    if ($appSettingsStore.devMode) {
      animationList = Array.from(
        avatarModel?.getAnimation()?.getAnimations("gesture") || [],
        (x: any) => x.name,
      );
      toolkit.getSettings().save({ animationList });
    }

    addGlobal("Avatar", avatarModel);

    emitter.on("performance", onPerformance);

    avatarLoadedStore.set(true);
  };

  const stop = async () => {
    if (!browser) return;
    logger.debug(`stop avatar`);
    if (avatarModel) {
      await avatarModel.destroy();
      avatarModel = undefined;
    }
    emitter.off("performance", onPerformance);
    started = false;
    avatarLoadedStore.set(false);
  };

  const onStartAR = async () => {
    if (!avatarModel) return;
    xrSupported = await avatarModel.getXR().start();
    if (!xrSupported) sendStatus("AR is not available on this device");
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
<div id="xr-button-avatar" class={xrSupported ? "" : "is-hidden"}>
  <button
    class="button is-primary start-ar {$avatarLoadedStore ? '' : 'is-hidden'}"
    on:click|preventDefault={onStartAR}
  >
    Start AR
  </button>
</div>

<div
  id="web-avatar"
  class={$appSettingsStore.devMode ? "controls-enabled" : ""}
>
</div>
<SessionHelpers />
<div id="blendshape-controls" />

<style lang="scss">
  @import "../../variables.scss";

  #xr-button-avatar {
    position: absolute;
    z-index: 80;
    left: 0;
    right: 0;
    margin: auto;
    padding-top: 1em;
    text-align: center;
  }

  #xr-button-avatar .button {
    opacity: 0.6;
  }

  #xr-button-avatar .button:hover {
    opacity: 0.8;
  }

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
    // disable canvas mouse controls
    pointer-events: none;
  }

  #web-avatar.controls-enabled {
    pointer-events: inherit;
  }

</style>
