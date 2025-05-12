<script lang="ts">
  import FaVrCardboard from "svelte-icons/fa/FaVrCardboard.svelte";
  import IoMdCloseCircleOutline from "svelte-icons/io/IoMdCloseCircleOutline.svelte";
  import IoMdMic from "svelte-icons/io/IoMdMic.svelte";
  import IoMdMicOff from "svelte-icons/io/IoMdMicOff.svelte";
  import IoMdVolumeHigh from "svelte-icons/io/IoMdVolumeHigh.svelte";
  import IoMdVolumeOff from "svelte-icons/io/IoMdVolumeOff.svelte";
  import MdClose from "svelte-icons/md/MdClose.svelte";
  import MdMenu from "svelte-icons/md/MdMenu.svelte";
  import MdSync from "svelte-icons/md/MdSync.svelte";

  import { browser } from "$app/environment";
  import { toolkit } from "$lib";
  import sermasLogo from "$lib/assets/images/sermas-logo-white.svg";
  import {
    appReadyStore,
    appSettingsStore,
    avatarLoadedStore,
    avatarModelStore,
    backgroundImageAndSoundStore,
  } from "$lib/store";
  import type { SessionChangedDto } from "@sermas/toolkit";
  import { AppSettings } from "@sermas/toolkit/dto";
  import { sendStatus } from "@sermas/toolkit/events";
  import { Logger, addGlobal, setDefaultLogLevel } from "@sermas/toolkit/utils";
  import { onDestroy, onMount } from "svelte";
  import Impressum from "./navbar/Impressum.svelte";
  import NavigationMenu from "./navbar/NavigationMenu.svelte";
  import SettingsMenu from "./navbar/SettingsMenu.svelte";

  const logger = new Logger("navbar");

  let settings: AppSettings;
  let loaded = false;
  let showMenu = false;

  let sessionId: string | undefined = undefined;
  const version = PKG_VERSION;
  let xrSupported: boolean = false;

  let audio: any;

  const setLogLevel = (devMode: boolean) =>
    setDefaultLogLevel(devMode ? "DEBUG" : "WARN");

  addGlobal("developerMode", () => {
    settings.devMode = !settings.devMode;
    setLogLevel(settings.devMode);
  });

  $: if ($appReadyStore && $appSettingsStore && !loaded) {
    settings = $appSettingsStore;
    logger.debug(`Settings loaded`, settings);
    loaded = true;
    setLogLevel(settings.devMode);
  }

  $: if (
    $backgroundImageAndSoundStore.isBackgroundAudioPlaying &&
    settings.enableAudio
  ) {
    audio.play();
  }

  $: if (
    !$backgroundImageAndSoundStore.isBackgroundAudioPlaying &&
    settings.enableAudio &&
    $backgroundImageAndSoundStore.backgroundAudioUrl
  ) {
    audio.pause();
    $backgroundImageAndSoundStore.backgroundAudioUrl = undefined;
    $backgroundImageAndSoundStore.backgroundAudioType = undefined;
  }

  const onSessionChanged = (ev: SessionChangedDto) => {
    if (ev.operation === "updated" && ev.record.closedAt) {
      sessionId = undefined;
      if (ev.record.settings?.resetPrivacyEverySession) localStorage.removeItem("privacy");
    } else {
      sessionId = ev.record.sessionId;
    }
  };

  onMount(() => {
    if (!browser) return;

    sessionId = toolkit.getSessionId();
    toolkit.getBroker().on("session.session", onSessionChanged);
  });

  $: if ($avatarModelStore) {
    $avatarModelStore
      .getXR()
      .isSupported()
      .then((res) => (xrSupported = res));
  }

  onDestroy(async () => {
    loaded = false;
    toolkit.getBroker().off("session.session", onSessionChanged);
  });

  const toggleAudio = () => {
    settings.enableAudio = !settings.enableAudio;
    if (!settings.enableAudio) {
      audio.pause();
    }
    settings.ttsEnabled = settings.enableAudio;
  };

  const closeSession = async () => {
    toolkit?.triggerInteraction("ui", "stop");
  };

  const onStartAR = async () => {
    if (!$avatarModelStore) return;
    xrSupported = await $avatarModelStore.getXR().start();

    if (!xrSupported) sendStatus("AR is not available on this device");
  };
</script>

<audio
  src={$backgroundImageAndSoundStore.backgroundAudioUrl}
  bind:this={audio}
  loop
/>

