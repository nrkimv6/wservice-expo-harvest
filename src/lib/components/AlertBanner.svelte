<script lang="ts">
	import { Clock3, Zap } from 'lucide-svelte';

	type Props = {
		message: string;
		mode?: 'fallback' | 'live';
	};

	let { message, mode = 'fallback' }: Props = $props();
</script>

<div
	class="overflow-hidden rounded-2xl bg-gradient-to-r from-orange via-orange-glow to-orange px-3 py-3 text-black shadow-[0_12px_30px_rgba(255,94,0,0.22)]"
	role="status"
	aria-live="polite"
>
	<div class="flex items-center gap-3">
		<div class="flex shrink-0 items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em]">
			<Zap size={16} class="animate-pulse-glow" />
			<span>{mode === 'live' ? 'Live Feed' : 'Hot Drop'}</span>
		</div>

		<div class="relative flex-1 overflow-hidden">
			<div class="animate-ticker flex min-w-max items-center gap-3 whitespace-nowrap font-heading text-sm font-semibold">
				<Clock3 size={15} />
				<span>{message}</span>
			</div>
		</div>
	</div>
</div>
