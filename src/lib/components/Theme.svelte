<script>
	/* Default theme props can be retrieved from store or provided on SSR/SSG generation.
		 To update :root CSS Vars dynamically you can use
		 document.documentElement.style.setProperty('--your-var', 'value');
  */
	export let primaryBgColor = '#64539e';
	export let primaryTextColor = 'white';
	export let secondaryBgColor = '#64539e';
	export let secondaryTextColor = 'white';

</script>

<style>
	:global(.sermas-button) {
		background-color: var(--theme-primary-bg-color) !important;
		color: var(--theme-primary-text-color) !important;
	}
	:global(.sermas-title) {
		color: var(--theme-primary-bg-color) !important;
		text-shadow: 2px 1px 3px rgba(0,0,0,0.5);
	}
	:global(.sermas-actor) {
		background-color: var(--theme-secondary-bg-color) !important;
		color: var(--theme-secondary-text-color) !important;
	}
	:global(.with-neumorphism) {
		box-shadow:
            0px -0px 14px var(--theme-secondary-bg-color),
            -0px 0px 14px var(--theme-secondary-bg-color);
		/* background: linear-gradient(
             45deg,
             rgba(var(--theme-secondary-bg-color), 0.7),
             rgba(var(--theme-secondary-bg-color), 0.5)
         ); */
	}

</style>

<div style={
  `--theme-primary-bg-color: ${primaryBgColor};` + 
	`--theme-primary-text-color: ${primaryTextColor};` +
  `--theme-secondary-bg-color: ${secondaryBgColor};` + 
	`--theme-secondary-text-color: ${secondaryTextColor};` +
	`width: 100%; height: 100%;`
}>
	<slot/>
</div>