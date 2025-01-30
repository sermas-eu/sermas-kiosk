<script lang="ts">
  import { type DialogueMessageUIContentDto } from "@sermas/api-client";
  import type { AvatarAudioPlaybackStatus } from "@sermas/toolkit/avatar";
  import { AppSettings, type DialogueActor } from "@sermas/toolkit/dto";
  import { emitter } from "@sermas/toolkit/events";

  import DOMPurify from "dompurify";
  import { marked } from "marked";
  import { onDestroy, onMount } from "svelte";
  import { appReadyStore, appSettingsStore } from "$lib/store";

  interface mexDto {
    [id: string]: {
      mex: string | null;
      mexToShow: string[];
      show: boolean;
      id: string;
    };
  }

  export let content;
  export let actor: DialogueActor | null;
  export let chunks: DialogueMessageUIContentDto[] | null;
  export let messageId: string | undefined;
  let mex: mexDto = {} as mexDto;
  let mexSimple: string;

  let show: boolean = false;
  let chunkIdToShow: string | null = null;
  let duration: number | null = null;
  let settings: AppSettings;
  let ref: any = {};

  onMount(async () => {
    emitter.on("avatar.speech", ev);
  });

  onDestroy(() => {
    emitter.off("avatar.speech", ev);
  });

  const ev = (ev: AvatarAudioPlaybackStatus) => {
    console.warn("*** ev", ev);

    // TODO remove when ev.chunkid present
    if (Object.entries(mex).length !== 0 && mex.constructor === Object) {
      for (const [key, value] of Object.entries(mex)) {
        mex[key].show = false;
      }
    }

    if (ev.chunkId) {
      mex[ev.chunkId] = {
        mex: null,
        mexToShow: [],
        show: false,
        id: ev.chunkId,
      };
    }

    // TODO remove when ev.chunkid present
    show = ev.status == "started" ? true : false;

    chunkIdToShow = ev.chunkId ? ev.chunkId : null;
    duration = ev.duration ? ev.duration : null;

  };

  const renderMarkdown = async (text: string, id?: string) => {
    if (id) {
      mex[id].mex = DOMPurify.sanitize(await marked.parse(text));
      mex[id].id = id;
      mex[id].show = true;
      console.warn("*** text", text);

      const tmp = text.replace(/([.?!])\s*(?=[A-Z])/g, "$1|").split("|");
      for (let i = 0; i < tmp.length; i++) {
        tmp[i] = DOMPurify.sanitize(await marked.parse(tmp[i]));
      }
      mex[id].mexToShow = tmp;
      console.warn("*** mex", mex);
    } else {
      mexSimple = DOMPurify.sanitize(await marked.parse(text));
    }
  };

  $: if ($appReadyStore && $appSettingsStore) {
    settings = $appSettingsStore;
  }

  $: if (
    (actor !== "agent" && content && content.text) ||
    !settings.enableAudio
  )
    renderMarkdown(content.text);

  $: if (actor === "agent" && show && settings.enableAudio) {
    const tmp = chunks?.find((o) => o.chunkId === chunkIdToShow);
    console.warn("*** tmp", tmp?.content);

    if (tmp && tmp.content.chunkId)
      renderMarkdown(tmp.content.text, tmp.content.chunkId);
  }
</script>

<span>
  {#if actor === "agent" && show && chunkIdToShow && mex[chunkIdToShow].show && settings.enableAudio}
    <div
      id="box"
      class="subtitle-wrap message {actor == 'agent'
        ? 'agent-box'
        : 'user-box'}"
      bind:this={ref[chunkIdToShow]}
    >
      <div class={actor == "agent" ? "agent-wrap" : ""}>
        <div
          class="message-{messageId || 'none'} subtitle {actor == 'agent'
            ? 'agent'
            : 'user'}"
        >
          {chunkIdToShow}
          {@html mex[chunkIdToShow].mex}
        </div>
      </div>
    </div>
  {:else if mexSimple}
    <div
      id="box"
      class="subtitle-wrap message {actor == 'agent'
        ? 'agent-box'
        : 'user-box'}"
    >
      <div class={actor == "agent" ? "agent-wrap" : ""}>
        <div
          class="message-{messageId || 'none'} subtitle {actor == 'agent'
            ? 'agent'
            : 'user'}"
        >
          {@html mexSimple}
        </div>
      </div>
    </div>
  {/if}
</span>

<style lang="scss">
  @use "bulma/sass/utilities/mixins";
  @import "../../../variables.scss";
  $breakpoint: 1201px;

  .subtitle-wrap {
    backdrop-filter: blur(10px);
    opacity: 0.7;
    background-color: var(--theme-primary-bg-color);
    padding: 1em 1em;
    display: block;
  }

  .agent-box {
    background-color: var(--theme-secondary-bg-color);
    bottom: 15vh;
    display: flex;
    flex-direction: column;
    overflow: auto;
    height: 100%;
    width: 100%;

    @include mixins.until($breakpoint) {
      margin-left: 1rem;
      margin-right: 1rem;
    }

    @include mixins.from($breakpoint) {
      // width: var(--ui-content-width);
    }
  }

  .user-box {
    background-color: var(--theme-primary-bg-color);

    @include mixins.until($breakpoint) {
      width: auto;
      margin-left: 1rem;
      margin-right: 1rem;
    }
  }

  .subtitle {
    color: var(--theme-primary-text-color);
    display: contents;
  }

  .agent-wrap {
    position: relative;
    display: block;
    min-height: 100%;
  }

  .agent {
    color: var(--theme-secondary-text-color);
    display: unset;
    padding-top: 1rem;
  }
</style>
