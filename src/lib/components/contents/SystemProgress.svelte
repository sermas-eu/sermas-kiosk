<script lang="ts">

  export let event

</script>

<div class="is-flex is-justify-content-center">
  <div>
    <div class="loading-dots"></div>
    <div class="progress-event">
      {#if event == 'stt'}
        Speech to text
      {:else if event == 'analyze'}
        Analizyng input
      {:else if event == 'llm'}
        Calling LLM
      {:else if event == 'translate'}
        Translating
      {:else if event == 'tts'}
        Text to speech
      {:else}
        {event}
      {/if}
    </div>
  </div>
</div>



<style>

.loading-dots {
    /* HTML: <div class="loader"></div> */
    width: 100px;
    aspect-ratio: 2;
    --_g: no-repeat
      radial-gradient(
        circle closest-side,
        var(--theme-primary-bg-color) 90%,
        #0000
      );
    background:
      var(--_g) 0% 50%,
      var(--_g) 50% 50%,
      var(--_g) 100% 50%;
    background-size: calc(100% / 3) 50%;
    animation: l3 1s infinite linear;
  }

  .progress-event{
    color: var(--theme-primary-text-color);
    font-size: 1.3rem;
    font-weight: bold;
    width: 100px;
    text-align:center;
  }


  @keyframes l3 {
    20% {
      background-position:
        0% 0%,
        50% 50%,
        100% 50%;
    }
    40% {
      background-position:
        0% 100%,
        50% 0%,
        100% 50%;
    }
    60% {
      background-position:
        0% 50%,
        50% 100%,
        100% 0%;
    }
    80% {
      background-position:
        0% 50%,
        50% 50%,
        100% 100%;
    }
  }
</style>