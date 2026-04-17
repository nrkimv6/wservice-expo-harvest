<script lang="ts">
	import { Bookmark, CheckCircle2, MapPin } from 'lucide-svelte';
	import type { Exhibition, LootItem } from '$lib/data/lootItems';

	type Props = {
		exhibition: Exhibition;
		items: LootItem[];
		onPinClick: (id: string) => void;
	};

	let { exhibition, items, onPinClick }: Props = $props();

	const rows = Array.from({ length: 8 });
	const columns = Array.from({ length: 12 });
	let hoveredItemId = $state<string | null>(null);
	const hoveredItem = $derived(items.find((item) => item.id === hoveredItemId) ?? null);
</script>

<section class="rounded-[32px] border border-border bg-navy-surface p-4 shadow-[0_24px_50px_rgba(0,0,0,0.35)]">
	<div class="mb-4 flex items-center justify-between gap-3">
		<div>
			<p class="text-[11px] font-semibold uppercase tracking-[0.26em] text-muted-foreground">
				{exhibition.mapTitle}
			</p>
			<h2 class="mt-1 font-heading text-2xl font-semibold text-foreground">부스 보기</h2>
			<p class="mt-2 text-xs leading-5 text-muted-foreground">{exhibition.mapNote}</p>
		</div>

		<div class="rounded-full border border-border bg-navy-elevated px-3 py-1 text-xs text-muted-foreground">
			{items.length} pins
		</div>
	</div>

	<div class="mb-4 min-h-[68px] rounded-[24px] border border-border bg-black/25 px-4 py-3">
		{#if hoveredItem}
			<p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-gold">Hover Booth</p>
			<p class="mt-1 text-sm font-semibold text-foreground">{hoveredItem.title}</p>
			<div class="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
				{#if hoveredItem.firstComeEvent}
					<span class="text-rose-200">{hoveredItem.firstComeEvent}</span>
				{/if}
				{#if hoveredItem.location}
					<span>{hoveredItem.location}</span>
				{/if}
			</div>
		{:else}
			<p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Hover Booth</p>
		{/if}
	</div>

	<div
		class="relative overflow-hidden rounded-[28px] border border-border bg-navy-surface"
		style={`aspect-ratio:${exhibition.mapAspectRatio ?? '16 / 10'}`}
	>
		{#if exhibition.mapBackgroundImage}
			<img
				src={exhibition.mapBackgroundImage}
				alt={`${exhibition.name} 부스배치도`}
				class="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-90"
			/>
			<div class="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/5 via-black/10 to-black/35"></div>
		{/if}

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

		{#if exhibition.hallLabels?.length}
			<div class="pointer-events-none absolute inset-x-4 top-3 flex justify-between text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
				{#each exhibition.hallLabels as label}
					<span>{label}</span>
				{/each}
			</div>
		{/if}

		<div class="pointer-events-none absolute bottom-3 left-4 rounded-full border border-white/8 bg-black/45 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
			{exhibition.subtitle}
		</div>

		{#each items as item (item.id)}
			<button
				type="button"
				class={[
					'group absolute -translate-x-1/2 -translate-y-1/2 rounded-full border p-2 transition',
					item.isCompleted
						? 'border-mint/35 bg-mint/20 text-mint glow-mint'
						: item.firstComeEvent.trim().length > 0
							? 'border-rose-300/70 bg-rose-400/20 text-rose-50 shadow-[0_0_0_6px_rgba(251,113,133,0.16),0_10px_24px_rgba(244,63,94,0.22)]'
						: item.isBookmarked
							? 'border-gold/60 bg-gold/20 text-gold glow-gold'
							: 'border-border bg-navy-elevated text-foreground'
				]}
				aria-label={`${item.title} 상세 보기 - ${item.isCompleted ? '완료' : item.firstComeEvent.trim().length > 0 ? '선착순 이벤트' : item.isBookmarked ? '찜' : '기본'}`}
				style={`left:${item.mapX}%; top:${item.mapY}%`}
				onmouseenter={() => {
					hoveredItemId = item.id;
				}}
				onmouseleave={() => {
					if (hoveredItemId === item.id) {
						hoveredItemId = null;
					}
				}}
				onfocus={() => {
					hoveredItemId = item.id;
				}}
				onblur={() => {
					if (hoveredItemId === item.id) {
						hoveredItemId = null;
					}
				}}
				onclick={() => onPinClick(item.id)}
			>
				{#if item.firstComeEvent.trim().length > 0 && !item.isCompleted}
					<span class="absolute -right-1 -top-1 flex h-3 w-3">
						<span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-300 opacity-70"></span>
						<span class="relative inline-flex h-3 w-3 rounded-full border border-rose-100/80 bg-rose-300"></span>
					</span>
				{/if}

				{#if item.isCompleted}
					<CheckCircle2 size={16} />
				{:else if item.isBookmarked}
					<Bookmark size={16} />
				{:else}
					<MapPin size={16} />
				{/if}
			</button>
		{/each}
	</div>
</section>
