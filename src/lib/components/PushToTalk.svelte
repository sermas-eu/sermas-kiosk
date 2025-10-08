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
    import { Logger } from "@sermas/toolkit/utils";

    const logger = new Logger("status");

    let status = "Push to talk";

    let userSpeaking = false;

    const onUserSpeaking = (ev: UserSpeaking) => {
        let message: string | undefined = undefined;
        switch (ev.status) {
            case "speaking":
                message = "Listening";
                userSpeaking = true;
                status = "Listening..."
                break;
            case "noise":
                if (!userSpeaking) message = "Noise detected";
                break;
            case "completed":
                userSpeaking = false;
                message = "";
                status = "Wait..."
                break;
        }
    };

    const endPress = (ev) => {
        status = "Listening..."
    }


    onMount(() => {
        if (!browser) return;
      //  toolkit.getUI().on("ui.status", onStatus);
      //  toolkit.getUI().on("ui.avatar.speaking", onAvatarSpeaking);
      //  toolkit.getUI().on("ui.user.speaking", onUserSpeaking);
      //  toolkit.getUI().on("ui.user.request-processing", onRequestProcessing);
      //  toolkit.getUI().on("dialogue.progress", onProgress);
    });

    onDestroy(() => {
        // toolkit.getBroker().off("ui.status", onStatus);
        // toolkit.getUI().off("dialogue.progress", onProgress);
    });
</script>

<div class="push-to-talk" id="push-to-talk">
    <button class="push-to-talk-btn sermas-button is-large" on:mouseup={endPress}>
        <div class="ptt-icon"><i class="fas fa-microphone"></i></div>
        <div class="ptt-status">{status}</div>
    </button>
</div>

<style lang="scss">
    @import "../../variables.scss";

    #push-to-talk{
        position: absolute;
        left: 25%;
        bottom: 25vh;

    }
    .push-to-talk-btn{
        position: flex;
        flex-direction: column;
        width: 100px;
        height: 100px;
        border: none;
        border-radius: 100px !important;
        opacity: 0.8;
    }
    .push-to-talk-btn:active{
        opacity: 1.0;
    }
    .ptt-status {
      padding-top: 5px;
        font-size: 1.1em;
        //font-weight: bold;
        height: 50%;
    }
    .ptt-icon{
        padding-top:5px;
        font-size: 3em;
        height: 50%;
    }

    @include mobile-view {
        .status-bar {
            display: none;
        }
    }
</style>
