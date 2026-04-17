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
</script>

<section class="rounded-[32px] border border-border bg-navy-surface p-4 shadow-[0_24px_50px_rgba(0,0,0,0.35)]">
	<div class="mb-4 flex items-center justify-between gap-3">
		<div>
			<p class="text-[11px] font-semibold uppercase tracking-[0.26em] text-muted-foreground">
				{exhibition.mapTitle}
			</p>
			<h2 class="mt-1 font-heading text-2xl font-semibold text-foreground">부스 안내도</h2>
			<p class="mt-2 text-xs leading-5 text-muted-foreground">{exhibition.mapNote}</p>
		</div>

		<div class="rounded-full border border-border bg-navy-elevated px-3 py-1 text-xs text-muted-foreground">
			Pins {items.length}
		</div>
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
						: item.isBookmarked
							? 'border-gold/60 bg-gold/20 text-gold glow-gold'
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
					{#if item.location}
						<p class="mt-1 whitespace-nowrap text-[10px] text-muted-foreground">{item.location}</p>
					{/if}
				</div>
			</button>
		{/each}
	</div>
</section>
