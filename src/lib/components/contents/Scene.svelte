<script lang="ts">
  import { T } from "@threlte/core";
  import { GLTF, OrbitControls } from "@threlte/extras";
  import { interactivity } from "@threlte/extras";

  interactivity();
  export let type;
  export let url: string;
</script>

<T.PerspectiveCamera makeDefault position={[5, 2, 5]} fov={25}>
  <OrbitControls autoRotate enableDamping />
</T.PerspectiveCamera>

<T.AmbientLight />

<GLTF {url} interactive />
