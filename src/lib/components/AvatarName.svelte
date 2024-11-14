<script lang="ts">
    import { toolkit } from "$lib";
    import { type AvatarModelConfig } from "@sermas/toolkit/avatar";
    import { onMount } from "svelte";

    interface Props {
        id: string | undefined;
    }

    let { id }: Props = $props();

    let avatar: AvatarModelConfig | undefined = $state();

    onMount(async () => {
        avatar = await toolkit.getAvatarConfig(id);
    });
</script>

<span>
    {avatar?.name || "Agent"}
</span>
