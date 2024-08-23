<script lang="ts">
    import { browser } from "$app/environment";
    import { page } from "$app/stores";
    import { toolkit } from "$lib";
    import Loader from "$lib/components/Loader.svelte";
    import { appReadyStore } from "$lib/store";
    import { toDateTime, toTime } from "$lib/util";
    import {
        type MonitoringRecordDto,
        type SessionDto,
    } from "@sermas/api-client";
    import { onDestroy, onMount } from "svelte";

    let interval: NodeJS.Timeout;

    let session: SessionDto;
    let ready = false;

    let history: MonitoringRecordDto[] = [];

    onMount(async () => {
        if (!browser) return;
    });

    onDestroy(async () => {
        if (!browser) return;
        if (interval) clearInterval(interval);
    });

    $: if ($appReadyStore) {
        ready = true;
        interval = setInterval(() => refreshContents(), 1000);
        refreshContents();
    }

    const refreshContents = () => {
        loadSession();
        loadMonitoringHistory();
    };

    const loadMonitoringHistory = async () => {
        const { appId, sessionId } = $page.params;
        history = await toolkit.getApiClient().api.platform.monitoringSearch({
            requestBody: {
                appId,
                sessionId,
                // types: [
                //     "kpi",
                //     "performance",
                //     "chat",
                //     "characterization",
                //     "task",
                // ],
            },
        });

        history = history.sort((a, b) =>
            new Date(a.ts).getTime() <= new Date(b.ts).getTime() ? 1 : -1,
        );
    };

    const loadSession = async () => {
        const { appId, sessionId } = $page.params;
        session = await toolkit.getApiClient().api.session.readSession({
            sessionId,
        });
    };

    const toDuration = (d1: Date | string, d2: Date | string) => {
        const diff = new Date(d2).getTime() - new Date(d1).getTime();
        return Math.floor(diff / 1000 / 60);
    };

    const exportCsv = () => {
        const rows = history.map((r: any) => {
            const cols: any[] = [];
            for (const key in r) {
                const val = r[key];
                cols.push(val);
            }
            return cols;
        });

        const csvContent =
            "data:text/csv;charset=utf-8," +
            rows.map((e) => e.join(";")).join("\n");

        var encodedUri = encodeURI(csvContent);
        var link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `session_${session.sessionId}.csv`);
        document.body.appendChild(link); // Required for FF
        link.click();
    };
</script>

{#if !ready}
    <Loader />
{:else}
    <div class="container with-scroll has-background-light">
        <div class="header">
            <div class="container">
                <div class="column">
                    {#if session}
                        <h1 class="title" title={session.sessionId}>
                            Session statistics
                        </h1>
                        <div class="subtitle">
                            <!-- status {session.closedAt ? "closed" : "ongoing"} -->
                            started on {#if session.createdAt}
                                {toDateTime(session.createdAt)}
                            {/if}
                            {#if session.closedAt}
                                completed in {toDuration(
                                    session.createdAt,
                                    session.closedAt,
                                )}min
                            {:else}
                                ongoing
                            {/if}
                        </div>
                        <a
                            class="button is-small is-primary"
                            href="#"
                            on:click|preventDefault={() => exportCsv()}
                        >
                            Export
                        </a>
                    {:else}
                        <p>Loading session ...</p>
                    {/if}
                </div>
            </div>
        </div>

        <div class="section">
            <div class="container">
                <div class="column">
                    {#if history.length}
                        {#each history as record}
                            <ul>
                                <li>
                                    <span>{toTime(record.ts)}</span>
                                    <span class="tag is-secondary"
                                        >{record.type}</span
                                    >
                                    <span>{record.label}</span>
                                </li>
                            </ul>
                        {/each}
                    {:else}
                        No records found
                    {/if}
                </div>
            </div>
        </div>
    </div>
{/if}

<style>
    .with-scroll {
        overflow-y: scroll;
        height: 100%;
    }
</style>
