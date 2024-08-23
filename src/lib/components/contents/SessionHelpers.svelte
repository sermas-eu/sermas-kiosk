<script lang="ts">
    import { toolkit } from "$lib";
    import { onMount } from "svelte";
    import { createEventDispatcher } from 'svelte';
    import IoMdRefresh from "svelte-icons/io/IoMdRefresh.svelte";
    import IoMdCloseCircleOutline from "svelte-icons/io/IoMdCloseCircleOutline.svelte";
    import { appSettingsStore } from '$lib/store';

    const dispatch = createEventDispatcher();

    let sessionId: string | undefined = undefined

    const closeSession = async () => {
      toolkit?.triggerInteraction("ui", 'stop');
    }

    const start= () => {
      sessionId = toolkit.getSessionId()

      toolkit.on("session.session", (ev)=>{
        if (ev.operation === 'updated' && ev.record.closedAt) {
          sessionId = undefined
        } else {
          sessionId = ev.record.sessionId
        }
      })
    }

    onMount(start);
</script>

<div class="session-buttons is-flex is-flex-direction-row is-justify-content-center">
    <button class="button is-light is-warning has-text-grey-dark is-small is-rounded" on:click={() => window.location.reload()}>
      <span class="icon">
        <IoMdRefresh />
      </span>
      <span>Reload</span>
    </button>
    {#if sessionId && $appSettingsStore?.interactionStart != "intent-detection"}
      <button 
      on:click={()=> closeSession()}
      class="button is-light is-danger is-small ml-1 is-rounded">
        <span class="icon">
          <IoMdCloseCircleOutline />
        </span>
        <span>
              End session
        </span>
      </button>
    {/if}
  </div>

<style lang="scss">
    @import "../../../variables.scss";
    .session-closer-widget {
        width: 100%;
    }
    .session-closer-widget button {
        margin-left: 10px;
    }
    .session-closer-widget span {
        text-shadow: 1px 1px #999;
    }

  .session-buttons {
    position: absolute;
    z-index: 900 !important;
    top: 1em;
    // left: 25%;
    // margin-left: -50px;
    width: 100%;
    margin-left: -25%;
    z-index: 999;
  }

  .session-buttons button{
    background: rgba(255,255,255,0.4);
  }

  @include mobile-view {
    .session-buttons {
      margin-left: 0;
    }
  }

</style>