{#if settings}
  <div class="nav-container {showMenu ? 'is-show' : ''}">
    <div
      class="navbar-toggle {showMenu
        ? 'is-opened'
        : 'is-closed'} {$avatarLoadedStore ? '' : 'is-hidden'}"
    >
      {#if !showMenu}
        <a
          title="Open settings"
          href="#"
          class="navbar-button"
          on:click|preventDefault={() => (showMenu = !showMenu)}
          on:keydown|preventDefault={() => (showMenu = !showMenu)}
        >
          <MdMenu />
        </a>
      {:else}
        <a
          title="Close menu"
          href="#"
          class="navbar-button"
          on:click|preventDefault={() => (showMenu = !showMenu)}
          on:keydown|preventDefault={() => (showMenu = !showMenu)}
        >
          <MdClose />
        </a>
      {/if}
      <a
        title="Reload Page"
        href="#"
        class="navbar-button"
        on:click={() => window.location.reload()}
      >
        <MdSync />
      </a>
      {#if sessionId && $appSettingsStore?.interactionStart != "intent-detection"}
        <a
          title="End Session"
          href="#"
          class="navbar-button"
          on:click={() => closeSession()}
        >
          <IoMdCloseCircleOutline />
        </a>
      {/if}

      <a
        title="Toggle microphone"
        href="#"
        class="navbar-button {settings.enableMic ? 'is-active' : ''}"
        on:click|preventDefault={() =>
          (settings.enableMic = !settings.enableMic)}
        on:keydown|preventDefault={() =>
          (settings.enableMic = !settings.enableMic)}
      >
        {#if settings.enableMic}
          <IoMdMic />
        {:else}
          <IoMdMicOff />
        {/if}
      </a>
      <a
        title="Toggle audio"
        href="#"
        class="navbar-button {settings.enableAudio ? 'is-active' : ''}"
        on:click|preventDefault={() => toggleAudio()}
        on:keydown|preventDefault={() => toggleAudio()}
      >
        {#if settings.enableAudio}
          <IoMdVolumeHigh />
        {:else}
          <IoMdVolumeOff />
        {/if}
      </a>

      <a
        title="Start AR"
        href="#"
        class="navbar-button {xrSupported && avatarLoadedStore
          ? ''
          : 'is-hidden'}"
        on:click|preventDefault={onStartAR}
      >
        <FaVrCardboard />
      </a>
    </div>

    <nav class={!showMenu ? "hidden" : ""}>
      <div class="nav-content">
        <NavigationMenu />
        <!-- <hr class="navbar-divider" /> -->
        <Impressum />
        {#if settings}
          <SettingsMenu {settings} />
        {/if}
      </div>

      <div class="credits">
        <a href="https://sermasproject.eu" target="_blank">
          <img class="logo" src={sermasLogo} alt="SERMAS" />
          SERMAS
        </a>
        <span>v{version}</span>
      </div>
    </nav>
  </div>
{/if}

<style lang="scss">
  @import "../../variables.scss";

  .nav-container {
    position: absolute;
    z-index: 999;

    .hidden {
      display: none;
    }

    .navbar-button {
      color: rgba($secondary, 0.8);
      display: flex;
      align-content: center;
      justify-content: center;
    }
    .navbar-button:first-child {
      margin-left: 0.5rem;
    }
    .navbar-button:last-child {
      margin-right: 0.5rem;
    }

    --navbar-toggle-height: 2.5em;
    --credits-height: 2em;

    .navbar-toggle {
      cursor: pointer;
      font-size: 1em;
      text-align: center;
      position: relative;
      height: var(--navbar-toggle-height);
      border-radius: 0.5em;
      padding: 0.2em;
      display: flex;
      flex-direction: row;
      .navbar-button:hover {
        color: rgba($primary, 1);
      }
    }

    .is-opened {
      margin-top: 1em;

      .navbar-button:hover {
        color: rgba($secondary, 0.8);
      }
      .navbar-button {
        color: white;
      }
    }

    .is-closed {
      left: 1em;
      top: 1em;
      background-color: rgba(255, 255, 255, 0.6);
      backdrop-filter: blur(10px);
    }

    nav {
      color: #eee;
      left: 0;
      top: 0;
      width: 18em;
      height: 100vh;
      overflow-y: hidden;

      .nav-content {
        height: calc(
          100vh - (var(--navbar-toggle-height) + var(--credits-height) + 1em)
        );
        overflow-y: auto;
      }

      .menu {
        margin-top: 1em;
        margin-left: 1em;

        .menu-list {
          li a {
            color: white;
          }
          a:hover {
            background-color: rgba($secondary, 0.8);
          }
          a.is-active {
            background-color: rgba($secondary, 0.8);
          }
          .list {
            height: 100%;
            display: flex;
            flex-direction: column;
          }
        }
        .menu-item-w-icon {
          display: inline-flex;
          width: 100%;
        }
      }

      .controls {
        align-content: center;
        flex: 1;
        overflow: auto;
        select {
          color: $dark-blue;
          width: 100%;
        }

        span {
          display: block;
          .a-no-padding {
            padding-right: 0px;
            padding-left: 0px;
          }
        }

        ul li {
          padding: 0.5em;
          border-bottom: 1pt solid #efefef;
        }

        li:last-child {
          border-bottom: none;
        }

        .li-item {
          margin-top: 10px;
          margin-bottom: 10px;
          font-size: 14px;

          span {
            margin-bottom: 5px;
          }

          select {
            margin-bottom: 5px;
          }
        }

        .row-container {
          display: flex;
          width: 100%;
          max-width: 100%;
          flex-direction: row;
          justify-content: space-between;

          .rpm-url {
            max-width: 55%;
          }

          .load-button {
            width: 20%;
            color: black;
            background-color: $palette4;
            border: none;
            border-radius: 3px;
          }

          .gender {
            width: 20%;
            align-content: center;
            margin-bottom: 0px;
          }
        }
      }
      .credits {
        margin-bottom: 1em;
        margin-left: 1em;
        color: white;
        display: flex;
        height: var(--credits-height);
        justify-content: center;
        text-align: center;
        align-items: center;
        color: white;

        .logo {
          width: 35px;
          height: 35px;
        }
        a {
          color: white;
          margin-right: 10px;
          display: flex;
          align-items: center;
        }
        a:hover {
          color: rgba($secondary, 0.8);
        }
      }
    }
  }
  .is-show {
    background-color: $dark-blue;
  }
</style>
