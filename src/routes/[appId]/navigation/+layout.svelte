<script>
  /**
   * @typedef {Object} Props
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let { children } = $props();
</script>

<div class="app">
  <main>
    {@render children?.()}
  </main>
</div>

<style lang="scss">

  @import '../../../variables.scss';

  .app {
    position: relative;
    width: 100%;
    height: calc(100vh);
    margin: 0;
    padding: 0;
  }


</style>
