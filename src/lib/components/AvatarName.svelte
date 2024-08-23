<script lang="ts">
    import { toolkit } from "$lib";
    import { type AvatarModelConfig } from "@sermas/toolkit/avatar";
    import { onMount } from "svelte";

    export let id: string | undefined;

    let avatar: AvatarModelConfig | undefined;

    onMount(async () => {
        avatar = await toolkit.getAvatarConfig(id);
    });
</script>

<span>
    {avatar?.name || "Agent"}
</span>
