<script lang="ts">
  import { browser } from "$app/environment";
  import { toolkit } from "$lib";
  import { Logger } from "@sermas/toolkit/utils";
  import { onMount } from "svelte";
  import Loader from "./Loader.svelte";
  import Login from "./Login.svelte";

  let loginRequired: boolean | undefined;
  let authWait = true;

  const logger = new Logger("auth");

  const onSubmit = async (
    username: string,
    password: string,
  ): Promise<string | undefined> => {
    const res = await toolkit.getUserAuth().login({
      username,
      password,
      appId: toolkit.getAppId(),
    });

    loginRequired = res === null;

    if (loginRequired) return "Login failed, please retry";
  };

  onMount(async () => {
    if (!browser) return;
    loginRequired = await toolkit.getUserAuth().isLoginRequired();
    authWait = false;
  });
</script>

{#if authWait}
  <Loader />
{:else if loginRequired}
  <Login {onSubmit} />
{:else}
  <slot />
{/if}
