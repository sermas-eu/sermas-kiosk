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

    // the address as a visitor would type it: no scheme, no trailing slash
    let address = $derived(
        (content.url || "").replace(/^https?:\/\//, "").replace(/\/$/, ""),
    );

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
    {#if qr}
        <!-- the SVG is generated locally by the qrcode library from the URL -->
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        <span class="link-qr" role="img" aria-label="QR code for {host}">{@html qr}</span>
    {/if}
    <!-- plain text, not a link: the kiosk never navigates away -->
    <span class="link-address">{address}</span>
    {#if qr}<span class="link-hint">Scan to open it on your phone</span>{/if}
</span>

<style>
    .link-card {
        /* the agent's message wrapper is a Bulma .button: not clickable here */
        cursor: default;
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
    .link-address {
        font-family: monospace;
        font-size: 0.95em;
        word-break: break-all;
        text-align: center;
        user-select: text;
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
