<script lang="ts">
  import { type DialogueMessageUIContentDto } from "@sermas/api-client";
  import type { AvatarAudioPlaybackStatus } from "@sermas/toolkit/avatar";
  import { AppSettings, type DialogueActor } from "@sermas/toolkit/dto";
  import { emitter } from "@sermas/toolkit/events";

  import DOMPurify from "dompurify";
  import { marked } from "marked";
  import { onDestroy, onMount } from "svelte";
  import { appReadyStore, appSettingsStore } from "$lib/store";

  export let content;
  export let actor: DialogueActor | null;
  export let chunks: DialogueMessageUIContentDto[] | null;
  export let messageId: string | undefined;
  let mex: string;

  let show: boolean = false;
  let chunkIdToShow: string | null = null;
  let settings: AppSettings;

  onMount(async () => {
    emitter.on("avatar.speech", ev);
  });

  onDestroy(() => {
    emitter.off("avatar.speech", ev);
  });

  const ev = (ev: AvatarAudioPlaybackStatus) => {
    show = ev.status == "started" ? true : false;
    chunkIdToShow = ev.chunkId ? ev.chunkId : null;
  };

  const renderMarkdown = async (text: string) => {
    mex = DOMPurify.sanitize(await marked.parse(text));
  };

  $: if ($appReadyStore && $appSettingsStore) {
    settings = $appSettingsStore;
  }

  $: if (
    (actor !== "agent" && content && content.text) ||
    !settings.enableAudio
  )
    renderMarkdown(content.text);

  $: if (actor === "agent" && show) {
    const tmp = chunks?.find((o) => o.chunkId === chunkIdToShow);
    if (tmp) renderMarkdown(tmp.content.text);
  }
</script>

<span>
  {#if (actor === "agent" && show) || actor !== "agent" || !settings.enableAudio}
    <span
      class="subtitle-wrap message {actor == 'agent'
        ? 'agent-box'
        : 'user-box'}"
    >
      <span
        class="message-{messageId || 'none'} subtitle {actor == 'agent'
          ? 'agent'
          : 'user'}"
      >
        {@html mex}
      </span>
    </span>
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
    position: absolute;
    background-color: var(--theme-secondary-bg-color);
    bottom: 15vh;

    @include mixins.until($breakpoint) {
      width: auto;
      margin-left: 1rem;
      margin-right: 1rem;
    }

    @include mixins.from($breakpoint) {
      width: var(--ui-content-width);
      left: 7vh;
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

  .agent {
    color: var(--theme-secondary-text-color);
  }
</style>
