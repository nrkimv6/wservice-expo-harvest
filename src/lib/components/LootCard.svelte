<script lang="ts">
	import { CheckCircle2, Circle, Gift, MapPin } from 'lucide-svelte';
	import {
		getPhysicalFloorLabel,
		getVisibleSocialLinks,
		type LootItem
	} from '$lib/data/lootItems';

	type Props = {
		item: LootItem;
		onToggleComplete: (id: string) => void;
		onSelect: (id: string) => void;
	};

	let { item, onToggleComplete, onSelect }: Props = $props();

	const isTimeLimited = $derived(item.time !== 'Always');
	const hasFirstComeEvent = $derived(item.firstComeEvent.trim().length > 0);
	const hasPrize = $derived(item.prize.trim().length > 0);
	const visibleSocialLinks = $derived(getVisibleSocialLinks(item));
	const hasCategory = $derived(item.category.trim().length > 0);
	const floorBadge = $derived(getPhysicalFloorLabel(item.floorId));
	const hasDetailedLocation = $derived(item.location.trim().length > 0 && item.location !== floorBadge);
</script>

<article
	class={[
		'relative rounded-[26px] border border-border bg-navy-surface p-4 transition',
		item.isCompleted
			? 'border-mint/20 bg-mint/5 opacity-60'
			: item.isBookmarked
				? 'border-gold/30 bg-navy-elevated'
				: 'hover:border-gold/40'
	]}
>
	{#if item.isBookmarked && !item.isCompleted}
		<div class="absolute right-0 top-0 h-0 w-0 border-l-[24px] border-t-[24px] border-l-transparent border-t-gold"></div>
	{/if}

	<div class="flex gap-3">
		<button
			type="button"
			class={[
				'mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition',
				item.isCompleted
					? 'border-mint bg-mint/15 text-mint glow-mint'
					: 'border-border bg-navy-elevated text-muted-foreground'
			]}
			aria-label={item.isCompleted ? '미완료로 변경' : '완료 처리'}
			aria-pressed={item.isCompleted}
			onclick={(event) => {
				event.stopPropagation();
				onToggleComplete(item.id);
			}}
		>
			{#if item.isCompleted}
				<CheckCircle2 size={18} />
			{:else}
				<Circle size={18} />
			{/if}
		</button>

		<button type="button" class="flex-1 text-left" aria-label={`${item.title} 상세 보기`} onclick={() => onSelect(item.id)}>
			<div class="flex flex-wrap items-center gap-2">
				<span
					class={[
						'rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em]',
						isTimeLimited ? 'bg-gold/15 text-gold' : 'bg-white/5 text-muted-foreground'
					]}
				>
					{item.time}
				</span>
				{#if hasFirstComeEvent}
					<span class="rounded-full border border-rose-300/35 bg-rose-400/15 px-2.5 py-1 text-[10px] font-bold tracking-[0.18em] text-rose-100">
						선착순
					</span>
				{/if}
				<span class="rounded-full bg-black/20 px-2.5 py-1 text-[10px] font-semibold text-gold">
					{floorBadge}
				</span>
				{#if hasCategory}
					<span class="rounded-full bg-navy-elevated px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">
						{item.category}
					</span>
				{/if}
			</div>

			<h3
				class={[
					'mt-3 font-heading text-lg font-semibold text-foreground',
					item.isCompleted && 'line-through'
				]}
			>
				{item.title}
			</h3>

			{#if hasPrize}
				<div class="mt-3 flex items-center gap-2 text-sm text-gold">
					<Gift size={16} />
					<span>{item.prize}</span>
				</div>
			{/if}

			{#if hasFirstComeEvent}
				<p class="mt-3 text-sm font-medium text-rose-100">{item.firstComeEvent}</p>
			{/if}

			{#if hasDetailedLocation}
				<div class="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
					<MapPin size={14} />
					<span>{item.location}</span>
				</div>
			{/if}

			<p class="mt-2 text-xs text-muted-foreground">선택 시 해당 전시 구역 지도로 이동해 부스를 바로 강조합니다.</p>

			<div class="mt-3 flex flex-wrap gap-2 text-[11px]">
				{#if item.hashtags.length > 0}
					<span class="rounded-full border border-border bg-black/20 px-2.5 py-1 text-muted-foreground">
						#{item.hashtags.length} hashtags
					</span>
				{/if}
				<span class="rounded-full border border-border bg-black/20 px-2.5 py-1 text-muted-foreground">
					{visibleSocialLinks.length} SNS links
				</span>
			</div>
		</button>
	</div>
</article>
