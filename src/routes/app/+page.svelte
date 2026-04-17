<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		goto('/', { replaceState: true, noScroll: true, keepFocus: true });
	});
</script>

<svelte:head>
	<title>expo-harvest | 루트 앱으로 이동</title>
	<meta http-equiv="refresh" content="0;url=/" />
</svelte:head>

<div class="safe-top safe-bottom flex min-h-dvh items-center justify-center px-4">
	<div class="w-full max-w-md rounded-[28px] border border-border bg-navy-surface p-6 text-center shadow-[0_24px_60px_rgba(0,0,0,0.4)]">
		<p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Legacy Route</p>
		<h1 class="mt-3 font-heading text-2xl font-semibold text-foreground">루트 앱으로 이동 중입니다</h1>
		<p class="mt-3 text-sm leading-6 text-muted-foreground">
			이제 `expo-harvest`의 기본 진입점은 `/`입니다. 자동 이동이 되지 않으면 아래 링크를 눌러 주세요.
		</p>
		<a
			href="/"
			class="mt-5 inline-flex items-center justify-center rounded-2xl bg-gold px-4 py-3 text-sm font-semibold text-black"
		>
			루트 앱 열기
		</a>
	</div>
</div>
