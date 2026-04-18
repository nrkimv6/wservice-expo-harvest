<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount, untrack } from 'svelte';
	import type {
		ArrowOverlay,
		EventZoneOverlay,
		Exhibition,
		MapSection,
		MapSectionId,
		LootItem,
		StairsOverlay
	} from '$lib/data/lootItems';
	import { getPhysicalFloorLabel } from '$lib/data/lootItems';

	type ActiveMapSection = Exhibition['defaultMapSectionId'] | 'all';

	type Props = {
		exhibition: Exhibition;
		items: LootItem[];
		onPinClick: (id: string, options?: { preserveMapSectionOverride?: boolean }) => void;
		activeMapSectionOverride?: MapSectionId | null;
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

	type OverviewSectionPlacement = {
		sectionId: MapSectionId;
		offsetX: number;
		offsetY: number;
		width: number;
		height: number;
		titleWidth: number;
	};

	type OverviewMapMetrics = {
		viewBox: ViewBoxMetrics;
		width: number;
		height: number;
		placements: Record<MapSectionId, OverviewSectionPlacement>;
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

	type MapSectionViewportState = {
		scale: number;
		centerX: number;
		centerY: number;
	};

	type ViewportTarget = {
		key: string;
		metrics: ViewBoxMetrics;
		defaultScale: number;
		defaultCenter: {
			x: number;
			y: number;
		};
	};

	type BoothRect = {
		x: number;
		y: number;
		width: number;
		height: number;
	};

	type BoothVisual = {
		fill: string;
		stroke: string;
		text: string;
		badge: string;
	};

	type BoothBadgeSymbol = '✓' | '★' | '!';

	type BoothRenderModel = {
		ariaLabel: string;
		badgeSymbol: BoothBadgeSymbol | null;
		fontSize: number;
		isSelected: boolean;
		labelLines: string[];
		lineGap: number;
		rect: BoothRect;
		textOffset: number;
		visual: BoothVisual;
	};

	type OverlayTextModel = {
		centerX: number;
		centerY: number;
		fontSize: number;
		labelLines: string[];
		lineGap: number;
		textOffset: number;
	};

	type GestureIntent = 'drag' | 'pinch';

	const MIN_SINGLE_FLOOR_SCALE = 1;
	const MAX_SINGLE_FLOOR_SCALE = 4.6;
	const BUTTON_ZOOM_STEP = 0.38;
	const WHEEL_ZOOM_STEP = 0.24;
	const DRAG_INTENT_THRESHOLD = 8;
	const PINCH_INTENT_SCALE_THRESHOLD = 0.02;
	const OVERVIEW_VIEWPORT_KEY = '__overview__';
	const OVERVIEW_OUTER_PADDING = 24;
	const OVERVIEW_SECTION_GAP = 28;
	const OVERVIEW_SECTION_TITLE_HEIGHT = 28;
	const DEFAULT_MAP_SECTION_SCALE = 1;
	const EVENT_ZONE_FILL = '#dceede';
	const EVENT_ZONE_STROKE = '#84b68a';
	const EVENT_ZONE_TEXT = '#406347';
	const EVENT_ZONE_RADIUS = 2;
	const EVENT_ZONE_STROKE_WIDTH = 1;

	let {
		exhibition,
		items,
		onPinClick,
		activeMapSectionOverride = null,
		selectedItemId = null
	}: Props = $props();

	let selectedMapSection = $state<ActiveMapSection | null>(null);
	let hoveredItemId = $state<string | null>(null);
	let isCoarsePointer = $state(false);
	let zoomScale = $state(1);
	let viewCenterX = $state(0);
	let viewCenterY = $state(0);
	let lastFocusedSelectionKey = $state('');
	let mapSectionViewportStates = $state<Record<string, MapSectionViewportState>>({});

	let zoomViewport = $state<HTMLDivElement | null>(null);
	let activePointers = new Map<number, PointerSnapshot>();
	let dragGesture: DragGesture | null = null;
	let pinchGesture: PinchGesture | null = null;
	let gestureIntent = $state<GestureIntent | null>(null);

	const activeMapSection = $derived(selectedMapSection ?? exhibition.defaultMapSectionId);
	const selectedItem = $derived(items.find((item) => item.id === selectedItemId) ?? null);
	const hoveredItem = $derived(items.find((item) => item.id === hoveredItemId) ?? null);
	const visibleMapSections = $derived(
		activeMapSection === 'all'
			? exhibition.mapSections
			: exhibition.mapSections.filter((section) => section.id === activeMapSection)
	);
	const focusItem = $derived.by(() => {
		const candidate = isCoarsePointer ? selectedItem ?? hoveredItem : hoveredItem ?? selectedItem;
		if (!candidate) return null;
		if (activeMapSection !== 'all' && candidate.mapSectionId !== activeMapSection) {
			return null;
		}
		return candidate;
	});
	const activeMapSectionItems = $derived(
		activeMapSection === 'all'
			? items
			: items.filter((item) => item.mapSectionId === activeMapSection)
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
		selectedMapSection = null;
		hoveredItemId = null;
		lastFocusedSelectionKey = '';
		mapSectionViewportStates = {};
		resetViewport(exhibition.defaultMapSectionId);
	});

	$effect(() => {
		if (activeMapSectionOverride) {
			selectedMapSection = activeMapSectionOverride as ActiveMapSection;
		}
	});

	$effect(() => {
		activeMapSection;
		hoveredItemId = null;
		resetViewport(activeMapSection);
		clearGestures();
	});

	$effect(() => {
		const item = selectedItem;
		const nextSection = activeMapSection;

		if (!item) {
			return;
		}

		if (nextSection === 'all') {
			const nextKey = `${item.id}:all`;
			if (lastFocusedSelectionKey === nextKey) {
				return;
			}

			lastFocusedSelectionKey = nextKey;
			focusOverviewViewportOnItem(item, true);
			return;
		}

		if (item.mapSectionId !== nextSection) {
			lastFocusedSelectionKey = '';
			resetViewport(nextSection);
			return;
		}

		const nextKey = `${item.id}:${nextSection}`;
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

	function getSectionItems(mapSectionId: string) {
		return items.filter((item) => item.mapSectionId === mapSectionId);
	}

	function getSourceMapSectionMetrics(section: MapSection) {
		return parseViewBox(section.viewBox);
	}

	function getDisplayMapSectionMetrics(section: MapSection) {
		return parseViewBox(section.displayViewBox ?? section.viewBox);
	}

	function getOverviewMapMetrics(): OverviewMapMetrics {
		let currentY = OVERVIEW_OUTER_PADDING;
		let maxWidth = 0;
		const placements = {} as Record<MapSectionId, OverviewSectionPlacement>;

		for (const section of exhibition.mapSections) {
			const metrics = getSourceMapSectionMetrics(section);
			placements[section.id] = {
				sectionId: section.id,
				offsetX: OVERVIEW_OUTER_PADDING - metrics.x,
				offsetY: currentY + OVERVIEW_SECTION_TITLE_HEIGHT - metrics.y,
				width: metrics.width,
				height: metrics.height,
				titleWidth: Math.min(Math.max(metrics.width, 156), 320)
			};
			currentY += OVERVIEW_SECTION_TITLE_HEIGHT + metrics.height + OVERVIEW_SECTION_GAP;
			maxWidth = Math.max(maxWidth, metrics.width);
		}

		const width = maxWidth + OVERVIEW_OUTER_PADDING * 2;
		const height = currentY - OVERVIEW_SECTION_GAP + OVERVIEW_OUTER_PADDING;

		return {
			viewBox: {
				x: 0,
				y: 0,
				width,
				height
			},
			width,
			height,
			placements
		};
	}

	function getOverviewPlacement(sectionId: MapSectionId) {
		return getOverviewMapMetrics().placements[sectionId];
	}

	function getActiveMapSectionData() {
		if (activeMapSection === 'all') return null;
		return exhibition.mapSections.find((section) => section.id === activeMapSection) ?? null;
	}

	function getDefaultOverviewScale() {
		return 1;
	}

	function getDefaultMapSectionScale(section: MapSection) {
		return section.defaultScale ?? DEFAULT_MAP_SECTION_SCALE;
	}

	function getDefaultViewportCenter(metrics: ViewBoxMetrics) {
		return {
			x: metrics.x + metrics.width / 2,
			y: metrics.y + metrics.height / 2
		};
	}

	function createSectionViewportTarget(section: MapSection): ViewportTarget {
		const metrics = getDisplayMapSectionMetrics(section);
		return {
			key: section.id,
			metrics,
			defaultScale: getDefaultMapSectionScale(section),
			defaultCenter: getDefaultViewportCenter(metrics)
		};
	}

	function getOverviewViewportTarget(): ViewportTarget {
		const metrics = getOverviewMapMetrics().viewBox;
		return {
			key: OVERVIEW_VIEWPORT_KEY,
			metrics,
			defaultScale: getDefaultOverviewScale(),
			defaultCenter: getDefaultViewportCenter(metrics)
		};
	}

	function getActiveViewportTarget(): ViewportTarget | null {
		if (activeMapSection === 'all') {
			return getOverviewViewportTarget();
		}

		const section = getActiveMapSectionData();
		if (!section) return null;
		return createSectionViewportTarget(section);
	}

	function getViewportMetrics(target: ViewportTarget, scale = zoomScale) {
		const metrics = target.metrics;
		return {
			width: metrics.width / scale,
			height: metrics.height / scale
		};
	}

	function getViewportWidth(target: ViewportTarget) {
		return getViewportMetrics(target).width;
	}

	function getViewportHeight(target: ViewportTarget) {
		return getViewportMetrics(target).height;
	}

	function resetViewport(nextSection: ActiveMapSection) {
		const target =
			nextSection === 'all'
				? getOverviewViewportTarget()
				: (() => {
						const section = exhibition.mapSections.find((candidate) => candidate.id === nextSection);
						return section ? createSectionViewportTarget(section) : null;
					})();
		if (!target) return;

		const savedViewport = untrack(() => mapSectionViewportStates[target.key]);
		if (savedViewport) {
			zoomScale = savedViewport.scale;
			viewCenterX = savedViewport.centerX;
			viewCenterY = savedViewport.centerY;
			return;
		}

		const previousViewportStates = untrack(() => mapSectionViewportStates);
		zoomScale = target.defaultScale;
		viewCenterX = target.defaultCenter.x;
		viewCenterY = target.defaultCenter.y;
		mapSectionViewportStates = {
			...previousViewportStates,
			[target.key]: {
				scale: target.defaultScale,
				centerX: target.defaultCenter.x,
				centerY: target.defaultCenter.y
			}
		};
	}

	function clampViewportCenter(centerX: number, centerY: number, target: ViewportTarget, scale = zoomScale) {
		const metrics = target.metrics;
		const { width: viewportWidth, height: viewportHeight } = getViewportMetrics(target, scale);
		const halfWidth = viewportWidth / 2;
		const halfHeight = viewportHeight / 2;

		return {
			x: clamp(centerX, metrics.x + halfWidth, metrics.x + metrics.width - halfWidth),
			y: clamp(centerY, metrics.y + halfHeight, metrics.y + metrics.height - halfHeight)
		};
	}

	function setViewportCenter(nextX: number, nextY: number, target: ViewportTarget, scale = zoomScale) {
		const nextCenter = clampViewportCenter(nextX, nextY, target, scale);
		const previousViewportStates = untrack(() => mapSectionViewportStates);
		viewCenterX = nextCenter.x;
		viewCenterY = nextCenter.y;
		mapSectionViewportStates = {
			...previousViewportStates,
			[target.key]: {
				scale,
				centerX: nextCenter.x,
				centerY: nextCenter.y
			}
		};
	}

	function getRenderedViewBox(target: ViewportTarget) {
		const metrics = target.metrics;
		const { width: viewportWidth, height: viewportHeight } = getViewportMetrics(target);
		const nextCenter = clampViewportCenter(viewCenterX, viewCenterY, target);

		return `${nextCenter.x - viewportWidth / 2} ${nextCenter.y - viewportHeight / 2} ${viewportWidth} ${viewportHeight}`;
	}

	function getBoothRect(item: LootItem): BoothRect {
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
		return item.mapLabelFontSize ?? item.fontSize ?? 12.4;
	}

	function getBoothTextOffset(item: LootItem, lineCount: number) {
		if (lineCount <= 1) return 0;
		return getLabelFontSize(item) * 0.3;
	}

	function getBoothLineGap(item: LootItem) {
		return getLabelFontSize(item) * 0.84;
	}

	function getOverlayLabelLines(label: string) {
		const normalized = label.trim();
		if (normalized === '인생네컷 포토존') {
			return ['인생네컷', '포토존'];
		}
		if (normalized === '쿠팡 와우회원 인증존') {
			return ['와우회원', '인증존'];
		}
		if (normalized === '헤어쇼 이벤트(4/18)') {
			return ['헤어쇼 이벤트', '(4/18)'];
		}
		if (normalized === '쿠팡 뉴존 체험존') {
			return ['쿠팡 뉴존', '체험존'];
		}
		if (normalized === '뉴존 선물 수령존') {
			return ['뉴존 선물', '수령존'];
		}
		if (normalized === '파페치 / TW 홍보 부스') {
			return ['파페치 / TW', '홍보 부스'];
		}
		if (normalized.includes(' / ')) {
			return normalized.split(' / ').slice(0, 2);
		}
		if (normalized.length > 12 && normalized.includes(' ')) {
			const words = normalized.split(/\s+/);
			return [words[0], words.slice(1).join(' ')];
		}
		return [normalized];
	}

	function isBoothSizedEventZone(overlay: EventZoneOverlay) {
		return overlay.width <= 72 && overlay.height >= 54;
	}

	function getEventZoneFontSize(overlay: EventZoneOverlay) {
		if (overlay.fontSize) {
			return overlay.fontSize;
		}

		return isBoothSizedEventZone(overlay) ? 9 : 9.6;
	}

	function getEventZoneTextOffset(overlay: EventZoneOverlay, lineCount: number) {
		if (lineCount <= 1) return 0;
		return getEventZoneFontSize(overlay) * 0.3;
	}

	function getEventZoneLineGap(overlay: EventZoneOverlay) {
		return getEventZoneFontSize(overlay) * 0.82;
	}

	function getBoothVisual(item: LootItem): BoothVisual {
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
		return item.location || getPhysicalFloorLabel(item.floorId);
	}

	function getBoothBadgeSymbol(item: LootItem): BoothBadgeSymbol | null {
		if (item.isCompleted) return '✓';
		if (item.isBookmarked) return '★';
		if (item.firstComeEvent.trim().length > 0) return '!';
		return null;
	}

	function getBoothRenderModel(item: LootItem): BoothRenderModel {
		const rect = getBoothRect(item);
		const labelLines = getLabelLines(item);
		const fontSize = getLabelFontSize(item);
		const visual = getBoothVisual(item);

		return {
			ariaLabel: `${item.title} 상세 보기 - ${getFloorBadge(item)}`,
			badgeSymbol: getBoothBadgeSymbol(item),
			fontSize,
			isSelected: item.id === selectedItemId,
			labelLines,
			lineGap: getBoothLineGap(item),
			rect,
			textOffset: getBoothTextOffset(item, labelLines.length),
			visual
		};
	}

	function getEventZoneTextModel(overlay: EventZoneOverlay): OverlayTextModel {
		const labelLines = getOverlayLabelLines(overlay.label);
		return {
			centerX: overlay.x + overlay.width / 2,
			centerY: overlay.y + overlay.height / 2,
			fontSize: getEventZoneFontSize(overlay),
			labelLines,
			lineGap: getEventZoneLineGap(overlay),
			textOffset: getEventZoneTextOffset(overlay, labelLines.length)
		};
	}

	function handleBoothMouseEnter(itemId: string) {
		if (!isCoarsePointer) {
			hoveredItemId = itemId;
		}
	}

	function handleBoothMouseLeave(itemId: string) {
		if (hoveredItemId === itemId) {
			hoveredItemId = null;
		}
	}

	function handleBoothFocus(itemId: string) {
		hoveredItemId = itemId;
	}

	function handleBoothBlur(itemId: string) {
		if (hoveredItemId === itemId) {
			hoveredItemId = null;
		}
	}

	function handleBoothPointerDown(event: PointerEvent, itemId: string) {
		event.stopPropagation();
		if (event.button !== 0) return;

		const currentTarget = event.currentTarget as SVGGElement & {
			blur?: () => void;
		};
		currentTarget.blur?.();

		if (gestureIntent !== null) {
			gestureIntent = null;
			return;
		}

		handleItemPinClick(itemId);
	}

	function handleBoothKeyDown(event: KeyboardEvent, itemId: string) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleItemPinClick(itemId);
		}
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

	function getOverviewItemCenter(item: LootItem) {
		const placement = getOverviewPlacement(item.mapSectionId);
		if (!placement) return null;

		const { x, y, width, height } = getBoothRect(item);
		return {
			x: x + placement.offsetX + width / 2,
			y: y + placement.offsetY + height / 2
		};
	}

	function focusOverviewViewportOnItem(item: LootItem, preserveZoom = false) {
		const target = getOverviewViewportTarget();
		const itemCenter = getOverviewItemCenter(item);
		if (!itemCenter) return;

		const nextScale = preserveZoom ? Math.max(zoomScale, target.defaultScale) : target.defaultScale;
		applyZoomScale(nextScale, target, itemCenter.x, itemCenter.y);
	}

	function focusViewportOnItem(item: LootItem, preserveZoom = false) {
		if (activeMapSection === 'all') {
			focusOverviewViewportOnItem(item, preserveZoom);
			return;
		}

		const section = exhibition.mapSections.find((candidate) => candidate.id === item.mapSectionId);
		if (!section) return;

		const { x, y, width, height } = getBoothRect(item);
		const target = createSectionViewportTarget(section);
		const defaultScale = target.defaultScale;
		const nextScale = preserveZoom ? Math.max(zoomScale, defaultScale) : defaultScale;

		applyZoomScale(nextScale, target, x + width / 2, y + height / 2);
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
		target: ViewportTarget,
		centerX = viewCenterX,
		centerY = viewCenterY
	) {
		const clampedScale = clamp(nextScale, MIN_SINGLE_FLOOR_SCALE, MAX_SINGLE_FLOOR_SCALE);
		zoomScale = clampedScale;
		setViewportCenter(centerX, centerY, target, clampedScale);
	}

	function handleZoomStep(delta: number) {
		const target = getActiveViewportTarget();
		if (!target) return;

		const nextScale = clamp(zoomScale + delta, MIN_SINGLE_FLOOR_SCALE, MAX_SINGLE_FLOOR_SCALE);
		if (nextScale === zoomScale) return;

		applyZoomScale(nextScale, target);
	}

	function handleZoomReset() {
		const target = getActiveViewportTarget();
		if (!target) return;
		applyZoomScale(target.defaultScale, target, target.defaultCenter.x, target.defaultCenter.y);
	}

	function handleMapSectionSelect(nextSection: ActiveMapSection) {
		selectedMapSection = nextSection;
		hoveredItemId = null;
	}

	function handleItemPinClick(itemId: string) {
		onPinClick(itemId, activeMapSection === 'all' ? { preserveMapSectionOverride: true } : undefined);
	}

	function handleViewportWheel(event: WheelEvent) {
		const target = getActiveViewportTarget();
		if (!target || !zoomViewport) return;

		event.preventDefault();

		const delta = event.deltaY < 0 ? WHEEL_ZOOM_STEP : -WHEEL_ZOOM_STEP;
		const nextScale = clamp(zoomScale + delta, MIN_SINGLE_FLOOR_SCALE, MAX_SINGLE_FLOOR_SCALE);

		if (nextScale === zoomScale) return;

		applyZoomScale(nextScale, target);
	}

	function handleViewportPointerDown(event: PointerEvent) {
		const target = getActiveViewportTarget();
		if (!target || !zoomViewport) return;
		const eventTarget = event.target as Element | null;
		if (eventTarget?.closest('.map-booth-target')) return;

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
		const target = getActiveViewportTarget();
		if (!target || !zoomViewport || !activePointers.has(event.pointerId)) return;

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
			const { width: viewportWidth, height: viewportHeight } = getViewportMetrics(target, nextScale);
			const deltaX = midpoint.x - pinchGesture.midpointX;
			const deltaY = midpoint.y - pinchGesture.midpointY;

			applyZoomScale(
				nextScale,
				target,
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
		const viewportWidth = getViewportWidth(target);
		const viewportHeight = getViewportHeight(target);

		setViewportCenter(
			dragGesture.centerX - (deltaX / rect.width) * viewportWidth,
			dragGesture.centerY - (deltaY / rect.height) * viewportHeight,
			target
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

<!-- Shared booth/overlay renderers stay inside their wrappers so overview transforms and viewport handlers remain local to each caller. -->
{#snippet renderSharedOverlay(overlay)}
	{#if overlay.kind === 'eventZone'}
		{@const overlayTextModel = getEventZoneTextModel(overlay)}
		<g pointer-events="none" opacity="0.78">
			<rect
				x={overlay.x}
				y={overlay.y}
				width={overlay.width}
				height={overlay.height}
				fill={EVENT_ZONE_FILL}
				stroke={EVENT_ZONE_STROKE}
				stroke-width={EVENT_ZONE_STROKE_WIDTH}
				rx={EVENT_ZONE_RADIUS}
			/>
			<text
				x={overlayTextModel.centerX}
				y={overlayTextModel.centerY - overlayTextModel.textOffset}
				text-anchor="middle"
				dominant-baseline="middle"
				fill={EVENT_ZONE_TEXT}
				font-size={overlayTextModel.fontSize}
				font-weight="600"
			>
				{#each overlayTextModel.labelLines as line, lineIndex (line)}
					<tspan x={overlayTextModel.centerX} dy={lineIndex === 0 ? 0 : overlayTextModel.lineGap}>
						{line}
					</tspan>
				{/each}
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
	{/if}
{/snippet}

{#snippet renderBooth(item, boothModel)}
	<g
		role="button"
		tabindex="0"
		class="map-booth-target cursor-pointer"
		aria-label={boothModel.ariaLabel}
		onmouseenter={() => handleBoothMouseEnter(item.id)}
		onmouseleave={() => handleBoothMouseLeave(item.id)}
		onfocus={() => handleBoothFocus(item.id)}
		onblur={() => handleBoothBlur(item.id)}
		onpointerdown={(event) => handleBoothPointerDown(event, item.id)}
		onkeydown={(event) => handleBoothKeyDown(event, item.id)}
	>
		<title>{item.title}</title>
		{#if boothModel.isSelected}
			<rect
				x={boothModel.rect.x - 3}
				y={boothModel.rect.y - 3}
				width={boothModel.rect.width + 6}
				height={boothModel.rect.height + 6}
				rx="2"
				fill="none"
				stroke="#f5c35c"
				stroke-width="2.25"
				stroke-dasharray="5 3"
			/>
		{/if}
		<rect
			x={boothModel.rect.x}
			y={boothModel.rect.y}
			width={boothModel.rect.width}
			height={boothModel.rect.height}
			rx="1.5"
			fill={boothModel.visual.fill}
			stroke={boothModel.isSelected ? '#f5c35c' : boothModel.visual.stroke}
			stroke-width={boothModel.isSelected ? '2' : '1.2'}
		/>
		<text
			x={boothModel.rect.x + boothModel.rect.width / 2}
			y={boothModel.rect.y + boothModel.rect.height / 2 - boothModel.textOffset}
			text-anchor="middle"
			dominant-baseline="middle"
			fill={boothModel.visual.text}
			font-size={boothModel.fontSize}
			font-weight="700"
		>
			{#each boothModel.labelLines as line, lineIndex (line)}
				<tspan
					x={boothModel.rect.x + boothModel.rect.width / 2}
					dy={lineIndex === 0 ? 0 : boothModel.lineGap}
				>
					{line}
				</tspan>
			{/each}
		</text>

		{#if boothModel.badgeSymbol}
			<circle
				cx={boothModel.rect.x + boothModel.rect.width - 7}
				cy={boothModel.rect.y + 7}
				r="7"
				fill={boothModel.visual.badge}
				stroke="#0f1724"
				stroke-width="1"
			/>
			<text
				x={boothModel.rect.x + boothModel.rect.width - 7}
				y={boothModel.rect.y + 7}
				text-anchor="middle"
				dominant-baseline="middle"
				fill="#0f1724"
				font-size="8"
				font-weight="700"
			>
				{boothModel.badgeSymbol}
			</text>
		{/if}
	</g>
{/snippet}

<section class="rounded-[32px] border border-border bg-navy-surface p-4 shadow-[0_24px_50px_rgba(0,0,0,0.35)]">
	<div class="mb-4 flex items-start justify-between gap-3">
		<div>
			<p class="text-[11px] font-semibold uppercase tracking-[0.26em] text-muted-foreground">
				{exhibition.mapTitle}
			</p>
			<h2 class="mt-1 font-heading text-2xl font-semibold text-foreground">부스보기</h2>
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
				activeMapSection === 'all'
					? 'border-gold/40 bg-gold text-black'
					: 'border-border bg-navy-elevated text-muted-foreground'
			]}
			onclick={() => handleMapSectionSelect('all')}
		>
			전체
		</button>

		{#each exhibition.mapSections as section (section.id)}
			<button
				type="button"
				class={[
					'shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition',
					activeMapSection === section.id
						? 'border-gold/40 bg-gold text-black'
						: 'border-border bg-navy-elevated text-muted-foreground'
				]}
				onclick={() => handleMapSectionSelect(section.id)}
			>
				{section.label}
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
					한 번 더 탭하면 상세 시트가 열립니다.
				</p>
			{/if}
		{:else}
			<p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
				{isCoarsePointer ? 'Selected Booth' : 'Hover Booth'}
			</p>
			<p class="mt-1 text-sm text-muted-foreground">
				{#if activeMapSection !== 'all' && activeMapSectionItems.length === 0}
					수령과 동선 안내 중심 구역입니다.
				{:else if isCoarsePointer}
					{activeMapSection === 'all'
						? '부스를 탭하면 구역 요약이 표시됩니다.'
						: '부스를 탭하면 현재 구역 요약이 표시됩니다.'}
				{:else}
					{activeMapSection === 'all'
						? '포인터를 올리면 구역과 상태를 보여줍니다.'
						: '포인터를 올리면 상태를 보여줍니다.'}
				{/if}
			</p>
		{/if}
	</div>

	<div class="flex flex-col gap-4">
		{#if activeMapSection === 'all'}
			{@const overviewMetrics = getOverviewMapMetrics()}
			{@const overviewTarget = getOverviewViewportTarget()}
			<div class="overflow-hidden rounded-[28px] border border-border bg-black/20 p-3">
				<div class="mb-3 flex items-center justify-between gap-3 px-1">
					<div>
						<h3 class="font-heading text-lg font-semibold text-foreground">전체 Overview</h3>
						<p class="mt-1 text-[11px] text-muted-foreground">한 장으로 보고 필요한 구역만 확대하세요.</p>
					</div>

					<div class="flex items-center gap-2">
						<div
							class="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/35 p-1"
							aria-label="전체 지도 확대/축소 컨트롤"
						>
							<button
								type="button"
								class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-navy-elevated text-sm font-semibold text-foreground transition disabled:cursor-not-allowed disabled:opacity-35"
								aria-label="전체 지도 축소"
								disabled={zoomScale <= overviewTarget.defaultScale + 0.001}
								onclick={() => handleZoomStep(-BUTTON_ZOOM_STEP)}
							>
								-
							</button>
							<button
								type="button"
								class="inline-flex min-w-[52px] items-center justify-center rounded-full bg-navy-elevated px-3 py-2 text-[11px] font-semibold text-foreground transition disabled:cursor-not-allowed disabled:opacity-35"
								aria-label="전체 지도 확대 리셋"
								disabled={Math.abs(zoomScale - overviewTarget.defaultScale) < 0.001}
								onclick={handleZoomReset}
							>
								리셋
							</button>
							<button
								type="button"
								class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-navy-elevated text-sm font-semibold text-foreground transition disabled:cursor-not-allowed disabled:opacity-35"
								aria-label="전체 지도 확대"
								disabled={zoomScale >= MAX_SINGLE_FLOOR_SCALE - 0.001}
								onclick={() => handleZoomStep(BUTTON_ZOOM_STEP)}
							>
								+
							</button>
						</div>

						<span class="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
							{exhibition.mapSections.length} sections
						</span>
					</div>
				</div>

				<div
					role="group"
					aria-label="전체 지도 viewport"
					class="overflow-hidden rounded-[24px] border border-white/6 bg-[#0b1320] touch-none"
					style={`aspect-ratio: ${overviewMetrics.width} / ${overviewMetrics.height}; touch-action: none;`}
					bind:this={zoomViewport}
					onwheel={handleViewportWheel}
					onpointerdown={handleViewportPointerDown}
					onpointermove={handleViewportPointerMove}
					onpointerup={handleViewportPointerUp}
					onpointercancel={handleViewportPointerUp}
				>
					<svg viewBox={getRenderedViewBox(overviewTarget)} class="h-full w-full">
						{#each exhibition.mapSections as section (section.id)}
							{@const placement = overviewMetrics.placements[section.id]}
							{@const sectionItems = getSectionItems(section.id)}
							{@const sectionMetrics = getSourceMapSectionMetrics(section)}
							<g transform={`translate(${placement.offsetX} ${placement.offsetY})`}>
								<rect
									x={sectionMetrics.x - 6}
									y={sectionMetrics.y - OVERVIEW_SECTION_TITLE_HEIGHT}
									width={placement.titleWidth}
									height={OVERVIEW_SECTION_TITLE_HEIGHT - 8}
									rx="8"
									fill="#122031"
									stroke="#2a3f59"
									stroke-width="1"
									opacity="0.92"
								/>
								<text
									x={sectionMetrics.x + 10}
									y={sectionMetrics.y - 10}
									fill="#f6d16d"
									font-size="12"
									font-weight="700"
								>
									{section.label}
								</text>
								<text
									x={sectionMetrics.x + placement.titleWidth - 10}
									y={sectionMetrics.y - 10}
									text-anchor="end"
									fill="#b7c6da"
									font-size="9"
									font-weight="600"
								>
									{sectionItems.length} booths
								</text>
								{#each section.overlays as overlay, index (`overview-${section.id}-${overlay.kind}-${index}`)}
									{#if overlay.kind === 'eventZone' || overlay.kind === 'stairs'}
										{@render renderSharedOverlay(overlay)}
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

								{#each sectionItems as item (item.id)}
									{@const boothModel = getBoothRenderModel(item)}
									{@render renderBooth(item, boothModel)}
								{/each}
							</g>
						{/each}
					</svg>
				</div>
			</div>
		{:else}
		{#each visibleMapSections as section (section.id)}
			{@const sectionItems = getSectionItems(section.id)}
			{@const sectionMetrics = getDisplayMapSectionMetrics(section)}
			{@const isInteractiveSection = activeMapSection === section.id}
			{@const sectionTarget = createSectionViewportTarget(section)}
			{@const defaultSectionScale = sectionTarget.defaultScale}
			<div class="overflow-hidden rounded-[28px] border border-border bg-black/20 p-3">
				<div class="mb-3 flex items-center justify-between gap-3 px-1">
					<div>
						<h3 class="font-heading text-lg font-semibold text-foreground">{section.label}</h3>
						<p class="mt-1 text-[11px] text-muted-foreground">드래그로 이동하고 핀치나 버튼으로 확대하세요.</p>
					</div>

					<div class="flex items-center gap-2">
						{#if isInteractiveSection}
							<div
								class="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/35 p-1"
								aria-label={`${section.label} 지도 확대/축소 컨트롤`}
							>
								<button
									type="button"
									class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-navy-elevated text-sm font-semibold text-foreground transition disabled:cursor-not-allowed disabled:opacity-35"
									aria-label={`${section.label} 지도 축소`}
									disabled={zoomScale <= MIN_SINGLE_FLOOR_SCALE + 0.001}
									onclick={() => handleZoomStep(-BUTTON_ZOOM_STEP)}
								>
									-
								</button>
								<button
									type="button"
									class="inline-flex min-w-[52px] items-center justify-center rounded-full bg-navy-elevated px-3 py-2 text-[11px] font-semibold text-foreground transition disabled:cursor-not-allowed disabled:opacity-35"
									aria-label={`${section.label} 지도 확대 리셋`}
									disabled={Math.abs(zoomScale - defaultSectionScale) < 0.001}
									onclick={handleZoomReset}
								>
									리셋
								</button>
								<button
									type="button"
									class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-navy-elevated text-sm font-semibold text-foreground transition disabled:cursor-not-allowed disabled:opacity-35"
									aria-label={`${section.label} 지도 확대`}
									disabled={zoomScale >= MAX_SINGLE_FLOOR_SCALE - 0.001}
									onclick={() => handleZoomStep(BUTTON_ZOOM_STEP)}
								>
									+
								</button>
							</div>
						{/if}

						<span class="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
							{sectionItems.length} booths
						</span>
					</div>
				</div>

				<div
					role="group"
					aria-label={`${section.label} 지도 viewport`}
					class={['overflow-hidden rounded-[24px] border border-white/6 bg-[#0b1320]', 'touch-none']}
					style={`aspect-ratio: ${sectionMetrics.width} / ${sectionMetrics.height}; touch-action: ${activeMapSection === section.id ? 'none' : 'auto'};`}
					bind:this={zoomViewport}
					onwheel={activeMapSection === section.id ? handleViewportWheel : undefined}
					onpointerdown={activeMapSection === section.id ? handleViewportPointerDown : undefined}
					onpointermove={activeMapSection === section.id ? handleViewportPointerMove : undefined}
					onpointerup={activeMapSection === section.id ? handleViewportPointerUp : undefined}
					onpointercancel={activeMapSection === section.id ? handleViewportPointerUp : undefined}
				>
					<svg viewBox={getRenderedViewBox(sectionTarget)} class="h-full w-full">
						{#each section.overlays as overlay, index (`${section.id}-${overlay.kind}-${index}`)}
							{#if overlay.kind === 'eventZone' || overlay.kind === 'stairs'}
								{@render renderSharedOverlay(overlay)}
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

						{#each sectionItems as item (item.id)}
							{@const boothModel = getBoothRenderModel(item)}
							{@render renderBooth(item, boothModel)}
						{/each}
					</svg>
				</div>
			</div>
		{/each}
		{/if}
	</div>
</section>
