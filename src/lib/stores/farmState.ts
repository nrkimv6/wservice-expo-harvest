import { browser } from '$app/environment';
import type { LootItem } from '$lib/data/lootItems';

const STORAGE_KEY = 'expo-harvest:loot-state';

type PersistedLootItem = Pick<LootItem, 'isBookmarked' | 'isCompleted' | 'memo'>;
type PersistedLootState = Record<string, PersistedLootItem>;

export function hydrateLootItems(initialItems: LootItem[]): LootItem[] {
	if (!browser) return initialItems;

	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return initialItems;

		const saved = JSON.parse(raw) as PersistedLootState;

		return initialItems.map((item) => {
			const persisted = saved[item.id];
			if (!persisted) return item;

			return {
				...item,
				isBookmarked: persisted.isBookmarked,
				isCompleted: persisted.isCompleted,
				memo: persisted.memo
			};
		});
	} catch {
		return initialItems;
	}
}

export function persistLootItems(items: LootItem[]) {
	if (!browser) return;

	try {
		const payload = items.reduce<PersistedLootState>((accumulator, item) => {
			accumulator[item.id] = {
				isBookmarked: item.isBookmarked,
				isCompleted: item.isCompleted,
				memo: item.memo
			};
			return accumulator;
		}, {});

		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
	} catch {
		// localStorage quota or private mode failure is non-blocking for the UI
	}
}
