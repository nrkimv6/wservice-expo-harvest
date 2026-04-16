<script lang="ts">
	import { browser } from '$app/environment';
	import { fly } from 'svelte/transition';
	import { Bookmark, CheckCircle2, Gift, MapPin, MessageSquare, X } from 'lucide-svelte';
	import type { LootItem } from '$lib/data/lootItems';

	type Props = {
		item: LootItem | null;
		onClose: () => void;
		onToggleBookmark: (id: string) => void;
		onToggleComplete: (id: string) => void;
		onMemoChange: (id: string, memo: string) => void;
	};

	let { item, onClose, onToggleBookmark, onToggleComplete, onMemoChange }: Props = $props();
	let closeButton = $state<HTMLButtonElement | null>(null);

	$effect(() => {
		if (!item || !browser) return;
		closeButton?.focus();
	});

	$effect(() => {
		if (!item || !browser) return;

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

		return () => {
			document.body.style.overflow = previousOverflow;
		};
	});
</script>

<svelte:window
	onkeydown={(event) => {
		if (item && event.key === 'Escape') {
			onClose();
		}
	}}
/>

{#if item}
	<div class="fixed inset-0 z-50">
		<button
			type="button"
			class="absolute inset-0 bg-navy-deep/80 backdrop-blur-sm"
			aria-label="배경 클릭으로 닫기"
			onclick={onClose}
		></button>

		<div class="absolute inset-x-0 bottom-0 mx-auto w-full max-w-lg">
			<div
				class="animate-sheet-in max-h-[85vh] overflow-y-auto rounded-t-[30px] border border-border bg-navy-surface px-5 pb-8 pt-4 shadow-[0_-20px_60px_rgba(0,0,0,0.45)]"
				role="dialog"
				aria-modal="true"
				aria-labelledby={`sheet-title-${item.id}`}
				transition:fly={{ y: 400, duration: 300 }}
			>
				<div class="mx-auto h-1.5 w-14 rounded-full bg-white/15"></div>

				<div class="mt-4 flex items-start justify-between gap-3">
					<div>
						<div class="flex flex-wrap items-center gap-2">
							<span class="rounded-full bg-gold/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-gold">
								{item.time}
							</span>
							<span class="rounded-full bg-navy-elevated px-2.5 py-1 text-[10px] text-muted-foreground">
								{item.category}
							</span>
						</div>

						<h2 id={`sheet-title-${item.id}`} class="mt-3 font-heading text-2xl font-semibold text-foreground">
							{item.title}
						</h2>

						<div class="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
							<MapPin size={15} />
							<span>{item.location}</span>
						</div>
					</div>

					<button
						type="button"
						class="rounded-full border border-border bg-navy-elevated p-2 text-muted-foreground"
						aria-label="상세 닫기"
						bind:this={closeButton}
						onclick={onClose}
					>
						<X size={16} />
					</button>
				</div>

				<div class="mt-5 rounded-[24px] border border-gold/20 bg-gold/10 p-4">
					<div class="flex items-center gap-2 text-gold">
						<Gift size={16} />
						<p class="text-sm font-semibold">Prize</p>
					</div>
					<p class="mt-2 text-sm text-foreground">{item.prize}</p>
				</div>

				<div class="mt-4 rounded-[24px] border border-border bg-navy-elevated p-4">
					<p class="text-sm font-semibold text-foreground">Mission</p>
					<p class="mt-2 text-sm leading-6 text-muted-foreground">{item.mission}</p>
				</div>

				<div class="mt-4 rounded-[24px] border border-border bg-navy-elevated p-4">
					<div class="flex items-center gap-2 text-foreground">
						<MessageSquare size={16} />
						<p class="text-sm font-semibold">Local Memo</p>
					</div>
					<textarea
						class="mt-3 min-h-28 w-full resize-none rounded-2xl border border-border bg-black/20 px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
						aria-label="부스 메모"
						placeholder="필수 해시태그, 대기열 위치, 받는 곳 위치 같은 현장 메모를 남기세요"
						value={item.memo}
						oninput={(event) => {
							onMemoChange(item.id, (event.currentTarget as HTMLTextAreaElement).value);
						}}
					></textarea>
				</div>

				<div class="mt-5 grid gap-3 sm:grid-cols-2">
					<button
						type="button"
						class={[
							'flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition',
							item.isBookmarked
								? 'border-gold/40 bg-gold/15 text-gold'
								: 'border-border bg-navy-elevated text-foreground'
						]}
						aria-label={item.isBookmarked ? '찜 해제' : '찜하기'}
						onclick={() => onToggleBookmark(item.id)}
					>
						<Bookmark size={16} />
						<span>{item.isBookmarked ? '관심 해제' : '관심 등록'}</span>
					</button>

					<button
						type="button"
						class={[
							'flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition',
							item.isCompleted
								? 'border-mint bg-mint/15 text-mint'
								: 'border-gold bg-gold text-black glow-gold'
						]}
						aria-label={item.isCompleted ? '완료 해제' : '완료 처리'}
						onclick={() => onToggleComplete(item.id)}
					>
						<CheckCircle2 size={16} />
						<span>{item.isCompleted ? '완료 해제' : 'Mark Farmed'}</span>
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
