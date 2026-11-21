<script lang="ts">
  import type { StatusDto } from "@sermas/toolkit";

  interface Props {
    dataAvailable?: boolean;
    status: StatusDto;
  }

  let { dataAvailable = true, status }: Props = $props();

  const colors = { x: "red", y: "green", z: "blue", w: "grey" };
</script>

<div class="is-fullwidth">
  <div class="is-size-3">
    <div class="status-title has-background-primary has-text-light">
      Robot status
    </div>
    <div
      class="robot-status has-text-weight-bold has-text-centered is-uppercase {dataAvailable
        ? 'available'
        : 'unavailable'}"
    >
      {dataAvailable ? "Available" : "Unavailable"}
    </div>
  </div>
  <div class="status-data">
    <div class="status-title has-text-primary">Position</div>
    <div class="status-values">
      {#each Object.entries(status.actualPosition?.position || {}) as [key, value]}
        <div class="status-value is-uppercase color-{key}">
          {key}: {value != undefined ? Math.round(value * 100) / 100 : "--"}
        </div>
      {/each}
    </div>
  </div>
  <div class="status-data">
    <div class="status-title has-text-primary">Orientation</div>
    <div class="status-values">
      {#each Object.entries(status.actualPosition?.orientation || {}) as [key, value]}
        <div class="status-value is-uppercase color-{key}">
          {key}: {value != undefined ? Math.round(value * 100) / 100 : "--"}
        </div>
      {/each}
    </div>
  </div>
  <div class="status-data">
    <div class="status-title has-text-primary">Velocity</div>
    <div class="status-values">
      {#each Object.entries(status.velocity?.linear || {}) as [key, value]}
        <div class="status-value is-uppercase color-{key}">
          {key}: {value !== undefined && value !== null
            ? Math.round(+value * 100) / 100
            : "--"}
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .status-data {
    font-size: 1.25rem;
    /* margin-bottom: 10px; */
  }

  .robot-status {
    height: 60px;
    line-height: 60px;
  }

  .status-data div {
    height: 40px;
    line-height: 40px;
  }

  .status-title {
    width: 100%;
    text-align: center;
    background-color: #ddd;
  }

  .status-values {
    display: flex;
    justify-content: space-between;
  }

  .status-value {
    padding-left: 5px;
    flex-grow: 1;
  }

  .color-x,
  .unavailable {
    background-color: rgba(255, 0, 0, 0.2);
    color: rgba(255, 0, 0, 0.8);
  }
  .color-y,
  .available {
    background-color: rgba(0, 255, 0, 0.2);
    color: rgba(0, 200, 0, 0.8);
  }
  .color-z {
    background-color: rgba(0, 0, 255, 0.2);
    color: rgba(0, 0, 255, 0.8);
  }
  .color-w {
    background-color: rgba(255, 255, 0, 0.2);
    color: rgba(170, 170, 0, 0.8);
  }
</style>
