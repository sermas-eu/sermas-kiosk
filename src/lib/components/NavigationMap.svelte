<script lang="ts">
  import type {
    OrientationDto,
    RepositoryRobotModelDto,
    StatusDto,
  } from "@sermas/toolkit";
  import { onMount } from "svelte";
  import * as THREE from "three";

  export let status: StatusDto;
  export let robot: RepositoryRobotModelDto;

  let imageUrl = `https://${window.location.hostname}/${robot.map?.imageUrl}`;
  let agvImageUrl = `https://${window.location.hostname}/agv.png`;

  let originOffsetX = robot.map?.originOffsetX || 0;
  let originOffsetY = robot.map?.originOffsetY || 0;

  // let robotPositionXPerc = 0
  // let robotPositionYPerc = 0

  const buildingWidth = robot.map?.width || 0;
  // const buildingHeight = 9
  const agvW = 30; //cm
  const agvRatio = 0.75;

  let imgWidthPerc = 100;
  let ratio = 1;

  let agvWidthPerc = 1;
  let agvHeightPerc = 1;

  const resizeImage = () => {
    const curMaAreaW = (window.innerWidth / 3) * 2;
    const curMaAreaH = window.innerHeight - 50;
    if (curMaAreaW > curMaAreaH) {
      imgWidthPerc = 100 * (curMaAreaH / curMaAreaW);
    } else {
      imgWidthPerc = 100;
    }
  };

  const rotation = (orientation: OrientationDto) => {
    const q = new THREE.Quaternion(
      orientation.x,
      orientation.y,
      orientation.z,
      orientation.w,
    );
    const rot = new THREE.Euler();
    rot.setFromQuaternion(q);
    return rot.z;
  };

  onMount(() => {
    const img = new Image();
    img.onload = function () {
      let imgWidth = img.width;
      let imgHeight = img.height;
      ratio = imgHeight / imgWidth;
      // console.log(imgWidth, imgHeight, ratio)
      agvWidthPerc = agvW / buildingWidth;
      agvHeightPerc = agvWidthPerc / agvRatio;
    };
    img.src = imageUrl;

    resizeImage();
    window.addEventListener("resize", resizeImage);

    return () => {
      window.removeEventListener("resize", resizeImage);
    };
  });
</script>

<div>
  <div class="map-content is-size-3">
    <div class="status-title has-background-primary has-text-light">
      Navigation map
    </div>
    <div class="map-div">
      {#if !imageUrl}
        <div class="no-map has-text-info">No map</div>
      {:else}
        <div
          class="img-div"
          style="width: {imgWidthPerc}%;padding-top: {imgWidthPerc *
            Math.round(ratio)}%;background-image: url('{imageUrl}');"
        >
          <div
            class="agv-div"
            style="background-image: url({agvImageUrl});transform: rotate({-rotation(
              status.actualPosition?.orientation,
            )}rad);left: {(100 *
              (status.actualPosition?.position.x + originOffsetX)) /
              buildingWidth}%;top: {(100 *
              (status.actualPosition?.position.y + originOffsetY)) /
              (buildingWidth /
                ratio)}%;width: {agvWidthPerc}%; height: {agvHeightPerc}%;"
          >
            <span></span>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .map-content {
    position: relative;
    width: 100%;
    height: auto;
  }

  .map-div {
    position: relative;
    width: 100%;
    height: 100vh;
    padding-bottom: 50px;
    min-height: 250px;
    text-align: center;
    line-height: 250px;
    background-color: #ccc;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .img-div {
    position: relative;
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
  }

  .agv-div {
    position: absolute;
    background-position: center;
    background-size: contain;
    background-repeat: no-repeat;
    /* top:0; */
    /* background-color: blue; */
    transition:
      transform 0.5s,
      left 0.5s,
      top 0.5s;
  }

  .status-title {
    width: 100%;
    text-align: center;
    background-color: #ddd;
  }

  .no-map {
    position: absolute;
    top: 40%;
    width: 100%;
    text-align: center;
  }
</style>
