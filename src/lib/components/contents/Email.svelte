<script lang="ts">
    import { type EmailContentDto } from "@sermas/toolkit";

    interface Props {
        content: EmailContentDto;
    }

    let { content }: Props = $props();
</script>

<span class="email">
    <a href="mailto:{content.email}">{content.label || content.email}</a>
</span>

<style>
</style>
