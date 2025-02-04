<script lang="ts">
    import { toolkit } from "$lib";
    import { type TextUIContentDto } from "@sermas/api-client";
    import VirtualKeyboard from "./VirtualKeyboard.svelte";
    import { appSettingsStore } from "$lib/store";

    export let messageId: string;
    export let onMessageSent: () => void;

    const ui = toolkit.getUI();

    let chatMessage = "";
    let sendingMessage = false;

    let showStopButton = false;

    let showVirtualKeyboard = false;
    let inputValue = "";
    let placeholder = "";
    let callbackFunc: (res: string) => void;

    const openVirtualKeyboard = (
        initValue: string,
        placehoder: string,
        callback: (res: string) => void,
    ) => {
        callbackFunc = callback;
        inputValue = initValue;
        placeholder = placehoder;
        showVirtualKeyboard = true;
    };

    const onVirtualKeyboardInput = (ev: CustomEvent) => {
        showVirtualKeyboard = false;
        callbackFunc(ev.detail.text);
    };

    const sendChatMessage = async () => {
        if (!chatMessage) return;

        sendingMessage = true;

        const dialogueMessage = await toolkit.sendChatMessage(chatMessage);
        if (dialogueMessage) {
            const content: TextUIContentDto = {
                messageId: dialogueMessage.messageId,
                chunkId: dialogueMessage.chunkId,
                appId: dialogueMessage.appId,
                contentType: "text",
                content: { text: chatMessage + " " },
                options: {},
            };
            await ui.appendContent("user", content);
            chatMessage = "";
            ui.stopAvatarSpeech(messageId);
        } else {
            // send failed
        }

        sendingMessage = false;

        if (onMessageSent) onMessageSent();
    };

    ui.on("ui.avatar.speaking", (isSpeaking: boolean) => {
        showStopButton = isSpeaking;
    });

    $: disabled =
        ($appSettingsStore.enableAudio && !showStopButton) ||
        !$appSettingsStore.enableAudio;
</script>

<div class="chat-input">
    <button
        {disabled}
        class="button is-medium is-primary ml-2 sermas-button"
        on:click={() => ui.stopAvatarSpeech()}
    >
        <span class="icon is-medium">
            <i class="fas fa-stop"></i>
        </span>
    </button>
    <form on:submit|preventDefault={sendChatMessage} class="input-form">
        <input
            id="user-input"
            class="input is-medium"
            bind:value={chatMessage}
            on:focus={(e) =>
                openVirtualKeyboard(
                    chatMessage,
                    "Type something to ask",
                    (result) => (chatMessage = result),
                )}
            placeholder="Type something to ask"
        />
        <button
            id="send-button"
            class="button is-medium ml-2 is-primary sermas-button {sendingMessage
                ? 'is-loading'
                : ''}"
            type="submit"
        >
            <span>Send</span>
        </button>
    </form>
</div>
<VirtualKeyboard
    {placeholder}
    showKeyboard={showVirtualKeyboard}
    {inputValue}
    on:virtual-keyboard-input={onVirtualKeyboardInput}
/>

<style lang="scss">
    @import "../../variables.scss";

    .chat-input {
        display: flex;
        flex-direction: row-reverse;
        justify-content: space-between;
    }

    .input-form {
        display: flex;
        flex-direction: row;
        flex-grow: 1;
    }

    .chat-input input {
        backdrop-filter: blur(10px);
        background-color: rgba(255, 255, 255, 0.7);
    }

    .stop-button {
        padding-right: 3.7em;
    }

    @include mobile-view {
        .chat-input {
            bottom: 0.5em;
        }
    }
</style>
