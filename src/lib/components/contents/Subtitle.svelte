<script lang="ts">
  import { type DialogueActor } from "@sermas/toolkit/dto";
  import DOMPurify from "dompurify";
  import { marked } from "marked";

  export let actor: DialogueActor | null;
  export let mex: string;
  export let id: string;
  let textToShow: string;

  const renderMarkdown = async (text: string) => {
    textToShow = DOMPurify.sanitize(await marked.parse(text));
  };

  $: if (mex) {
    renderMarkdown(mex);
  }
</script>

<div
  id="box"
  class="subtitle-wrap message {actor == 'agent' ? 'agent-box' : 'user-box'}"
>
  <div class={actor == "agent" ? "agent-wrap" : ""}>
    <div
      class="content message-{id || 'none'} subtitle {actor == 'agent'
        ? 'agent'
        : 'user'}"
    >
      {@html textToShow}
    </div>
  </div>
</div>

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
