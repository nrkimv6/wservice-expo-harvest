<script lang="ts">
	import { Bookmark, Clock, MessageSquare, ScrollText, Smartphone, UserRoundPlus } from 'lucide-svelte';
	import { CATEGORIES, type LootCategory } from '$lib/data/lootItems';

	type Props = {
		active: LootCategory[];
		onToggle: (category: LootCategory) => void;
	};

	let { active, onToggle }: Props = $props();

	const chipIcons = {
		시간제한: Clock,
		'SNS 업로드': MessageSquare,
		'단순 팔로우': Bookmark,
		'앱 설치': Smartphone,
		회원가입: UserRoundPlus,
		'설문 참여': ScrollText
	} as const;
</script>

<div class="no-scrollbar flex gap-2 overflow-x-auto pb-1">
	{#each CATEGORIES as category}
		{@const Icon = chipIcons[category as Exclude<LootCategory, ''>]}
		<button
			type="button"
			class={[
				'flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition',
				active.includes(category)
					? 'glow-gold bg-gold text-black'
					: 'border border-border bg-navy-elevated text-foreground'
			]}
			aria-pressed={active.includes(category)}
			onclick={() => onToggle(category)}
		>
			<Icon size={14} />
			<span>{category}</span>
		</button>
	{/each}
</div>
