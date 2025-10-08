<script lang="ts">
  import Loader from "$lib/components/Loader.svelte";
  import Auth from "$lib/components/Auth.svelte";
  import Microphone from "$lib/components/Microphone.svelte";
  import NavBar from "$lib/components/NavBar.svelte";
  import StatusBar from "$lib/components/StatusBar.svelte";
  import UiContent from "$lib/components/UIContent.svelte";
  import VideoDetection from "$lib/components/VideoDetection.svelte";
  import WebAvatar from "$lib/components/WebAvatar.svelte";
  import PushToTalk from "$lib/components/PushToTalk.svelte";
  import { appReadyStore } from "$lib/store";
  import { browser } from "$app/environment";

  let loading = true;
  $: if (browser && $appReadyStore) loading = !$appReadyStore;


 function onStart() { console.log('start voice capture'); }
  function onStop()  { console.log('stop voice capture'); }
</script>


{#if loading}
  <Loader />
{:else}
  <Auth>
    <NavBar />
    <Microphone />
    <VideoDetection />
    <WebAvatar />
    <UiContent />
    <StatusBar />
    <PushToTalk size={80} on:start={onStart} on:stop={onStop}/>
  </Auth>
{/if}
