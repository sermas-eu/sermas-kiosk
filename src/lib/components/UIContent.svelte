<script lang="ts">
  import { browser } from "$app/environment";
  import { toolkit } from "$lib";
  import {
    appConfigStore,
    appSettingsStore,
    avatarLoadedStore,
  } from "$lib/store";
  import {
    DEFAULT_AVATAR_LANGUAGE,
    type PlatformAppDto,
    type RepositoryAvatarDto,
    type TextUIContentDto,
  } from "@sermas/toolkit";
  import { type ChatMessage, type SessionStatus } from "@sermas/toolkit/dto";
  import { Logger, getChunkId } from "@sermas/toolkit/utils";
  import { onDestroy, onMount } from "svelte";
  import AvatarName from "./AvatarName.svelte";
  import Loader from "./Loader.svelte";
  import VirtualKeyboard from "./VirtualKeyboard.svelte";
  import RenderContent from "./contents/RenderContent.svelte";

  const logger = new Logger("ui");

  const ui = toolkit.getUI();

  let history: ChatMessage[] = [];
  let showStopButton = false;
  let sessionOpened: boolean = false;
  let navigationFrameEnabled = false;
  let showSessionClose = false

  let chatMessage = "";
  let sendingMessage = false;

  let avatar: RepositoryAvatarDto | undefined;
  let gender: string | undefined;
  let language: string | undefined;
  let llm: string | undefined;
  let enableMic: boolean;
  let enableAudio: boolean;

  let app: PlatformAppDto;

  let showHomepage = true;

  const MAX_RESPONSE_WAITING_SEC = 15;
  let waitingResponse = false;
  let dotsTimeout: NodeJS.Timeout;

  let showVirtualKeyboard = false;
  let inputValue = "";
  let placeholder = "";
  let callbackFunc: (res: string) => void;

  let messageId = getChunkId();

  // $: $sessionIdStore, (sessionId = $sessionIdStore);
  $: if ($appConfigStore) {
    app = $appConfigStore;
    loadAvatar();
    loadAvatarGender();
  }

  $: if ($appSettingsStore) {
    llm = $appSettingsStore.llm;
    language = $appSettingsStore.language;
    enableMic = $appSettingsStore.enableMic;
    enableAudio = $appSettingsStore.enableAudio;
  }

  const loadAvatarGender = async () => {
    gender = (await toolkit.getAvatarGender()) || "F";
    return gender;
  };

  const loadAvatar = async () => {
    avatar = await toolkit.getAvatarConfig();
    return avatar;
  };

  const sendToken = () => {
    const iframe = document.getElementById(
      "navigation-frame",
    ) as HTMLIFrameElement;
    const iframeWin = iframe?.contentWindow;
    if (iframeWin) {
      iframeWin?.postMessage(
        JSON.stringify({
          appId: toolkit.getAppId(),
          token: toolkit.getToken(),
        }),
      );
    }
  };

  const scrollChat = () => {
    setTimeout(() => {
      const element = document.getElementById("chat-history");
      if (!element) return;
      element.scrollTop = element.scrollHeight;
    }, 100);
  };

  const startInteraction = () => {
    toolkit?.triggerInteraction("ui", 'start');
  };

  $: if (!sessionOpened && (!history || !history?.length)) showHomepage = true;

  const toggleLoadingDots = (show: boolean) => {
    if (!show) {
      waitingResponse = false;
      clearTimeout(dotsTimeout);
      return;
    }
    waitingResponse = true;
    // off after MAX_RESPONSE_WAITING_SEC sec
    setTimeout(() => toggleLoadingDots(false), MAX_RESPONSE_WAITING_SEC * 1000);
  };

  onMount(async () => {
    if (!browser) return;

    await ui.init();

    ui.on("ui.dialogue.history", (chatHistory: ChatMessage[]) => {
      if (chatHistory.length == 0) {
        toggleLoadingDots(false);
      } else {
        toggleLoadingDots(chatHistory[chatHistory.length - 1].actor == "user");
      }
      showHomepage = false;
      history = [...chatHistory];
      scrollChat();
      // messageId must change every time the avatar "interrupts" the conversation
      messageId = getChunkId();
    });

    ui.on("ui.avatar.speaking", (isSpeaking: boolean) => {
      showStopButton = isSpeaking;
    });

    ui.on("ui.session.changed", (status: SessionStatus) => {
      sessionOpened = status === "started";
    });

    // TODO open navigation iframe on robot action
    ui.on("ui.tool.request", (name: string) => {
      if (name == "navigation-map") {
        if (!navigationFrameEnabled) {
          showNavigation();
        } else {
          hideNavigation();
        }
      }
    });

    ui.on("close.session", () => {
      showSessionClose = true;
    });
  });

  const hideSessionCloser = () => {
    showSessionClose = false
  }

  onDestroy(async () => {
    await ui.destroy();
  });

  const openVirtualKeyboard = (
    initValue: string,
    placehoder: string,
    callback: (res: string) => void,
  ) => {
    callbackFunc = callback;
    inputValue = initValue;
    placeholder = placehoder;
    showVirtualKeyboard = true;
  };

  const onVirtualKeyboardInput = (ev: CustomEvent) => {
    showVirtualKeyboard = false;
    callbackFunc(ev.detail.text);
  };

  const sendChatMessage = async () => {
    sendingMessage = true;
    try {
      const gender = await loadAvatarGender();
      const avatar = await loadAvatar();
      const chunkId = getChunkId();
      await toolkit.getApi().sendChatMessage({
        appId: toolkit.getAppId(),
        sessionId: toolkit.getSessionId(),
        text: chatMessage,
        messageId,
        chunkId,
        language: language || DEFAULT_AVATAR_LANGUAGE,
        avatar: avatar?.id,
        gender,
        llm,
      });
      const content: TextUIContentDto = {
        contentType: "text",
        content: { text: chatMessage + " " },
        messageId,
        chunkId,
        appId: toolkit.getAppId(),
        options: {},
      };
      await ui.appendContent("user", content);
      chatMessage = "";
      ui.stopAvatarSpeech();
    } catch (e: any) {
      logger.log(`Error sending chat message, e=${e.message}`);
    } finally {
      sendingMessage = false;
      scrollChat();
    }
  };

  const showNavigation = () => {
    navigationFrameEnabled = true;
  };

  const hideNavigation = () => {
    navigationFrameEnabled = false;
  };
