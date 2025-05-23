<script lang="ts">
  import type {
    ImageContentDto,
    TextContentDto,
    UIContentDto,
    UIContentMetadataDto,
    UIContentOptionsDto,
  } from "@sermas/api-client";
  import { type DialogueActor } from "@sermas/toolkit/dto";
  import Subtitle from "../Subtitle.svelte";
  import BackgroundAudio from "./BackgroundAudio.svelte";
  import Buttons from "./Buttons.svelte";
  import DialogueMessage from "./DialogueMessage.svelte";
  import Email from "./Email.svelte";
  import Html from "./Html.svelte";
  import Image from "./Image.svelte";
  import Link from "./Link.svelte";
  import Object from "./Object.svelte";
  import QrCodeScanner from "./QrCodeScanner.svelte";
  import Quiz from "./Quiz.svelte";
  import Text from "./Text.svelte";
  import Video from "./Video.svelte";
  import Webpage from "./Webpage.svelte";

  type UIContent = {
    content: any;
    metadata?: UIContentMetadataDto;
    options?: UIContentOptionsDto & Record<string, any>;
  } & UIContentDto;

  export let content: UIContent;
  export let subtitle: boolean = false;
  export let actor: DialogueActor | null = null;
</script>

<div
  class="ui-content {content.options?.fullscreen === true ? 'fullscreen' : ''} "
>
  {#if (subtitle && content.contentType === "text" && content.messageId && content.content.text && actor === "user") || (subtitle && content.contentType === "dialogue-message" && content.messageId && content.content.text && actor === "user")}
    <Subtitle message={content.content.text} id={content.messageId} {actor} />
  {:else if content.contentType === "dialogue-message"}
    <DialogueMessage message={content.content} />
  {:else if content.contentType === "image"}
    <Image img={content.content} />
  {:else if content.contentType === "webpage"}
    <Webpage content={content.content} />
  {:else if content.contentType === "email"}
    <Email content={content.content} />
  {:else if content.contentType === "html"}
    <Html content={content.content} />
  {:else if content.contentType === "pdf"}
    <Webpage content={content.content} />
  {:else if content.contentType === "link"}
    <Link content={content.content} />
  {:else if content.contentType === "text"}
    <Text content={content.content} />
  {:else if content.contentType === "video"}
    <Video content={content.content} />
  {:else if content.contentType === "object" && content.content?.list && content.content?.list instanceof Array}
    <div class="obj-container">
      {#each content.content.list as cont}
        <div class="obj-list">
          <Object content={cont} />
        </div>
      {/each}
    </div>
  {:else if content.contentType === "object"}
    <Object content={content.content} />
  {:else if content.contentType === "buttons"}
    <Buttons content={content.content} metadata={content.metadata} />
  {:else if content.contentType === "quiz"}
    <Quiz content={content.content} metadata={content.metadata} />
  {:else if content.contentType === "qrcode-scanner"}
    <QrCodeScanner />
  {:else if content.contentType === "background-audio"}
    <BackgroundAudio content={content.content} />
  {/if}
</div>

<style>
  .fullscreen {
    z-index: 9999999;
    width: 100vw;
    height: 100vh;
    top: 0;
    left: 0;
  }
  .obj-container {
    overflow: visible;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    aspect-ratio: 16/9;
    flex-wrap: wrap;
  }
  .obj-list {
    flex: 1;
  }
  .ui-content {
    display: inherit;
    min-width: 100%;
  }
</style>
