<script lang="ts">
  import { type DialogueMessageUIContentDto } from "@sermas/api-client";
  import type { AvatarAudioPlaybackStatus } from "@sermas/toolkit/avatar";
  import { type DialogueActor } from "@sermas/toolkit/dto";
  import { emitter } from "@sermas/toolkit/events";

  import DOMPurify from "dompurify";
  import { marked } from "marked";
  import { onDestroy, onMount } from "svelte";

  export let content;
  export let actor: DialogueActor | null;
  export let chunks: DialogueMessageUIContentDto[] | null;

  let mex: string;

  let show: boolean = false;
  let chunkIdToShow: string | null = null;

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

  $: if (actor != "agent" && content && content.text)
    renderMarkdown(content.text);
  $: if (actor == "agent" && show) {
    const tmp = chunks?.find((o) => o.chunkId === chunkIdToShow);
    if (tmp) renderMarkdown(tmp.content.text);
  }
</script>

<span>
  {#if (actor == "agent" && show) || actor != "agent"}
    <span
      class="subtitle-wrap message {actor == 'agent'
        ? 'agent-box'
        : 'user-box'}"
    >
      <span
        class="message-{content.messageId || 'none'} subtitle {actor == 'agent'
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
