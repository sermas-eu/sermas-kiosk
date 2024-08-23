<script lang="ts">
  import IoMdLogOut from "svelte-icons/io/IoMdLogOut.svelte";
  import IoMdMic from "svelte-icons/io/IoMdMic.svelte";
  import IoMdMicOff from "svelte-icons/io/IoMdMicOff.svelte";
  import IoMdSettings from "svelte-icons/io/IoMdSettings.svelte";
  import IoMdVolumeHigh from "svelte-icons/io/IoMdVolumeHigh.svelte";
  import IoMdVolumeOff from "svelte-icons/io/IoMdVolumeOff.svelte";

  import { toolkit } from "$lib";
  import {
    appConfigStore,
    appReadyStore,
    appSettingsStore,
    avatarLoadedStore,
    sessionIdStore,
  } from "$lib/store";
  import {
    type PlatformAppDto,
    type RepositoryConfigDto,
  } from "@sermas/toolkit";
  import { AppSettings, supportedLanguages } from "@sermas/toolkit/dto";
  import { Logger, addGlobal, setDefaultLogLevel } from "@sermas/toolkit/utils";
  import { onDestroy, onMount } from "svelte";
  import EmotionFeedback from "./EmotionFeedback.svelte";
  import { llmDefaults } from "@sermas/toolkit/settings";

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
  let rpmUrl = "";
  let rpmGender = "M";

  let hasCopied = "";
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
        },
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
</script>

{#if settings}
  <nav class={!showMenu ? "hidden" : ""}>
    <div class="controls">
      <ul class="">
        <li class="menu-title">
          <a
            title="Close settings"
            href="#"
            on:click|preventDefault={() => (showMenu = !showMenu)}
            on:keydown|preventDefault={() => (showMenu = !showMenu)}
          >
            &#10060;
          </a>
          Settings
        </li>
        {#each Object.entries(settings.llm || {}) as [tag, llmService]}
          {#if tag === "chat" || settings.devMode}
            <li>
              <span> LLM for {tag} </span>
              <select
                bind:value={settings.llm[tag]}
                on:change={() => setLLM(tag, llmService)}
              >
                <option value="" selected={!llmService}>default</option>
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
          <select bind:value={settings.language} on:change={setLanguage}>
            {#each Object.keys(supportedLanguages) as key}
              <option value={key}>{supportedLanguages[key]}</option>
            {/each}
          </select>
        </li>
        <li>
          <span> Avatar </span>
          <!-- {#if repository.avatars} -->
          <select bind:value={settings.avatar} on:change={setModelName}>
            {#each repository?.avatars || [].sort() as avatar}
              <option value={avatar.id}>{avatar.name}</option>
            {/each}
          </select>
          <!-- {/if} -->
          <div class="row-container mt-1">
            <input
              class="rpm-url pl-1 mr-1 {rpmUrl != '' ? 'text-black' : ''}"
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
              <button disabled={rpmUrl == ""} on:click={() => setRPMUrl(rpmUrl)}
                >Load</button
              >
            {:else}
              <button on:click={() => setRPMUrl("")}>Unload</button>
            {/if}
          </div>
        </li>
        <li>
          <span> Background </span>
          <select bind:value={settings.background} on:change={setBackground}>
            {#each repository?.backgrounds || {} as background}
              <option value={background?.id}>{background.name}</option>
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
          {settings.virtualKeyboardEnabled == true ? "Enabled" : "Disabled"}
        </li>

        {#if $sessionIdStore}
          <li>
            <span>
              <a
                href="#"
                class="has-text-grey-lighter"
                title={$sessionIdStore}
                on:click={(e) => copyClipboard($sessionIdStore)}
                >Copy Session ID <b class="has-text-white-ter">{hasCopied}</b
                ></a
              >
            </span>
            <span>
              <a
                href="/{toolkit.getAppId()}/{$sessionIdStore}/stats"
                class="has-text-grey-ter"
                title="View stats"
                target="_blank"
                on:click={(e) => copyClipboard($sessionIdStore)}>stats</a
              >
            </span>
          </li>
        {/if}

        {#if settings.devMode}
          <li class="menu-title">Development settings</li>

          <li>
            <label>
              <input type="checkbox" bind:checked={settings.enableMic} /> Toggle
              Microphone
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
              <input type="checkbox" bind:checked={settings.enableAvatar} /> Toggle
              Avatar
            </label>
          </li>

          <li>
            <label>
              <input type="checkbox" bind:checked={settings.enableAnimation} /> Toggle
              Animation
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
            <select bind:value={settings.testFace} on:change={setFace}>
              {#each facesList as name}
                <option value={name}>{name}</option>
              {/each}
            </select>
          </li>
        {/if}
      </ul>
    </div>
  </nav>

  <div
    class="navbar-toggle {showMenu ? 'is-hidden' : ''} {$avatarLoadedStore
      ? ''
      : 'is-hidden'}"
  >
    <a
      title="Toggle microphone"
      href="#"
      class="navbar-button {settings.enableMic ? 'is-active' : ''}"
      on:click|preventDefault={() => (settings.enableMic = !settings.enableMic)}
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
      title="Open settings"
      href="#"
      class="navbar-button {showMenu ? 'hidden' : ''}"
      on:click|preventDefault={() => (showMenu = !showMenu)}
      on:keydown|preventDefault={() => (showMenu = !showMenu)}
    >
      <IoMdSettings />
    </a>

    {#if login}
      <a
        title="logout"
        href="#"
        class="navbar-button {showMenu ? 'hidden' : ''}"
        on:click|preventDefault={logout}
      >
        <IoMdLogOut />
      </a>
    {/if}

    <a href="">
      <EmotionFeedback />
    </a>
  </div>
{/if}

<style lang="scss">
  @import "../../variables.scss";

  .row-container {
    display: flex;
  }
  .hidden {
    display: none;
  }

  .navbar-button {
    color: rgba($secondary, 0.8);
  }

  .navbar-button:hover,
  .navbar-button.is-active {
    color: rgba($primary, 1);
  }

  .navbar-container {
    position: relative;
    height: 300px;
  }

  .navbar-toggle {
    cursor: pointer;
    font-size: 1em;
    text-align: center;
    position: absolute;
    z-index: 999;
    left: 1em;
    top: 1em;
    width: 2.5em;
    background-color: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(10px);
    border-radius: 0.5em;
    padding: 0.2em;
  }

  nav {
    background-color: #333;
    color: #eee;
    z-index: 999999999;
    position: absolute;
    left: 0;
    top: 0;
    width: 20em;
    height: 100vh;
    overflow-y: scroll;
  }
  select {
    color: #333;
  }
  .controls {
    align-content: center;
  }
  nav span {
    display: block;
  }
  nav ul li {
    padding: 0.5em;
    border-bottom: 1pt solid #efefef;
  }
  nav select {
    width: 100%;
  }
  .menu-title {
    font-weight: bold;
  }
  .menu-title a {
    float: right;
    font-size: 1.5em;
    margin-top: -0.25em;
  }

  input.rpm-url {
    width: 50%;
  }
  select.gender {
    width: 50px;
  }
</style>
