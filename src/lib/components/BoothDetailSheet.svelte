<script lang="ts">
	import { browser } from '$app/environment';
	import { fly } from 'svelte/transition';
	import {
		Bookmark,
		Check,
		CheckCircle2,
		Copy,
		ExternalLink,
		Gift,
		MapPin,
		MessageSquare,
		Share2,
		X
	} from 'lucide-svelte';
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
	let copyState = $state<'idle' | 'done' | 'error'>('idle');
	let includeInstagramAccounts = $state(false);

	function getInstagramAccountId(url: string): string | null {
		try {
			const [accountId] = new URL(url).pathname.split('/').filter(Boolean);
			return accountId ? accountId.replace(/^@/, '') : null;
		} catch {
			return null;
		}
	}

	const instagramAccountTags = $derived(
		item
			? Array.from(
					new Set(
						item.socialLinks
							.filter((link) => link.platform === 'instagram')
							.map((link) => link.accountId ?? getInstagramAccountId(link.url))
							.filter((accountId): accountId is string => Boolean(accountId))
							.map((accountId) => `@${accountId}`)
					)
				)
			: []
	);
	const hashtagBlock = $derived(
		item ? [...item.hashtags, ...(includeInstagramAccounts ? instagramAccountTags : [])].join('\n') : ''
	);
	const hasHashtags = $derived((item?.hashtags.length ?? 0) > 0);
	const hasInstagramAccountTags = $derived(instagramAccountTags.length > 0);

	$effect(() => {
		if (!item || !browser) return;
		closeButton?.focus();
	});

	$effect(() => {
		item?.id;
		copyState = 'idle';
		includeInstagramAccounts = false;
	});

	$effect(() => {
		if (!item || !browser) return;

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

		return () => {
			document.body.style.overflow = previousOverflow;
		};
	});

	$effect(() => {
		if (copyState !== 'done') return;

		const timeout = window.setTimeout(() => {
			copyState = 'idle';
		}, 1800);

		return () => {
			window.clearTimeout(timeout);
		};
	});

	async function copyHashtags() {
		if (!item || !browser || !hashtagBlock) return;

		try {
			await navigator.clipboard.writeText(hashtagBlock);
			copyState = 'done';
		} catch {
			copyState = 'error';
		}
	}
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
				class="safe-bottom animate-sheet-in max-h-[85vh] overflow-y-auto rounded-t-[30px] border border-border bg-navy-surface px-5 pb-10 pt-4 shadow-[0_-20px_60px_rgba(0,0,0,0.45)]"
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

						{#if item.location}
							<div class="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
								<MapPin size={15} />
								<span>{item.location}</span>
							</div>
						{/if}
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

				{#if hasHashtags}
					<div class="mt-4 rounded-[24px] border border-border bg-navy-elevated p-4">
						<div class="flex items-center justify-between gap-3">
							<div class="flex items-center gap-2 text-foreground">
								<Share2 size={16} />
								<p class="text-sm font-semibold">Hashtag Block</p>
							</div>

							<button
								type="button"
								class={[
									'flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition',
									copyState === 'done'
										? 'border-mint/40 bg-mint/10 text-mint'
										: copyState === 'error'
											? 'border-red-400/30 bg-red-400/10 text-red-200'
											: 'border-border bg-black/20 text-foreground'
								]}
								onclick={copyHashtags}
							>
								{#if copyState === 'done'}
									<Check size={14} />
									<span>복사됨</span>
								{:else}
									<Copy size={14} />
									<span>{copyState === 'error' ? '다시 시도' : '코드블럭 복사'}</span>
								{/if}
							</button>
						</div>

						{#if hasInstagramAccountTags}
							<label
								class="mt-3 flex cursor-pointer items-center gap-3 rounded-2xl border border-white/8 bg-black/20 px-3 py-2 text-sm text-muted-foreground"
							>
								<input
									type="checkbox"
									class="h-4 w-4 rounded border-border bg-navy-surface text-gold accent-gold"
									bind:checked={includeInstagramAccounts}
								/>
								<span>인스타그램 계정 추가 (@계정id)</span>
							</label>
						{/if}

						<pre class="mt-3 overflow-x-auto rounded-2xl border border-white/6 bg-black/35 px-4 py-3 text-xs leading-6 text-gold"><code>{hashtagBlock}</code></pre>
					</div>
				{/if}

				<div class="mt-4 rounded-[24px] border border-border bg-navy-elevated p-4">
					<div class="flex items-center gap-2 text-foreground">
						<ExternalLink size={16} />
						<p class="text-sm font-semibold">SNS Links</p>
					</div>

					<div class="mt-3 grid gap-2">
						{#each item.socialLinks as link (link.id)}
							<a
								href={link.url}
								target="_blank"
								rel="noreferrer"
								class="flex items-center justify-between rounded-2xl border border-border bg-black/20 px-4 py-3 text-sm text-foreground transition hover:border-gold/40 hover:text-gold"
							>
								<span>{link.label}</span>
								<ExternalLink size={14} />
							</a>
						{/each}
					</div>
				</div>

				<div class="mt-4 rounded-[24px] border border-border bg-navy-elevated p-4">
					<div class="flex items-center gap-2 text-foreground">
						<MessageSquare size={16} />
						<p class="text-sm font-semibold">Local Memo</p>
					</div>
					<textarea
						class="mt-3 min-h-28 w-full resize-none rounded-2xl border border-border bg-black/20 px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
						aria-label="부스 메모"
						placeholder="현장 확인 내용이나 수령 메모를 남기세요"
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
