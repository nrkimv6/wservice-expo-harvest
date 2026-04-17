<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import {
		AlarmClockCheck,
		Bookmark,
		MapPinned,
		Menu,
		Route,
		Search,
		X
	} from 'lucide-svelte';
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

	type AppTab = 'home' | 'map' | 'list' | 'saved';

	const tabs: { id: Exclude<AppTab, 'home'>; label: string; icon: typeof AlarmClockCheck }[] = [
		{ id: 'map', label: '지도', icon: MapPinned },
		{ id: 'list', label: '리스트', icon: Search },
		{ id: 'saved', label: '저장됨', icon: Bookmark }
	];

	function createInitialItemMap() {
		return Object.fromEntries(EXHIBITIONS.map((exhibition) => [exhibition.id, exhibition.items])) as Record<
			string,
			LootItem[]
		>;
	}

	function parseTimeValue(time: string) {
		if (time === 'Always') return Number.POSITIVE_INFINITY;
		const [hours, minutes] = time.split(':').map(Number);
		return hours * 60 + minutes;
	}

	let itemsByExhibition = $state<Record<string, LootItem[]>>(createInitialItemMap());
	let selectedExhibitionId = $state(DEFAULT_EXHIBITION_ID);
	let selectedId = $state<string | null>(null);
	let activeTab = $state<AppTab>('map');
	let isExhibitionMenuOpen = $state(false);
	let liveAlertMessage = $state<string | null>(null);
	let alertChannelStatus = $state<AlertChannelStatus>('connecting');

	let clearLiveAlertTimer: ReturnType<typeof setTimeout> | null = null;

	const exhibitionIds = EXHIBITIONS.map((exhibition) => exhibition.id);
	const selectedExhibition = $derived(
		EXHIBITIONS.find((exhibition) => exhibition.id === selectedExhibitionId) ?? EXHIBITIONS[0]
	);
	const items = $derived(itemsByExhibition[selectedExhibitionId] ?? selectedExhibition.items);
	const selectedItem = $derived(items.find((item) => item.id === selectedId) ?? null);
	const bookmarkedItems = $derived(items.filter((item) => item.isBookmarked));
	const completedItems = $derived(items.filter((item) => item.isCompleted));
	const savedItems = $derived(items.filter((item) => item.isBookmarked || item.isCompleted));

	const nextHotItem = $derived.by(() => {
		return [...items]
			.filter((item) => !item.isCompleted && item.time !== 'Always')
			.sort((left, right) => parseTimeValue(left.time) - parseTimeValue(right.time))[0];
	});

	const fallbackAlertMessage = $derived.by(() => {
		if (!nextHotItem) {
			return null;
		}

		return `${selectedExhibition.name} · ${nextHotItem.time} ${nextHotItem.title} 임박 → ${nextHotItem.location}`;
	});

	const alertMessage = $derived(liveAlertMessage || fallbackAlertMessage);
	const alertMode = $derived(liveAlertMessage ? 'live' : 'fallback');
	const doneCount = $derived(completedItems.length);
	const bookmarkedCount = $derived(bookmarkedItems.length);
	const savedCount = $derived(savedItems.length);

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

	function setActiveTab(tab: AppTab) {
		activeTab = tab;
	}

	function toggleExhibitionMenu() {
		if (EXHIBITIONS.length < 2) return;
		isExhibitionMenuOpen = !isExhibitionMenuOpen;
	}

	function closeExhibitionMenu() {
		isExhibitionMenuOpen = false;
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
	<meta
		name="description"
		content={`${selectedExhibition.name}의 이벤트 파밍 동선을 홈, 지도, 리스트, 저장됨 탭으로 빠르게 전환하는 모바일 우선 웹앱`}
	/>
</svelte:head>

<div class="safe-top safe-bottom min-h-dvh bg-navy-deep">
	<div class="safe-right fixed right-4 top-4 z-30 sm:right-5 sm:top-5">
		<button
			type="button"
			class="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-gold/25 bg-navy-surface/95 text-foreground shadow-[0_14px_30px_rgba(0,0,0,0.35)] backdrop-blur transition hover:border-gold/40 hover:text-gold"
			aria-controls="exhibition-menu-drawer"
			aria-expanded={isExhibitionMenuOpen}
			aria-haspopup="dialog"
			aria-label="박람회 메뉴 열기"
			onclick={toggleExhibitionMenu}
		>
			<Menu size={18} />
		</button>
	</div>

	<div class="bottom-nav-offset mx-auto flex w-full max-w-lg flex-col gap-4 px-4 pt-5 sm:px-5">
		{#if alertMessage}
			<AlertBanner message={alertMessage} mode={alertMode} />
		{/if}

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

				<div class="flex flex-col items-end gap-2">
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
		</section>

		{#if activeTab === 'home'}
			<section class="rounded-[30px] border border-border bg-black/30 p-4 sm:p-5">
				<div class="grid gap-3 sm:grid-cols-3">
					<div class="rounded-2xl border border-border bg-navy-surface p-4">
						<p class="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Current Expo</p>
						<p class="mt-2 text-base font-semibold text-foreground">{selectedExhibition.name}</p>
						<p class="mt-1 text-xs text-muted-foreground">{selectedExhibition.venue}</p>
						<p class="mt-2 text-[11px] text-muted-foreground">전환은 우측 상단 햄버거 메뉴에서 합니다</p>
					</div>
					<div class="rounded-2xl border border-border bg-navy-surface p-4">
						<p class="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Saved</p>
						<p class="mt-2 text-2xl font-heading font-semibold text-gold">{savedCount}</p>
						<p class="mt-1 text-xs text-muted-foreground">관심/완료로 저장한 부스</p>
					</div>
					<div class="rounded-2xl border border-border bg-navy-surface p-4">
						<p class="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Farmed</p>
						<p class="mt-2 text-2xl font-heading font-semibold text-mint">{doneCount}</p>
						<p class="mt-1 text-xs text-muted-foreground">완료 처리한 부스</p>
					</div>
				</div>
			</section>

			<section class="rounded-[30px] border border-border bg-black/30 p-4 sm:p-5">
				<div class="flex items-start justify-between gap-4">
					<div>
						<p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
							Quick Focus
						</p>
						<h2 class="mt-1 font-heading text-2xl font-semibold text-foreground">다음 타깃</h2>
					</div>
					<div class="rounded-full border border-border bg-navy-surface px-3 py-1 text-xs text-muted-foreground">
						북마크 {bookmarkedCount}
					</div>
				</div>

				<div class="mt-4 rounded-[26px] border border-gold/20 bg-gold/10 p-4">
					{#if nextHotItem}
						<p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">Next hot drop</p>
						<h3 class="mt-2 font-heading text-xl font-semibold text-foreground">{nextHotItem.title}</h3>
						<p class="mt-2 text-sm text-foreground">
							{nextHotItem.time} · {nextHotItem.location}
						</p>
						<p class="mt-3 text-sm leading-6 text-muted-foreground">{nextHotItem.mission}</p>
						<div class="mt-4 flex flex-wrap gap-2">
							<button
								type="button"
								class="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-black"
								onclick={() => {
									setActiveTab('map');
									selectItem(nextHotItem.id);
								}}
							>
								지도에서 보기
							</button>
							<button
								type="button"
								class="rounded-full border border-border bg-navy-surface px-4 py-2 text-sm font-semibold text-foreground"
								onclick={() => {
									setActiveTab('list');
									selectItem(nextHotItem.id);
								}}
							>
								리스트에서 보기
							</button>
						</div>
					{:else}
						<p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">Always-on booths</p>
						<h3 class="mt-2 font-heading text-xl font-semibold text-foreground">임박 이벤트가 없습니다</h3>
						<p class="mt-3 text-sm leading-6 text-muted-foreground">
							지금은 상시 참여 가능한 부스 위주로 움직이면 됩니다. 저장됨 탭에서 관심 부스를 다시 확인하세요.
						</p>
					{/if}
				</div>

				<div class="mt-4 grid gap-3 sm:grid-cols-3">
					<button
						type="button"
						class="rounded-2xl border border-border bg-navy-surface px-4 py-4 text-left"
						onclick={() => setActiveTab('map')}
					>
						<p class="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Map</p>
						<p class="mt-2 text-base font-semibold text-foreground">부스 지도로 이동</p>
					</button>
					<button
						type="button"
						class="rounded-2xl border border-border bg-navy-surface px-4 py-4 text-left"
						onclick={() => setActiveTab('list')}
					>
						<p class="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">List</p>
						<p class="mt-2 text-base font-semibold text-foreground">전체 이벤트 훑기</p>
					</button>
					<button
						type="button"
						class="rounded-2xl border border-border bg-navy-surface px-4 py-4 text-left"
						onclick={() => setActiveTab('saved')}
					>
						<p class="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Saved</p>
						<p class="mt-2 text-base font-semibold text-foreground">관심/완료 부스 보기</p>
					</button>
				</div>
			</section>
		{:else if activeTab === 'map'}
			<ExhibitionMap exhibition={selectedExhibition} items={items} onPinClick={selectItem} />
		{:else if activeTab === 'list'}
			<LootFeed
				items={items}
				onToggleComplete={toggleComplete}
				onSelectItem={selectItem}
				eyebrow="All Booths"
				title="전체 이벤트 리스트"
				summaryLabel="Farmed"
			/>
		{:else}
			<LootFeed
				items={savedItems}
				onToggleComplete={toggleComplete}
				onSelectItem={selectItem}
				eyebrow="Saved Booths"
				title="저장된 부스"
				summaryLabel="Tracked"
				emptyTitle="저장된 부스가 없습니다"
				emptyBody="관심 등록이나 완료 처리를 하면 이 탭에서 다시 빠르게 모아볼 수 있습니다."
			/>
		{/if}
	</div>

	<nav class="bottom-nav-shell safe-left safe-right fixed bottom-0 left-0 right-0 z-40">
		<div class="mx-auto w-full max-w-lg px-4 sm:px-5">
			<div class="grid grid-cols-3 gap-2 rounded-[28px] border border-border bg-navy-surface/95 p-2 shadow-[0_-12px_40px_rgba(0,0,0,0.35)] backdrop-blur">
				{#each tabs as tab}
					<button
						type="button"
						class={[
							'flex min-h-16 flex-col items-center justify-center gap-1 rounded-[22px] px-2 py-2 text-[11px] font-semibold transition',
							activeTab === tab.id
								? 'bg-gold text-black'
								: 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
						]}
						aria-pressed={activeTab === tab.id}
						onclick={() => setActiveTab(tab.id)}
					>
						<tab.icon size={18} />
						<span>{tab.label}</span>
					</button>
				{/each}
			</div>
		</div>
	</nav>
</div>

{#if isExhibitionMenuOpen}
	<div class="fixed inset-0 z-50">
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
						메인 홈에서는 숨기고 여기서만 박람회를 전환합니다.
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
