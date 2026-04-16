<script lang="ts">
	import { Bookmark, CheckCircle2, MapPin } from 'lucide-svelte';
	import type { LootItem } from '$lib/data/lootItems';

	type Props = {
		items: LootItem[];
		onPinClick: (id: string) => void;
	};

	let { items, onPinClick }: Props = $props();

	const rows = Array.from({ length: 8 });
	const columns = Array.from({ length: 12 });
</script>

<section class="rounded-[32px] border border-border bg-navy-surface p-4 shadow-[0_24px_50px_rgba(0,0,0,0.35)]">
	<div class="mb-4 flex items-center justify-between gap-3">
		<div>
			<p class="text-[11px] font-semibold uppercase tracking-[0.26em] text-muted-foreground">
				Expo Map
			</p>
			<h2 class="mt-1 font-heading text-2xl font-semibold text-foreground">부스 안내도</h2>
		</div>

		<div class="rounded-full border border-border bg-black/30 px-3 py-1 text-xs text-muted-foreground">
			Pins {items.length}
		</div>
	</div>

	<div class="relative aspect-[16/10] overflow-hidden rounded-[28px] border border-border bg-[radial-gradient(circle_at_top,_rgba(255,94,0,0.14),_transparent_30%),linear-gradient(180deg,_rgba(255,255,255,0.03),_transparent)]">
		<div class="pointer-events-none absolute inset-0">
			{#each rows as _, index}
				<div
					class="absolute left-0 right-0 border-t border-white/5"
					style={`top:${(index + 1) * 12.5}%`}
				></div>
			{/each}

			{#each columns as _, index}
				<div
					class="absolute bottom-0 top-0 border-l border-white/5"
					style={`left:${(index + 1) * 8.333}%`}
				></div>
			{/each}
		</div>

		<div class="pointer-events-none absolute inset-x-4 top-3 flex justify-between text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
			<span>Hall A</span>
			<span>Hall B</span>
			<span>Hall C</span>
		</div>

		<div class="pointer-events-none absolute bottom-3 left-4 rounded-full border border-white/8 bg-black/35 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
			Pinch/drag interaction will replace this mock map in the next phase
		</div>

		{#each items as item (item.id)}
			<button
				type="button"
				class={[
					'group absolute -translate-x-1/2 -translate-y-1/2 rounded-full border p-2 transition',
					item.isCompleted
						? 'border-mint/35 bg-mint/20 text-mint glow-mint'
						: item.isBookmarked
							? 'border-orange/35 bg-orange/20 text-orange glow-orange'
							: 'border-border bg-navy-elevated text-foreground'
				]}
				aria-label={`${item.title} 상세 보기 - ${item.isCompleted ? '완료' : item.isBookmarked ? '찜' : '기본'}`}
				style={`left:${item.mapX}%; top:${item.mapY}%`}
				onclick={() => onPinClick(item.id)}
			>
				{#if item.isCompleted}
					<CheckCircle2 size={16} />
				{:else if item.isBookmarked}
					<Bookmark size={16} />
				{:else}
					<MapPin size={16} />
				{/if}

				<div class="pointer-events-none absolute left-1/2 top-[calc(100%+10px)] hidden -translate-x-1/2 rounded-xl border border-border bg-black/90 px-3 py-2 text-left shadow-lg group-hover:block">
					<p class="whitespace-nowrap text-xs font-semibold text-foreground">{item.title}</p>
					<p class="mt-1 whitespace-nowrap text-[10px] text-muted-foreground">{item.location}</p>
				</div>
			</button>
		{/each}
	</div>
</section>
