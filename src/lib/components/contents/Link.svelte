<script lang="ts">
    import { type LinkContentDto } from "@sermas/toolkit";
    import QRCode from "qrcode";

    interface Props {
        content: LinkContentDto;
    }

    let { content }: Props = $props();

    // a kiosk is not a browser: the visitor takes the link away on their phone, and
    // the kiosk never navigates away from the app
    let host = $derived.by(() => {
        try {
            return new URL(content.url).host.replace(/^www\./, "");
        } catch {
            return content.url;
        }
    });

    let qr = $state("");
    $effect(() => {
        const url = content.url;
        qr = "";
        if (!url) return;
        QRCode.toString(url, { type: "svg", margin: 1, errorCorrectionLevel: "M" })
            .then((svg) => {
                if (url === content.url) qr = svg;
            })
            .catch(() => (qr = ""));
    });
</script>

<span class="link-card">
    <span class="link-label">{content.label || host}</span>
    {#if content.label}<span class="link-host">{host}</span>{/if}
    {#if qr}
        <!-- the SVG is generated locally by the qrcode library from the URL -->
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        <span class="link-qr" role="img" aria-label="QR code for {host}">{@html qr}</span>
        <span class="link-hint">Scan to open it on your phone</span>
    {/if}
</span>

<style>
    .link-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25rem;
        padding: 0.75rem 1rem;
        width: 100%;
        box-sizing: border-box;
    }
    .link-label {
        font-weight: 600;
        text-align: center;
    }
    .link-host {
        font-size: 0.85em;
        opacity: 0.8;
        word-break: break-all;
    }
    .link-qr {
        display: block;
        width: 10rem;
        height: 10rem;
        margin-top: 0.5rem;
        background: #fff;
        border-radius: 0.5rem;
        padding: 0.25rem;
    }
    .link-qr :global(svg) {
        display: block;
        width: 100%;
        height: 100%;
    }
    .link-hint {
        font-size: 0.85em;
        opacity: 0.8;
    }
</style>
