import { supabase } from '$lib/supabase';

export type AlertChannelStatus = 'closed' | 'connected' | 'connecting';

export interface LiveAlertPayload {
	message?: string;
	boothName?: string;
	eventName?: string;
	location?: string;
	time?: string;
	minutesLeft?: number;
	expiresAt?: string;
}

function buildMessageFromPayload(payload: LiveAlertPayload) {
	if (payload.message?.trim()) {
		return payload.message.trim();
	}

	const label = payload.eventName || payload.boothName;
	if (!label) return null;

	if (typeof payload.minutesLeft === 'number' && payload.location) {
		return `${label} 이벤트 ${payload.minutesLeft}분 전 → ${payload.location}`;
	}

	if (payload.time && payload.location) {
		return `${payload.time} ${label} 이벤트 임박 → ${payload.location}`;
	}

	if (payload.location) {
		return `${label} 현장 이벤트 진행 중 → ${payload.location}`;
	}

	return `${label} 현장 이벤트 진행 중`;
}

function resolveExpiresAt(payload: LiveAlertPayload) {
	if (payload.expiresAt) {
		const parsed = new Date(payload.expiresAt).getTime();
		if (!Number.isNaN(parsed)) {
			return parsed;
		}
	}

	return Date.now() + 3 * 60 * 1000;
}

export function subscribeToAlertFeed(handlers: {
	onAlert: (message: string, expiresAt: number) => void;
	onStatusChange?: (status: AlertChannelStatus) => void;
}) {
	handlers.onStatusChange?.('connecting');

	const channel = supabase
		.channel('expo-harvest-alerts')
		.on('broadcast', { event: 'alert' }, ({ payload }) => {
			const message = buildMessageFromPayload(payload as LiveAlertPayload);
			if (!message) return;

			handlers.onAlert(message, resolveExpiresAt(payload as LiveAlertPayload));
		});

	channel.subscribe((status) => {
		if (status === 'SUBSCRIBED') {
			handlers.onStatusChange?.('connected');
			return;
		}

		if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
			handlers.onStatusChange?.('closed');
		}
	});

	return () => {
		handlers.onStatusChange?.('closed');
		void supabase.removeChannel(channel);
	};
}
