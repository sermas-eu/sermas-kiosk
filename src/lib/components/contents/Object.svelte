<script lang="ts">
  import { type ObjectContentDto } from "@sermas/toolkit";
  import { Canvas } from "@threlte/core";
  import Scene from "./Scene.svelte";
  import * as THREE from "three";
  import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
  import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
  import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
  import { onMount } from "svelte";

  export let content: ObjectContentDto;

  onMount(async () => {
    if (content.type !== "glb") {
      const container = document.getElementById("three-d") as HTMLInputElement;

      const scene = new THREE.Scene();
      // scene.background = new THREE.Color(0x808080);
      scene.background = null;

      const camera = new THREE.PerspectiveCamera(
        30,
        container.clientWidth / container.clientHeight
      );
      camera.position.set(2, 5, 10);
      camera.lookAt(scene.position);

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
      });
      renderer.setSize(container.clientWidth, container.clientHeight - 5);
      container.appendChild(renderer.domElement);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      // controls.target.set(0, 1, 0);

      const light = new THREE.DirectionalLight("white", 0.5);
      light.position.set(1, 1, 1);
      scene.add(light);

      const ambientLight = new THREE.AmbientLight("white", 0.5);
      scene.add(ambientLight);

      const fbxLoader = new FBXLoader();
      const objLoader = new OBJLoader();
      if (content.type === "fbx") {
        fbxLoader.load(
          content.url,
          (object) => {
            addObj(object);
          }
          // (xhr) => {
          //   console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
          // },
          // (error) => {
          //   console.log(error);
          // }
        );
      } else {
        objLoader.load(
          content.url,
          (object) => {
            addObj(object);
          }
          // (xhr) => {
          //   console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
          // },
          // (error) => {
          //   console.log(error);
          // }
        );
      }

      function addObj(object: THREE.Group<THREE.Object3DEventMap>) {
        object.traverse(function (child) {
          if ((child as THREE.Mesh).isMesh) {
            if ((child as THREE.Mesh).material) {
              (
                (child as THREE.Mesh).material as THREE.MeshBasicMaterial
              ).transparent = false;
              (
                (child as THREE.Mesh).material as THREE.MeshBasicMaterial
              ).alphaTest = 0.5;
            }
          }
        });

        scene.add(object);
        const box3 = new THREE.Box3().setFromObject(object);
        const vector = new THREE.Vector3();
        box3.getCenter(vector);
        object.position.set(-vector.x, -vector.y, -vector.z);
      }

      window.addEventListener("resize", onWindowResize, false);

      function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        render();
      }

      function animate() {
        requestAnimationFrame(animate);
        controls.update();
        render();
      }

      function render() {
        renderer.render(scene, camera);
      }

      animate();
    }
  });
</script>

<span class="object">
  <div class="three-d" id="three-d">
    {#if content.type === "glb"}
      <Canvas>
        <Scene type={content.type} url={content.url} />
      </Canvas>
      <!-- {:else if content.type === "obj"}{:else if content.type === "fbx"} -->
    {/if}
  </div>
</span>

<style lang="scss">
  .three-d {
    position: relative;
    width: 99%;

    min-width: 100px;
    min-height: 100px;
  }
</style>
