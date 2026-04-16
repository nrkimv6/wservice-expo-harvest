import { browser } from '$app/environment';
import type { User } from '@supabase/supabase-js';
import { supabase } from '$lib/supabase';
import { config } from '$lib/config';

function createAuthStore() {
	let user = $state<User | null>(null);
	let loading = $state(true);
	let initialized = false;
	let initializing = false;
	let isReinitializing = false;
	let authSubscription: { unsubscribe: () => void } | null = null;

	// 초기화
	async function initialize() {
		if (!browser) {
			loading = false;
			return;
		}

		if (initialized || initializing) return;
		initializing = true;

		try {
			const { data: { user: currentUser }, error } = await supabase.auth.getUser();
			if (error) {
				console.error('Auth initialization error:', error);
			} else if (currentUser) {
				user = currentUser;
				const { data: { session } } = await supabase.auth.getSession();
				// session은 필요 시 사용 (현재는 user만 저장)
			}
		} catch (e) {
			console.error('Auth initialization error:', e);
		} finally {
			loading = false;
			initialized = true;
			initializing = false;
		}

		// 인증 상태 변경 리스너
		const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
			user = session?.user || null;

			// SIGNED_OUT 이벤트 시 모든 스토어 정리
			if (event === 'SIGNED_OUT') {
				user = null;
			}
		});
		authSubscription = subscription;
	}

	// 재초기화 (callback 등에서 사용)
	async function reinit() {
		if (isReinitializing) return;
		isReinitializing = true;
		try {
			cleanup();
			initialized = false;
			await initialize();
		} finally {
			isReinitializing = false;
		}
	}

	// 정리
	function cleanup() {
		authSubscription?.unsubscribe();
		authSubscription = null;
	}

	// 로그인 관련 경로인지 확인
	function isLoginPath(path: string): boolean {
		return (
			path === '/login' ||
			path.endsWith('/login') ||
			path.includes('/auth/') ||
			path.includes('/callback')
		);
	}

	// Google 로그인 URL 생성
	function getGoogleLoginUrl(): string {
		if (!browser) {
			return `${config.auth.workerUrl}/google?appId=${config.auth.appId}&returnTo=${encodeURIComponent('/')}`;
		}

		const currentPath = window.location.pathname;
		// 로그인 페이지면 기본 경로로, 아니면 현재 경로 유지
		const returnTo = isLoginPath(currentPath) ? '/' : currentPath;

		return `${config.auth.workerUrl}/google?appId=${config.auth.appId}&returnTo=${encodeURIComponent(returnTo)}`;
	}

	// 로그아웃
	async function signOut() {
		await supabase.auth.signOut();
		user = null;
	}

	return {
		get user() {
			return user;
		},
		get loading() {
			return loading;
		},
		get isAuthenticated() {
			return !!user;
		},

		initialize,
		reinit,
		cleanup,
		getGoogleLoginUrl,
		signOut
	};
}

export const authStore = createAuthStore();
