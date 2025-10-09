<script lang="ts">
  import { browser } from "$app/environment";
  import { toolkit } from "$lib";
  import {
    appConfigStore,
    appSettingsStore,
    avatarLoadedStore,
    backgroundImageAndSoundStore,
    sessionIdStore,
  } from "$lib/store";
  import { toBase64 } from "$lib/util";
  import { type PlatformAppDto, type TextUIContentDto } from "@sermas/toolkit";
  import type {
    ChatMessage,
    RequestProcessing,
    SessionStatus,
    SubtitleMessage,
    UserSpeaking,
  } from "@sermas/toolkit/dto";
  import { emitter } from "@sermas/toolkit/events";
  import { Logger, getChunkId } from "@sermas/toolkit/utils";
  import { deepCopy } from "deep-copy-ts";
  import { createEventDispatcher, onDestroy, onMount } from "svelte";
  import AvatarName from "./AvatarName.svelte";
  import RenderContent from "./contents/RenderContent.svelte";
  import Loader from "./Loader.svelte";
  import SpinnerRequest from "./SpinnerRequest.svelte";
  import SpinnerVoice from "./SpinnerVoice.svelte";
  import Subtitle from "./Subtitle.svelte";
  import VirtualKeyboard from "./VirtualKeyboard.svelte";
    import PushToTalk from "./PushToTalk.svelte";

  type InteractionSpinner = {
    type: "voice" | "request";
    enabled?: number;
    timeout?: NodeJS.Timeout;
  };

  const logger = new Logger("ui");

  const ui = toolkit.getUI();

  let history: ChatMessage[] = [];

  let lastMessage: ChatMessage | undefined;
  let lastUserMessage: ChatMessage | undefined;

  let showStopButton = false;
  let sessionOpened: boolean = false;
  let navigationFrameEnabled = false;

  let chatMessage = "";
  let sendingMessage = false;

  let language: string | undefined;
  let llm: Record<string, string | undefined> | undefined;
  let enableMic: boolean;
  let enableAudio: boolean;

  let app: PlatformAppDto;

  let showHomepage = true;

  const SPINNER_TIMEOUT = 10 * 1000;

  let interactionSpinner: InteractionSpinner = {
    type: "voice",
  };

  let pageContentSpinnerTimeout: NodeJS.Timeout;

  let showVirtualKeyboard = false;
  let inputValue = "";
  let placeholder = "";
  let callbackFunc: (res: string) => void;

  let messageId = getChunkId();

  let lastClearScreenMessageId = getChunkId();

  let subtitle: SubtitleMessage;
  let showSubtitlesBlock: boolean = false;

  $: if ($appConfigStore) {
    app = $appConfigStore;
  }

  $: if ($appSettingsStore) {
    llm = $appSettingsStore.llm;
    language = $appSettingsStore.language;
    enableMic = $appSettingsStore.enableMic;
    enableAudio = $appSettingsStore.enableAudio;
  }

  const dispatch = createEventDispatcher();

  function onStart() { dispatch('start');}
  function onStop()  { dispatch('stop'); }

  const scrollChat = () => {
    setTimeout(() => {
      const elements = document.getElementsByClassName("scroll-span");
      if (!elements || elements.length === 0) return;
      const element = elements[0] as HTMLElement;
      if (!element) return;
      element.scrollTop = element.scrollHeight;
    }, 100);
  };

  const startInteraction = () => {
    toolkit?.triggerInteraction("ui", "start");
  };

  $: if ($sessionIdStore) {
    sessionOpened = $sessionIdStore ? true : false;

    if (sessionOpened) {
      pageContentSpinnerTimeout = setTimeout(() => {
        if (lastMessage) return;
        // show empty right block instead of an infinite spinner
        lastMessage = {
          actor: "agent",
          ts: new Date(),
          messages: [],
        };
      }, 2500);
    } else {
      lastMessage = undefined;
    }
  }
  $: if (!sessionOpened && (!history || !history?.length)) showHomepage = true;

  const showInteractionSpinner = (
    show: boolean,
    type?: "voice" | "request",
  ) => {
    type = type || "voice";

    if (type !== interactionSpinner.type) {
      showInteractionSpinner(false, interactionSpinner.type);
    }

    interactionSpinner.type = type;

    if (show && interactionSpinner.enabled) {
      return;
    }

    // avoid flickering
    if (
      interactionSpinner.enabled &&
      Date.now() - interactionSpinner.enabled < 1000
    ) {
      return;
    }

    if (interactionSpinner.timeout) {
      clearTimeout(interactionSpinner.timeout);
      interactionSpinner.timeout = undefined;
    }

    interactionSpinner.enabled = show ? Date.now() : 0;

    if (show) {
      // remove after timeout
      interactionSpinner.timeout = setTimeout(() => {
        interactionSpinner.enabled = 0;
      }, SPINNER_TIMEOUT);
    }

    interactionSpinner = { ...interactionSpinner };
  };

  onMount(async () => {
    if (!browser) return;

    await ui.init();

    ui.on("ui.user.request-processing", (ev: RequestProcessing) => {
      showInteractionSpinner(ev.status === "started", "request");
    });

    ui.on("ui.session.changed", (status: SessionStatus) => {
      sessionOpened = status === "started";
      if (!sessionOpened) history = [];
    });

    ui.on("ui.dialogue.history", (chatHistory: ChatMessage[]) => {
      // if (chatHistory.length === 0) {
      //   if (lastMessage && lastMessage.messages) {
      //     lastMessage.messages = [];
      //   }
      //   // showLoadingDots(false);
      //   // } else {
      //   //   const isLastMessageFromUser =
      //   //     chatHistory[chatHistory.length - 1].actor === "user";
      //   //   showLoadingDots(isLastMessageFromUser);
      // }

      showHomepage = false;

      history = [...deepCopy(chatHistory)];

      // console.warn("history", history);

      if (history.length) {
        lastMessage = history[history.length - 1];
        if (lastMessage && lastMessage?.actor === "user") {
          lastUserMessage = deepCopy(lastMessage);
        }
      }

      for (const message of history) {
        (message.messages || []).forEach((uiContent) => {
          const uiContentMessageId =
            uiContent.messageId ||
            getChunkId(new Date(uiContent.ts || message.ts));

          uiContent.messageId = uiContentMessageId;

          if (uiContentMessageId < lastClearScreenMessageId) {
            // remove content
            logger.debug(`remove content from ${uiContentMessageId}`);
            return;
          }

          if (uiContent.contentType === "dialogue-message") return;

          if (uiContent.options?.clearScreen) {
            lastClearScreenMessageId = uiContentMessageId;
            logger.debug(
              `set clear screen content from ${lastClearScreenMessageId}`,
            );
          }
        });
      }

      scrollChat();
      // messageId must change every time the avatar "interrupts" the conversation
      messageId = getChunkId();

      if (
        lastMessage &&
        lastMessage.actor == "agent" &&
        lastMessage.messages.length
      ) {
        if (
          lastMessage.messages.filter((m) => m.isWelcome === true).length &&
          $backgroundImageAndSoundStore.image &&
          $backgroundImageAndSoundStore.image === "stream"
        ) {
          $backgroundImageAndSoundStore.image =
            $backgroundImageAndSoundStore.defaultImage;

          if ($backgroundImageAndSoundStore.defaultImage) {
            setBackground($backgroundImageAndSoundStore.defaultImage);
          }
          $backgroundImageAndSoundStore.urlImage = "";
          $backgroundImageAndSoundStore.defaultImage = undefined;
          $backgroundImageAndSoundStore.messageImage = false;
          $backgroundImageAndSoundStore.isBackgroundAudioPlaying = false;
        }
      }
    });

    const setBackground = async (background: string) => {
      let config = await toolkit.getAssetConfig("backgrounds", background);
      if (!config) return;

      const blob = await toolkit.getApi().getAsset(config.type, config.id);
      if (blob) {
        $backgroundImageAndSoundStore.urlImage = `${await toBase64(blob)}`;
      }
    };

    ui.on("ui.user.request-processing", (req: RequestProcessing) => {
      showInteractionSpinner(false, "request");
    });

    ui.on("ui.avatar.speaking", (isSpeaking: boolean) => {
      showStopButton = isSpeaking;
      showInteractionSpinner(false, "voice");
    });

    ui.on("ui.user.speaking", (speaking: UserSpeaking) => {
      const showDots = speaking.status !== "completed";
      showInteractionSpinner(showDots, "voice");
      // showSubtitlesBlock = false;
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

    emitter.on("avatar.subtitle", onAvatarSubtitle);
    emitter.on("avatar.subtitle.clean", onAvatarSubtitleClean);
  });

  onDestroy(async () => {
    await ui.destroy();
    emitter.off("avatar.subtitle", onAvatarSubtitle);
    emitter.off("avatar.subtitle.clean", onAvatarSubtitleClean);
  });

  const onAvatarSubtitle = (ev: SubtitleMessage) => {
    showSubtitlesBlock = true;
    subtitle = ev;
  };

  const onAvatarSubtitleClean = (ev: boolean) => {
    showSubtitlesBlock = !ev;
  };

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
  {#if (subtitle || interactionSpinner.enabled) && $appSettingsStore.subtitlesEnabled && sessionOpened}
    <span id="ui-content-agent" class="ui-content-agent">
      <div
        class="is-flex chat-history chat-history-subs chat-history-agent-subs"
      >
        {#if showSubtitlesBlock}
          <div class="subtitle-div" id="subtitle-{subtitle.id || 'none'}">
            <span class="subtitle-box agent-box">
              <Subtitle
                message={subtitle.message}
                id={subtitle.id}
                actor="agent"
              />
            </span>
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
        {#if interactionSpinner.enabled}
          <div class="is-flex is-justify-content-center">
            {#if interactionSpinner.type === "voice"}
              <SpinnerVoice />
            {:else}
              <SpinnerRequest />
            {/if}
          </div>
        {/if}
      </div>
    {:else if (lastMessage || lastUserMessage) && $appSettingsStore.subtitlesEnabled && sessionOpened}
      <div class="is-flex chat-history chat-history-subs">
        <span class="scroll-span">
          {#each history as chatMessage, index}
            {#each chatMessage.messages as message, i}
              {#if chatMessage.actor === "agent" && message.contentType !== "dialogue-message" && message.messageId && message.messageId >= lastClearScreenMessageId}
                <div
                  class="subtitle-div {chatMessage.actor === 'agent' &&
                  message.contentType == 'buttons'
                    ? 'button-div'
                    : ''}"
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
        </span>

        {#if lastUserMessage || interactionSpinner.enabled}
          <!-- interaction spinner -->
          {#if interactionSpinner.enabled || !lastUserMessage}
            <div class="interaction-spinner">
              {#if interactionSpinner.type === "voice"}
                <SpinnerVoice />
              {:else}
                <SpinnerRequest />
              {/if}
            </div>
          {:else}
            {#each lastUserMessage.messages as message, i}
              {#if lastUserMessage.messages.length === i + 1}
                <div class="subtitle-div">
                  <span class="subtitle-box">
                    <span class="subtitle-span">
                      <RenderContent
                        content={message}
                        subtitle={$appSettingsStore.subtitlesEnabled}
                        actor={lastUserMessage.actor}
                      />
                    </span>
                  </span>
                </div>
              {/if}
            {/each}
          {/if}
        {/if}
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
        {#if showStopButton}
        <button
          disabled={(enableAudio && !showStopButton) || !enableAudio}
          class="button is-medium is-primary ml-2 sermas-button"
          on:click={() => ui.stopAvatarSpeech()}
        >
        <span class="icon is-medium">
          <i class="fas fa-stop"></i>
        </span>
      </button>
      {/if}
        <form on:submit|preventDefault={sendChatMessage} class="input-form">
          <input
            id="user-input"
            class="input is-medium"
            bind:value={chatMessage}
            on:focus={(e) =>
              openVirtualKeyboard(
                chatMessage,
                "Type something to ask",
                (result) => (chatMessage = result),
              )}
            placeholder="Type something to ask"
            autocomplete="off"
          />
          {#if chatMessage.trim().length > 0}
          <button
            id="send-button"
            class="button is-medium ml-2 is-primary sermas-button {sendingMessage
              ? 'is-loading'
              : ''}"
            type="submit"
          >
            <span>Send</span>
          </button>
          {/if}
        </form>
        <PushToTalk on:start={onStart} on:stop={onStop}/>
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

  .scroll-span {
    // flex-grow: 1;
    // flex-wrap: nowrap;
    min-height: 0;
    // overflow: hidden scroll;
    overflow: auto;
    scrollbar-width: auto;
    display: flex;
    flex-direction: column;
    margin: 0 0 0.5em 0;
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
    width: 100%;
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

  .interaction-spinner {
    background-color: var(--theme-primary-bg-color);
    border-radius: 4px;
    backdrop-filter: blur(10px);
    opacity: 0.8;
    background-color: var(--theme-primary-bg-color);
    padding: 1em 1em;
    display: block;
    margin: 0 0 0.5em 0;
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
