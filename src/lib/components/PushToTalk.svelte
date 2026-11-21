<script lang="ts">
    import { browser } from "$app/env";
    import { toolkit } from "#lib";
      import { appSettingsStore } from "#lib/store.ts";

    import type {
    SystemProgressEvent,
        UserSpeaking,
    } from "@sermas/toolkit/dto";
    import { onMount } from "svelte";

    interface Props {
        onstart?: () => void;
        onstop?: () => void;
    }

    let { onstart, onstop }: Props = $props();


    let status = $state("Push to talk");

    let userSpeaking = false;

    // undefined until the app settings are loaded
    let enableMic: boolean | undefined = $derived(
        $appSettingsStore ? !!$appSettingsStore.enableMic : undefined,
    );
    let pushToTalkEnabled: boolean | undefined = $derived(
        $appSettingsStore
            ? !!($appSettingsStore.pushToTalkEnabled && $appSettingsStore.enableMic)
            : undefined,
    );



    const onUserSpeaking = (ev: UserSpeaking) => {
        switch (ev.status) {
            case "completed":
                userSpeaking = false;
                status = "Push to talk";
                stopMic();
                break;
            default:
                break;
        }
    };

    let processingAudio = false;

    const onProgress = (ev: SystemProgressEvent) => {
        if (ev.status == 'error'){
            console.warn(`Unrecognized speech: ${ev.error}`);
            processingAudio = false;
            return;
        }
        processingAudio = ev.event == 'ended' ? false : true;
    };

    let active = false;

    const startMic = () => {
        if (active == true) {
            stopMic();
            processingAudio = false;
            status = "Push to talk";
            return
        }
        status = "Listening..."
        onstart?.();
        active = true;
    }

    const stopMic = () => {
        if (!pushToTalkEnabled) return
        console.log('stopMic');
        onstop?.();
        active = false;
    }

    onMount(() => {
        if (!browser) return;
        toolkit.getUI().on("dialogue.progress", onProgress);
        toolkit.getUI().on("ui.user.speaking", onUserSpeaking);
    });

    let listening = $derived(status.toLowerCase().includes("listening"));
</script>

{#if pushToTalkEnabled && enableMic}
<div class="push-to-talk" id="push-to-talk">
    <button class="push-to-talk-btn sermas-button is-large  {listening ? 'listening' : ''}" onmouseup={startMic}>
        <div class="ptt-icon"><i class="fas fa-microphone"></i></div>
        <div class="ptt-status">{status}</div>
    </button>
</div>
{/if}

<style lang="scss">
    @import "../../variables.scss";


    .ptt-status {
        padding-top: 3px;
        font-size: 1.2em;
        //font-weight: bold;
        height: 50%;
    }
    .ptt-icon{
        padding-top:5px;
        font-size: 1.5em;
        height: 50%;
    }

    .push-to-talk-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 120px;
        height: 50px;
        border: none;
        border-radius: 7px;
        opacity: 0.8;
        background-color: #444;
        color: white;
        transition: background-color 0.3s ease, transform 0.3s ease;
        margin-right: 5px;
    }

    .push-to-talk-btn:active {
        opacity: 1.0;
    }

    /* 🔊 Listening animation */
    @keyframes pulse {
        0% {
            box-shadow: 0 0 0 0 rgba(0, 200, 255, 0.6);
            transform: scale(1);
        }
        50% {
            box-shadow: 0 0 0 15px rgba(0, 200, 255, 0);
            transform: scale(1.08);
        }
        100% {
            box-shadow: 0 0 0 0 rgba(0, 200, 255, 0);
            transform: scale(1);
        }
    }

    .push-to-talk-btn.listening {
        background-color: #0078ff;
        animation: pulse 1.5s infinite;
        color: white;
    }

</style>
