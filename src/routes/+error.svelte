<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="flex min-h-dvh items-center justify-center px-4">
	<div class="w-full max-w-md rounded-[28px] border border-border bg-navy-surface p-8 text-center shadow-[0_18px_50px_rgba(0,0,0,0.45)]">
		<p class="text-xs uppercase tracking-[0.28em] text-muted-foreground">expo-harvest</p>
		<h1 class="mt-4 font-['Space_Grotesk'] text-5xl font-bold text-foreground">{$page.status}</h1>
		<p class="mt-4 text-sm leading-6 text-muted-foreground">{$page.error?.message}</p>
		<a
			href="/"
			class="mt-6 inline-flex rounded-full border border-gold/35 bg-gold/12 px-5 py-2 text-sm font-semibold text-gold-glow transition hover:bg-gold/18"
		>
			홈으로 돌아가기
		</a>
	</div>
</div>
