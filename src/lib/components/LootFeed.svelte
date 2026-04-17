<script lang="ts">
	import { Search } from 'lucide-svelte';
	import FilterChips from '$lib/components/FilterChips.svelte';
	import LootCard from '$lib/components/LootCard.svelte';
	import {
		getInstagramUploadTypeLabel,
		getVisibleSocialLinks,
		type LootCategory,
		type LootItem
	} from '$lib/data/lootItems';

	type Props = {
		items: LootItem[];
		onToggleComplete: (id: string) => void;
		onSelectItem: (id: string) => void;
		eyebrow?: string;
		title?: string;
		summaryLabel?: string;
		summaryCount?: number;
		emptyTitle?: string;
		emptyBody?: string;
	};

	let {
		items,
		onToggleComplete,
		onSelectItem,
		eyebrow = 'Loot Feed',
		title = '이벤트 리스트',
		summaryLabel = 'Farmed',
		summaryCount = undefined,
		emptyTitle = '조건에 맞는 부스가 없습니다',
		emptyBody = '검색어를 줄이거나 필터를 해제해서 다시 확인하세요.'
	}: Props = $props();

	let search = $state('');
	let activeFilters = $state<LootCategory[]>([]);
	const showCategoryFilters = false;

	function parseTimeValue(time: string) {
		if (time === 'Always') return Number.POSITIVE_INFINITY;
		const [hours, minutes] = time.split(':').map(Number);
		return hours * 60 + minutes;
	}

	function toggleFilter(category: LootCategory) {
		activeFilters = activeFilters.includes(category)
			? activeFilters.filter((value) => value !== category)
			: [...activeFilters, category];
	}

	const filteredItems = $derived.by(() => {
		const normalized = search.trim().toLowerCase();

		return items.filter((item) => {
			const visibleSocialLinks = getVisibleSocialLinks(item);
			const matchesSearch =
				normalized.length === 0 ||
				[
					item.title,
					item.firstComeEvent,
					item.prize,
					item.location,
					item.category,
					item.mission,
					item.raffleEvent ?? '',
					getInstagramUploadTypeLabel(item.instagramUploadType),
					item.hashtags.join(' '),
					visibleSocialLinks.map((link) => link.label).join(' ')
				]
					.join(' ')
					.toLowerCase()
					.includes(normalized);

			const matchesFilter =
				activeFilters.length === 0 || activeFilters.includes(item.category);

			return matchesSearch && matchesFilter;
		});
	});

	const sortedItems = $derived.by(() => {
		return [...filteredItems].sort((left, right) => {
			if (left.isCompleted !== right.isCompleted) {
				return Number(left.isCompleted) - Number(right.isCompleted);
			}

			const leftHasFirstCome = left.firstComeEvent.trim().length > 0;
			const rightHasFirstCome = right.firstComeEvent.trim().length > 0;
			if (leftHasFirstCome !== rightHasFirstCome) {
				return Number(rightHasFirstCome) - Number(leftHasFirstCome);
			}

			const leftIsTimed = left.time !== 'Always';
			const rightIsTimed = right.time !== 'Always';
			if (leftIsTimed !== rightIsTimed) {
				return Number(rightIsTimed) - Number(leftIsTimed);
			}

			return parseTimeValue(left.time) - parseTimeValue(right.time) || left.title.localeCompare(right.title);
		});
	});

	const doneCount = $derived(items.filter((item) => item.isCompleted).length);
	const resolvedSummaryCount = $derived(summaryCount ?? doneCount);
</script>

<section class="rounded-[30px] border border-border bg-black/30 p-4 sm:p-5">
	<div class="flex items-center justify-between gap-3">
		<div>
			<p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
				{eyebrow}
			</p>
			<h2 class="mt-1 font-heading text-2xl font-semibold text-foreground">{title}</h2>
		</div>

		<div class="rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-xs font-semibold text-mint">
			{summaryLabel} {resolvedSummaryCount}/{items.length}
		</div>
	</div>

	<label class="mt-4 flex items-center gap-3 rounded-2xl border border-border bg-navy-surface px-4 py-3">
		<Search size={16} class="text-muted-foreground" />
		<input
			class="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
			placeholder="부스명, 경품명, 이벤트 종류 검색"
			value={search}
			oninput={(event) => {
				search = (event.currentTarget as HTMLInputElement).value;
			}}
		/>
	</label>

	{#if showCategoryFilters}
		<div class="mt-4">
			<FilterChips active={activeFilters} onToggle={toggleFilter} />
		</div>
	{/if}

	<div class="mt-4 space-y-3">
		{#if sortedItems.length > 0}
			{#each sortedItems as item (item.id)}
				<LootCard item={item} onToggleComplete={onToggleComplete} onSelect={onSelectItem} />
			{/each}
		{:else}
			<div class="rounded-[26px] border border-dashed border-border bg-navy-surface/60 px-5 py-8 text-center">
				<p class="font-heading text-lg font-semibold text-foreground">{emptyTitle}</p>
				<p class="mt-2 text-sm text-muted-foreground">{emptyBody}</p>
			</div>
		{/if}
	</div>
</section>
