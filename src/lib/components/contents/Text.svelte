<script lang="ts">
    import { type TextContentDto } from "@sermas/toolkit";
    interface Props {
        content: TextContentDto;
    }

    let { content }: Props = $props();
</script>

<span class="text">
    {content.text}
</span>

<style>
</style>
