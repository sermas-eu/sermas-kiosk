<script lang="ts">
    import { browser } from "$app/environment";
    import { toolkit } from "$lib";
    import type { UiStatus } from "@sermas/toolkit/dto";
    import { onDestroy, onMount } from "svelte";

    export let system = "";

    const onStatus = (ev: UiStatus) => {
        system = ev.message;
    };

    onMount(() => {
        if (!browser) return;
        toolkit.getBroker().on("ui.status", onStatus);
    });

    onDestroy(() => {
        toolkit.getBroker().off("ui.status", onStatus);
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
