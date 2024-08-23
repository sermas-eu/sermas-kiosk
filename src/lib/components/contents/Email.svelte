<script lang="ts">
    import { type EmailContentDto } from "@sermas/toolkit";

    export let content: EmailContentDto;
</script>

<span class="email">
    <a href="mailto:{content.email}">{content.label || content.email}</a>
</span>

<style>
</style>
