<script lang="ts">
  import Footer from "$lib/components/Footer.svelte";
  import PrivacyPopup from "$lib/components/PrivacyPopup.svelte";
  import "../app.scss";
</script>

<div class="app">
  <PrivacyPopup />
  <main>
    <slot />
  </main>
  <Footer />
</div>

<style>
  .app {
    position: relative;
    width: 100%;
    height: calc(100vh);
    margin: 0;
    padding: 0;
  }
  main {
    position: relative;
    height: calc(100% - var(--footer-height));
    width: 100%;
    padding: 0;
    margin: 0;
  }
</style>
