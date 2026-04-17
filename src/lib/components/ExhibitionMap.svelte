<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount, untrack } from 'svelte';
	import type {
		ArrowOverlay,
		Exhibition,
		FloorMap,
		LootItem,
		StairsOverlay
	} from '$lib/data/lootItems';

	type ActiveFloor = Exhibition['defaultFloorId'] | 'all';

	type Props = {
		exhibition: Exhibition;
		items: LootItem[];
		onPinClick: (id: string) => void;
		activeFloorOverride?: string | null;
		selectedItemId?: string | null;
	};

	type ViewBoxMetrics = {
		x: number;
		y: number;
		width: number;
		height: number;
	};

	type PointerSnapshot = {
		x: number;
		y: number;
	};

	type DragGesture = {
		pointerId: number;
		startX: number;
		startY: number;
		centerX: number;
		centerY: number;
		hasExceededThreshold: boolean;
	};

	type PinchGesture = {
		distance: number;
		scale: number;
		centerX: number;
		centerY: number;
		midpointX: number;
		midpointY: number;
	};

	type FloorViewportState = {
		scale: number;
		centerX: number;
		centerY: number;
	};

	type GestureIntent = 'drag' | 'pinch';

	const MIN_SINGLE_FLOOR_SCALE = 1;
	const MAX_SINGLE_FLOOR_SCALE = 4.6;
	const BUTTON_ZOOM_STEP = 0.38;
	const WHEEL_ZOOM_STEP = 0.24;
	const DRAG_INTENT_THRESHOLD = 8;
	const PINCH_INTENT_SCALE_THRESHOLD = 0.02;

	let {
		exhibition,
		items,
		onPinClick,
		activeFloorOverride = null,
		selectedItemId = null
	}: Props = $props();

	let selectedFloor = $state<ActiveFloor | null>(null);
	let hoveredItemId = $state<string | null>(null);
	let isCoarsePointer = $state(false);
	let zoomScale = $state(1);
	let viewCenterX = $state(0);
	let viewCenterY = $state(0);
	let lastFocusedSelectionKey = $state('');
	let floorViewportStates = $state<Record<string, FloorViewportState>>({});

	let zoomViewport = $state<HTMLDivElement | null>(null);
	let activePointers = new Map<number, PointerSnapshot>();
	let dragGesture: DragGesture | null = null;
	let pinchGesture: PinchGesture | null = null;
	let gestureIntent = $state<GestureIntent | null>(null);

	const activeFloor = $derived(selectedFloor ?? exhibition.defaultFloorId);
	const selectedItem = $derived(items.find((item) => item.id === selectedItemId) ?? null);
	const hoveredItem = $derived(items.find((item) => item.id === hoveredItemId) ?? null);
	const visibleFloors = $derived(
		activeFloor === 'all'
			? exhibition.floors
			: exhibition.floors.filter((floor) => floor.id === activeFloor)
	);
	const focusItem = $derived(
		isCoarsePointer ? selectedItem ?? hoveredItem : hoveredItem ?? selectedItem
	);

	onMount(() => {
		if (!browser) return;

		const pointerQuery = window.matchMedia('(pointer: coarse)');
		const updatePointerMode = () => {
			isCoarsePointer = pointerQuery.matches;
		};

		updatePointerMode();
		pointerQuery.addEventListener('change', updatePointerMode);

		return () => {
			pointerQuery.removeEventListener('change', updatePointerMode);
		};
	});

	$effect(() => {
		exhibition.id;
		selectedFloor = null;
		hoveredItemId = null;
		lastFocusedSelectionKey = '';
		floorViewportStates = {};
		resetViewport(exhibition.defaultFloorId);
	});

	$effect(() => {
		if (activeFloorOverride) {
			selectedFloor = activeFloorOverride as ActiveFloor;
		}
	});

	$effect(() => {
		activeFloor;
		hoveredItemId = null;
		resetViewport(activeFloor);
		clearGestures();
	});

	$effect(() => {
		const item = selectedItem;
		const nextFloor = activeFloor;

		if (!item || nextFloor === 'all' || item.floorId !== nextFloor) {
			return;
		}

		const nextKey = `${item.id}:${nextFloor}`;
		if (lastFocusedSelectionKey === nextKey) {
			return;
		}

		lastFocusedSelectionKey = nextKey;
		focusViewportOnItem(item, true);
	});

	function parseViewBox(viewBox: string): ViewBoxMetrics {
		const [x = 0, y = 0, width = 0, height = 0] = viewBox.split(/\s+/).map(Number);
		return { x, y, width, height };
	}

	function clamp(value: number, min: number, max: number) {
		return Math.min(Math.max(value, min), max);
	}

	function getFloorItems(floorId: string) {
		return items.filter((item) => item.floorId === floorId);
	}

	function getFloorMetrics(floor: FloorMap) {
		return parseViewBox(floor.viewBox);
	}

	function getActiveFloorData() {
		if (activeFloor === 'all') return null;
		return exhibition.floors.find((floor) => floor.id === activeFloor) ?? null;
	}

	function getFloorOutlineHeight(floor: FloorMap) {
		return Math.max(getFloorMetrics(floor).height - 40, 0);
	}

	function getDefaultFloorScale(floor: FloorMap) {
		const metrics = getFloorMetrics(floor);
		return metrics.height <= 340 ? 1.7 : 1.45;
	}

	function getDefaultViewportCenter(floor: FloorMap) {
		const metrics = getFloorMetrics(floor);
		return {
			x: metrics.x + metrics.width / 2,
			y: metrics.y + metrics.height / 2
		};
	}

	function getViewportMetrics(floor: FloorMap, scale = zoomScale) {
		const metrics = getFloorMetrics(floor);
		return {
			width: metrics.width / scale,
			height: metrics.height / scale
		};
	}

	function getViewportWidth(floor: FloorMap) {
		return getViewportMetrics(floor).width;
	}

	function getViewportHeight(floor: FloorMap) {
		return getViewportMetrics(floor).height;
	}

	function resetViewport(nextFloor: ActiveFloor) {
		if (nextFloor === 'all') {
			zoomScale = 1;
			viewCenterX = 0;
			viewCenterY = 0;
			return;
		}

		const floor = exhibition.floors.find((candidate) => candidate.id === nextFloor);
		if (!floor) return;

		const savedViewport = untrack(() => floorViewportStates[floor.id]);
		if (savedViewport) {
			zoomScale = savedViewport.scale;
			viewCenterX = savedViewport.centerX;
			viewCenterY = savedViewport.centerY;
			return;
		}

		const defaultCenter = getDefaultViewportCenter(floor);
		const defaultScale = getDefaultFloorScale(floor);
		const previousViewportStates = untrack(() => floorViewportStates);
		zoomScale = defaultScale;
		viewCenterX = defaultCenter.x;
		viewCenterY = defaultCenter.y;
		floorViewportStates = {
			...previousViewportStates,
			[floor.id]: {
				scale: defaultScale,
				centerX: defaultCenter.x,
				centerY: defaultCenter.y
			}
		};
	}

	function clampViewportCenter(centerX: number, centerY: number, floor: FloorMap, scale = zoomScale) {
		const metrics = getFloorMetrics(floor);
		const { width: viewportWidth, height: viewportHeight } = getViewportMetrics(floor, scale);
		const halfWidth = viewportWidth / 2;
		const halfHeight = viewportHeight / 2;

		return {
			x: clamp(centerX, metrics.x + halfWidth, metrics.x + metrics.width - halfWidth),
			y: clamp(centerY, metrics.y + halfHeight, metrics.y + metrics.height - halfHeight)
		};
	}

	function setViewportCenter(nextX: number, nextY: number, floor: FloorMap, scale = zoomScale) {
		const nextCenter = clampViewportCenter(nextX, nextY, floor, scale);
		const previousViewportStates = untrack(() => floorViewportStates);
		viewCenterX = nextCenter.x;
		viewCenterY = nextCenter.y;
		floorViewportStates = {
			...previousViewportStates,
			[floor.id]: {
				scale,
				centerX: nextCenter.x,
				centerY: nextCenter.y
			}
		};
	}

	function getRenderedViewBox(floor: FloorMap) {
		if (activeFloor === 'all') {
			return floor.viewBox;
		}

		const metrics = getFloorMetrics(floor);
		const { width: viewportWidth, height: viewportHeight } = getViewportMetrics(floor);
		const nextCenter = clampViewportCenter(viewCenterX, viewCenterY, floor);

		return `${nextCenter.x - viewportWidth / 2} ${nextCenter.y - viewportHeight / 2} ${viewportWidth} ${viewportHeight}`;
	}

	function getBoothRect(item: LootItem) {
		return {
			x: item.renderX ?? item.mapX,
			y: item.renderY ?? item.mapY,
			width: item.renderWidth ?? item.boxWidth,
			height: item.renderHeight ?? item.boxHeight
		};
	}

	function getLabelLines(item: LootItem) {
		if (item.mapLabelLines?.length) {
			return item.mapLabelLines;
		}

		const mapLabel =
			item.mapLabel ??
			(item.title.trim().length <= 6 ? item.title : item.englishTitle?.trim() || item.title);
		const normalized = mapLabel.trim();

		if (normalized.includes(' ')) {
			return normalized.split(/\s+/).slice(0, 2);
		}

		return [normalized];
	}

	function getLabelFontSize(item: LootItem) {
		return item.mapLabelFontSize ?? item.fontSize ?? 10;
	}

	function getBoothVisual(item: LootItem) {
		if (item.isCompleted) {
			return { fill: '#14372d', stroke: '#84f2c0', text: '#e6fff4', badge: '#84f2c0' };
		}

		if (item.firstComeEvent.trim().length > 0) {
			return { fill: '#4b1624', stroke: '#f8a8b9', text: '#fff0f3', badge: '#f8a8b9' };
		}

		if (item.isBookmarked) {
			return { fill: '#4f3912', stroke: '#ffd77c', text: '#fff3c5', badge: '#ffd77c' };
		}

		return { fill: '#eef8ec', stroke: '#65c572', text: '#255a2d', badge: '#65c572' };
	}

	function getFloorBadge(item: LootItem) {
		return item.location || item.floorId;
	}

	function getArrowPath(overlay: ArrowOverlay) {
		switch (overlay.direction) {
			case 'up':
				return `M${overlay.x},${overlay.y + 10} L${overlay.x},${overlay.y} L${overlay.x - 5},${overlay.y + 5} M${overlay.x},${overlay.y} L${overlay.x + 5},${overlay.y + 5}`;
			case 'down':
				return `M${overlay.x},${overlay.y} L${overlay.x},${overlay.y + 10} L${overlay.x - 5},${overlay.y + 5} M${overlay.x},${overlay.y + 10} L${overlay.x + 5},${overlay.y + 5}`;
			case 'left':
				return `M${overlay.x + 10},${overlay.y} L${overlay.x},${overlay.y} L${overlay.x + 5},${overlay.y - 5} M${overlay.x},${overlay.y} L${overlay.x + 5},${overlay.y + 5}`;
			case 'right':
				return `M${overlay.x},${overlay.y} L${overlay.x + 10},${overlay.y} L${overlay.x + 5},${overlay.y - 5} M${overlay.x + 10},${overlay.y} L${overlay.x + 5},${overlay.y + 5}`;
		}
	}

	function getOverlayTextY(overlay: ArrowOverlay) {
		switch (overlay.direction) {
			case 'up':
				return overlay.y - 5;
			case 'down':
				return overlay.y + 20;
			default:
				return overlay.y - 8;
		}
	}

	function getOverlayTextX(overlay: ArrowOverlay) {
		return overlay.direction === 'up' || overlay.direction === 'down' ? overlay.x : overlay.x + 5;
	}

	function getStairsLines(overlay: StairsOverlay) {
		const steps = overlay.steps ?? 6;
		const stepHeight = overlay.height / steps;
		return Array.from({ length: steps }, (_, index) => overlay.y + stepHeight * (index + 1));
	}

	function focusViewportOnItem(item: LootItem, preserveZoom = false) {
		const floor = exhibition.floors.find((candidate) => candidate.id === item.floorId);
		if (!floor) return;

		const { x, y, width, height } = getBoothRect(item);
		const defaultScale = getDefaultFloorScale(floor);
		const nextScale = preserveZoom
			? Math.max(zoomScale, defaultScale)
			: defaultScale;

		applyZoomScale(nextScale, floor, x + width / 2, y + height / 2);
	}

	function getSinglePointer() {
		const [pointerEntry] = activePointers.entries();
		if (!pointerEntry) return null;
		const [pointerId, pointer] = pointerEntry;
		return { pointerId, pointer };
	}

	function getPointerDistance() {
		const pointers = Array.from(activePointers.values());
		if (pointers.length !== 2) return 0;
		const [first, second] = pointers;
		return Math.hypot(second.x - first.x, second.y - first.y);
	}

	function getPointerMidpoint() {
		const pointers = Array.from(activePointers.values());
		if (pointers.length !== 2) return null;
		const [first, second] = pointers;
		return {
			x: (first.x + second.x) / 2,
			y: (first.y + second.y) / 2
		};
	}

	function clearGestures() {
		activePointers = new Map<number, PointerSnapshot>();
		dragGesture = null;
		pinchGesture = null;
		gestureIntent = null;
	}

	function markGestureIntent(kind: GestureIntent) {
		gestureIntent = kind;
	}

	function applyZoomScale(
		nextScale: number,
		floor: FloorMap,
		centerX = viewCenterX,
		centerY = viewCenterY
	) {
		const clampedScale = clamp(nextScale, MIN_SINGLE_FLOOR_SCALE, MAX_SINGLE_FLOOR_SCALE);
		zoomScale = clampedScale;
		setViewportCenter(centerX, centerY, floor, clampedScale);
	}

	function handleZoomStep(delta: number) {
		const floor = getActiveFloorData();
		if (!floor) return;

		const nextScale = clamp(zoomScale + delta, MIN_SINGLE_FLOOR_SCALE, MAX_SINGLE_FLOOR_SCALE);
		if (nextScale === zoomScale) return;

		applyZoomScale(nextScale, floor);
	}

	function handleZoomReset() {
		const floor = getActiveFloorData();
		if (!floor) return;

		const defaultCenter = getDefaultViewportCenter(floor);
		applyZoomScale(getDefaultFloorScale(floor), floor, defaultCenter.x, defaultCenter.y);
	}

	function handleFloorSelect(nextFloor: ActiveFloor) {
		selectedFloor = nextFloor;
		hoveredItemId = null;
	}

	function handleViewportWheel(event: WheelEvent) {
		const floor = getActiveFloorData();
		if (!floor || !zoomViewport) return;

		event.preventDefault();

		const delta = event.deltaY < 0 ? WHEEL_ZOOM_STEP : -WHEEL_ZOOM_STEP;
		const nextScale = clamp(zoomScale + delta, MIN_SINGLE_FLOOR_SCALE, MAX_SINGLE_FLOOR_SCALE);

		if (nextScale === zoomScale) return;

		applyZoomScale(nextScale, floor);
	}

	function handleViewportPointerDown(event: PointerEvent) {
		const floor = getActiveFloorData();
		if (!floor || !zoomViewport) return;

		if (activePointers.size === 0) {
			gestureIntent = null;
		}

		zoomViewport.setPointerCapture(event.pointerId);
		activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

		if (activePointers.size === 1) {
			dragGesture = {
				pointerId: event.pointerId,
				startX: event.clientX,
				startY: event.clientY,
				centerX: viewCenterX,
				centerY: viewCenterY,
				hasExceededThreshold: false
			};
			pinchGesture = null;
			return;
		}

		if (activePointers.size === 2) {
			const midpoint = getPointerMidpoint();
			const distance = getPointerDistance();
			if (!midpoint || distance <= 0) return;

			pinchGesture = {
				distance,
				scale: zoomScale,
				centerX: viewCenterX,
				centerY: viewCenterY,
				midpointX: midpoint.x,
				midpointY: midpoint.y
			};
			dragGesture = null;
		}
	}

	function handleViewportPointerMove(event: PointerEvent) {
		const floor = getActiveFloorData();
		if (!floor || !zoomViewport || !activePointers.has(event.pointerId)) return;

		const previousPoint = activePointers.get(event.pointerId);
		activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

		const rect = zoomViewport.getBoundingClientRect();
		if (rect.width === 0 || rect.height === 0) return;

		if (activePointers.size === 2 && pinchGesture) {
			const nextDistance = getPointerDistance();
			const midpoint = getPointerMidpoint();
			if (!nextDistance || !midpoint) return;

			const nextScale = clamp(
				pinchGesture.scale * (nextDistance / pinchGesture.distance),
				MIN_SINGLE_FLOOR_SCALE,
				MAX_SINGLE_FLOOR_SCALE
			);
			const { width: viewportWidth, height: viewportHeight } = getViewportMetrics(floor, nextScale);
			const deltaX = midpoint.x - pinchGesture.midpointX;
			const deltaY = midpoint.y - pinchGesture.midpointY;

			applyZoomScale(
				nextScale,
				floor,
				pinchGesture.centerX - (deltaX / rect.width) * viewportWidth,
				pinchGesture.centerY - (deltaY / rect.height) * viewportHeight
			);

			if (
				Math.abs(nextScale - pinchGesture.scale) >= PINCH_INTENT_SCALE_THRESHOLD ||
				Math.abs(deltaX) >= DRAG_INTENT_THRESHOLD ||
				Math.abs(deltaY) >= DRAG_INTENT_THRESHOLD
			) {
				markGestureIntent('pinch');
			}
			return;
		}

		if (!dragGesture || !previousPoint || dragGesture.pointerId !== event.pointerId) {
			return;
		}

		const deltaX = event.clientX - dragGesture.startX;
		const deltaY = event.clientY - dragGesture.startY;
		const viewportWidth = getViewportWidth(floor);
		const viewportHeight = getViewportHeight(floor);

		setViewportCenter(
			dragGesture.centerX - (deltaX / rect.width) * viewportWidth,
			dragGesture.centerY - (deltaY / rect.height) * viewportHeight,
			floor
		);

		if (
			!dragGesture.hasExceededThreshold &&
			(Math.abs(deltaX) >= DRAG_INTENT_THRESHOLD || Math.abs(deltaY) >= DRAG_INTENT_THRESHOLD)
		) {
			dragGesture = {
				...dragGesture,
				hasExceededThreshold: true
			};
			markGestureIntent('drag');
		}
	}

	function handleViewportPointerUp(event: PointerEvent) {
		if (zoomViewport?.hasPointerCapture(event.pointerId)) {
			zoomViewport.releasePointerCapture(event.pointerId);
		}

		activePointers.delete(event.pointerId);

		if (activePointers.size === 0) {
			dragGesture = null;
			pinchGesture = null;
			return;
		}

		if (activePointers.size === 1) {
			const singlePointer = getSinglePointer();
			if (!singlePointer) return;

			dragGesture = {
				pointerId: singlePointer.pointerId,
				startX: singlePointer.pointer.x,
				startY: singlePointer.pointer.y,
				centerX: viewCenterX,
				centerY: viewCenterY,
				hasExceededThreshold: false
			};
			pinchGesture = null;
		}
	}
