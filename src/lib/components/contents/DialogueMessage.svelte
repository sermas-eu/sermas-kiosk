<script lang="ts">
    import { type DialogueMessageDto } from "@sermas/toolkit";

    import DOMPurify from "dompurify";
    import { marked } from "marked";

    export let message: DialogueMessageDto;

    let content: string;

    const renderMarkdown = async (text: string) => {
        content = DOMPurify.sanitize(await marked.parse(text));
    };

    $: if (message && message.text) renderMarkdown(message.text);
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
