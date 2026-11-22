<script lang="ts">

  interface Props {
    videoUrl: string;
  }

  let { videoUrl }: Props = $props();

</script>

<div>
    <div class="video-content is-size-3">
      <div class="status-title has-background-primary has-text-light">Video feed</div>
      <div class="img-container ">
        {#if videoUrl == ''}
          <div class="no-video has-text-info">No video</div>
        {:else}
          <iframe class="has-text-info" src={videoUrl} title="live-stream"></iframe>
        {/if}
      </div>
    </div>
</div>

<style>

.video-content {
  position: relative;
  width: 100%;
  height: auto;
}

.status-title{
  width: 100%;
  text-align: center;
  background-color: #ddd;
}

.img-container {
  position: absolute;
  width: 100%;
  height: 300px;
  background-color: #eee;
  display: flex;
  justify-content: center;
  align-items: center;
}

.img-container iframe {
  width: 100%;
  height: 100%;
}


.no-video {
  position: absolute;
  top: 40%;
  width: 100%;
  text-align: center;
}

</style>