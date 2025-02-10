<script lang="ts">
  import { browser } from "$app/environment";
  import { toolkit } from "$lib";
  import {
    appConfigStore,
    appSettingsStore,
    avatarLoadedStore,
  } from "$lib/store";
  import {
    type PlatformAppDto,
    type RepositoryAvatarDto,
    type TextUIContentDto,
  } from "@sermas/toolkit";
  import {
    type SubtitleMessage,
    type ChatMessage,
    type SessionStatus,
  } from "@sermas/toolkit/dto";
  import { Logger, getChunkId } from "@sermas/toolkit/utils";
  import { onDestroy, onMount } from "svelte";
  import AvatarName from "./AvatarName.svelte";
  import Loader from "./Loader.svelte";
  import VirtualKeyboard from "./VirtualKeyboard.svelte";
  import RenderContent from "./contents/RenderContent.svelte";
  import Subtitle from "./contents/Subtitle.svelte";
  import { emitter } from "@sermas/toolkit/events";

  const logger = new Logger("ui");

  const ui = toolkit.getUI();

  let history: ChatMessage[] = [];
  let lastMessage: ChatMessage | undefined;
  let showStopButton = false;
  let sessionOpened: boolean = false;
  let navigationFrameEnabled = false;

  let chatMessage = "";
  let sendingMessage = false;

  let avatar: RepositoryAvatarDto | undefined;
  let gender: string | undefined;
  let language: string | undefined;
  let llm: Record<string, string | undefined> | undefined;
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

  let compRef: any = {};

  let subtitle: SubtitleMessage;
  let showSubsBlock: boolean = false;

  $: if ($appConfigStore) {
    app = $appConfigStore;
  }

  $: if ($appSettingsStore) {
    llm = $appSettingsStore.llm;
    language = $appSettingsStore.language;
    enableMic = $appSettingsStore.enableMic;
    enableAudio = $appSettingsStore.enableAudio;
  }

  const scrollChat = () => {
    setTimeout(() => {
      const element = document.getElementById("chat-history");
      if (!element) return;
      element.scrollTop = element.scrollHeight;
    }, 100);
  };

  const startInteraction = () => {
    toolkit?.triggerInteraction("ui", "start");
  };

  $: if (!sessionOpened && (!history || !history?.length)) showHomepage = true;

  const toggleLoadingDots = (show: boolean) => {
    if (!show) {
      waitingResponse = false;
      if (dotsTimeout) clearTimeout(dotsTimeout);
      return;
    }
    waitingResponse = true;
    // off after MAX_RESPONSE_WAITING_SEC sec
    dotsTimeout = setTimeout(
      () => toggleLoadingDots(false),
      MAX_RESPONSE_WAITING_SEC * 1000
    );
  };

  onMount(async () => {
    if (!browser) return;

    await ui.init();

    ui.on("ui.dialogue.history", (chatHistory: ChatMessage[]) => {
      if (chatHistory.length == 0) {
        if (lastMessage && lastMessage.messages) {
          lastMessage.messages = [];
        }
        toggleLoadingDots(false);
      } else {
        toggleLoadingDots(chatHistory[chatHistory.length - 1].actor == "user");
      }
      showHomepage = false;
      history = [...chatHistory];
      if (history.length) lastMessage = history[history.length - 1];

      for (const [key, value] of Object.entries(compRef)) {
        if (key !== "leave" && value) {
          compRef[key].remove();
          delete compRef[key];
        }
      }

      scrollChat();
      // messageId must change every time the avatar "interrupts" the conversation
      messageId = getChunkId();
    });

    ui.on("ui.avatar.speaking", (isSpeaking: boolean) => {
      showStopButton = isSpeaking;
    });

    ui.on("ui.session.changed", (status: SessionStatus) => {
      sessionOpened = status === "started";
      if (!sessionOpened) history = [];
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

    emitter.on("avatar.subtitle", subsEv);
    emitter.on("avatar.subtitle.clean", showSubs);
  });

  onDestroy(async () => {
    await ui.destroy();
    emitter.off("avatar.subtitle", subsEv);
    emitter.off("avatar.subtitle.clean", showSubs);
  });

  const subsEv = (ev: SubtitleMessage) => {
    showSubsBlock = true;
    subtitle = ev;
  };

  const showSubs = (ev: boolean) => {
    showSubsBlock = !ev;
  };

  const openVirtualKeyboard = (
    initValue: string,
    placehoder: string,
    callback: (res: string) => void
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

    const dialogueMessage = await toolkit.sendChatMessage(chatMessage);
    if (dialogueMessage) {
      const content: TextUIContentDto = {
        messageId: dialogueMessage.messageId,
        chunkId: dialogueMessage.chunkId,
        appId: dialogueMessage.appId,
        contentType: "text",
        content: { text: chatMessage + " " },
        options: {},
      };
      await ui.appendContent("user", content);
      chatMessage = "";
      ui.stopAvatarSpeech(messageId);
    } else {
      // send failed
    }

    sendingMessage = false;
    scrollChat();
  };

  const showNavigation = () => {
    navigationFrameEnabled = true;
  };

  const hideNavigation = () => {
    navigationFrameEnabled = false;
  };
</script>

<span>
  {#if subtitle && $appSettingsStore.subtitlesEnabled && sessionOpened}
    <span id="ui-content-agent" class="ui-content-agent">
      <div
        class="is-flex chat-history chat-history-subs chat-history-agent-subs"
      >
        {#if showSubsBlock}
          <div class="subtitle-div" id="subtitle-{subtitle.id || 'none'}">
            <span class="subtitle-box agent-box">
              <Subtitle mex={subtitle.mex} id={subtitle.id} actor="agent" />
            </span>
          </div>
        {/if}
        {#if waitingResponse}
          <div class="is-flex is-justify-content-center">
            <div class="loading-dots"></div>
          </div>
        {/if}
      </div>
    </span>
  {/if}
  <div
    id="ui-content"
    class="ui-content is-flex {history.length ? '' : 'is-align-items-center'}
    with-input-bar
    : ''} {$avatarLoadedStore ? '' : 'is-hidden'}"
  >
    {#if history.length && !$appSettingsStore.subtitlesEnabled && sessionOpened}
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
              <span class="time">
                {chatMessage.ts.toLocaleTimeString(undefined, {
                  timeStyle: "short",
                  hour12: false,
                })}
              </span>
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
      </div>
    {:else if lastMessage && $appSettingsStore.subtitlesEnabled && sessionOpened}
      <div class="is-flex chat-history chat-history-subs">
        {#each history as chatMessage, index}
          {#each chatMessage.messages as message, i}
            {#if chatMessage.actor === "agent" && message.contentType !== "dialogue-message"}
              <div
                class="subtitle-div {chatMessage.actor === 'agent' &&
                message.contentType == 'buttons'
                  ? 'button-div'
                  : ''}"
                bind:this={compRef[
                  message.options?.clearScreen
                    ? message.messageId
                      ? message.messageId
                      : String(Math.random())
                    : "leave"
                ]}
              >
                <span
                  class="subtitle-box {chatMessage.actor === 'agent'
                    ? 'subs-message'
                    : ''}
                    {message.contentType === 'background-audio' ||
                  (message.contentType === 'image' &&
                    message.content.isBackground)
                    ? 'display-content'
                    : ''}"
                >
                  <span
                    class="subtitle-span {chatMessage.actor === 'agent'
                      ? 'button'
                      : ''}"
                  >
                    <RenderContent
                      content={message}
                      subtitle={$appSettingsStore.subtitlesEnabled}
                      actor={chatMessage.actor}
                    />
                  </span>
                </span>
              </div>
            {/if}
          {/each}
        {/each}
        {#each lastMessage.messages as message, i}
          {#if lastMessage.actor !== "agent" && lastMessage.messages.length === i + 1}
            <div class="subtitle-div">
              <span class="subtitle-box">
                <span class="subtitle-span">
                  <RenderContent
                    content={message}
                    subtitle={$appSettingsStore.subtitlesEnabled}
                    actor={lastMessage.actor}
                  />
                </span>
              </span>
            </div>
          {/if}
        {/each}
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
          on:click={() => ui.stopAvatarSpeech()}
        >
          <span class="icon is-medium">
            <i class="fas fa-stop"></i>
          </span>
        </button>
        <form on:submit|preventDefault={sendChatMessage} class="input-form">
          <input
            id="user-input"
            class="input is-medium"
            bind:value={chatMessage}
            on:focus={(e) =>
              openVirtualKeyboard(
                chatMessage,
                "Type something to ask",
                (result) => (chatMessage = result)
              )}
            placeholder="Type something to ask"
            autocomplete="off"
          />
          <button
            id="send-button"
            class="button is-medium ml-2 is-primary sermas-button {sendingMessage
              ? 'is-loading'
              : ''}"
            type="submit"
          >
            <span>Send</span>
          </button>
        </form>
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
</span>

<style lang="scss">
  @use "bulma/sass/utilities/mixins";
  @import "../../variables.scss";
  $breakpoint: 1201px;

  .subtitle-div {
    justify-content: end;
    display: flex;
    flex-direction: column;
  }

  .subtitle-box {
    margin-bottom: 1em;
    border-radius: 4px;
    display: block;
  }

  .agent-box {
    margin-bottom: 0em;
    display: flex;
    min-width: 100%;
  }

  .display-content {
    display: contents;
  }

  .subtitle-span {
    display: contents;
  }

  .button-div {
    justify-content: flex-start;
  }

  .chat-history-subs {
    height: 100%;
    flex-direction: column;
    justify-content: end;
  }

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

  .subs-message {
    backdrop-filter: blur(10px);
    // opacity: 0.7;
    background-color: rgba(255, 255, 255, 0.8);
    margin-bottom: 10px;
    padding: 1em 1em;
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

  .ui-content-agent {
    position: absolute;
    padding: 1em 1em;
    top: 0;
    left: 2vw;
    width: var(--ui-content-width);
    height: 95%;
    flex-direction: column;
    justify-content: center;
  }

  .chat-history-agent-subs {
    height: calc(100% - 80px);
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

    .ui-content-agent {
      position: absolute;
      width: 100%;
      height: 40%;
      top: 6rem;
      bottom: auto;
      left: 0;
      right: 0;
    }

    .welcome-box .is-size-1 {
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
      color: var(--theme-primary-text-color);
    }
    .actor {
      display: none;
    }
  }
</style>
