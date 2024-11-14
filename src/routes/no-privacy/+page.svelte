<script lang="ts">
    import BackgroundAnimation from "$lib/components/BackgroundAnimation.svelte";

    const reset = () => {
        document.location = "/";
    };
</script>

<div class="wrapper is-flex is-align-items-center">
    <section class="hero overlay is-primary has-text-centered">
        <div class="hero-body">
            <p class="title is-size-1">Welcome to the SERMAS Kiosk</p>
            <p class="subtitle is-size-4">
                Those pages offers a development preview of the SERMAS Toolkit.
            </p>

            <div class="block my-6 is-size-5">
                <p class="">
                    To continue visiting the site, you have to agree on our
                    privacy policy
                </p>

                <p class="">
                    <br />
                    <button class="button is-primary" onclick={() => reset()}
                        >Homepage</button
                    >
                </p>
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
