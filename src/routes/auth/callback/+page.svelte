<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';
	import { browser } from '$app/environment';

	let status = $state<'loading' | 'error'>('loading');
	let errorMessage = $state('');

	// Hash fragment에서 토큰 파싱 (Auth Worker에서 전달)
	function parseHashFragment(): {
		provider?: string;
		access_token?: string;
		id_token?: string;
		refresh_token?: string;
		supabase_access_token?: string;
		supabase_refresh_token?: string;
		returnTo?: string;
	} | null {
		if (!browser) return null;

		const hash = window.location.hash.substring(1);
		if (!hash) return null;

		const params = new URLSearchParams(hash);
		const access_token = params.get('access_token');
		const id_token = params.get('id_token');
		const provider = params.get('provider');
		const refresh_token = params.get('refresh_token');
		const supabase_access_token = params.get('supabase_access_token');
		const supabase_refresh_token = params.get('supabase_refresh_token');
		const returnTo = params.get('returnTo');

		if (access_token || id_token || supabase_access_token) {
			return {
				provider: provider || undefined,
				access_token: access_token || undefined,
				id_token: id_token || undefined,
				refresh_token: refresh_token || undefined,
				supabase_access_token: supabase_access_token || undefined,
				supabase_refresh_token: supabase_refresh_token || undefined,
				returnTo: returnTo || undefined
			};
		}
		return null;
	}

	// Query parameter에서 메타데이터 파싱 (토큰은 hash에서)
	function parseQueryParams(): {
		provider?: string;
		appId?: string;
		returnTo?: string;
		error?: string;
	} | null {
		if (!browser) return null;

		const searchParams = new URLSearchParams(window.location.search);

		const provider = searchParams.get('provider');
		const appId = searchParams.get('appId');
		const returnTo = searchParams.get('returnTo');
		const errorParam = searchParams.get('error');

		console.log('[Auth Callback] Query metadata:', {
			provider,
			appId,
			returnTo,
			error: errorParam
		});

		if (errorParam) {
			return { error: errorParam };
		}

		if (provider) {
			return {
				provider,
				appId: appId || undefined,
				returnTo: returnTo || undefined
			};
		}

		return null;
	}

	onMount(async () => {
		try {
			// 1. Query params에서 메타데이터 확인
			const queryMetadata = parseQueryParams();

			// 2. Hash fragment에서 토큰 확인
			const hashTokens = parseHashFragment();

			// 통합: 메타데이터 우선, 토큰은 hash에서
			const tokens = { ...hashTokens, ...queryMetadata };

			console.log(
				'[Auth Callback] Query metadata:',
				queryMetadata ? 'present' : 'none'
			);
			console.log('[Auth Callback] Hash tokens:', hashTokens ? 'present' : 'none');

			// 에러 처리
			if (tokens?.error) {
				throw new Error(`인증 오류: ${tokens.error}`);
			}

			if (!tokens?.provider) {
				throw new Error('로그인 정보를 찾을 수 없습니다.');
			}

			// 카카오는 Supabase 토큰 직접 사용 (setSession)
			if (tokens.supabase_access_token && tokens.supabase_refresh_token) {
				console.log('[Auth Callback] Using Supabase tokens (Kakao)');
				const { error } = await supabase.auth.setSession({
					access_token: tokens.supabase_access_token,
					refresh_token: tokens.supabase_refresh_token
				});
				if (error) {
					console.error('[Auth Callback] setSession error:', error);
					throw error;
				}
			} else if (tokens.id_token && tokens.access_token) {
				// 구글은 기존 방식 (signInWithIdToken)
				console.log('[Auth Callback] Using signInWithIdToken (Google)');
				const { data, error: signInError } = await supabase.auth.signInWithIdToken({
					provider: 'google',
					token: tokens.id_token,
					access_token: tokens.access_token
				});

				if (signInError) {
					console.error('[Auth Callback] signInWithIdToken error:', signInError);
					throw signInError;
				}

				if (!data.session) {
					throw new Error('세션 생성에 실패했습니다.');
				}
			} else {
				throw new Error('유효한 토큰을 찾을 수 없습니다.');
			}

			console.log('[Auth Callback] Session created successfully');
			const safeReturnTo = tokens.returnTo === '/login' ? '/' : tokens.returnTo || '/';
			window.location.href = safeReturnTo;
		} catch (e) {
			console.error('[Auth Callback] Error:', e);
			status = 'error';
			errorMessage = e instanceof Error ? e.message : '인증 처리 중 오류가 발생했습니다.';
		}
	});
</script>

{#if status === 'loading'}
	<div class="flex min-h-dvh items-center justify-center">
		<div class="text-center space-y-4">
			<div class="h-12 w-12 mx-auto animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
			<p class="text-sm text-gray-600">로그인 처리 중...</p>
		</div>
	</div>
{:else if status === 'error'}
	<div class="flex min-h-dvh items-center justify-center p-4">
		<div class="w-full max-w-sm text-center space-y-4">
			<div class="rounded-lg border border-red-200 bg-red-50 p-6">
				<p class="text-sm font-medium text-red-800">로그인 오류</p>
				<p class="mt-2 text-xs text-red-600">{errorMessage}</p>
			</div>
			<a
				href="/"
				class="inline-block rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
			>
				홈으로 돌아가기
			</a>
		</div>
	</div>
{/if}
