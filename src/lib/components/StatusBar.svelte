<script lang="ts">
    import { browser } from "$app/environment";
    import { toolkit } from "$lib";
    import type {
        RequestProcessing,
        SystemProgressEvent,
        UiStatus,
        UserSpeaking,
    } from "@sermas/toolkit/dto";
    import { onDestroy, onMount } from "svelte";

    export let system = "";

    let userSpeaking = false;

    const onStatus = (ev: UiStatus) => {
        system = ev.message;
    };

    const onProgress = (ev: SystemProgressEvent) => {
        if (ev.status == 'error'){
            console.warn(`Unrecognized speech: ${ev.error}`);
            system = `Unrecognized speech`;
            return;
        }
        // system = "";
        // progress = ev.event;
        switch (ev.event) {
            case "stt":
                system = "Processing audio";
                break;
            case "analyze":
                system = "Analyzing audio";
                break;
            case "llm":
                system = "Reasoning";
                break;
            case "translate":
                system = "Translating";
                break;
            case "tts":
                system = "Answering";
                break;
            case "ended":
                system = "";
                break;
            default:
                system = ev.event;
                break;
        }
    };

    const onUserSpeaking = (ev: UserSpeaking) => {
        switch (ev.status) {
            case "speaking":
                system = "Listening";
                userSpeaking = true;
                break;
            case "noise":
                if (!userSpeaking) system = "Noise detected";
                break;
            case "completed":
                userSpeaking = false;
                system = "";
                break;
        }
    };

    const onAvatarSpeaking = (isSpeaking: boolean) => {
        if (!userSpeaking && isSpeaking) system = "Avatar speaking";
    };

    const onRequestProcessing = (ev: RequestProcessing) => {
        if (ev.status === "started") {
            system = "Sending request";
        }
    };

    onMount(() => {
        if (!browser) return;
        toolkit.getUI().on("ui.status", onStatus);
        toolkit.getUI().on("ui.avatar.speaking", onAvatarSpeaking);
        toolkit.getUI().on("ui.user.speaking", onUserSpeaking);
        toolkit.getUI().on("ui.user.request-processing", onRequestProcessing);
        toolkit.getUI().on("dialogue.progress", onProgress);
    });

    onDestroy(() => {
        // toolkit.getBroker().off("ui.status", onStatus);
        // toolkit.getUI().off("dialogue.progress", onProgress);
    });
</script>

<div class="status-bar px-5 text-yellow-500" id="status-bar">
    <div class="system">{system || ""}</div>
</div>

<style lang="scss">
    @import "../../variables.scss";

    .status-bar {
        position: absolute;
        background-color: rgba($primary, 0.5);
        backdrop-filter: blur(10px);
        width: 100%;
        height: 1.5em;
        font-size: 1.2em;
        bottom: 0;
        text-align: center;
        z-index: 20;
        align-items: center;
        text-shadow: 1px 1px 2px #333;
        display: inline-block;
    }

    .system {
        color: #efefef;
    }

    @include mobile-view {
        .status-bar {
            display: none;
        }
    }
</style>
