<script lang="ts">
    import { browser } from "$app/env";
    import { toolkit } from "#lib";
    import type {
        RequestProcessing,
        SystemProgressEvent,
        UiStatus,
        UserSpeaking,
    } from "@sermas/toolkit/dto";
    import { onDestroy, onMount } from "svelte";
    import { Logger } from "@sermas/toolkit/utils";

    const logger = new Logger("status");

    interface Props {
        system?: string;
    }

    let { system = $bindable("") }: Props = $props();

    let userSpeaking = false;

    const setSystemMessage = (message?: string) => {
        if (message === undefined) return;
        if (message === system) return;
        system = message;
    };

    const onStatus = (ev: UiStatus) => {
        setSystemMessage(ev.message);
    };

    // shown for a few seconds when a turn ends without an answer
    const NOTICE_MS = 4000;
    let noticeTimer: ReturnType<typeof setTimeout> | undefined;
    const showNotice = (message: string) => {
        setSystemMessage(message);
        clearTimeout(noticeTimer);
        noticeTimer = setTimeout(() => {
            if (system === message) system = "";
        }, NOTICE_MS);
    };

    const onProgress = (ev: SystemProgressEvent) => {
        // a dropped voice turn: `stt` error (no-speech, other-speaker), or `stt`
        // ended from an API that does not send the reason yet
        if (ev.event === "stt" && (ev.status === "error" || ev.status === "ended")) {
            logger.debug(`Voice turn dropped: ${ev.error || ev.status}`);
            showNotice("Sorry, I didn't catch that. Please try again.");
            return;
        }
        if (ev.status === "error") {
            logger.warn(`${ev.event} failed: ${ev.error}`);
            showNotice("Sorry, something went wrong. Please try again.");
            return;
        }
        // system = "";
        // progress = ev.event;
        let message: string | undefined;
        switch (ev.event) {
            case "stt":
                message = "Processing audio";
                break;
            case "analyze":
                message = "Analyzing audio";
                break;
            case "llm":
                message = "Reasoning";
                break;
            case "translate":
            // falls through: translation is shown as answering
            case "tts":
                message = "Answering";
                break;
            case "ended":
                message = "";
                break;
            default:
                logger.debug(`Missing status label ${ev.event}`);
                message = ev.event;
                break;
        }
        setSystemMessage(message);
    };

    const onUserSpeaking = (ev: UserSpeaking) => {
        let message: string | undefined = undefined;
        switch (ev.status) {
            case "speaking":
                message = "Listening";
                userSpeaking = true;
                break;
            case "noise":
                if (!userSpeaking) message = "Noise detected";
                break;
            case "completed":
                userSpeaking = false;
                message = "";
                break;
        }
        setSystemMessage(message);
    };

    const onAvatarSpeaking = (isSpeaking: boolean) => {
        if (userSpeaking) return;
        const message = isSpeaking ? "Speaking" : "";
        setSystemMessage(message);
    };

    const onRequestProcessing = (ev: RequestProcessing) => {
        if (ev.status === "started") {
            const message = "Processing";
            setSystemMessage(message);
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
        clearTimeout(noticeTimer);
        // toolkit.getBroker().off("ui.status", onStatus);
        // toolkit.getUI().off("dialogue.progress", onProgress);
    });
</script>

<div class="status-bar px-5 text-yellow-500" id="status-bar">
    <div class="system">{system || ""}</div>
</div>

<style lang="scss">
    @use "../../variables.scss" as *;

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
