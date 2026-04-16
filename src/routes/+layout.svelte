<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<div class="min-h-dvh bg-[radial-gradient(circle_at_top,_rgba(255,94,0,0.14),_transparent_34%),linear-gradient(180deg,_#060606_0%,_#111111_100%)] text-white">
	<main>
		{@render children()}
	</main>
</div>

<span class="fixed bottom-2 right-3 text-[10px] uppercase tracking-[0.28em] text-white/35">
	v{__APP_VERSION__}
</span>
