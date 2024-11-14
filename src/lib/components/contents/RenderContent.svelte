<script lang="ts">
    import { type UIContentDto } from "@sermas/toolkit";
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

    interface Props {
        content: UIContentDto;
    }

    let { content }: Props = $props();
</script>

<div
    class="ui-content {content.options?.fullscreen === true
        ? 'fullscreen'
        : ''}"
>
    {#if content.contentType === "dialogue-message"}
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
    {:else if content.contentType === "object"}
        <Object content={content.content} />
    {:else if content.contentType === "buttons"}
        <Buttons content={content.content} metadata={content.metadata} />
    {:else if content.contentType === "quiz"}
        <Quiz content={content.content} metadata={content.metadata} />
    {:else if content.contentType === "qrcode-scanner"}
        <QrCodeScanner content={content.content} metadata={content.metadata} />
    {/if}
</div>

<style>
    .ui-content {
    }
    .fullscreen {
        z-index: 9999999;
        width: 100vw;
        height: 100vh;
        top: 0;
        left: 0;
    }
</style>
