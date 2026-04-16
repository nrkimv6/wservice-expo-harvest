<script lang="ts">
	import { onMount } from 'svelte';
	import { MapPinned, Route, Search } from 'lucide-svelte';
	import AlertBanner from '$lib/components/AlertBanner.svelte';
	import BoothDetailSheet from '$lib/components/BoothDetailSheet.svelte';
	import ExhibitionMap from '$lib/components/ExhibitionMap.svelte';
	import LootFeed from '$lib/components/LootFeed.svelte';
	import { initialLootItems, type LootItem } from '$lib/data/lootItems';
	import { hydrateLootItems, persistLootItems } from '$lib/stores/farmState';

	let items = $state<LootItem[]>(initialLootItems);
	let selectedId = $state<string | null>(null);

	const selectedItem = $derived(items.find((item) => item.id === selectedId) ?? null);

	function parseTimeValue(time: string) {
		if (time === 'Always') return Number.POSITIVE_INFINITY;
		const [hours, minutes] = time.split(':').map(Number);
		return hours * 60 + minutes;
	}

	const nextHotItem = $derived.by(() => {
		return [...items]
			.filter((item) => !item.isCompleted && item.time !== 'Always')
			.sort((left, right) => parseTimeValue(left.time) - parseTimeValue(right.time))[0];
	});

	const alertMessage = $derived.by(() => {
		if (!nextHotItem) {
			return '지금 바로 파밍 가능한 상시 이벤트를 탐색하세요';
		}

		return `${nextHotItem.time} ${nextHotItem.title} 이벤트 임박 → ${nextHotItem.location}`;
	});

	onMount(() => {
		items = hydrateLootItems(initialLootItems);
	});

	$effect(() => {
		persistLootItems(items);
	});

	function selectItem(id: string) {
		selectedId = id;
	}

	function closeSheet() {
		selectedId = null;
	}

	function toggleComplete(id: string) {
		items = items.map((item) =>
			item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
		);
	}

	function toggleBookmark(id: string) {
		items = items.map((item) =>
			item.id === id ? { ...item, isBookmarked: !item.isBookmarked } : item
		);
	}

	function updateMemo(id: string, memo: string) {
		items = items.map((item) => (item.id === id ? { ...item, memo } : item));
	}
</script>

<svelte:head>
	<title>박람회 파밍 | expo-harvest</title>
	<meta
		name="description"
		content="시간제한 이벤트, 지도 핀, 메모와 완료 상태를 한 화면에서 탐색하는 expo-harvest 파밍 화면"
	/>
</svelte:head>

<div class="safe-top safe-bottom min-h-dvh bg-navy-deep pb-8">
	<div class="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 pb-24 pt-5 sm:px-5">
		<AlertBanner message={alertMessage} />

		<section class="rounded-[32px] border border-border bg-white/[0.04] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.4)]">
			<div class="flex items-start justify-between gap-4">
				<div>
					<p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
						Expo Harvest
					</p>
					<h1 class="mt-2 font-heading text-3xl font-bold text-foreground">🗡️ 박람회 파밍 트래커</h1>
					<p class="mt-3 text-sm leading-6 text-muted-foreground">박람회 사은품, 하나도 놓치지 마세요</p>
				</div>

				<div class="rounded-2xl border border-orange/20 bg-orange/10 px-3 py-2 text-right">
					<p class="text-[10px] uppercase tracking-[0.18em] text-orange">Live Queue</p>
					<p class="mt-1 text-sm font-semibold text-foreground">{items.length} booths</p>
				</div>
			</div>

			<div class="mt-5 grid gap-3 sm:grid-cols-3">
				<div class="rounded-2xl border border-border bg-black/20 p-3">
					<MapPinned size={18} class="text-orange" />
					<p class="mt-3 text-sm font-semibold text-foreground">Map First</p>
					<p class="mt-1 text-xs leading-5 text-muted-foreground">핀으로 부스 위치를 먼저 고정</p>
				</div>
				<div class="rounded-2xl border border-border bg-black/20 p-3">
					<Search size={18} class="text-orange" />
					<p class="mt-3 text-sm font-semibold text-foreground">Search + Filter</p>
					<p class="mt-1 text-xs leading-5 text-muted-foreground">미션 허들 기준으로 바로 압축</p>
				</div>
				<div class="rounded-2xl border border-border bg-black/20 p-3">
					<Route size={18} class="text-orange" />
					<p class="mt-3 text-sm font-semibold text-foreground">Local State</p>
					<p class="mt-1 text-xs leading-5 text-muted-foreground">메모와 완료 상태를 이 기기에 저장</p>
				</div>
			</div>
		</section>

		<ExhibitionMap items={items} onPinClick={selectItem} />

		<div class="h-px bg-white/6"></div>

		<LootFeed items={items} onToggleComplete={toggleComplete} onSelectItem={selectItem} />
	</div>
</div>

<BoothDetailSheet
	item={selectedItem}
	onClose={closeSheet}
	onToggleBookmark={toggleBookmark}
	onToggleComplete={toggleComplete}
	onMemoChange={updateMemo}
/>
