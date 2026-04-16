<script lang="ts">
	import {
		AlarmClockCheck,
		ChartNoAxesCombined,
		MapPinned,
		Search,
		NotebookPen,
		Radio
	} from 'lucide-svelte';

	const alertItems = [
		'13:40 A-102 룰렛 10분 전',
		'14:00 C-221 선착순 키트 오픈',
		'14:20 B-118 인스타 업로드 인증 마감'
	];

	const featureCards = [
		{
			icon: AlarmClockCheck,
			title: '실시간 파밍 알림',
			body: '상단 티커로 임박 이벤트를 빠르게 훑고, 타임어택 순서를 먼저 잡습니다.'
		},
		{
			icon: MapPinned,
			title: '지도 기반 동선 확인',
			body: '전시장 이미지 맵 위에서 이벤트 부스만 먼저 강조하고, 바텀 시트로 핵심 보상을 바로 확인합니다.'
		},
		{
			icon: Search,
			title: '허들 기준 필터링',
			body: '시간제한, SNS 업로드, 앱 설치, 회원가입 같은 미션 허들로 탐색 밀도를 줄입니다.'
		},
		{
			icon: NotebookPen,
			title: '로컬 메모와 완료 관리',
			body: '해시태그, 현장 팁, 지급 위치 메모를 남기고 완료 부스를 흐리게 분리합니다.'
		}
	];

	const valueProps = [
		'한 손 조작을 전제로 한 모바일 우선 레이아웃',
		'Pitch Black + Neon Orange 톤으로 시간 압박감 강조',
		'오프라인 진입을 고려한 캐시 우선 구조'
	];
</script>

<svelte:head>
	<title>expo-harvest | 박람회 이벤트 파밍</title>
	<meta
		name="description"
		content="박람회 부스 이벤트를 시간순으로 탐색하고, 지도 기반 동선과 메모로 파밍 효율을 높이는 모바일 우선 웹앱"
	/>
</svelte:head>

