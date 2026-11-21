<script lang="ts">
    import { renderMarkdown } from "#lib/util.ts";
    import { type DialogueMessageDto } from "@sermas/toolkit";

    interface Props {
        message: DialogueMessageDto;
    }

    let { message }: Props = $props();

    let content: string = $state()!;

    const renderText = async (text: string) => {
        content = await renderMarkdown(text);
    };

    $effect(() => {
        if (message && message.text) renderText(message.text);
    });
</script>

<span title={message.emotion} class="text emotion-{message.emotion || 'none'}">
    <span
        class="message-{message.messageId ||
            'none'} chunk chunk-{message.chunkId || 'none'} content"
        >{@html content}</span
    >
</span>

<style>
    .chunk {
        /* white-space: pre-line; */
    }
</style>
