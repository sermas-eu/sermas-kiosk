<script lang="ts">
  import IoMdLogOut from "svelte-icons/io/IoMdLogOut.svelte";
  import IoMdMic from "svelte-icons/io/IoMdMic.svelte";
  import IoMdMicOff from "svelte-icons/io/IoMdMicOff.svelte";
  import IoMdSettings from "svelte-icons/io/IoMdSettings.svelte";
  import IoMdVolumeHigh from "svelte-icons/io/IoMdVolumeHigh.svelte";
  import IoMdVolumeOff from "svelte-icons/io/IoMdVolumeOff.svelte";
  import MdSync from "svelte-icons/md/MdSync.svelte";
  import IoMdCloseCircleOutline from "svelte-icons/io/IoMdCloseCircleOutline.svelte";
  import MdMenu from "svelte-icons/md/MdMenu.svelte";
  import MdClose from "svelte-icons/md/MdClose.svelte";
  import FaVrCardboard from "svelte-icons/fa/FaVrCardboard.svelte";

  import { toolkit } from "$lib";
  import {
    appConfigStore,
    appReadyStore,
    appSettingsStore,
    avatarLoadedStore,
    avatarModelStore,
    sessionIdStore,
  } from "$lib/store";
  import {
    type PlatformAppDto,
    type RepositoryConfigDto,
  } from "@sermas/toolkit";
  import { AppSettings, supportedLanguages } from "@sermas/toolkit/dto";
  import { Logger, addGlobal, setDefaultLogLevel } from "@sermas/toolkit/utils";
  import { onDestroy, onMount } from "svelte";
  import sermasLogo from "$lib/assets/images/sermas-logo-white.svg";
  import { sendStatus } from "@sermas/toolkit/events";

  let app: PlatformAppDto | undefined;
  let login: boolean;
  const logger = new Logger("navbar");

  const facesList = [
    "sad",
    "neutral",
    "happy",
    "disgust",
    "angry",
    "fear",
    "surprise",
  ];

  let repository: RepositoryConfigDto;
  let settings: AppSettings;
  let loaded = false;
  let showMenu = false;
  let showSettings = false;
  let rpmUrl = "";
  let rpmGender = "M";

  let hasCopied = "";
  let sessionId: string | undefined = undefined;
  const version = PKG_VERSION;
  let xrSupported: boolean = false;

  const copyClipboard = (text: string) => {
    navigator?.clipboard
      ?.writeText(text)
      .then(
        function () {
          logger.log("Copying to clipboard was successful!");
          hasCopied = "copied";
        },
        function (err: any) {
          logger.error(`Could not copy text: ${text} [${err.message}]`);
          hasCopied = "copy failed";
        }
      )
      .finally(() => {
        setTimeout(() => {
          hasCopied = "";
        }, 2500);
      });
  };

  const setLogLevel = (devMode: boolean) =>
    setDefaultLogLevel(devMode ? "DEBUG" : "WARN");

  addGlobal("developerMode", () => {
    settings.devMode = !settings.devMode;
    setLogLevel(settings.devMode);
  });

  $: if ($appConfigStore) {
    repository = $appConfigStore.repository;
  }

  $: if ($appReadyStore && $appSettingsStore && !loaded) {
    settings = $appSettingsStore;
    logger.debug(`Settings loaded`, settings);
    loaded = true;
    setLogLevel(settings.devMode);
  }

  $: if ($appReadyStore && loaded && settings) {
    logger.debug(`Settings changed`, settings);
    toolkit.getSettings().save(settings || {});
  }

  onMount(async () => {
    //
    app = await toolkit.getApp();
    login = app?.settings?.login || false;

    sessionId = toolkit.getSessionId();

    toolkit.on("session.session", (ev) => {
      if (ev.operation === "updated" && ev.record.closedAt) {
        sessionId = undefined;
      } else {
        sessionId = ev.record.sessionId;
      }
    });

    xrSupported = (await $avatarModelStore?.getXR().isSupported()) || false;
  });

  onDestroy(async () => {
    loaded = false;
  });

  const updateAudioSettings = () => {
    settings.enableAudio = !settings.enableAudio;
    settings.ttsEnabled = settings.enableAudio;
  };

  const logout = async () => {
    await toolkit.getUserAuth().logout();
    window.location.reload();
  };
  const setRPMUrl = (url: string) => {
    settings.rpmGender = rpmGender;
    settings.rpmUrl = url;
  };

  const setBackground = (ev: any) => {
    settings.background = ev.target.value;
  };

  const setInteractionStart = (ev: any) => {
    settings.interactionStart = ev.target.value;
  };

  const setVirtualKeyboardEnabled = (ev: any) => {
    settings.virtualKeyboardEnabled = ev.target.checked;
  };

  const setLanguage = (ev: any) => {
    if (!settings) return;
    if (!ev.target || !ev.target.value) return;
    settings.language = ev.target.value;
  };

  const setLLM = (key: string, service: string | undefined) => {
    if (!settings) return;
    settings.llm = settings.llm || {};
    settings.llm[key] = service || "";
  };

  const setModelName = (ev: any) => {
    if (!settings) return;
    if (!ev.target || !ev.target.value) return;
    settings.avatar = ev.target.value;
    rpmUrl = "";
    rpmGender = "";
    settings.rpmUrl = "";
  };

  const setFace = (ev: any) => {
    if (!settings) return;
    if (!ev.target || !ev.target.value) return;
    settings.testFace = ev.target.value;
  };

  const setAnimation = (ev: any) => {
    if (!settings) return;
    if (!ev.target || !ev.target.value) return;
    settings.animation = ev.target.value;
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
          title="Reload Page"
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
        on:click|preventDefault={() => updateAudioSettings()}
        on:keydown|preventDefault={() => updateAudioSettings()}
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
      <aside class="menu">
        <p class="menu-label">General</p>
        <ul class="menu-list">
          <!-- <li><a>TODO Intro</a></li>
          <li><a>TODO Free Chat</a></li> -->
          <!-- <hr class="navbar-divider"> -->
          <li>
            <a
              title="Open settings"
              href="#"
              on:click|preventDefault={() => (showSettings = !showSettings)}
              on:keydown|preventDefault={() => (showSettings = !showSettings)}
              class="menu-item-w-icon {showSettings ? 'is-active' : ''}"
            >
              <span class="icon">
                <IoMdSettings />
              </span>
              <span style="margin-left:0.5em;"> Settings </span>
            </a>
            {#if showSettings}
              <div class="controls">
                <ul class="">
                  {#each Object.entries(settings.llm || {}) as [tag, llmService]}
                    {#if tag === "chat" || settings.devMode}
                      <li>
                        <span> LLM for {tag} </span>
                        <select
                          bind:value={settings.llm[tag]}
                          on:change={() => setLLM(tag, llmService)}
                        >
                          <option value="" selected={!llmService}
                            >default</option
                          >
                          {#each toolkit.getAvailableModels() as key}
                            <option value={key} selected={llmService === key}
                              >{key}</option
                            >
                          {/each}
                        </select>
                      </li>
                    {/if}
                  {/each}
                  <li>
                    <span> Language </span>
                    <select
                      bind:value={settings.language}
                      on:change={setLanguage}
                    >
                      {#each Object.keys(supportedLanguages) as key}
                        <option value={key}>{supportedLanguages[key]}</option>
                      {/each}
                    </select>
                  </li>
                  <li>
                    <span> Avatar </span>
                    <!-- {#if repository.avatars} -->
                    <select
                      bind:value={settings.avatar}
                      on:change={setModelName}
                    >
                      {#each repository?.avatars || [].sort() as avatar}
                        <option value={avatar.id}>{avatar.name}</option>
                      {/each}
                    </select>
                    <!-- {/if} -->
                    <div class="row-container mt-1">
                      <input
                        class="rpm-url pl-1 mr-1 {rpmUrl != ''
                          ? 'text-black'
                          : ''}"
                        bind:value={rpmUrl}
                        placeholder="or paste RPM url"
                      />
                      <select
                        class="pl-2 mr-1 gender"
                        placeholder="Gender"
                        bind:value={rpmGender}
                      >
                        <option value="F" selected>F</option>
                        <option value="M">M</option>
                      </select>
                      {#if settings.rpmUrl == ""}
                        <button
                          disabled={rpmUrl == ""}
                          on:click={() => setRPMUrl(rpmUrl)}>Load</button
                        >
                      {:else}
                        <button on:click={() => setRPMUrl("")}>Unload</button>
                      {/if}
                    </div>
                  </li>
                  <li>
                    <span> Background </span>
                    <select
                      bind:value={settings.background}
                      on:change={setBackground}
                    >
                      {#each repository?.backgrounds || {} as background}
                        <option value={background?.id}>{background.name}</option
                        >
                      {/each}
                    </select>
                  </li>
                  <li>
                    <span> Interaction start </span>
                    <select
                      bind:value={settings.interactionStart}
                      on:change={setInteractionStart}
                    >
                      <option value="on-load">On load</option>
                      <option value="touch">On touch</option>
                      <option value="speak">On speak</option>
                      <option value="intent-detection"
                        >On intent detection (with Kinect)</option
                      >
                    </select>
                  </li>
                  <li>
                    <span> Virtual keyboard </span>
                    <input
                      type="checkbox"
                      bind:checked={settings.virtualKeyboardEnabled}
                      on:change={setVirtualKeyboardEnabled}
                    />
                    {settings.virtualKeyboardEnabled == true
                      ? "Enabled"
                      : "Disabled"}
                  </li>

                  {#if $sessionIdStore}
                    <li>
                      <span>
                        <a
                          href="#"
                          class="has-text-grey-lighter"
                          title={$sessionIdStore}
                          on:click={(e) => copyClipboard($sessionIdStore)}
                          >Copy Session ID <b class="has-text-white-ter"
                            >{hasCopied}</b
                          ></a
                        >
                      </span>
                      <span>
                        <a
                          href="/{toolkit.getAppId()}/{$sessionIdStore}/stats"
                          class="has-text-grey-ter"
                          title="View stats"
                          target="_blank"
                          on:click={(e) => copyClipboard($sessionIdStore)}
                          >stats</a
                        >
                      </span>
                    </li>
                  {/if}

                  {#if settings.devMode}
                    <li class="menu-title">Development settings</li>

                    <li>
                      <label>
                        <input
                          type="checkbox"
                          bind:checked={settings.enableMic}
                        /> Toggle Microphone
                      </label>
                    </li>

                    <li class="menu-title">Detectors</li>

                    <li>
                      <label>
                        <input
                          type="checkbox"
                          bind:checked={settings.enableVideoDetection}
                        /> Toggle Video Detection
                      </label>
                    </li>

                    <li>
                      <label>
                        <input
                          type="checkbox"
                          bind:checked={settings.showVideo}
                          disabled={!settings.enableVideoDetection}
                        /> Toggle Video Rendering
                      </label>
                    </li>

                    <li>
                      <label>
                        <input
                          type="checkbox"
                          bind:checked={settings.enableMirrorMode}
                          disabled={!settings.enableVideoDetection ||
                            !settings.enableAnimation}
                        /> Mirror mode (holistic v1)
                      </label>
                    </li>

                    <li>
                      <label>
                        <input
                          type="checkbox"
                          bind:checked={settings.detectorHuman}
                          disabled={!settings.enableVideoDetection}
                        /> Toggle Emotion (human)
                      </label>
                    </li>

                    <li>
                      <label>
                        <input
                          type="checkbox"
                          bind:checked={settings.qrcode}
                          disabled={!settings.enableVideoDetection}
                        /> Toggle Qrcode (zbar)
                      </label>
                    </li>

                    <li>
                      <label>
                        <input
                          type="checkbox"
                          bind:checked={settings.detectorFaceLandmarker}
                          disabled={!settings.enableVideoDetection}
                        /> Toggle Face mapping (faceLandmark)
                      </label>
                    </li>

                    <li class="menu-title">Avatar</li>

                    <li>
                      <label>
                        <input
                          type="checkbox"
                          bind:checked={settings.enableAvatar}
                        />
                        Toggle Avatar
                      </label>
                    </li>

                    <li>
                      <label>
                        <input
                          type="checkbox"
                          bind:checked={settings.enableAnimation}
                        /> Toggle Animation
                      </label>
                    </li>

                    {#if settings && settings.animationList && settings.animationList.length}
                      <li>
                        <span> Play Animation </span>
                        <select
                          bind:value={settings.animation}
                          on:change={setAnimation}
                          placeholder="Animation"
                        >
                          {#each settings.animationList as name}
                            <option value={name}>{name}</option>
                          {/each}
                        </select>
                      </li>
                    {/if}
                    <li>
                      <span> Face </span>
                      <select
                        bind:value={settings.testFace}
                        on:change={setFace}
                      >
                        {#each facesList as name}
                          <option value={name}>{name}</option>
                        {/each}
                      </select>
                    </li>
                  {/if}
                </ul>
              </div>
            {/if}
            {#if login}
              <a
                title="logout"
                href="#"
                on:click|preventDefault={logout}
                class="menu-item-w-icon"
              >
                <span class="icon">
                  <IoMdLogOut />
                </span>
                <span style="margin-left:0.5em;"> Logout </span>
              </a>
            {/if}
          </li>
        </ul>
      </aside>
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
    }

    .navbar-toggle {
      cursor: pointer;
      font-size: 1em;
      text-align: center;
      position: relative;
      height: 2.5em;
      border-radius: 0.5em;
      padding: 0.2em;
      display: flex;
      flex-direction: row;
      .navbar-button:hover,
      .navbar-button.is-active {
        color: rgba($primary, 1);
      }
    }

    .is-opened {
      margin-top: 1em;
      margin-left: 1em;

      .navbar-button:hover,
      .navbar-button.is-active {
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
      width: 15em;
      height: 100vh;
      overflow-y: scroll;
      .menu {
        margin-top: 1em;
        margin-left: 1em;
        height: 85%;

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
        }
        .menu-item-w-icon {
          display: inline-flex;
          width: 100%;
        }
      }

      .controls {
        align-content: center;

        select {
          color: $dark-blue;
          width: 100%;
          .gender {
            width: 50px;
          }
        }

        span {
          display: block;
        }

        ul li {
          padding: 0.5em;
          border-bottom: 1pt solid #efefef;
        }
        .row-container {
          display: flex;
          .rpm-url {
            width: 50%;
          }
        }
      }
      .credits {
        margin-bottom: 1em;
        margin-left: 1em;
        color: white;
        display: flex;
        height: 2em;
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