<div class="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 pb-16 pt-6 sm:px-6 lg:px-8">
	<div class="mb-6 overflow-hidden rounded-full border border-[#ff5e00]/35 bg-black/45 py-2">
		<div class="ticker-track flex min-w-max gap-8 px-4 text-[11px] font-medium uppercase tracking-[0.22em] text-[#ff8b4d]">
			{#each [...alertItems, ...alertItems] as item}
				<span class="whitespace-nowrap">{item}</span>
			{/each}
		</div>
	</div>

	<section class="grid gap-6 lg:grid-cols-[1.25fr_0.9fr]">
		<div class="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_24px_60px_rgba(0,0,0,0.45)] sm:p-8">
			<div class="mb-5 inline-flex items-center gap-2 rounded-full border border-[#ff5e00]/35 bg-[#ff5e00]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#ff9a66]">
				<Radio size={14} />
				Offline-Ready MVP
			</div>

			<h1 class="max-w-3xl font-['Space_Grotesk'] text-4xl font-bold leading-none text-white sm:text-5xl">
				박람회 현장에서
				<span class="block text-[#ff5e00]">이벤트 파밍 효율을 극대화하는 화면</span>
			</h1>

			<p class="mt-5 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
				`expo-harvest`는 선착순 이벤트, SNS 인증 미션, 사은품 수령 동선을 한 화면에서 빠르게
				정리하기 위한 모바일 우선 웹앱입니다. 지금 단계에서는 제품 톤과 정보 구조를 먼저 고정하고,
				다음 단계에서 지도, 리스트, 메모, 실시간 배너를 연결합니다.
			</p>

			<div class="mt-8 grid gap-3 sm:grid-cols-3">
				{#each valueProps as item}
					<div class="rounded-2xl border border-white/8 bg-black/35 px-4 py-4 text-sm text-white/75">
						{item}
					</div>
				{/each}
			</div>
		</div>

		<div class="rounded-[32px] border border-[#ff5e00]/20 bg-[#151515] p-6 shadow-[0_18px_48px_rgba(0,0,0,0.4)]">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-xs uppercase tracking-[0.28em] text-white/45">Preview Stack</p>
					<h2 class="mt-2 font-['Space_Grotesk'] text-2xl font-semibold text-white">Core Loop</h2>
				</div>
				<div class="rounded-full border border-[#ff5e00]/30 bg-[#ff5e00]/10 px-3 py-1 text-xs font-semibold text-[#ff9a66]">
					MVP
				</div>
			</div>

			<div class="mt-6 space-y-3">
				<div class="rounded-2xl border border-white/8 bg-black/30 p-4">
					<div class="flex items-center gap-3">
						<AlarmClockCheck class="text-[#ff5e00]" size={20} />
						<div>
							<p class="text-sm font-semibold text-white">시간 임박 이벤트 먼저 확인</p>
							<p class="text-xs text-white/55">선착순, 룰렛, 타임세일형 이벤트 우선 노출</p>
						</div>
					</div>
				</div>

				<div class="rounded-2xl border border-white/8 bg-black/30 p-4">
					<div class="flex items-center gap-3">
						<MapPinned class="text-[#ff5e00]" size={20} />
						<div>
							<p class="text-sm font-semibold text-white">지도와 리스트를 교차 탐색</p>
							<p class="text-xs text-white/55">부스 위치, 경품, 미션 허들을 한 번에 확인</p>
						</div>
					</div>
				</div>

				<div class="rounded-2xl border border-white/8 bg-black/30 p-4">
					<div class="flex items-center gap-3">
						<ChartNoAxesCombined class="text-[#ff5e00]" size={20} />
						<div>
							<p class="text-sm font-semibold text-white">완료/관심 상태로 파밍 밀도 제어</p>
							<p class="text-xs text-white/55">완료 부스 흐림 처리, 관심 부스 재집중</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<section class="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
		{#each featureCards as feature}
			<div class="rounded-[28px] border border-white/8 bg-white/[0.035] p-5">
				<feature.icon class="text-[#ff5e00]" size={22} />
				<h3 class="mt-5 font-['Space_Grotesk'] text-xl font-semibold text-white">{feature.title}</h3>
				<p class="mt-3 text-sm leading-6 text-white/65">{feature.body}</p>
			</div>
		{/each}
	</section>

	<section class="mt-8 rounded-[32px] border border-white/8 bg-black/25 p-6 sm:p-8">
		<p class="text-xs uppercase tracking-[0.28em] text-white/45">Current Build Scope</p>
		<div class="mt-4 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
			<div>
				<h2 class="font-['Space_Grotesk'] text-2xl font-semibold text-white">이번 구현에서 끝내는 것</h2>
				<ul class="mt-4 space-y-3 text-sm leading-7 text-white/70">
					<li>`/app` 실제 파밍 화면 라우트 추가</li>
					<li>부스 데이터 모델, 지도 핀, 리스트/검색/필터 연결</li>
					<li>관심/완료/메모 상태를 localStorage에 저장</li>
					<li>상세 바텀시트와 현장용 모바일 레이아웃 정리</li>
				</ul>
			</div>

			<div class="rounded-3xl border border-[#ff5e00]/15 bg-[#ff5e00]/[0.06] p-5">
				<p class="text-sm font-semibold text-[#ffae80]">다음 단계 후보</p>
				<ul class="mt-4 space-y-3 text-sm text-white/72">
					<li>Supabase 실데이터와 Realtime 배너 연결</li>
					<li>전시장 이미지 맵 + 핀치줌 교체</li>
					<li>PWA 캐시와 오프라인 진입 정리</li>
					<li>auth-worker 등록 및 운영 origin 반영</li>
				</ul>

				<a
					href="/app"
					class="mt-5 inline-flex items-center justify-center rounded-2xl bg-[#ff5e00] px-4 py-3 text-sm font-semibold text-black transition hover:bg-[#ff8b4d]"
				>
					파밍 화면 열기
				</a>
			</div>
		</div>
	</section>
</div>
