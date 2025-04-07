<script lang="ts">
    import IoMdLogOut from "svelte-icons/io/IoMdLogOut.svelte";
    import IoMdSettings from "svelte-icons/io/IoMdSettings.svelte";

    import newGithubIssueUrl from "new-github-issue-url";

    import { toolkit } from "$lib";
    import {
        appConfigStore,
        appSettingsStore,
        backgroundImageAndSoundStore,
        sessionIdStore,
    } from "$lib/store";
    import { type RepositoryConfigDto } from "@sermas/toolkit";
    import { AppSettings, supportedLanguages } from "@sermas/toolkit/dto";
    import { Logger } from "@sermas/toolkit/utils";
    import { onMount } from "svelte";
    import { browser } from "$app/environment";

    const logger = new Logger("settings");

    export let settings: AppSettings;

    const facesList = [
        "sad",
        "neutral",
        "happy",
        "disgust",
        "angry",
        "fear",
        "surprise",
    ];

    let login: boolean;
    let repository: RepositoryConfigDto;
    let showSettings = false;
    let rpmUrl = "";
    let rpmGender = "M";
    let hasCopied = "";

    onMount(async () => {
        if (!browser) return;
        const app = await toolkit.getApp();
        login = app?.settings?.login || false;
    });

    $: if (settings) {
        logger.debug(`Settings changed`, settings);
        toolkit.getSettings().save(settings || {});
    }

    $: if ($appConfigStore) {
        repository = $appConfigStore.repository;
    }

    const copyClipboard = (text: string) => {
        navigator?.clipboard
            ?.writeText(text)
            .then(
                function () {
                    logger.log("Copying to clipboard was successful!");
                    hasCopied = "copied";
                },
                function (err: any) {
                    logger.error(
                        `Could not copy text: ${text} [${err.message}]`,
                    );
                    hasCopied = "copy failed";
                },
            )
            .finally(() => {
                setTimeout(() => {
                    hasCopied = "";
                }, 2500);
            });
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

    const setSubtitlesEnabled = (ev: any) => {
        settings.subtitlesEnabled = ev.target.checked;
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

    const openGithubIssue = async (sessionId: string) => {
        const date = new Date();
        const insertDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

        const isPilot = ["poa", "asa", "ra"].includes(toolkit.getAppId());
        const repo = settings.githubRepository
            ? settings.githubRepository
            : isPilot
              ? `pilots-${toolkit.getAppId()}`
              : "sermas-kiosk";

        const url = newGithubIssueUrl({
            user: "sermas-eu",
            repo,
            labels: ["bug"],
            title: "",
            body: `**Describe the bug**
  A clear and concise description of what the bug is.
  
  **To Reproduce**
  Steps to reproduce the behavior:
  1. Go to '...'
  2. Click on '....'
  3. Scroll down to '....'
  4. See error
  
  **Expected behavior**
  A clear and concise description of what you expected to happen.
  
  **Screenshots**
  If applicable, add screenshots to help explain your problem.
  
  **References**
  - date: ${insertDate}
  - sessionId: ${sessionId}
  - version: ${PKG_VERSION}
  - ref: ${window.location.toString()}
  - browser: ${navigator.userAgent}
  `,
        });

        window.open(url, "_blank")?.focus();
    };
</script>

{#if settings}
    <aside class="menu">
        <p class="menu-label">General</p>
        <ul class="menu-list">
            <!-- <li><a>TODO Intro</a></li>
              <li><a>TODO Free Chat</a></li> -->
            <!-- <hr class="navbar-divider"> -->
            <li class="list">
                <a
                    title="Open settings"
                    href="#"
                    on:click|preventDefault={() =>
                        (showSettings = !showSettings)}
                    on:keydown|preventDefault={() =>
                        (showSettings = !showSettings)}
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
                            <li>
                                <span class="li-item">
                                    <input
                                        type="checkbox"
                                        bind:checked={settings.subtitlesEnabled}
                                        on:change={setSubtitlesEnabled}
                                    />
                                    Show subtitles
                                </span>
                                <span class="li-item">
                                    <input
                                        type="checkbox"
                                        bind:checked={
                                            settings.virtualKeyboardEnabled
                                        }
                                        on:change={setVirtualKeyboardEnabled}
                                    />
                                    Enable Virtual keyboard
                                </span>
                                <span class="li-item">
                                    <span> Background </span>
                                    <select
                                        bind:value={settings.background}
                                        on:change={setBackground}
                                    >
                                        {#each repository?.backgrounds || {} as background}
                                            <option value={background?.id}
                                                >{background.name}</option
                                            >
                                        {/each}
                                    </select>
                                </span>
                            </li>

                            <li>
                                <span class="li-item">
                                    <span> Language </span>
                                    <select
                                        bind:value={settings.language}
                                        on:change={setLanguage}
                                    >
                                        {#each Object.keys(supportedLanguages) as key}
                                            <option value={key}
                                                >{supportedLanguages[
                                                    key
                                                ]}</option
                                            >
                                        {/each}
                                    </select>
                                </span>
                                {#if settings.devMode}
                                    <span class="li-item">
                                        {#each Object.entries(settings.llm || {}) as [tag, llmService]}
                                            <span>
                                                Large Language Model (LLM)</span
                                            >
                                            <select
                                                bind:value={settings.llm[tag]}
                                                on:change={() =>
                                                    setLLM(tag, llmService)}
                                            >
                                                <option
                                                    value=""
                                                    selected={!llmService}
                                                >
                                                    default
                                                </option>
                                                {#each toolkit.getAvailableModels() as key}
                                                    <option
                                                        value={key}
                                                        selected={llmService ===
                                                            key}
                                                    >
                                                        {key}
                                                    </option>
                                                {/each}
                                            </select>
                                        {/each}
                                    </span>
                                {/if}
                                <span class="li-item">
                                    <span> Avatar </span>
                                    <select
                                        bind:value={settings.avatar}
                                        on:change={setModelName}
                                    >
                                        {#each repository?.avatars || [].sort() as avatar}
                                            <option value={avatar.id}>
                                                {avatar.name}
                                            </option>
                                        {/each}
                                    </select>
                                    <div class="row-container mt-1">
                                        <input
                                            class="rpm-url pl-1 mr-1 {rpmUrl !=
                                            ''
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
                                            <option value="F" selected>F</option
                                            >
                                            <option value="M">M</option>
                                        </select>
                                        {#if settings.rpmUrl == ""}
                                            <button
                                                class="load-button"
                                                disabled={rpmUrl == ""}
                                                on:click={() =>
                                                    setRPMUrl(rpmUrl)}
                                                >Load</button
                                            >
                                        {:else}
                                            <button
                                                on:click={() => setRPMUrl("")}
                                                >Unload</button
                                            >
                                        {/if}
                                    </div>
                                </span>
                                <span class="li-item">
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
                                </span>
                            </li>

                            {#if $sessionIdStore}
                                <li>
                                    <span>
                                        <a
                                            href="#"
                                            class="has-text-grey-lighter a-no-padding"
                                            title={$sessionIdStore}
                                            on:click={(e) =>
                                                copyClipboard($sessionIdStore)}
                                        >
                                            Copy Session ID
                                            <b class="has-text-white-ter">
                                                {hasCopied}
                                            </b>
                                        </a>
                                    </span>
                                    <span>
                                        <a
                                            href="#"
                                            class="has-text-grey-lighter a-no-padding"
                                            title="Open Issue"
                                            on:click={(e) =>
                                                openGithubIssue(
                                                    $sessionIdStore,
                                                )}
                                        >
                                            Open Github Issue
                                        </a>
                                    </span>
                                    <span>
                                        <a
                                            href="/{toolkit.getAppId()}/{$sessionIdStore}/stats"
                                            class="has-text-grey-ter a-no-padding"
                                            title="View stats"
                                            target="_blank"
                                            on:click={(e) =>
                                                copyClipboard($sessionIdStore)}
                                        >
                                            Show statistics
                                        </a>
                                    </span>
                                </li>
                            {/if}

                            {#if settings.devMode}
                                <li class="menu-title">
                                    Development settings

                                    <span class="li-item">
                                        <input
                                            type="checkbox"
                                            bind:checked={settings.enableMic}
                                        />
                                        Toggle Microphone
                                    </span>
                                </li>

                                <li class="menu-title">
                                    Detectors

                                    <span class="li-item">
                                        <input
                                            type="checkbox"
                                            bind:checked={
                                                settings.enableVideoDetection
                                            }
                                        />
                                        Toggle Video Detection
                                    </span>

                                    <span class="li-item">
                                        <input
                                            type="checkbox"
                                            bind:checked={settings.showVideo}
                                            disabled={!settings.enableVideoDetection}
                                        />
                                        Toggle Video Rendering
                                    </span>

                                    <span class="li-item">
                                        <input
                                            type="checkbox"
                                            bind:checked={
                                                settings.enableMirrorMode
                                            }
                                            disabled={!settings.enableVideoDetection ||
                                                !settings.enableAnimation}
                                        />
                                        Mirror mode (holistic v1)
                                    </span>

                                    <span class="li-item">
                                        <input
                                            type="checkbox"
                                            bind:checked={
                                                settings.detectorHuman
                                            }
                                            disabled={!settings.enableVideoDetection}
                                        />
                                        Toggle Emotion (human)
                                    </span>

                                    <span class="li-item">
                                        <input
                                            type="checkbox"
                                            bind:checked={settings.qrcode}
                                            disabled={!settings.enableVideoDetection}
                                        />
                                        Toggle Qrcode (zbar)
                                    </span>

                                    <span class="li-item">
                                        <input
                                            type="checkbox"
                                            bind:checked={
                                                settings.detectorFaceLandmarker
                                            }
                                            disabled={!settings.enableVideoDetection}
                                        />
                                        Toggle Face mapping (faceLandmark)
                                    </span>
                                </li>

                                <li class="menu-title">
                                    Avatar

                                    <span class="li-item">
                                        <input
                                            type="checkbox"
                                            bind:checked={settings.enableAvatar}
                                        />
                                        Toggle Avatar
                                    </span>

                                    <span class="li-item">
                                        <input
                                            type="checkbox"
                                            bind:checked={
                                                settings.enableAnimation
                                            }
                                        />
                                        Toggle Animation
                                    </span>

                                    {#if settings && settings.animationList && settings.animationList.length}
                                        <span class="li-item">
                                            <span> Play Animation </span>
                                            <select
                                                bind:value={settings.animation}
                                                on:change={setAnimation}
                                                placeholder="Animation"
                                            >
                                                {#each settings.animationList as name}
                                                    <option value={name}
                                                        >{name}</option
                                                    >
                                                {/each}
                                            </select>
                                        </span>
                                    {/if}

                                    <span class="li-item">
                                        <span> Face </span>
                                        <select
                                            bind:value={settings.testFace}
                                            on:change={setFace}
                                        >
                                            {#each facesList as name}
                                                <option value={name}
                                                    >{name}</option
                                                >
                                            {/each}
                                        </select>
                                    </span>
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
{/if}

<style lang="scss">
    @import "../../../variables.scss";
    aside {
        margin: 1em 0 0 1em;
    }

    .nav-container {
        position: absolute;
        z-index: 999;

        .hidden {
            display: none;
        }

        .navbar-button {
            color: rgba($secondary, 0.8);
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
            width: 18em;
            height: 100vh;
            overflow-y: hidden;

            .nav-content {
                height: calc(
                    100vh -
                        (
                            var(--navbar-toggle-height) + var(--credits-height) +
                                1em
                        )
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
