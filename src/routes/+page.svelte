<script lang="ts">
    import { browser } from "$app/environment";
    import { goto } from "$app/navigation";
    import { createToolkit } from "$lib";
    import BackgroundAnimation from "$lib/components/BackgroundAnimation.svelte";
    import type { PlatformAppDto, SermasToolkit } from "@sermas/toolkit";
    import { onMount } from "svelte";

    let toolkit: SermasToolkit;
    let apps: PlatformAppDto[] = $state([]);

    onMount(async () => {
        if (!browser) return;

        toolkit = createToolkit({
            moduleId: "kiosk",
        });

        apps = (await toolkit.getApi().getApps()) || [];

        // go to app if only one is available
        if (apps && apps.length === 1) {
            goto(`./${apps[0].appId}`);
        }
    });
</script>

<div class="wrapper is-flex is-align-items-center">
    <section class="hero overlay is-primary has-text-centered">
        <div class="hero-body">
            <p class="title is-size-1">Welcome to the SERMAS Kiosk</p>
            <p class="subtitle is-size-4">
                The SERMAS Kiosk is the home of the SERMAS Avatars.
            </p>

            <div class="block my-6 is-size-5">
                <p class="">
                    Try the SERMAS Avatar, an agent designed to be socially
                    acceptable.
                </p>

                <div class="block my-4">
                    {#if apps && apps.length}
                        {#each apps as app}
                            <a
                                href="/{app.appId}"
                                class="button is-info is-size-4 m-2"
                            >
                                {app.name}
                            </a>
                        {/each}
                    {:else if !apps || !apps.length}
                        <p>No apps available</p>
                    {/if}
                </div>
            </div>

            <div class="note my-4 p-0 is-size-6">
                NOTE: this is a preview, some capabilities will not be
                available.
            </div>
        </div>
    </section>
</div>

<div class="background">
    <BackgroundAnimation />
</div>

<style lang="scss">

    .note {
        max-width: 35em;
        margin: 0 auto;
        padding: 0.5em;
        background-color: rgba(variables.$palette5, 0.6) !important;
    }

    .wrapper {
        width: 100%;
        height: 100%;
    }

    .overlay {
        font-size: 150%;
        z-index: 10;
        width: 100%;
        background-color: rgba(variables.$palette1, 0.5) !important;
        box-shadow: inset 0 0 10em rgba(variables.$palette4, 0.2) !important;
        backdrop-filter: blur(10px);
    }

    .background {
        position: absolute;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 0;

        margin: auto;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        overflow: auto;
    }

    @include variables.mobile-view {
        //
    }
</style>
