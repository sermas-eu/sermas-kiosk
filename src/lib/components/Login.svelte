<script lang="ts">
    import loginImage from "$lib/assets/images/sermas-logo-white.svg";

    export let logoUrl = loginImage;
    export let title = "Signin to continue";
    export let onSubmit: (
        username: string,
        password: string,
    ) => (string | undefined) | Promise<string | undefined>;

    let errorText: null | string = null;
    let username = "";
    let password = "";

    const submit = async () => {
        if (!onSubmit) return;
        const result = await onSubmit(username, password);
        if (typeof result === "string") {
            errorText = result;
        }
    };
</script>

<div id="login-page">
    <form on:submit|preventDefault={submit}>
        <div class="columns is-vcentered mt-5">
            <div class="column">
                <div class="cn">
                    <div class="login-img">
                        <img src={logoUrl} alt={title} />
                    </div>

                    <p class="is-size-3 mb-4">{title}</p>
                    <div class="field">
                        <label class="label" for="username"> Username </label>
                        <div class="control has-icons-left">
                            <input
                                name="username"
                                class="input is-success"
                                type="text"
                                placeholder="Username"
                                autocomplete="username"
                                bind:value={username}
                            />
                            <span class="icon is-small is-left">
                                <i class="fas fa-user"></i>
                            </span>
                        </div>
                    </div>

                    <div class="field">
                        <label class="label" for="password"> Password </label>
                        <div class="control has-icons-left">
                            <input
                                name="password"
                                class="input is-success"
                                type="password"
                                placeholder="Password"
                                autocomplete="current-password"
                                bind:value={password}
                            />
                            <span class="icon is-small is-left">
                                <i class="fas fa-lock"></i>
                            </span>
                        </div>
                    </div>

                    {#if errorText}
                        <p class="help is-danger">{errorText}</p>
                    {/if}

                    <button class="mt-2 button is-primary" on:click={submit}
                        >Login</button
                    >
                </div>
            </div>
        </div>
    </form>
</div>

<style lang="scss">
    @import "../../app.scss";

    .login-img {
        backdrop-filter: blur(10px);
        background-color: rgba($primary, 0.85);
        border-radius: 50%;
        height: 25vh;
        width: 25vh;
    }

    .cn {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    #login-page {
        position: absolute;
        width: 100vw;
        height: calc(100vh - var(--footer-height));
        max-width: 100vw;
        max-height: 100vh;
        background: #ffffff;
    }
</style>
