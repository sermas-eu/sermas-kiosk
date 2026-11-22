<script lang="ts">
  import NavigationMenuItems from './NavigationMenuItems.svelte';
  import { toolkit } from "#lib";
  import type {
    NavigationMenuItemDto,
    UIInteractionEventDto,
  } from "@sermas/api-client";
  import { UI_INTERACTION_TOPIC } from "@sermas/toolkit";

  interface Props {
    items: NavigationMenuItemDto[];
  }

  let { items }: Props = $props();

  let isOpen: Record<string, boolean> = $state(items.reduce(
    (obj, item) => ({
      ...obj,
      [item.id]: false,
    }),
    {}
  ));

  const sendEvent = (item: NavigationMenuItemDto) => {
    const payload: UIInteractionEventDto = {
      appId: toolkit.getAppId(),
      sessionId: toolkit.getSessionId(),
      moduleId: "avatar",
      interaction: {
        context: {
          item,
        },
        element: "navigation-menu",
        value: item.id,
      },
    };
    toolkit.getBroker().publish(`${UI_INTERACTION_TOPIC}/avatar`, payload);
    toolkit.getUI().stopAvatarSpeech();
  };
</script>

{#if items?.length}
  <ul class="menu-list">
    {#each items as item}
      <li class="list">
        <a
          title={item.label}
          href="#{item.id}"
          class={item.selected ? "selected" : ""}
          onclick={(ev) => {
            isOpen[item.id] = !isOpen[item.id];
            sendEvent({
              ...item,
              selected: true,
            });
            ev.preventDefault();
          }}
        >
          <span style="margin-left:0.5em;"> {item.label} </span>
        </a>

        {#if isOpen[item.id] && item.items?.length}
          <NavigationMenuItems items={item.items} />
        {/if}
      </li>
    {/each}
  </ul>
{/if}

<style lang="scss">
  @use "../../../variables.scss" as *;

  .list {
    a {
      color: white;
    }
    a:hover {
      background-color: rgba($secondary, 0.8);
    }
    a.selected {
      background-color: rgba($secondary, 0.8);
    }
  }
</style>
