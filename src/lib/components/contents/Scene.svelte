<script lang="ts">
  import { T } from "@threlte/core";
  import { GLTF, OrbitControls } from "@threlte/extras";
  import { interactivity } from "@threlte/extras";

  interactivity();
  interface Props {
    type: any;
    url: string;
  }

  let { type, url }: Props = $props();
</script>

<T.PerspectiveCamera
  makeDefault
  position={[5, 5, 5]}
  oncreate={(ref) => {
    ref.lookAt(0, 1, 0);
  }}
  fov={25}
>
  <OrbitControls autoRotate enableDamping />
</T.PerspectiveCamera>

<T.AmbientLight />

<GLTF {url} interactive />
