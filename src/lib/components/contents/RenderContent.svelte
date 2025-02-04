<script lang="ts">
  import {
    type DialogueMessageUIContentDto,
    type UIContentDto,
  } from "@sermas/toolkit";
  import DialogueMessage from "./DialogueMessage.svelte";
  import Email from "./Email.svelte";
  import Html from "./Html.svelte";
  import Image from "./Image.svelte";
  import Link from "./Link.svelte";
  import Text from "./Text.svelte";
  import Webpage from "./Webpage.svelte";
  import Video from "./Video.svelte";
  import Object from "./Object.svelte";
  import Buttons from "./Buttons.svelte";
  import Quiz from "./Quiz.svelte";
  import QrCodeScanner from "./QrCodeScanner.svelte";
  import Subtitle from "./Subtitle.svelte";
  import { type DialogueActor } from "@sermas/toolkit/dto";
  import BackgroundAudio from "./BackgroundAudio.svelte";
  import { backgroundImageAndSoundStore } from "$lib/store";
  import { toolkit } from "$lib";
  import { toBase64 } from "$lib/util";

  export let content: UIContentDto;
  export let subtitle: boolean = false;
  export let actor: DialogueActor | null = null;

  const chunks: DialogueMessageUIContentDto[] = content.metadata?.chunks
    ? (content.metadata?.chunks as unknown as DialogueMessageUIContentDto[])
    : [];

  $: if (
    content.isWelcome &&
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
  const setBackground = async (background: string) => {
    let config = await toolkit.getAssetConfig("backgrounds", background);
    if (!config) return;

    const blob = await toolkit.getApi().getAsset(config.type, config.id);
    if (blob) {
      $backgroundImageAndSoundStore.urlImage = `${await toBase64(blob)}`;
    }
  };

  const getUiContent = <T = any,>(t: any) => t as T;

  $: isSubtitle =
    (subtitle && content.contentType === "dialogue-message") ||
    (subtitle && content.contentType === "text");
</script>

<div
  class="ui-content {content.options?.fullscreen === true ? 'fullscreen' : ''} "
>
  <!-- {#if (subtitle && content.contentType === "dialogue-message") || (subtitle && content.contentType === "text")}
    <Subtitle
      content={getUiContent(content.content)}
      messageId={content.messageId}
      {chunks}
      {actor}
    /> -->
  {#if content.contentType === "dialogue-message" && !isSubtitle}
    <DialogueMessage message={getUiContent(content.content)} />
  {:else if content.contentType === "image"}
    <Image img={getUiContent(content.content)} />
  {:else if content.contentType === "webpage"}
    <Webpage content={getUiContent(content.content)} />
  {:else if content.contentType === "email"}
    <Email content={getUiContent(content.content)} />
  {:else if content.contentType === "html"}
    <Html content={getUiContent(content.content)} />
  {:else if content.contentType === "pdf"}
    <Webpage content={getUiContent(content.content)} />
  {:else if content.contentType === "link"}
    <Link content={getUiContent(content.content)} />
  {:else if content.contentType === "text"}
    <Text content={getUiContent(content.content)} />
  {:else if content.contentType === "video"}
    <Video content={getUiContent(content.content)} />
  {:else if content.contentType === "object" && content.content?.list && content.content?.list instanceof Array}
    <div class="obj-container">
      {#each content.content.list as cont}
        <div class="obj-list">
          <Object content={cont} />
        </div>
      {/each}
    </div>
  {:else if content.contentType === "object"}
    <Object content={getUiContent(content.content)} />
  {:else if content.contentType === "buttons"}
    <Buttons
      content={getUiContent(content.content)}
      metadata={content.metadata}
    />
  {:else if content.contentType === "quiz"}
    <Quiz content={getUiContent(content.content)} metadata={content.metadata} />
  {:else if content.contentType === "qrcode-scanner"}
    <QrCodeScanner content={getUiContent(content.content)} />
  {:else if content.contentType === "background-audio"}
    <BackgroundAudio content={getUiContent(content.content)} />
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
    overflow: hidden;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
  .obj-list {
    flex: auto;
  }
  .ui-content {
    display: inherit;
    min-width: 100%;
  }
</style>
