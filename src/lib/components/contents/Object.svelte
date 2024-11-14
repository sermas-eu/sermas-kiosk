<script lang="ts">
    import { type ObjectContentDto } from "@sermas/toolkit";

    interface Props {
        content: ObjectContentDto;
    }

    let { content }: Props = $props();
</script>

<span class="object">
    TODO Object {content.url}
</span>

<style>
</style>
