<script lang="ts">
    import sermasLogo from "$lib/assets/images/sermas-logo-white.svg";
    const version = PKG_VERSION;
</script>

<footer class="footer">
    <a href="https://sermasproject.eu" class="sermas-logo">
        <img
            class="logo"
            src={sermasLogo}
            alt="SERMAS"
            width="50"
            height="50"
        />
    </a>

    <div class="pre sermas-link">
        <a href="https://sermasproject.eu">sermasproject.eu</a>
    </div>
    <div class="pre sermas-title">
        SOCIALLY-ACCEPTABLE EXTENDED REALITY MODELS AND SYSTEMS
    </div>
    <div class="pre sermas-version">v{version}</div>
</footer>

<style lang="scss">

    .pre {
        font-family: "Courier New", Courier, monospace;
    }

    .footer {
        position: relative;
        bottom: 0;
        z-index: 2;

        height: var(--footer-height);
        width: 100%;

        padding: 0;
        margin: 0;

        text-align: center;
        background-color: rgba(variables.$primary, 0.5);
        backdrop-filter: blur(10px);
        color: white;

        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
    }

    .footer a {
        color: white;
    }

    .logo {
        margin-right: 10px;
    }

    .sermas-link {
        margin-right: 20px;
    }

    .sermas-version {
        margin-left: 20px;
    }

    @include variables.mobile-view {
        .footer {
            bottom: 0;
            --footer-height: 50px;
            font-size: 0.7em;
        }
        .sermas-logo .logo {
            width: 35px;
            height: 35px;
        }

        .sermas-title,
        .sermas-version {
            display: none;
        }
    }
</style>