</script>

<section class="rounded-[32px] border border-border bg-navy-surface p-4 shadow-[0_24px_50px_rgba(0,0,0,0.35)]">
	<div class="mb-4 flex items-start justify-between gap-3">
		<div>
			<p class="text-[11px] font-semibold uppercase tracking-[0.26em] text-muted-foreground">
				{exhibition.mapTitle}
			</p>
			<h2 class="mt-1 font-heading text-2xl font-semibold text-foreground">층별 부스 보기</h2>
			<p class="mt-2 text-xs leading-5 text-muted-foreground">{exhibition.mapNote}</p>
		</div>

		<div class="rounded-full border border-border bg-navy-elevated px-3 py-1 text-xs text-muted-foreground">
			{items.length} booths
		</div>
	</div>

	<div class="sticky top-4 z-10 -mx-1 mb-4 flex gap-2 overflow-x-auto px-1 pb-1 pt-1">
		<button
			type="button"
			class={[
				'shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition',
				activeFloor === 'all'
					? 'border-gold/40 bg-gold text-black'
					: 'border-border bg-navy-elevated text-muted-foreground'
			]}
			onclick={() => handleFloorSelect('all')}
		>
			전체
		</button>

		{#each exhibition.floors as floor (floor.id)}
			<button
				type="button"
				class={[
					'shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition',
					activeFloor === floor.id
						? 'border-gold/40 bg-gold text-black'
						: 'border-border bg-navy-elevated text-muted-foreground'
				]}
				onclick={() => handleFloorSelect(floor.id)}
			>
				{floor.label}
			</button>
		{/each}
	</div>

	<div class="mb-4 min-h-[88px] rounded-[24px] border border-border bg-black/25 px-4 py-3">
		{#if focusItem}
			<p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-gold">
				{isCoarsePointer ? 'Selected Booth' : 'Focus Booth'}
			</p>
			<p class="mt-1 text-sm font-semibold text-foreground">{focusItem.title}</p>
			<div class="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
				<span>{getFloorBadge(focusItem)}</span>
				{#if focusItem.firstComeEvent}
					<span class="text-rose-200">{focusItem.firstComeEvent}</span>
				{/if}
				{#if focusItem.isCompleted}
					<span class="text-mint">완료</span>
				{:else if focusItem.isBookmarked}
					<span class="text-gold">즐겨찾기</span>
				{/if}
			</div>
			{#if isCoarsePointer}
				<p class="mt-2 text-xs leading-5 text-muted-foreground">
					부스를 다시 탭하면 상세 시트가 열립니다. 단일층에서는 핀치 확대, 드래그 이동, 확대 버튼을 함께 사용할 수 있습니다.
				</p>
			{/if}
		{:else}
			<p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
				{isCoarsePointer ? 'Selected Booth' : 'Hover Booth'}
			</p>
			<p class="mt-1 text-sm text-muted-foreground">
				{#if isCoarsePointer}
					부스를 탭하면 선택 요약이 이 영역에 표시됩니다.
				{:else}
					브랜드 박스에 커서를 올리면 층과 상태를 요약해 보여줍니다.
				{/if}
			</p>
		{/if}
	</div>

	<div class="flex flex-col gap-4">
		{#each visibleFloors as floor (floor.id)}
			{@const floorItems = getFloorItems(floor.id)}
			{@const floorMetrics = getFloorMetrics(floor)}
			{@const isInteractiveFloor = activeFloor === floor.id}
			{@const defaultFloorScale = getDefaultFloorScale(floor)}
			<div class="overflow-hidden rounded-[28px] border border-border bg-black/20 p-3">
				<div class="mb-3 flex items-center justify-between gap-3 px-1">
					<div>
						<h3 class="font-heading text-lg font-semibold text-foreground">{floor.label}</h3>
						{#if activeFloor !== 'all'}
							<p class="mt-1 text-[11px] text-muted-foreground">
								지도 영역 안에서는 한 손가락 드래그가 지도 이동을 소유합니다. 핀치와 확대 버튼으로 배율을 바꿀 수 있고, 페이지 스크롤은 지도 밖에서 계속됩니다.
							</p>
						{/if}
					</div>

					<div class="flex items-center gap-2">
						{#if isInteractiveFloor}
							<div
								class="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/35 p-1"
								aria-label={`${floor.label} 지도 확대/축소 컨트롤`}
							>
								<button
									type="button"
									class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-navy-elevated text-sm font-semibold text-foreground transition disabled:cursor-not-allowed disabled:opacity-35"
									aria-label={`${floor.label} 지도 축소`}
									disabled={zoomScale <= MIN_SINGLE_FLOOR_SCALE + 0.001}
									onclick={() => handleZoomStep(-BUTTON_ZOOM_STEP)}
								>
									-
								</button>
								<button
									type="button"
									class="inline-flex min-w-[52px] items-center justify-center rounded-full bg-navy-elevated px-3 py-2 text-[11px] font-semibold text-foreground transition disabled:cursor-not-allowed disabled:opacity-35"
									aria-label={`${floor.label} 지도 확대 리셋`}
									disabled={Math.abs(zoomScale - defaultFloorScale) < 0.001}
									onclick={handleZoomReset}
								>
									리셋
								</button>
								<button
									type="button"
									class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-navy-elevated text-sm font-semibold text-foreground transition disabled:cursor-not-allowed disabled:opacity-35"
									aria-label={`${floor.label} 지도 확대`}
									disabled={zoomScale >= MAX_SINGLE_FLOOR_SCALE - 0.001}
									onclick={() => handleZoomStep(BUTTON_ZOOM_STEP)}
								>
									+
								</button>
							</div>
						{/if}

						<span class="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
							{floorItems.length} booths
						</span>
					</div>
				</div>

				<div
					role="group"
					aria-label={`${floor.label} 지도 viewport`}
					class={[
						'overflow-hidden rounded-[24px] border border-white/6 bg-[#0b1320]',
						activeFloor !== 'all' && 'touch-none'
					]}
					style={`aspect-ratio: ${floorMetrics.width} / ${floorMetrics.height}; touch-action: ${activeFloor === floor.id ? 'none' : 'auto'};`}
					bind:this={zoomViewport}
					onwheel={activeFloor === floor.id ? handleViewportWheel : undefined}
					onpointerdown={activeFloor === floor.id ? handleViewportPointerDown : undefined}
					onpointermove={activeFloor === floor.id ? handleViewportPointerMove : undefined}
					onpointerup={activeFloor === floor.id ? handleViewportPointerUp : undefined}
					onpointercancel={activeFloor === floor.id ? handleViewportPointerUp : undefined}
				>
					<svg viewBox={getRenderedViewBox(floor)} class="h-full w-full p-2">
						<rect
							x="20"
							y="20"
							width={Math.max(floorMetrics.width - 40, 0)}
							height={getFloorOutlineHeight(floor)}
							fill="none"
							stroke="#4caf50"
							stroke-width="2"
						/>

						{#each floor.overlays as overlay, index (`${floor.id}-${overlay.kind}-${index}`)}
							{#if overlay.kind === 'eventZone'}
								<g pointer-events="none" opacity="0.78">
									<rect
										x={overlay.x}
										y={overlay.y}
										width={overlay.width}
										height={overlay.height}
										fill="#dceede"
										stroke="#84b68a"
										stroke-width="1"
										rx="6"
									/>
									<text
										x={overlay.x + overlay.width / 2}
										y={overlay.y + overlay.height / 2}
										text-anchor="middle"
										dominant-baseline="middle"
										fill="#406347"
										font-size={overlay.fontSize ?? 9}
										font-weight="600"
									>
										{overlay.label}
									</text>
								</g>
							{:else if overlay.kind === 'stairs'}
								<g pointer-events="none" opacity="0.7">
									<rect
										x={overlay.x}
										y={overlay.y}
										width={overlay.width}
										height={overlay.height}
										fill="#f5f5f5"
										stroke="#8db794"
										stroke-width="1"
									/>
									{#each getStairsLines(overlay) as lineY}
										<line
											x1={overlay.x}
											y1={lineY}
											x2={overlay.x + overlay.width}
											y2={lineY}
											stroke="#8db794"
											stroke-width="0.5"
										/>
									{/each}
								</g>
							{:else if overlay.kind === 'arrow'}
								<g pointer-events="none" opacity="0.86">
									<path
										d={getArrowPath(overlay)}
										stroke={overlay.color ?? '#c62828'}
										stroke-width="2"
										fill="none"
									/>
									<text
										x={getOverlayTextX(overlay)}
										y={getOverlayTextY(overlay)}
										text-anchor="middle"
										fill={overlay.color ?? '#c62828'}
										font-size="10"
										font-weight="700"
									>
										{overlay.label}
									</text>
								</g>
							{:else}
								<rect
									x={overlay.x}
									y={overlay.y}
									width={overlay.width}
									height={overlay.height}
									fill={overlay.fill}
									opacity="0.5"
									pointer-events="none"
								/>
							{/if}
						{/each}

						{#each floorItems as item (item.id)}
							{@const visual = getBoothVisual(item)}
							{@const boothRect = getBoothRect(item)}
							{@const labelLines = getLabelLines(item)}
							{@const isSelected = item.id === selectedItemId}
							<g
								role="button"
								tabindex="0"
								class="cursor-pointer"
								aria-label={`${item.title} 상세 보기 - ${item.floorId}`}
								onmouseenter={() => {
									if (!isCoarsePointer) {
										hoveredItemId = item.id;
									}
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
								onclick={() => {
									if (gestureIntent !== null) {
										gestureIntent = null;
										return;
									}
									onPinClick(item.id);
								}}
								onkeydown={(event) => {
									if (event.key === 'Enter' || event.key === ' ') {
										event.preventDefault();
										onPinClick(item.id);
									}
								}}
							>
								<title>{item.title}</title>
								{#if isSelected}
									<rect
										x={boothRect.x - 6}
										y={boothRect.y - 6}
										width={boothRect.width + 12}
										height={boothRect.height + 12}
										rx="14"
										fill="none"
										stroke="#f5c35c"
										stroke-width="3"
										stroke-dasharray="8 4"
									/>
								{/if}
								<rect
									x={boothRect.x}
									y={boothRect.y}
									width={boothRect.width}
									height={boothRect.height}
									rx="10"
									fill={visual.fill}
									stroke={isSelected ? '#f5c35c' : visual.stroke}
									stroke-width={isSelected ? '2.2' : '1.5'}
								/>
								<text
									x={boothRect.x + boothRect.width / 2}
									y={boothRect.y + boothRect.height / 2 - (labelLines.length > 1 ? getLabelFontSize(item) * 0.42 : 0)}
									text-anchor="middle"
									dominant-baseline="middle"
									fill={visual.text}
									font-size={getLabelFontSize(item)}
									font-weight="700"
								>
									{#each labelLines as line, lineIndex (line)}
										<tspan
											x={boothRect.x + boothRect.width / 2}
											dy={lineIndex === 0 ? 0 : getLabelFontSize(item) * 1.05}
										>
											{line}
										</tspan>
									{/each}
								</text>

								{#if item.isCompleted}
									<circle
										cx={boothRect.x + boothRect.width - 8}
										cy={boothRect.y + 8}
										r="8"
										fill={visual.badge}
										stroke="#0f1724"
										stroke-width="1"
									/>
									<text
										x={boothRect.x + boothRect.width - 8}
										y={boothRect.y + 8}
										text-anchor="middle"
										dominant-baseline="middle"
										fill="#0f1724"
										font-size="9"
										font-weight="700"
									>
										✓
									</text>
								{:else if item.isBookmarked}
									<circle
										cx={boothRect.x + boothRect.width - 8}
										cy={boothRect.y + 8}
										r="8"
										fill={visual.badge}
										stroke="#0f1724"
										stroke-width="1"
									/>
									<text
										x={boothRect.x + boothRect.width - 8}
										y={boothRect.y + 8}
										text-anchor="middle"
										dominant-baseline="middle"
										fill="#0f1724"
										font-size="9"
										font-weight="700"
									>
										★
									</text>
								{:else if item.firstComeEvent.trim().length > 0}
									<circle
										cx={boothRect.x + boothRect.width - 8}
										cy={boothRect.y + 8}
										r="8"
										fill={visual.badge}
										stroke="#0f1724"
										stroke-width="1"
									/>
									<text
										x={boothRect.x + boothRect.width - 8}
										y={boothRect.y + 8}
										text-anchor="middle"
										dominant-baseline="middle"
										fill="#0f1724"
										font-size="9"
										font-weight="700"
									>
										!
									</text>
								{/if}
							</g>
						{/each}
					</svg>
				</div>
			</div>
		{/each}
	</div>
</section>
