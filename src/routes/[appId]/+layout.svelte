<script lang="ts">
  import { page } from "$app/stores";
  import { createToolkit } from "$lib";
  import {
    appConfigStore,
    appReadyStore,
    appSettingsStore,
    sessionIdStore,
  } from "$lib/store";
  import { AppSettings } from "@sermas/toolkit/dto";

  import Theme from "$lib/components/Theme.svelte";
  import {
    DefaultBackground,
    DefaultModel,
    SermasToolkit,
    type PlatformAppDto,
  } from "@sermas/toolkit";
  import { ErrorReason, type ErrorEventDto } from "@sermas/toolkit/dto";
  import { addGlobal, logger } from "@sermas/toolkit/utils";
  import { onDestroy, onMount } from "svelte";
  import "../../app.scss";
  import type { PageData } from "./$types";

  export let data: PageData;

  let toolkit: SermasToolkit;
  let hasError: ErrorEventDto;

  let theme = {};
  let toggle = false;
  const loadTheme = (settings: AppSettings | undefined) => {
    if (settings && settings?.theme) {
      theme = {
        primaryBgColor: settings.theme.primaryBgColor || "#64539e",
        secondaryBgColor: settings.theme.secondaryBgColor || "grey",
        primaryTextColor: settings.theme.primaryTextColor || "white",
        secondaryTextColor: settings.theme.secondaryTextColor || "#64539e",
        subtitleTextColor: settings.theme.subtitleTextColor || "white",
      };
    }
  };

  const setRepositoryDefaults = (app: PlatformAppDto) => {
    app.repository = app.repository || {};

    app.repository.avatars =
      app.repository.avatars && app.repository.avatars.length
        ? app.repository.avatars
        : [];
    app.repository.avatars.push(DefaultModel);

    app.repository.backgrounds =
      app.repository.backgrounds && app.repository.backgrounds.length
        ? app.repository.backgrounds
        : [];
    app.repository.backgrounds.push(DefaultBackground);

    app.repository.robots =
      app.repository.robots && app.repository.robots.length
        ? app.repository.robots
        : [];
  };

  const onReady = (toolkit: SermasToolkit) => {
    appReadyStore.set(true);
    addGlobal("Toolkit", toolkit);
  };

  const onSessionChange = (sessionId: string | undefined) => {
    sessionIdStore.set(sessionId);
  };

  const onSettings = (settings: AppSettings) => {
    appSettingsStore.set(settings);
    loadTheme(settings);
    const sessionId = toolkit.getSessionId() || $sessionIdStore;
    if (!sessionId) return;
    toolkit.getApi().updateSession({
      appId: toolkit.getAppId(),
      sessionId,
      settings,
    } as any);
  };

  const onFailure = (e: ErrorEventDto) => {
    logger.error(`Failure detected ${e.reason}`);
    hasError = e;
  };

  const onWindowClose = () => {
    logger.debug(`Window is closing`);
    const sessionId = toolkit.getSessionId();
    if (!sessionId) return;
    toolkit.getApi().updateSession({
      appId: toolkit.getAppId(),
      sessionId,
      closedAt: new Date().toISOString(),
    } as any);
  };

  const onSessionStatusChanged = (ev: {
    status: "closed" | "created" | "updated";
  }) => {
    if (ev.status !== "closed") return;
    logger.log(`Session closed, reloading page`);
    document?.location?.reload();
  };

  onMount(async () => {
    const appId = $page.params.appId;
    let token: string | null = null;

    if (data && data.accessToken) {
      logger.debug(`Found page token`);
      token = data.accessToken;
    }

    if ($page.url.searchParams.get("token")) {
      logger.debug(`Found query token`);
      token = $page.url.searchParams.get("token");
    }

    toolkit = createToolkit({
      appId,
      moduleId: "avatar",
    });

    toolkit.on("ready", onReady);
    toolkit.on("settings", onSettings);
    toolkit.on("session", onSessionChange);
    toolkit.on("failure", onFailure);

    toolkit.on("window.close", onWindowClose);
    toolkit.on("session.status", onSessionStatusChanged);

    await toolkit.init(token || undefined);

    const app = await toolkit.getApp();
    if (app) {
      logger.log(`Loaded app ${app.appId}`);
      setRepositoryDefaults(app);
      appConfigStore.set(app);
    }
  });

  onDestroy(async () => {
    if (toolkit) {
      toolkit.off("ready", onReady);
      toolkit.off("settings", onSettings);
      toolkit.off("session", onSessionChange);
      toolkit.off("session.status", onSessionStatusChanged);
      toolkit.off("failure", onFailure);
      toolkit.off("window.close", onWindowClose);
      await toolkit?.destroy();
    }
  });

  const beforeUnload = () => {
    if (toolkit) toolkit.emit("window.close");
  };
</script>

<svelte:window on:beforeunload={beforeUnload} />

<!-- <PrivacyPopup /> -->

<div class="app">
  {#if hasError}
    <div class="error">
      <div class="box">
        <div class="title is-spaced has-text-danger">An error occured</div>

        <div class="subtitle">
          {#if hasError.reason === ErrorReason.MISSING_APP}
            Failed to load app <span class="tag is-info is-size-5"
              >{$page.params.appId}</span
            >
          {:else}
            An internal error occured
          {/if}
        </div>

        <div class="has-text-centered">
          <a href="/{$page.params.appId}" target="_top">Retry</a> |
          <a href="/">Homepage</a>
        </div>
      </div>
    </div>
  {:else}
    <Theme {...theme}>
      <!-- <button class="test" on:click={loadTheme}>Toggle theme</button> -->
      <main>
        <slot />
      </main>
    </Theme>
  {/if}
</div>

<style lang="scss">
  @import "../../variables.scss";

  .error {
    padding-top: 10%;
  }
  .error .box {
    width: 50%;
    margin: 0 auto;
  }
  .app {
    position: relative;
    width: 100%;
    height: calc(100vh);
    margin: 0;
    padding: 0;
  }
  main {
    position: relative;
    height: 100%;
    width: 100%;
    padding: 0;
    margin: 0;
  }

  @include mobile-view {
    .error {
      padding-top: 40%;
    }

    .error .box {
      width: 90%;
    }
  }
</style>
