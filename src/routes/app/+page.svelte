<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { MapPinned, Menu, Route, Search, X } from 'lucide-svelte';
	import AlertBanner from '$lib/components/AlertBanner.svelte';
	import BoothDetailSheet from '$lib/components/BoothDetailSheet.svelte';
	import ExhibitionMap from '$lib/components/ExhibitionMap.svelte';
	import LootFeed from '$lib/components/LootFeed.svelte';
	import {
		DEFAULT_EXHIBITION_ID,
		EXHIBITIONS,
		type Exhibition,
		type LootItem
	} from '$lib/data/lootItems';
	import { subscribeToAlertFeed, type AlertChannelStatus } from '$lib/realtime/alertFeed';
	import {
		hydrateLootItems,
		hydrateSelectedExhibitionId,
		persistLootItems,
		persistSelectedExhibitionId
	} from '$lib/stores/farmState';

	function createInitialItemMap() {
		return Object.fromEntries(EXHIBITIONS.map((exhibition) => [exhibition.id, exhibition.items])) as Record<
			string,
			LootItem[]
		>;
	}

	let itemsByExhibition = $state<Record<string, LootItem[]>>(createInitialItemMap());
	let selectedExhibitionId = $state(DEFAULT_EXHIBITION_ID);
	let selectedId = $state<string | null>(null);
	let liveAlertMessage = $state<string | null>(null);
	let alertChannelStatus = $state<AlertChannelStatus>('connecting');
	let isExhibitionMenuOpen = $state(false);

	let clearLiveAlertTimer: ReturnType<typeof setTimeout> | null = null;

	const exhibitionIds = EXHIBITIONS.map((exhibition) => exhibition.id);
	const selectedExhibition = $derived(
		EXHIBITIONS.find((exhibition) => exhibition.id === selectedExhibitionId) ?? EXHIBITIONS[0]
	);
	const items = $derived(itemsByExhibition[selectedExhibitionId] ?? selectedExhibition.items);
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

	const fallbackAlertMessage = $derived.by(() => {
		if (!nextHotItem) {
			return `${selectedExhibition.name}에서 바로 파밍 가능한 상시 부스를 확인하세요`;
		}

		return `${selectedExhibition.name} · ${nextHotItem.time} ${nextHotItem.title} 임박`;
	});

	const alertMessage = $derived(liveAlertMessage || fallbackAlertMessage);
	const alertMode = $derived(liveAlertMessage ? 'live' : 'fallback');
	const doneCount = $derived(items.filter((item) => item.isCompleted).length);
	const bookmarkedCount = $derived(items.filter((item) => item.isBookmarked).length);

	onMount(() => {
		itemsByExhibition = Object.fromEntries(
			EXHIBITIONS.map((exhibition) => [exhibition.id, hydrateLootItems(exhibition.id, exhibition.items)])
		) as Record<string, LootItem[]>;
		selectedExhibitionId = hydrateSelectedExhibitionId(exhibitionIds, DEFAULT_EXHIBITION_ID);

		const unsubscribe = subscribeToAlertFeed({
			onAlert(message, expiresAt) {
				liveAlertMessage = message;

				if (clearLiveAlertTimer) {
					clearTimeout(clearLiveAlertTimer);
				}

				const timeoutMs = Math.max(expiresAt - Date.now(), 5_000);
				clearLiveAlertTimer = setTimeout(() => {
					liveAlertMessage = null;
					clearLiveAlertTimer = null;
				}, timeoutMs);
			},
			onStatusChange(status) {
				alertChannelStatus = status;
			}
		});

		return () => {
			if (clearLiveAlertTimer) {
				clearTimeout(clearLiveAlertTimer);
			}
			unsubscribe();
		};
	});

	$effect(() => {
		for (const exhibition of EXHIBITIONS) {
			persistLootItems(exhibition.id, itemsByExhibition[exhibition.id] ?? exhibition.items);
		}
		persistSelectedExhibitionId(selectedExhibitionId);
	});

	$effect(() => {
		if (!browser || !isExhibitionMenuOpen) return;

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

		return () => {
			document.body.style.overflow = previousOverflow;
		};
	});

	function updateSelectedItems(updater: (currentItems: LootItem[]) => LootItem[]) {
		itemsByExhibition = {
			...itemsByExhibition,
			[selectedExhibitionId]: updater(itemsByExhibition[selectedExhibitionId] ?? selectedExhibition.items)
		};
	}

	function selectItem(id: string) {
		selectedId = id;
	}

	function closeSheet() {
		selectedId = null;
	}

	function toggleExhibitionMenu() {
		isExhibitionMenuOpen = !isExhibitionMenuOpen;
	}

	function closeExhibitionMenu() {
		isExhibitionMenuOpen = false;
	}

	function selectExhibition(exhibition: Exhibition) {
		selectedExhibitionId = exhibition.id;
		selectedId = null;
		isExhibitionMenuOpen = false;
	}

	function toggleComplete(id: string) {
		updateSelectedItems((currentItems) =>
			currentItems.map((item) => (item.id === id ? { ...item, isCompleted: !item.isCompleted } : item))
		);
	}

	function toggleBookmark(id: string) {
		updateSelectedItems((currentItems) =>
			currentItems.map((item) => (item.id === id ? { ...item, isBookmarked: !item.isBookmarked } : item))
		);
	}

	function updateMemo(id: string, memo: string) {
		updateSelectedItems((currentItems) =>
			currentItems.map((item) => (item.id === id ? { ...item, memo } : item))
		);
	}
