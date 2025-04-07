<script lang="ts">
  import { browser } from "$app/environment";
  import { toolkit } from "$lib";
  import type {
    NavigationMenuItemDto,
    NavigationMenuUIContentDto,
    UIContentDto,
  } from "@sermas/api-client";
  import { onDestroy, onMount } from "svelte";
  import NavigationMenuItems from "./NavigationMenuItems.svelte";

  let items: NavigationMenuItemDto[] = [];

  const onContent = (content: UIContentDto) => {
    // if (content.contentType === "clear-screen") {
    //     items = [];
    //     return;
    // }
    if (content.contentType === "navigation") {
      const nav = content as NavigationMenuUIContentDto;
      items = nav.content.items;
    }
  };

  onMount(() => {
    if (!browser) return;
    items = [];
    toolkit.getBroker().on("ui.content", onContent);
  });

  onDestroy(() => {
    items = [];
    toolkit.getBroker().off("ui.content", onContent);
  });
</script>

{#if items?.length}
  <aside class="navigation">
    <p class="menu-label">Navigation</p>

    <ul class="menu-list">
      <NavigationMenuItems {items} />
    </ul>
  </aside>
{/if}

<style lang="scss">
  aside {
    margin: 1em 0 0 1em;
  }
</style>
