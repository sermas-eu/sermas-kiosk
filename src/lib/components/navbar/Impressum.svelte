<script lang="ts">
  import { browser } from "$app/environment";
  import { toolkit } from "$lib";
  import { renderMarkdown } from "$lib/util";
  import { onMount } from "svelte";

  let impressum: string;

  onMount(async () => {
    if (!browser) return;

    const app = await toolkit.getApp();
    const text = app?.settings?.impressum;

    if (!text) return;

    impressum = await renderMarkdown(text);
  });
</script>

{#if impressum}
  <aside class="menu impressum">
    <p class="menu-label">Impressum</p>
    <div class="content">{@html impressum}</div>
  </aside>
{/if}

<style lang="scss">
  aside {
    margin: 1em 0 0 1em;
  }
  :global(.impressum a) {
    color: white !important;
  }
</style>
