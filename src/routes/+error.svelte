<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="flex min-h-dvh items-center justify-center px-4">
	<div class="w-full max-w-md rounded-[28px] border border-white/10 bg-black/35 p-8 text-center shadow-[0_18px_50px_rgba(0,0,0,0.45)]">
		<p class="text-xs uppercase tracking-[0.28em] text-white/40">expo-harvest</p>
		<h1 class="mt-4 font-['Space_Grotesk'] text-5xl font-bold text-white">{$page.status}</h1>
		<p class="mt-4 text-sm leading-6 text-white/65">{$page.error?.message}</p>
		<a
			href="/"
			class="mt-6 inline-flex rounded-full border border-[#ff5e00]/35 bg-[#ff5e00]/12 px-5 py-2 text-sm font-semibold text-[#ff9a66] transition hover:bg-[#ff5e00]/18"
		>
			홈으로 돌아가기
		</a>
	</div>
</div>