</script>

<div
  class="ui-content is-flex {history.length
    ? ''
    : 'is-align-items-center'}
    with-input-bar
    : ''} {$avatarLoadedStore ? '' : 'is-hidden'}"
>
  {#if history.length}
    <div class="chat-history" id="chat-history">
      {#each history as chatMessage, i}
        <div class="chat-message actor-{chatMessage.actor}">
          <div class="actor sermas-actor with-neumorphism">
            {#if chatMessage.actor === "agent"}
              <AvatarName
                id={chatMessage.messages[0] &&
                chatMessage.messages[0].metadata?.avatar
                  ? chatMessage.messages[0].metadata?.avatar.toString()
                  : undefined}
              />
            {:else}
              You
            {/if}
          </div>
          <div class="message">
            <span class="time"
              >{chatMessage.ts.toLocaleTimeString(undefined, {
                timeStyle: "short",
                hour12: false,
              })}</span
            >
            <span class="inline-actor is-hidden">
              {#if chatMessage.actor === "agent"}
                <AvatarName
                  id={chatMessage.messages[0] &&
                  chatMessage.messages[0].metadata?.avatar
                    ? chatMessage.messages[0].metadata?.avatar.toString()
                    : undefined}
                />
              {:else}
                You
              {/if}
            </span>
            {#each chatMessage.messages as content}
              <RenderContent {content} />
            {/each}
          </div>
        </div>
      {/each}
      {#if waitingResponse}
        <div class="is-flex is-justify-content-center">
          <div class="loading-dots"></div>
        </div>
      {/if}
      <!-- {#if showSessionClose}
        <SessionCloser on:hide-session-closer={hideSessionCloser}/>
      {/if} -->
    </div>
  {:else if !sessionOpened && showHomepage}
    <div class="welcome-box box block has-text-centered my-6">
      {#if !app}
        <p class="is-size-1 has-text-primary-dark">Welcome</p>
      {:else}
        <p class="is-size-1 sermas-title">
          {app.name || ""}
        </p>
        <p class="is-size-4 has-text-secondary-dark">
          {app.description || ""}
        </p>
      {/if}

      {#if $appSettingsStore?.interactionStart == "touch"}
        <button
          class="button mt-4 is-large is-primary sermas-button"
          on:click={() => startInteraction()}
        >
          <span>Press here to start</span>
        </button>
      {:else if $appSettingsStore?.interactionStart == "intent-detection"}
        <p class="is-size-4 has-text-primary sermas-title">
          Get closer to interact to the avatar
        </p>
      {:else}
        <p class="is-size-4 has-text-primary sermas-title">
          Talk to the avatar to interact
        </p>
      {/if}
    </div>
  {:else}
    <Loader />
  {/if}
  {#if sessionOpened}
    <div class="chat-input">
      <button
        disabled={(enableAudio && !showStopButton) || !enableAudio}
        class="button is-medium is-primary ml-2 sermas-button"
        on:click={() => ui.stopAvatarSpeech()}>
        <span class="icon is-medium">
          <i class="fas fa-stop"></i>
        </span>
        {#if enableMic}
          <span>Stop Avatar</span>
        {/if}
      </button>
      {#if !enableMic}
        <form on:submit|preventDefault={sendChatMessage} class="input-form">
          <input
            class="input is-medium"
            bind:value={chatMessage}
            on:focus={(e) =>
              openVirtualKeyboard(
                chatMessage,
                "Type something to ask",
                (result) => (chatMessage = result),
              )}
            placeholder="Type something to ask"
          />
          <button
            class="button is-medium ml-2 is-primary sermas-button {sendingMessage
              ? 'is-loading'
              : ''}"
            type="submit"
          >
            <span class="icon is-medium">
              <i class="fas fa-paper-plane"></i>
            </span>
            <span>Send</span>
          </button>
        </form>
      {/if}
    </div>
  {/if}
  {#if navigationFrameEnabled}
    <div class="navigation-frame">
      <button
        class="delete is-large is-primary"
        on:click={() => hideNavigation()}
      ></button>
      <iframe
        id="navigation-frame"
        src="./{$appConfigStore.appId}/navigation"
        title="navigation"
      ></iframe>
    </div>
  {/if}
  <VirtualKeyboard
    {placeholder}
    showKeyboard={showVirtualKeyboard}
    {inputValue}
    on:virtual-keyboard-input={onVirtualKeyboardInput}
  />
</div>

<style lang="scss">
  @import "../../variables.scss";

  .navigation-frame {
    position: fixed;
    width: 90%;
    height: 85%;
    top: 5%;
    left: 5%;
    z-index: 50;
  }

  .navigation-frame iframe {
    position: absolute;
    top: 50px;
    width: 100%;
    height: calc(100% - 50px);
    box-shadow: 0px 0px 15px #555;
  }

  .navigation-frame button {
    position: absolute;
    right: 0;
  }

  .chat-input {
    display: flex;
    flex-direction: row-reverse;
    justify-content: space-between;
  }

  .input-form {
    display: flex;
    flex-direction: row;
    flex-grow: 1;
  }

  .chat-input input {
    backdrop-filter: blur(10px);
    background-color: rgba(255, 255, 255, 0.7);
  }

  .message {
    backdrop-filter: blur(10px);
    background-color: rgba(255, 255, 255, 0.8);
  }

  :root {
    --ui-content-width: 40vw;
  }

  .ui-content {
    position: absolute;
    padding: 1em 1em;
    top: 0;
    right: 5vw;
    width: var(--ui-content-width);
    height: 95%;
    flex-direction: column;
    justify-content: center;
  }

  .actor {
    width: 5em;
    height: 2.5em;
    text-align: center;
    border-radius: 0.25em 0.25em;
    margin: 0 0.25em;
  }

  .with-neumorphism {
    backdrop-filter: blur(10px);
    border-radius: 1px;
  }

  .chat-history {
    width: 100%;
    overflow-y: auto;
  }

  .with-input-bar .chat-history {
    height: calc(100% - 80px);
  }

  .chat-history::-webkit-scrollbar {
    display: none;
  }

  /* Hide scrollbar for IE, Edge and Firefox */
  .chat-history {
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
  }

  .chat-message {
    margin: 1em 0;
    display: flex;
    flex-direction: row;
    // background-color: rgba(255,255,255, 0.7);
  }

  .chat-message.actor-agent {
    flex-direction: row-reverse;
  }

  .chat-message > div {
    padding: 0.5em;
  }

  .text {
    overflow-y: auto;
    max-height: 80vh;
  }

  .welcome-box {
    width: 100%;
    backdrop-filter: blur(10px);
    background-color: rgba(white, 0.5);
    padding: 3em 0em;
  }

  .stop-button {
    padding-right: 3.7em;
  }

  .loading-dots {
    /* HTML: <div class="loader"></div> */
    width: 50px;
    aspect-ratio: 2;
    --_g: no-repeat
      radial-gradient(
        circle closest-side,
        var(--theme-primary-bg-color) 90%,
        #0000
      );
    background:
      var(--_g) 0% 50%,
      var(--_g) 50% 50%,
      var(--_g) 100% 50%;
    background-size: calc(100% / 3) 50%;
    animation: l3 1s infinite linear;
  }
  @keyframes l3 {
    20% {
      background-position:
        0% 0%,
        50% 50%,
        100% 50%;
    }
    40% {
      background-position:
        0% 100%,
        50% 0%,
        100% 50%;
    }
    60% {
      background-position:
        0% 50%,
        50% 100%,
        100% 0%;
    }
    80% {
      background-position:
        0% 50%,
        50% 50%,
        100% 100%;
    }
  }

  @include mobile-view {
    .chat-input {
      bottom: 0.5em;
    }

    .ui-content.is-flex {
      width: 100%;
      height: 60%;
      position: absolute;
      top: auto;
      bottom: 0;
      left: 0;
      right: 0;
      border: 0px !important;
    }

    .welcome-box .is-size-1{
      font-size: 2em !important;
    }

    .welcome-box .is-size-4 {
      font-size: 1.3em !important;
    }

    .welcome-box {
      margin: 0 !important;
      width: 100%;
      padding: 1em 0;
    }

    .with-input-bar .chat-history {
      height: calc(100% - 50px);
      overflow: hidden;
      overflow-y: scroll;
    }

    .chat-message {
      display: block;
    }

    .time {
      display: none;
    }

    .inline-actor {
      display: inline !important;
      float: left;
      padding: 0 0.2em 0 0;
      font-weight: bold;
    }
    .inline-actor {
      color: var(--theme-primary-text-color)
    }
    .actor {
      display: none;
    }
  }
</style>
