<script lang="ts">
    import { type ImageContentDto } from "@sermas/toolkit";

    interface Props {
        img: ImageContentDto;
    }

    let { img }: Props = $props();
</script>

<span class="image" style="width: {img.width}px; height: {img.height}px;">
    <img src={img.src} alt={img.alt} width={img.width} height={img.height} />
</span>

<style>
</style>
