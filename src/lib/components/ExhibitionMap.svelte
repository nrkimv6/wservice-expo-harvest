<script lang="ts">
	import type { ArrowOverlay, Exhibition, LootItem, StairsOverlay } from '$lib/data/lootItems';

	type ActiveFloor = Exhibition['defaultFloorId'] | 'all';

	type Props = {
		exhibition: Exhibition;
		items: LootItem[];
		onPinClick: (id: string) => void;
		activeFloorOverride?: string | null;
	};

	let { exhibition, items, onPinClick, activeFloorOverride = null }: Props = $props();

	let selectedFloor = $state<ActiveFloor | null>(null);
	let hoveredItemId = $state<string | null>(null);

	const activeFloor = $derived(selectedFloor ?? exhibition.defaultFloorId);
	const hoveredItem = $derived(items.find((item) => item.id === hoveredItemId) ?? null);
	const visibleFloors = $derived(
		activeFloor === 'all'
			? exhibition.floors
			: exhibition.floors.filter((floor) => floor.id === activeFloor)
	);

	$effect(() => {
		exhibition.id;
		selectedFloor = null;
		hoveredItemId = null;
	});

	$effect(() => {
		if (activeFloorOverride) {
			selectedFloor = activeFloorOverride as ActiveFloor;
		}
	});

	function getFloorItems(floorId: string) {
		return items.filter((item) => item.floorId === floorId);
	}

	function getFloorOutlineHeight(viewBox: string) {
		const parts = viewBox.split(/\s+/).map(Number);
		return parts[3] ? parts[3] - 40 : 0;
	}

	function getBoothVisual(item: LootItem) {
		if (item.isCompleted) {
			return { fill: '#10392d', stroke: '#6ee7b7', text: '#d1fae5' };
		}

		if (item.firstComeEvent.trim().length > 0) {
			return { fill: '#4c1d28', stroke: '#fda4af', text: '#ffe4e6' };
		}

		if (item.isBookmarked) {
			return { fill: '#4a3915', stroke: '#f5c35c', text: '#fde68a' };
		}

		return { fill: '#e8f5e9', stroke: '#4caf50', text: '#2e7d32' };
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
</script>

<section class="rounded-[32px] border border-border bg-navy-surface p-4 shadow-[0_24px_50px_rgba(0,0,0,0.35)]">
	<div class="mb-4 flex items-center justify-between gap-3">
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

	<div class="mb-4 flex flex-wrap gap-2">
		<button
			type="button"
			class={[
				'rounded-full border px-4 py-2 text-sm font-semibold transition',
				activeFloor === 'all'
					? 'border-gold/40 bg-gold text-black'
					: 'border-border bg-navy-elevated text-muted-foreground'
			]}
			onclick={() => {
				selectedFloor = 'all';
				hoveredItemId = null;
			}}
		>
			전체
		</button>

		{#each exhibition.floors as floor (floor.id)}
			<button
				type="button"
				class={[
					'rounded-full border px-4 py-2 text-sm font-semibold transition',
					activeFloor === floor.id
						? 'border-gold/40 bg-gold text-black'
						: 'border-border bg-navy-elevated text-muted-foreground'
				]}
				onclick={() => {
					selectedFloor = floor.id;
					hoveredItemId = null;
				}}
			>
				{floor.label}
			</button>
		{/each}
	</div>

	<div class="mb-4 min-h-[68px] rounded-[24px] border border-border bg-black/25 px-4 py-3">
		{#if hoveredItem}
			<p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-gold">Hover Booth</p>
			<p class="mt-1 text-sm font-semibold text-foreground">{hoveredItem.title}</p>
			<div class="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
				<span>{getFloorBadge(hoveredItem)}</span>
				{#if hoveredItem.firstComeEvent}
					<span class="text-rose-200">{hoveredItem.firstComeEvent}</span>
				{/if}
			</div>
		{:else}
			<p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Hover Booth</p>
			<p class="mt-1 text-sm text-muted-foreground">브랜드 박스에 커서를 올리면 층과 상태를 요약해 보여줍니다.</p>
		{/if}
	</div>

	<div class="flex flex-col gap-4">
		{#each visibleFloors as floor (floor.id)}
			<div class="overflow-hidden rounded-[28px] border border-border bg-black/20 p-3">
				<div class="mb-3 flex items-center justify-between gap-3 px-1">
					<h3 class="font-heading text-lg font-semibold text-foreground">{floor.label}</h3>
					<span class="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
						{getFloorItems(floor.id).length} booths
					</span>
				</div>

				<svg viewBox={floor.viewBox} class="w-full overflow-visible rounded-[22px] bg-[#0f1724] p-2">
					<rect
						x="20"
						y="20"
						width="660"
						height={getFloorOutlineHeight(floor.viewBox)}
						fill="none"
						stroke="#4caf50"
						stroke-width="2"
					/>

					{#each floor.overlays as overlay, index (`${floor.id}-${overlay.kind}-${index}`)}
						{#if overlay.kind === 'eventZone'}
							<g pointer-events="none">
								<rect x={overlay.x} y={overlay.y} width={overlay.width} height={overlay.height} fill="#e8f5e9" stroke="#4caf50" stroke-width="1" />
								<text
									x={overlay.x + overlay.width / 2}
									y={overlay.y + overlay.height / 2}
									text-anchor="middle"
									dominant-baseline="middle"
									fill="#2e7d32"
									font-size={overlay.fontSize ?? 9}
									font-weight="600"
								>
									{overlay.label}
								</text>
							</g>
						{:else if overlay.kind === 'stairs'}
							<g pointer-events="none">
								<rect x={overlay.x} y={overlay.y} width={overlay.width} height={overlay.height} fill="#f5f5f5" stroke="#4caf50" stroke-width="1" />
								{#each getStairsLines(overlay) as lineY}
									<line x1={overlay.x} y1={lineY} x2={overlay.x + overlay.width} y2={lineY} stroke="#4caf50" stroke-width="0.5" />
								{/each}
							</g>
						{:else if overlay.kind === 'arrow'}
							<g pointer-events="none">
								<path d={getArrowPath(overlay)} stroke={overlay.color ?? '#c62828'} stroke-width="2" fill="none" />
								<text
									x={getOverlayTextX(overlay)}
									y={getOverlayTextY(overlay)}
									text-anchor="middle"
									fill={overlay.color ?? '#c62828'}
									font-size="10"
									font-weight="600"
								>
									{overlay.label}
								</text>
							</g>
						{:else}
							<rect x={overlay.x} y={overlay.y} width={overlay.width} height={overlay.height} fill={overlay.fill} pointer-events="none" />
						{/if}
					{/each}

					{#each getFloorItems(floor.id) as item (item.id)}
						{@const visual = getBoothVisual(item)}
						<g
							role="button"
							tabindex="0"
							class="cursor-pointer"
							aria-label={`${item.title} 상세 보기 - ${item.floorId}`}
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
							onkeydown={(event) => {
								if (event.key === 'Enter' || event.key === ' ') {
									event.preventDefault();
									onPinClick(item.id);
								}
							}}
						>
							<title>{item.title}</title>
							<rect x={item.mapX} y={item.mapY} width={item.boxWidth} height={item.boxHeight} rx="8" fill={visual.fill} stroke={visual.stroke} stroke-width="1.5" />
							<text
								x={item.mapX + item.boxWidth / 2}
								y={item.mapY + item.boxHeight / 2}
								text-anchor="middle"
								dominant-baseline="middle"
								fill={visual.text}
								font-size={item.fontSize ?? 10}
								font-weight="500"
							>
								{item.englishTitle ?? item.title}
							</text>

							{#if item.isCompleted}
								<circle cx={item.mapX + item.boxWidth - 7} cy={item.mapY + 7} r="7" fill="#6ee7b7" stroke="#0f1724" stroke-width="1" />
								<text x={item.mapX + item.boxWidth - 7} y={item.mapY + 7} text-anchor="middle" dominant-baseline="middle" fill="#0f1724" font-size="9" font-weight="700">✓</text>
							{:else if item.isBookmarked}
								<circle cx={item.mapX + item.boxWidth - 7} cy={item.mapY + 7} r="7" fill="#f5c35c" stroke="#0f1724" stroke-width="1" />
								<text x={item.mapX + item.boxWidth - 7} y={item.mapY + 7} text-anchor="middle" dominant-baseline="middle" fill="#0f1724" font-size="9" font-weight="700">★</text>
							{:else if item.firstComeEvent.trim().length > 0}
								<circle cx={item.mapX + item.boxWidth - 7} cy={item.mapY + 7} r="7" fill="#fda4af" stroke="#0f1724" stroke-width="1" />
								<text x={item.mapX + item.boxWidth - 7} y={item.mapY + 7} text-anchor="middle" dominant-baseline="middle" fill="#0f1724" font-size="9" font-weight="700">!</text>
							{/if}
						</g>
					{/each}
				</svg>
			</div>
		{/each}
	</div>
</section>
