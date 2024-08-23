<script lang="ts">
    import { browser } from "$app/environment";
    import { page } from "$app/stores";
    import { env } from "$env/dynamic/public";
    import { createToolkit } from "$lib";
    import NavigationMap from "$lib/components/NavigationMap.svelte";
    import NavigationStatus from "$lib/components/NavigationStatus.svelte";
    import VideoFeed from "$lib/components/VideoFeed.svelte";
    import type {
        RepositoryRobotModelDto,
        SermasToolkit,
        StatusDto,
        StatusEventDto,
    } from "@sermas/toolkit";
    import { logger } from "@sermas/toolkit/utils";
    import { onDestroy, onMount } from "svelte";
    // import { PageData } from "../$types";

    export let data;

    let toolkit: SermasToolkit;
    let lastDataTimestamp = 0;
    let dataAvailable = false;
    let dataCheckInterval: any = undefined;
    const DATA_VALIDITY_SEC = 10;
    let videoUrl = "";
    // let mapUrl = "../map.png"
    let robot: RepositoryRobotModelDto;

    let status: StatusDto = {
        actualPosition: {
            position: { x: 0.0, y: 0.0, z: 0.0 },
            orientation: { x: 0.0, y: 0.0, z: 0.0, w: 1 },
        },
        velocity: {
            angular: { x: 0.0, y: 0.0, z: 0.0 },
            linear: { x: 0.0, y: 0.0, z: 0.0 },
        },
    };

    const onRobotStatus = (st: StatusEventDto) => {
        status = st.status;
        lastDataTimestamp = Date.now();
    };

    const loadRobotData = async () => {
        const app = await toolkit.getApp();
        logger.log("Fetched robot configuration", app?.repository.robots);

        const filtered = app?.repository.robots?.filter((r) => r.id === "agv");
        if (filtered?.length) {
            robot = filtered[0];
        }
    };

    const initToolkit = async (appId: string, token: string | undefined) => {
        toolkit = createToolkit({
            appId,
            moduleId: "robot",
        });

        await toolkit.init(token || undefined);

        toolkit.on("robotics.status", onRobotStatus);

        await loadRobotData();
    };

    const onMessage = async (event: MessageEvent<any>) => {
        // if (event.origin.indexOf("https://kiosk.local.sermas.spindoxlabs.it") === -1) {
        //     console.warn("Unknown origin ", event.origin)
        //     return
        // }
        // const d = JSON.parse(event.data)
        // if (d.appId && d.token) {
        //     setToken({ accessToken: d.token, refreshToken: '',  expiresIn: new Date()})
        //     const token = await getAppAccessToken(d.appId, 'robot')
        //     initToolkit(d.appId, token?.accessToken)
        // }
    };

    onMount(async () => {
        dataCheckInterval = setInterval(() => checkDataValidity(), 1000);
        if (!browser) return;
        window.addEventListener("message", onMessage, false);

        const appId = $page.params.appId;
        let token: string | null = null;

        if (data && data.accessToken) {
            logger.debug(`Found page token`);
            token = data.accessToken;
        }

        setTimeout(() => initToolkit(appId, data.accessToken), 3000);
    });

    onDestroy(async () => {
        clearInterval(dataCheckInterval);
        if (!browser) return;
        window.removeEventListener("message", onMessage);

        if (toolkit) {
            toolkit.on("robotics.status", onRobotStatus);
            await toolkit?.destroy();
        }
    });

    const checkDataValidity = () => {
        dataAvailable =
            lastDataTimestamp > Date.now() - DATA_VALIDITY_SEC * 1000;
        if (!dataAvailable) {
            videoUrl = "";
        } else {
            if (videoUrl == "") logger.debug("Robotics data available");
            videoUrl = robot?.videoUrl;
        }
    };
</script>

<div class="columns is-gapless no-scrollbars">
    <div class="column is-one-third">
        <NavigationStatus {dataAvailable} {status} />
        <VideoFeed {videoUrl} />
    </div>
    <div class="column map">
        {#if robot}
            <NavigationMap {robot} {status} />
        {/if}
    </div>
</div>

<style>
    :global(.app) {
        background-color: white;
    }
    :global(.app .footer) {
        display: none !important;
    }

    .columns {
        height: 100vh;
    }

    .no-scrollbars {
        overflow: hidden !important;
    }
</style>
