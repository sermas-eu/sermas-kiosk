<script lang="ts">
  import { type ObjectContentDto } from "@sermas/toolkit";
  import { Canvas } from "@threlte/core";
  import Scene from "./Scene.svelte";

  export let content: ObjectContentDto;
</script>

<span class="object">
  <div class="three-d">
    <Canvas>
      <Scene type={content.type} url={content.url} />
    </Canvas>
  </div>
</span>

<style lang="scss">
  .three-d {
    position: relative;
    width: 99%;
  }
</style>
