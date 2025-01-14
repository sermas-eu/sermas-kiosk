<script lang="ts">
  import { type DialogueMessageUIContentDto } from "@sermas/api-client";
  import type { AvatarAudioPlaybackStatus } from "@sermas/toolkit/avatar";
  import { AppSettings, type DialogueActor } from "@sermas/toolkit/dto";
  import { emitter } from "@sermas/toolkit/events";

  import DOMPurify from "dompurify";
  import { marked } from "marked";
  import { onDestroy, onMount } from "svelte";
  import { appReadyStore, appSettingsStore } from "$lib/store";
  import { gsap } from "gsap";
  import { ScrollTrigger } from "gsap/dist/ScrollTrigger.js";
  import { tick } from "svelte";

  export let content;
  export let actor: DialogueActor | null;
  export let chunks: DialogueMessageUIContentDto[] | null;
  export let messageId: string | undefined;
  let mex: string;

  let show: boolean = false;
  let chunkIdToShow: string | null = null;
  let settings: AppSettings;

  gsap.registerPlugin(ScrollTrigger);
  let tl = gsap.timeline();
  let ready = false;
  let ref;

  onMount(async () => {
    emitter.on("avatar.speech", ev);
    ready = true;
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

  $: if (
    ((actor === "agent" && show) ||
      (actor === "agent" && !settings.enableAudio)) &&
    ready &&
    mex
  ) {
    scrollText();
  }

  $: if (actor === "agent" && show) {
    const tmp = chunks?.find((o) => o.chunkId === chunkIdToShow);
    if (tmp) renderMarkdown(tmp.content.text);
  }

  async function scrollText() {
    await tick();
    const scroller = document.getElementById("scroller") as HTMLElement;
    if (!scroller) return;

    let scrollerheight = scroller.offsetHeight;

    let box = document.getElementById("box");
    let scrolldistance = scrollerheight + (box ? box.offsetHeight : 0);

    // Make a copy div with scroll distance
    let scrollcopy = document.getElementById("scroller-copy");
    let scrollscrolllength = scrollerheight * 4;
    if (scrollcopy) {
      scrollcopy.style.height = scrollscrolllength + "px";
    }

    // Slowly scroll the items
    tl.to(scroller, {
      y: -scrolldistance,
      duration: Math.round(scrollerheight / 3),
      // ease: "sine.inOut",
      ease: "power1.out",
    });

    // Listen to the scrolltrigger, and sync the animation speed
    ScrollTrigger.create({
      trigger: scrollcopy,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        var velo = self.getVelocity();
        var speed = velo * 0.01;
        tl.timeScale(speed);
      },
    });

    // On scrolling play the timeline
    ScrollTrigger.addEventListener("scrollStart", function () {
      tl.play();
    });

    // When scrolling is done, pause for a moment, then resume animation
    ScrollTrigger.addEventListener("scrollEnd", function () {
      tl.timeScale(1);
      tl.pause();

      setTimeout(() => {
        tl.play();
      }, 500);
    });
  }
</script>

{#if (actor === "agent" && show) || actor !== "agent" || !settings.enableAudio}
  <div
    id="box"
    class="subtitle-wrap message {actor == 'agent' ? 'agent-box' : 'user-box'}"
  >
    <div class={actor == "agent" ? "agent-wrap" : ""}>
      <div
        id="scroller"
        class="message-{messageId || 'none'} subtitle {actor == 'agent'
          ? 'agent'
          : 'user'}"
        bind:this={ref}
      >
        {@html mex}
      </div>
      <div id="scroller-copy" class="scroller-copy" />
    </div>
  </div>
{/if}

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
    min-height: 4rem;
  }

  .agent {
    color: var(--theme-secondary-text-color);
    position: fixed;
    display: unset;
    padding-top: 1rem;
  }

  .scroller-copy {
    position: relative;
    height: 10px;
    width: 100%;
  }
</style>
