<script lang="ts">
  import { browser } from "$app/env";
  import { toolkit } from "#lib";
  import {
    appConfigStore,
    appSettingsStore,
    avatarFailedStore,
    avatarLoadedStore,
    avatarModelStore,
    backgroundImageAndSoundStore,
  } from "#lib/store.ts";
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
  import { onDestroy, onMount, untrack } from "svelte";
  import Loader from "./Loader.svelte";
  import { toBase64 } from "#lib/util.ts";

  let enableAudio: boolean = $state()!;
  let enableAvatar: boolean = $state()!;
  let enableAnimation: boolean = $state()!;
  let avatar: string = $state()!;
  let animation: string = $state()!;
  let animationList: string[] = [];

  let mounted = false;
  let started = false;

  let rpmUrl: string | undefined = $state(undefined);
  let rpmGender: string | undefined = $state(undefined);

  let repository: RepositoryConfigDto | undefined = $derived(
    $appConfigStore?.repository,
  );

  let background: string = $state("");

  const logger = new Logger("WebAvatar");

  const updateSettings = (settings: AppSettings) => {
    background = settings.background;
    avatar = settings.avatar;

    enableAvatar = settings.enableAvatar;
    enableAnimation = settings.enableAnimation;
    rpmUrl = settings.rpmUrl;
    rpmGender = settings.rpmGender;
    avatar = settings.avatar;
    animation = settings.animation;
    animationList = settings.animationList;
    enableAudio = settings.enableAudio;
  };




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

  const setBackground = async (background: string) => {
    logger.debug(`Set background: ${background}`);
    let config = await toolkit.getAssetConfig("backgrounds", background);

    if (!config) return;
    const blob = await toolkit.getApi().getAsset(config.type, config.id);

    $backgroundImageAndSoundStore = {
      ...$backgroundImageAndSoundStore,
      image: background,
      defaultImage: background,
      messageImage: false,
    };

    if (blob) {
      $backgroundImageAndSoundStore.urlImage = `${await toBase64(blob)}`;
    }
  };

  // dev mode: play a gesture picked from the animation list (`waving_0`, …)
  const triggerAnimation = (name: string) => {
    if (!name) return;
    const played = $avatarModelStore?.getAnimation()?.playGesture(name);
    logger.debug(`Gesture ${name}: ${played ? "playing" : "not available"}`);
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
    if (!$avatarModelStore.getModel()) {
      // no model (unreachable or missing): keep the UI usable, show the dialogue as text
      logger.warn(`Avatar model not loaded, running text-only`);
      avatarFailedStore.set(true);
    }

    toolkit?.emit("avatar.status", "ready");

    if (background) {
      setBackground(background);
    }

    if ($appSettingsStore.devMode) {
      animationList = Array.from(
        $avatarModelStore?.getAnimation()?.getAnimations("gesture") || [],
        (x: any) => x.name,
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
    avatarFailedStore.set(false);
    avatarLoadedStore.set(false);
  };

  onMount(() => {
    mounted = true;
    start();
  });
  onDestroy(stop);
  // each effect depends only on the values read before untrack(), as the
  // former `$:` statements did
  $effect.pre(() => {
    const settings = $appSettingsStore;
    if (settings) untrack(() => updateSettings(settings));
  });
  $effect.pre(() => {
    const model = $avatarModelStore;
    const on = enableAudio;
    untrack(() => model?.toggleAudio(on));
  });
  $effect.pre(() => {
    const on = enableAvatar;
    untrack(() => (on ? start() : stop()));
  });
  $effect.pre(() => {
    const on = enableAnimation;
    untrack(() => (on ? enableAnim(true) : enableAnim()));
  });
  $effect.pre(() => {
    void [avatar, repository];
    untrack(reload);
  });
  $effect.pre(() => {
    void [rpmUrl, rpmGender];
    untrack(reload);
  });
  $effect.pre(() => {
    const name = animation;
    untrack(() => triggerAnimation(name));
  });
  $effect.pre(() => {
    const bg = background;
    untrack(() => setBackground(bg));
  });
</script>

{#if !$avatarLoadedStore}
  <Loader />
{/if}

<div
  id="web-avatar"
  class={$appSettingsStore.devMode ? "controls-enabled" : ""}
  style={"background-image: url(" +
    $backgroundImageAndSoundStore.urlImage +
    ");"}
></div>
<div id="blendshape-controls"></div>

<style lang="scss">
  @use "../../variables.scss" as *;

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
