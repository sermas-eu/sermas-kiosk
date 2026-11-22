<script lang="ts">
  import { toolkit } from "#lib";
  import { markUsed, usedIndex } from "#lib/used-content.ts";
  import {
    type QuizContentDto,
    UI_INTERACTION_TOPIC,
    type QuizAnswerDto,
    type UIInteractionEventDto,
  } from "@sermas/toolkit";

  interface Props {
    content: QuizContentDto;
    metadata: Record<string, any> | undefined;
    // single use, see #lib/used-content
    usedKey?: string;
  }

  let { content, metadata, usedKey }: Props = $props();
  // without a key (no ids) the choice is kept by this instance only
  let localSelected = $state(-1);
  // one answer: afterwards only the chosen one stays, disabled
  let selected = $derived(usedKey ? usedIndex(usedKey) : localSelected);

  const clicked = (answer: QuizAnswerDto, idx: number) => {
    if (selected > -1) return;
    localSelected = idx;
    markUsed(usedKey, idx);
    // console.warn(`selected answerId=${answer.answerId}`);
    const payload = {
      appId: toolkit.getAppId(),
      sessionId: toolkit.getSessionId(),
      moduleId: "avatar",
      interaction: {
        context: {
          answerId: answer.answerId,
          ...(metadata || {}),
        },
        element: "quiz",
        value: answer.answer,
      },
    } as UIInteractionEventDto;
    toolkit.getBroker().publish(`${UI_INTERACTION_TOPIC}/avatar`, payload);
  };
</script>

<div class="quiz">
  <div class="quiz-question">{content.question}</div>
  <span class={content.answers[0].answerImage ? "image-wrap" : ""}>
    {#each content.answers as a, idx}
      {#if selected > -1 && selected !== idx}
        <!-- answered: only the chosen answer stays -->
      {:else if a.answerImage}
        <button
          onclick={() => clicked(a, idx)}
          class="image-button"
          disabled={selected > -1}
        >
          <img
            src={a.answerImage.src}
            alt={a.answerImage.alt}
            style="max-width:100%;"
          />
        </button>
      {:else}
        <div class="quiz-answer">
          <button
            onclick={() => clicked(a, idx)}
            class="button is-multiline is-primary sermas-button"
            disabled={selected > -1}
          >
            {a.answer}
          </button>
        </div>
      {/if}
    {/each}
  </span>
</div>

<style lang="scss">
  @use "../../../variables.scss" as *;

  .quiz {
    // width: calc(var(--ui-content-width) / 1.5);

    .quiz-question {
      white-space: break-spaces;
    }

    .quiz-answer button {
      text-wrap: wrap;
      margin: 0.5em 0;
      padding: 0.5em;
      height: auto;
    }

    .button.is-multiline {
      min-height: 2.25em;
      white-space: break-spaces;
      height: auto;
      flex-direction: column;
    }
  }

  @include mobile-view {
    .quiz {
      width: 100%;
    }
  }

  .image-wrap {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
  }

  .image-button {
    max-width: 31%;
    flex: 1 0 33%;
    margin: 5px;
    max-height: 200px;
    cursor: pointer;
    padding: 0;
    border: none;
    background: none;
  }
</style>
