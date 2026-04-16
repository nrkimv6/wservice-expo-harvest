<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<div class="min-h-dvh bg-navy-deep text-foreground">
	<main>
		{@render children()}
	</main>
</div>

<span class="fixed bottom-2 right-3 text-[10px] uppercase tracking-[0.28em] text-muted-foreground/70">
	v{__APP_VERSION__}
</span>
