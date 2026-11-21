<script lang="ts">
  import Loader from "#lib/components/Loader.svelte";
  import Auth from "#lib/components/Auth.svelte";
  import Microphone from "#lib/components/Microphone.svelte";
  import NavBar from "#lib/components/NavBar.svelte";
  import StatusBar from "#lib/components/StatusBar.svelte";
  import UiContent from "#lib/components/UIContent.svelte";
  import VideoDetection from "#lib/components/VideoDetection.svelte";
  import WebAvatar from "#lib/components/WebAvatar.svelte";
  import { appReadyStore } from "#lib/store.ts";
  import { browser } from "$app/env";

  let loading = $derived(!(browser && $appReadyStore));

  let childComponent: Microphone = $state()!;

 function onStart() { console.log('start voice capture'); childComponent.restore()}
  function onStop()  { console.log('stop voice capture'); childComponent.pause() }
</script>


{#if loading}
  <Loader />
{:else}
  <Auth>
    <NavBar />
    <Microphone bind:this={childComponent}/>
    <VideoDetection />
    <WebAvatar />
    <UiContent onstart={onStart} onstop={onStop}/>
    <StatusBar />
  </Auth>
{/if}
