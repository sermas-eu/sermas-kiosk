<script lang="ts">
    import { browser } from "$app/environment";
    import { toolkit } from "$lib";
    import type { SystemProgressEvent, UiStatus } from "@sermas/toolkit/dto";
    import { sendStatus } from "@sermas/toolkit/events";
    import { onDestroy, onMount } from "svelte";
    import SystemProgress from "./SystemProgress.svelte";

    export let system = "";
    let progress = "";

    const onStatus = (ev: UiStatus) => {
        console.warn(ev);
        system = ev.message;
    };

    const onProgress = (ev: SystemProgressEvent) => {
        console.warn(ev);
        progress = ev.event;
    };

    onMount(() => {
        if (!browser) return;
        toolkit.getUI().on("ui.status", onStatus);
        toolkit.getBroker().on("dialogue.progress", onProgress);
    });

    onDestroy(() => {
        toolkit.getBroker().off("ui.status", onStatus);
        // toolkit.getUI().off("dialogue.progress", onProgress);
    });
</script>

<div class="status-bar px-5 text-yellow-500" id="status-bar">
    <div class="system">{system || ""}</div>
    <div class="system"><SystemProgress event={progress} /></div>
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
