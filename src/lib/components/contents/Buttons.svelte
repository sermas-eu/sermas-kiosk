<script lang="ts">
  import { toolkit } from "$lib";
  import {
    UI_INTERACTION_TOPIC,
    type ButtonDto,
    type ButtonsContentDto,
    type UIInteractionEventDto,
  } from "@sermas/toolkit";
  // import { stringSimilarity } from "string-similarity-js";

  export let content: ButtonsContentDto;
  export let metadata: Record<string, any> = {};

  let selected = -1;
  // let waitUserMessage = true
  // const SIMILARITY_TH = 0.7

  const ui = toolkit.getUI();

  const clicked = (button: ButtonDto, idx: number) => {
    selected = idx;
    const payload: UIInteractionEventDto = {
      appId: toolkit.getAppId(),
      moduleId: "avatar",
      sessionId: toolkit.getSessionId(),
      interaction: {
        context: {
          ...metadata,
          button,
        },
        element: "button",
        value: button.value,
      },
    };
    ui.stopAvatarSpeech();
    toolkit.getBroker().publish(`${UI_INTERACTION_TOPIC}/avatar`, payload);
  };

  // toolkit.on("dialogue.messages", (message: any) => {
  //     if (waitUserMessage && message.actor == 'user') {
  //         waitUserMessage = false
  //         content.list.forEach((element: string, index: number) => {
  //             const similarity = stringSimilarity(element, message.text)
  //             if (similarity >= SIMILARITY_TH) {
  //                 selected = index
  //                 console.log(`Matching answer, index: ${selected} (pb: ${similarity})`)
  //             }
  //         });
  //     }
  // });
</script>

<span class="buttons-widget">
  <ul>
    {#if content.label}
      <li class="mb-2">{content.label}</li>
    {/if}
    {#each content.list as b, idx}
      <li class="mb-2 is-flex is-flex-direction-row is-justify-content-center">
        <button
          on:click={() => clicked(b, idx)}
          class="button sermas-button is-multiline {b.classes &&
          b.classes.length
            ? b.classes.join(' ')
            : 'is-primary'}"
        >
          {b.label || b.value}
        </button>
      </li>
    {/each}
  </ul>
</span>

<style>
  .is-primary,
  .is-primary:hover,
  .is-secondary:hover,
  .is-secondary {
    border: 2px solid rgba(0, 0, 0, 0.1);
  }

  .is-secondary {
    opacity: 0.7;
  }
  .is-secondary:hover {
    opacity: 1;
  }

  .buttons-widget {
    min-width: 250px;
  }
  .buttons-widget ul {
    width: 100%;
  }

  .button.is-multiline {
    min-height: 2.25em;
    white-space: break-spaces;
    height: auto;
    flex-direction: column;
  }
</style>