</script>

<svelte:window
	onkeydown={(event) => {
		if (isExhibitionMenuOpen && event.key === 'Escape') {
			closeExhibitionMenu();
		}
	}}
/>

<svelte:head>
	<title>{selectedExhibition.name} | expo-harvest</title>
	<meta name="description" content={selectedExhibition.description} />
</svelte:head>

<div class="safe-top safe-bottom min-h-dvh bg-navy-deep pb-8">
	<div class="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 pb-24 pt-5 sm:px-5">
		<AlertBanner message={alertMessage} mode={alertMode} />

		<section class="rounded-[32px] border border-border bg-navy-surface p-5 shadow-[0_24px_60px_rgba(0,0,0,0.4)]">
			<div class="flex items-start justify-between gap-4">
				<div>
					<p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
						Expo Harvest
					</p>
					<h1 class="mt-2 font-heading text-3xl font-bold text-foreground">박람회 파밍 트래커</h1>
					<p class="mt-2 text-sm font-semibold text-gold">{selectedExhibition.name}</p>
					<p class="mt-3 text-sm leading-6 text-muted-foreground">{selectedExhibition.description}</p>
				</div>

				<div class="flex shrink-0 flex-col items-end gap-3">
					<button
						type="button"
						class="flex items-center gap-2 rounded-2xl border border-border bg-navy-elevated px-3 py-2 text-sm font-semibold text-foreground transition hover:border-gold/30 hover:text-gold"
						aria-controls="exhibition-menu-drawer"
						aria-expanded={isExhibitionMenuOpen}
						aria-haspopup="dialog"
						onclick={toggleExhibitionMenu}
					>
						<Menu size={16} />
						<span>박람회 메뉴</span>
					</button>

					<div class="rounded-2xl border border-gold/20 bg-gold/10 px-3 py-2 text-right">
						<p class="text-[10px] uppercase tracking-[0.18em] text-gold">Live Queue</p>
						<p class="mt-1 text-sm font-semibold text-foreground">{items.length} booths</p>
						<p class="mt-1 text-[10px] text-white/55">
							{#if liveAlertMessage}
								Realtime override
							{:else if alertChannelStatus === 'connected'}
								Realtime standby
							{:else if alertChannelStatus === 'connecting'}
								Realtime connecting
							{:else}
								Fallback schedule
							{/if}
						</p>
					</div>
				</div>
			</div>

			<div class="mt-5 grid gap-3 sm:grid-cols-3">
				<div class="rounded-2xl border border-border bg-navy-elevated p-3">
					<MapPinned size={18} class="text-gold" />
					<p class="mt-3 text-sm font-semibold text-foreground">Map First</p>
					<p class="mt-1 text-xs leading-5 text-muted-foreground">
						선택한 박람회 지도 위에서 바로 부스를 집습니다
					</p>
				</div>
				<div class="rounded-2xl border border-border bg-navy-elevated p-3">
					<Search size={18} class="text-gold" />
					<p class="mt-3 text-sm font-semibold text-foreground">Search + Filter</p>
					<p class="mt-1 text-xs leading-5 text-muted-foreground">
						브랜드명, 해시태그, SNS 링크 기준으로 빠르게 압축합니다
					</p>
				</div>
				<div class="rounded-2xl border border-border bg-navy-elevated p-3">
					<Route size={18} class="text-gold" />
					<p class="mt-3 text-sm font-semibold text-foreground">Separate State</p>
					<p class="mt-1 text-xs leading-5 text-muted-foreground">
						박람회마다 찜, 완료, 메모 상태를 따로 저장합니다
					</p>
				</div>
			</div>
		</section>

		<section class="rounded-[30px] border border-border bg-black/30 p-4 sm:p-5">
			<div class="grid gap-3 sm:grid-cols-3">
				<div class="rounded-2xl border border-border bg-navy-surface p-4">
					<p class="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Current Expo</p>
					<p class="mt-2 text-base font-semibold text-foreground">{selectedExhibition.name}</p>
					<p class="mt-1 text-xs text-muted-foreground">{selectedExhibition.venue}</p>
					<p class="mt-2 text-[11px] text-muted-foreground">전환은 우측 상단 햄버거 메뉴에서 합니다</p>
				</div>
				<div class="rounded-2xl border border-border bg-navy-surface p-4">
					<p class="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Bookmarked</p>
					<p class="mt-2 text-2xl font-heading font-semibold text-gold">{bookmarkedCount}</p>
					<p class="mt-1 text-xs text-muted-foreground">관심 부스 수</p>
				</div>
				<div class="rounded-2xl border border-border bg-navy-surface p-4">
					<p class="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Farmed</p>
					<p class="mt-2 text-2xl font-heading font-semibold text-mint">{doneCount}</p>
					<p class="mt-1 text-xs text-muted-foreground">완료 처리한 부스 수</p>
				</div>
			</div>
		</section>

		<ExhibitionMap exhibition={selectedExhibition} items={items} onPinClick={selectItem} />

		<div class="h-px bg-white/6"></div>

		<LootFeed items={items} onToggleComplete={toggleComplete} onSelectItem={selectItem} />
	</div>
</div>

{#if isExhibitionMenuOpen}
	<div class="fixed inset-0 z-40">
		<button
			type="button"
			class="absolute inset-0 bg-navy-deep/82 backdrop-blur-sm"
			aria-label="박람회 메뉴 닫기"
			onclick={closeExhibitionMenu}
		></button>

		<div
			id="exhibition-menu-drawer"
			class="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col border-l border-border bg-navy-surface shadow-[-18px_0_48px_rgba(0,0,0,0.45)]"
			role="dialog"
			aria-modal="true"
			aria-labelledby="exhibition-menu-title"
		>
			<div class="flex items-start justify-between gap-3 border-b border-white/6 px-5 pb-4 pt-5">
				<div>
					<p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
						Hamburger Menu
					</p>
					<h2 id="exhibition-menu-title" class="mt-1 font-heading text-2xl font-semibold text-foreground">
						박람회 선택
					</h2>
					<p class="mt-2 text-sm leading-6 text-muted-foreground">
						메인 화면에서는 숨기고 여기서만 박람회를 전환합니다.
					</p>
				</div>

				<button
					type="button"
					class="rounded-full border border-border bg-navy-elevated p-2 text-muted-foreground transition hover:border-gold/30 hover:text-gold"
					aria-label="박람회 메뉴 닫기"
					onclick={closeExhibitionMenu}
				>
					<X size={16} />
				</button>
			</div>

			<div class="no-scrollbar flex-1 space-y-3 overflow-y-auto px-5 py-5">
				{#each EXHIBITIONS as exhibition (exhibition.id)}
					<button
						type="button"
						class={[
							'w-full rounded-[24px] border px-4 py-4 text-left transition',
							exhibition.id === selectedExhibitionId
								? 'border-gold/40 bg-gold/10 shadow-[0_18px_40px_rgba(255,199,94,0.12)]'
								: 'border-border bg-navy-elevated hover:border-gold/25'
						]}
						aria-pressed={exhibition.id === selectedExhibitionId}
						onclick={() => selectExhibition(exhibition)}
					>
						<div class="flex items-start justify-between gap-3">
							<div>
								<p class="text-sm font-semibold text-foreground">{exhibition.name}</p>
								<p class="mt-1 text-xs text-muted-foreground">{exhibition.subtitle}</p>
							</div>

							<span
								class={[
									'rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]',
									exhibition.id === selectedExhibitionId
										? 'bg-gold text-black'
										: 'bg-black/25 text-muted-foreground'
								]}
							>
								{exhibition.id === selectedExhibitionId ? 'Selected' : 'Open'}
							</span>
						</div>

						<p class="mt-3 text-xs leading-5 text-muted-foreground">{exhibition.venue}</p>
					</button>
				{/each}
			</div>
		</div>
	</div>
{/if}

<BoothDetailSheet
	item={selectedItem}
	onClose={closeSheet}
	onToggleBookmark={toggleBookmark}
	onToggleComplete={toggleComplete}
	onMemoChange={updateMemo}
/>
