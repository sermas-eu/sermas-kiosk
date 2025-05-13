<script lang="ts">

    export let event = "";

</script>

<span>
{#if event == 'stt'}
    Converting to text...
{:else if event == 'analyze'}
    Analyzing...
{:else if event == 'llm'}
    Calling LLM...
{:else if event == 'translate'}
    Translating...
{:else if event == 'tts'}
    Converting to speech...
{:else}
    {event}
{/if}
</span>
