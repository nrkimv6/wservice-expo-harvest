import { browser } from '$app/environment';
import type { LootItem } from '$lib/data/lootItems';

const STORAGE_KEY = 'expo-harvest:loot-state:v2';
const SELECTED_EXHIBITION_KEY = 'expo-harvest:selected-exhibition';
const ONBOARDING_DISMISSED_KEY = 'expo-harvest:onboarding-dismissed';

type PersistedLootItem = Pick<LootItem, 'isBookmarked' | 'isCompleted' | 'memo'>;
type PersistedLootState = Record<string, PersistedLootItem>;
type PersistedExhibitionState = Record<string, PersistedLootState>;

function readPersistedState(): PersistedExhibitionState {
	if (!browser) return {};

	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return {};
		return JSON.parse(raw) as PersistedExhibitionState;
	} catch {
		return {};
	}
}

export function hydrateLootItems(exhibitionId: string, initialItems: LootItem[]): LootItem[] {
	if (!browser) return initialItems;

	try {
		const saved = readPersistedState()[exhibitionId] ?? {};

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

export function persistLootItems(exhibitionId: string, items: LootItem[]) {
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

		const allState = readPersistedState();
		allState[exhibitionId] = payload;
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(allState));
	} catch {
		// localStorage quota or private mode failure is non-blocking for the UI
	}
}

export function hydrateSelectedExhibitionId(validIds: string[], fallbackId: string) {
	if (!browser) return fallbackId;

	try {
		const savedId = window.localStorage.getItem(SELECTED_EXHIBITION_KEY);
		return savedId && validIds.includes(savedId) ? savedId : fallbackId;
	} catch {
		return fallbackId;
	}
}

export function persistSelectedExhibitionId(exhibitionId: string) {
	if (!browser) return;

	try {
		window.localStorage.setItem(SELECTED_EXHIBITION_KEY, exhibitionId);
	} catch {
		// localStorage quota or private mode failure is non-blocking for the UI
	}
}

export function hydrateOnboardingDismissed() {
	if (!browser) return false;

	try {
		return window.localStorage.getItem(ONBOARDING_DISMISSED_KEY) === 'true';
	} catch {
		return false;
	}
}

export function persistOnboardingDismissed(dismissed: boolean) {
	if (!browser) return;

	try {
		window.localStorage.setItem(ONBOARDING_DISMISSED_KEY, dismissed ? 'true' : 'false');
	} catch {
		// localStorage quota or private mode failure is non-blocking for the UI
	}
}
