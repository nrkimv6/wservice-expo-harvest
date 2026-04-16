# React exhibition-loot-boss → Svelte expo-harvest UI 이식

> 작성일시: 2026-04-16 14:14
> 기준커밋: 2c15c99
> 대상 프로젝트: expo-harvest
> 상태: 구현중
> 진행률: 48/54 (89%)
> 요약: 랜딩 페이지만 있어 실제 파밍 UX 확인 불가 — AI 생성 React 프로토타입(exhibition-loot-boss)의 레이아웃/컴포넌트/타이포그래피/간격/인터랙션/접근성을 Svelte 5로 이식, 색상만 타겟 Pitch Black + Neon Orange 테마로 재매핑

---

## 개요

### 배경

- 타겟 프로젝트 `expo-harvest`는 PRD + 랜딩 페이지(`src/routes/+page.svelte`)만 있고 실제 파밍 UI가 없다.
- AI 디자인 도구(lovable/v0 추정)가 생성한 React 프로토타입 `exhibition-loot-boss-main.zip`에 Index 페이지 + 6개 컴포넌트가 모바일 우선 레이아웃으로 잘 구현되어 있다.
- 소스 테마는 **다크 네이비 + 골드**, 타겟 테마는 **Pitch Black + Neon Orange** — 색상만 타겟 가이드 유지, 나머지(레이아웃/간격/타이포/상호작용/a11y)는 그대로 이식하거나 한국어/접근성 맞게 보강.

### 이식 범위

| 유형 | 소스 (React) | 타겟 (Svelte) |
|------|-------------|---------------|
| 페이지 | `src/pages/Index.tsx` | `src/routes/app/+page.svelte` (신규 라우트) |
| 배너 | `components/AlertBanner.tsx` | `src/lib/components/AlertBanner.svelte` |
| 지도 | `components/ExhibitionMap.tsx` | `src/lib/components/ExhibitionMap.svelte` |
| 피드 | `components/LootFeed.tsx` | `src/lib/components/LootFeed.svelte` |
| 카드 | `components/LootCard.tsx` | `src/lib/components/LootCard.svelte` |
| 필터 | `components/FilterChips.tsx` | `src/lib/components/FilterChips.svelte` |
| 상세 | `components/BoothDetailSheet.tsx` | `src/lib/components/BoothDetailSheet.svelte` |
| 데이터 | `data/mockData.ts` | `src/lib/data/lootItems.ts` |

랜딩(`/`)은 유지. `/app`이 실제 파밍 화면.

---

## 기술적 고려사항

### 1. 색상 재매핑 (유일한 테마 변경)

| React 소스 토큰 | Svelte 타겟 값 | 비고 |
|----------------|---------------|------|
| `--primary` / `gold` / `gold-glow` | `orange` (#ff5e00 / dim #cc4b00 / glow #ff8b4d) | Neon Orange 포인트 |
| `--primary-foreground` | `#0a0a0a` | 오렌지 위 전경색 |
| `navy-deep` | #050505 | body 배경 (PRD) |
| `navy-surface` | #0f0f0f | 카드 배경 |
| `navy-elevated` | #1a1a1a | 입력/뱃지 배경 |
| `border` | `rgba(255,255,255,0.1)` | 공통 보더 |
| `foreground` | `#f6efe9` | 기본 텍스트 (기존 --eh-text 재사용) |
| `muted-foreground` | `rgba(255,255,255,0.5)` | 서브 텍스트 |
| `mint` / `mint-dim` | 유지 (#34d399 / #065f46) | 완료 의미색 |
| `secondary` | `rgba(255,255,255,0.05)` | 비활성 뱃지 |

**원칙**: 색상만 재매핑, 간격/radius/font-size/애니메이션 타이밍은 소스 그대로.

### 2. i18n 정책 (UI 문구 한국어화)

타겟은 한국 사용자 대상. 소스의 영어 UI 문구는 **전부 한국어 인라인 번역** (별도 i18n 라이브러리 도입 없이 각 컴포넌트에 한글 문자열). mock 데이터(boothName/mission/prize)는 **구조 확인용으로 영어 유지** — 실제 한국 박람회 데이터는 별도 plan에서.

| 소스 문구 | 한국어 번역 |
|----------|------------|
| `Exhibition Loot Tracker` | `박람회 파밍 트래커` |
| `Farm all the freebies. Miss nothing.` | `박람회 사은품, 하나도 놓치지 마세요` |
| `12 minutes left until NVIDIA Roulette event! → Hall A-12` | `NVIDIA 룰렛 이벤트 12분 전 → Hall A-12` |
| `Exhibition Map` | `전시장 지도` |
| `Loot Feed` | `파밍 목록` |
| `{n}/{m} Farmed` | `{n}/{m} 완료` |
| `Search booths or prizes...` | `부스·경품 검색…` |
| `No loot matches your search.` | `검색 결과가 없습니다` |
| `Prize` | `경품` |
| `Mission` | `미션` |
| `Personal Memo` | `메모` |
| `Tips, notes, reminders...` | `현장 팁·메모…` |
| `Bookmark` / `Saved` | `찜하기` / `찜 완료` |
| `Mark Farmed` / `Farmed ✓` | `완료 처리` / `완료 ✓` |
| FilterChips 카테고리 (이번 단계 **영문 유지** — mock 데이터와 매칭) | Time Attack, Instagram, App Install, Survey, Free, Raffle 그대로 |

### 3. 타이포그래피 한글 호환성

소스의 `font-heading` = Space Grotesk는 라틴 전용. 한글은 fallback으로 IBM Plex Sans KR 렌더.

| 소스 패턴 | 이식 규칙 |
|----------|---------|
| `uppercase tracking-widest` / `tracking-wider` on 한글 | **한글 텍스트에선 uppercase·tracking-wider 제거** (의미 없음 + 자간 벌어지면 판독성 저하). `tracking-normal` 또는 생략 |
| `uppercase tracking-widest` on 라틴/숫자 (예: "Hall A", "A-12", "MVP") | 유지 |
| `text-[10px]` 한글 라벨 | **`text-[11px]`로 상향** (한글 최소 가독성) |
| `text-xs` (12px) 이하 한글 본문 | `text-xs` 유지하되 핵심 라벨 외엔 `text-sm` 권장 |
| `font-heading font-semibold` | 한글에 적용 시 자동으로 IBM Plex Sans KR semibold. 유지 |
| `leading-tight` | 한글에서 너무 타이트 → `leading-snug` 또는 기본값. 카드 제목은 유지 |

### 4. 레이아웃 간섭 (전역 `+layout.svelte` 점검)

현재 `src/routes/+layout.svelte`는 모든 라우트에 다음을 주입:
- `<div class="min-h-dvh bg-[radial-gradient(...orange..), linear-gradient(#060606→#111111)] text-white">`
- 우측 하단 `v{__APP_VERSION__}` 워터마크

이식 시:
- `/app/+page.svelte`는 이 전역 배경을 **상속** — `max-w-lg mx-auto` 중앙 정렬 시 좌우는 orange 방사 그라데이션이 보이고 가운데만 Pitch Black 앱 컬럼. 랜딩과 톤 일관성 유지용.
- **BoothDetailSheet는 `fixed inset-0 z-50`** — 전역 레이아웃을 덮으므로 간섭 없음. 다만 `z-50`이 워터마크(`fixed bottom-2 right-3`, default z) 위에 렌더되는지 시각 확인.
- `/app`이 Pitch Black 단일 배경을 원하면 `src/routes/app/+layout.svelte`를 추가해 전역 그라데이션을 재정의. **이번 이식은 상속 유지**가 기본, 구현 후 육안 판단.

### 5. 접근성 (Svelte a11y 경고 대응 + WCAG)

Svelte-check는 a11y 경고를 내므로 소스에 없어도 필수 보강:

| 요소 | 속성 |
|------|------|
| `BoothDetailSheet` 바깥 div | `role="dialog" aria-modal="true" aria-labelledby="sheet-title-{item.id}"` |
| 시트 제목 `<h2>` | `id="sheet-title-{item.id}"` |
| 닫기 버튼 | `aria-label="상세 닫기"` |
| 백드롭 (클릭 닫기) | `<div>` 대신 `<button type="button" aria-label="배경 클릭으로 닫기">` 또는 tabindex=-1 + role=presentation 중 경고 안 나는 패턴 선택 |
| `ExhibitionMap` 핀 버튼 | `aria-label="{boothName} 상세 보기"` |
| `LootCard` 체크 토글 | `aria-label={item.isCompleted ? '미완료로 변경' : '완료 처리'}` + `aria-pressed={item.isCompleted}` |
| `AlertBanner` | `role="status" aria-live="polite"` |
| `FilterChips` 버튼 | `aria-pressed={isActive}` |
| `textarea` | `id="memo-{item.id}"` + 숨김 `<label>` 또는 `aria-label="부스 메모"` |

키보드:
- Escape로 시트 닫기 (`svelte:window onkeydown`)
- 시트 열릴 때 body scroll lock (`$effect`로 `document.body.style.overflow`)
- 시트 열릴 때 첫 포커스 가능 요소(닫기 버튼)로 포커스 이동 (`$effect` + ref via `bind:this`)

### 6. border-radius 정책

- 이식 컴포넌트는 **소스 값 유지**: `rounded-xl`(0.75rem / 카드·입력·뱃지), `rounded-2xl`(1rem / 시트), `rounded-full`(필터칩·핀), `rounded-md`(0.375rem / 작은 뱃지)
- 타겟 랜딩의 거대 radius(`rounded-[32px]`, `rounded-[28px]`)는 **랜딩 hero 전용**으로 구분. 이식 컴포넌트가 랜딩과 시각적으로 섞일 일 없음(라우트 분리).

### 7. safe-area 적용

타겟 `app.css`에 `.safe-top/bottom/left/right` 유틸 이미 정의됨:
- `/app/+page.svelte` 최상위 container: `safe-top safe-bottom` 적용 (AlertBanner 상단 노치 회피, 바텀 시트 하단 홈바 회피)
- BoothDetailSheet 내부 `pb-8` → `pb-[max(2rem,env(safe-area-inset-bottom))]`

### 8. 인터랙션 타이밍 (소스 값 그대로)

| 컴포넌트 | 패턴 |
|---------|------|
| LootCard | `transition-all duration-200` + `active:scale-90` on 토글 버튼 |
| FilterChips | `transition-all duration-150 active:scale-95` |
| LootCard 토글 | `active:scale-90 transition-transform` |
| ExhibitionMap 핀 | `transition-all duration-200 active:scale-90` |
| BoothDetailSheet 닫기/액션 | `active:scale-90` / `active:scale-95 transition-all` |
| Tooltip (핀) | `group-active:opacity-100 transition-opacity` (mobile 터치 피드백) |
| AlertBanner Zap | `animate-pulse-glow` (2s ease-in-out infinite) |
| Ticker | `animate-ticker` (12s linear infinite, 100% → -100%) |
| Sheet 진입/퇴장 | Svelte `fly` transition `{ y: 400, duration: 300, easing: cubicOut }` |

### 9. viewport / meta 점검

`src/app.html` 현재:
- ✓ `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />`
- ✓ `<html lang="ko">`
- ✓ `<body style="background-color: #050505">`
- ✗ **theme-color 누락** → `<meta name="theme-color" content="#050505" />` 추가 (모바일 브라우저 상단바)

### 10. Svelte 5 변환 관용 표현

| React | Svelte 5 |
|-------|---------|
| `useState<T>(init)` | `let x = $state<T>(init)` |
| 파생 | `const y = $derived(expr)` |
| `({prop}: Props) =>` | `let { prop, ...rest }: Props = $props()` |
| `className` | `class` |
| `onClick` / `onChange` (input) | `onclick` / `oninput` |
| `{cond && <X/>}` | `{#if cond}<X/>{/if}` |
| `.map(x => <X/>)` | `{#each a as x (x.id)}<X/>{/each}` |
| `@/data/...` | `$lib/data/...` |
| `lucide-react` | `lucide-svelte` (이미 설치됨 · 동일 아이콘 이름 존재 확인 완료: Clock, Zap, MapPin, Bookmark, CheckCircle2, Circle, Gift, X, Scroll, MessageSquare, Search) |
| `ref={el}` | `bind:this={el}` |
| 콜백 prop 유지 (`onToggleComplete(id)`) — Svelte 5의 양방향 `$bindable` 대신 원본의 단방향 콜백 패턴 유지 |

### 11. 테스트 전략

- 타겟에 vitest/testing-library **미설치** → 컴포넌트 단위 테스트는 이번 이식 범위 **제외**
- 검증은 `svelte-check` (타입/a11y) + `vite build` + 브라우저 육안(인터랙션 체크리스트) + 키보드 접근성

### 12. 상태 & 데이터

- React `Index.tsx`의 최상위 `useState<LootItem[]>` + `useState<string|null>` 2개를 Svelte `$state` 2개로 이식
- PRD의 localStorage 영속화/debounce는 **이번 범위 아님** (별도 plan)
- 이식 단계에서는 메모리 상태만, 새로고침 시 `initialLootItems`로 리셋

---

## TODO

### Phase 0: 선행 점검 (코드 미수정)

1. [x] **전역 레이아웃 간섭 점검** — `+layout.svelte` 영향 분석
   - [x] `src/routes/+layout.svelte`의 radial-gradient 배경이 `/app` 컬럼(`max-w-lg mx-auto`)과 시각적으로 어울리는지 판단 기준 수립 (어울리면 상속, 아니면 `/app/+layout.svelte` 추가 결정 근거 기록)
   - [x] `v{__APP_VERSION__}` 워터마크(`fixed bottom-2 right-3`)가 `BoothDetailSheet z-50` 아래에 보이는지 z-index 관계 확인

2. [x] **app.html 메타 보강** — theme-color 추가
   - [x] `src/app.html`: `<meta name="theme-color" content="#050505" />`를 viewport 바로 아래에 추가

### Phase 1: 디자인 토큰 & 데이터 기반

3. [x] **Tailwind 색상 팔레트 확장** — React 토큰명을 타겟 Pitch Black+Orange 값으로 재매핑
   - [x] `tailwind.config.js`: `theme.extend.colors`에 `orange: {DEFAULT: '#ff5e00', dim: '#cc4b00', glow: '#ff8b4d'}`, `navy: {deep: '#050505', surface: '#0f0f0f', elevated: '#1a1a1a'}`, `mint: {DEFAULT: '#34d399', dim: '#065f46'}`, `border: 'rgba(255,255,255,0.1)'`, `foreground: '#f6efe9'`, `muted-foreground: 'rgba(255,255,255,0.5)'` 추가
   - [x] `tailwind.config.js`: `theme.extend.fontFamily.heading = ['"Space Grotesk"', '"IBM Plex Sans KR"', 'system-ui', 'sans-serif']` 추가 (소스 `font-heading` 대응)

4. [x] **app.css 유틸리티 & 키프레임 추가** — 소스 index.css의 ticker/glow/pulse 유틸 이관
   - [x] `src/app.css`: `@keyframes pulse-glow` 추가 (0,100%: opacity 1 / 50%: opacity 0.7)
   - [x] `src/app.css`: `@keyframes ticker-linear` 추가 (0% translateX(100%) → 100% translateX(-100%)) **기존 `.ticker-track`은 랜딩 전용으로 유지**, 신규 `.animate-ticker`는 ticker-linear 12s linear infinite
   - [x] `src/app.css`: `@layer utilities`에 `.animate-pulse-glow` (2s ease-in-out infinite), `.glow-orange` (box-shadow 0 0 20px rgba(255,94,0,0.3), 0 0 60px rgba(255,94,0,0.1)), `.glow-mint` (0 0 15px rgba(52,211,153,0.3)), `.no-scrollbar` (`scrollbar-width: none; &::-webkit-scrollbar{display:none}`) 추가
   - [x] `src/app.css`: `@keyframes slide-in-from-bottom` + `.animate-sheet-in` 유틸 추가 (BoothDetailSheet Svelte transition 보조용. fly transition 사용 시 생략 가능 — 구현 시 결정)

5. [x] **데이터 타입 & mock 데이터 이식** — LootItem 타입 + CATEGORIES + initialLootItems 8건
   - [x] `src/lib/data/lootItems.ts`: `LootCategory` 유니온 타입, `LootItem` 인터페이스, `CATEGORIES` 배열, `initialLootItems: LootItem[]` 8건 — React `mockData.ts` 내용 **영어 그대로 유지** (mock 구조 검증용)

### Phase 2: 원자 컴포넌트 이식

6. [x] **FilterChips.svelte** — 카테고리 다중선택 칩 (의존성 없음)
   - [x] `src/lib/components/FilterChips.svelte`: `{ active: LootCategory[]; onToggle: (c: LootCategory) => void }` props ($props), `chipIcons` 맵 6종, `{#each CATEGORIES as cat}`, 활성(`bg-orange text-black glow-orange`) / 비활성(`bg-navy-elevated text-muted-foreground border border-border`), `aria-pressed={isActive}`, 가로 스크롤(`.no-scrollbar overflow-x-auto`), `transition-all duration-150 active:scale-95`

7. [x] **AlertBanner.svelte** — 단일 메시지 티커 배너
   - [x] `src/lib/components/AlertBanner.svelte`: `{ message: string }` props, `role="status" aria-live="polite"`, 컨테이너 `bg-gradient-to-r from-orange via-orange-glow to-orange`, Zap 아이콘(`animate-pulse-glow text-black shrink-0`) + 메시지 span(`animate-ticker font-heading font-semibold text-sm text-black whitespace-nowrap`) + 인라인 Clock 아이콘

8. [x] **LootCard.svelte** — 리스트 아이템 카드 (3상태)
   - [x] `src/lib/components/LootCard.svelte`: `{ item: LootItem; onToggleComplete; onSelect }` props, `const isTimeLimited = $derived(item.time !== 'Always')`, 좌측 토글 버튼(`aria-label={item.isCompleted ? '미완료로 변경' : '완료 처리'} aria-pressed={item.isCompleted}`, CheckCircle2/Circle, `active:scale-90 transition-transform`), 콘텐츠 버튼(`onclick={() => onSelect(item.id)}`), 시간 뱃지(시간제한=`bg-orange/15 text-orange` / Always=`bg-white/5 text-muted-foreground`), 카테고리(라틴 유지 `uppercase tracking-wider text-[10px]`), 제목(한글 대비 `leading-snug`, 완료 시 `line-through text-muted-foreground`), 상품(Gift+오렌지), 위치(MapPin+muted, 한글인 경우 `text-[11px]`), 북마크 삼각형 인디케이터, 상태별 테두리/배경 분기

### Phase 3: 조합 컴포넌트 이식

9. [x] **LootFeed.svelte** — 검색 + 필터 + 정렬된 리스트
   - [x] `src/lib/components/LootFeed.svelte`: `{ items; onToggleComplete; onSelectItem }` props, `let search = $state('')` + `let activeFilters = $state<LootCategory[]>([])`, `const filtered = $derived(items.filter(...))`, `const sorted = $derived([...filtered].sort(...))`, `const doneCount = $derived(items.filter(i => i.isCompleted).length)`, 헤더 라벨 "파밍 목록" + 카운터 "`{doneCount}/{items.length} 완료`"(오렌지), 검색 input(placeholder="부스·경품 검색…" aria-label="검색", `focus:ring-1 focus:ring-orange/50`), FilterChips 조합, `{#each sorted as item (item.id)}<LootCard/>{/each}`, 빈 상태 "검색 결과가 없습니다"

10. [x] **ExhibitionMap.svelte** — 이미지 맵 + 핀 오버레이
    - [x] `src/lib/components/ExhibitionMap.svelte`: `{ items; onPinClick }` props, 헤더 "전시장 지도"(영문 라벨은 제거, 한글로), `aspect-[16/10] bg-navy-surface rounded-xl border border-border overflow-hidden relative`, 8×12 그리드 오버레이(`{#each Array(8) as _, i}<div style="top:{(i+1)*11.1}%"/>{/each}`), Hall A/B/C 라벨(라틴 유지 `uppercase tracking-widest text-[10px]`), 핀 버튼(`style:left="{item.mapX}%" style:top="{item.mapY}%"` + `aria-label="{item.boothName} 상세 보기"`, 상태별 배경 `bg-mint/20 border-mint/40` / `bg-orange/20 border-orange/60 glow-orange` / `bg-navy-elevated border-border`, 아이콘 분기 CheckCircle2/Bookmark/MapPin, `transition-all duration-200 active:scale-90`), group-active 툴팁(`opacity-0 group-active:opacity-100 transition-opacity pointer-events-none`)

11. [x] **BoothDetailSheet.svelte** — 바텀 시트 모달 (a11y/인터랙션 보강은 Phase 4.5에서 보강)
    - [x] `src/lib/components/BoothDetailSheet.svelte`: `{ item: LootItem | null; onClose; onToggleBookmark; onToggleComplete; onMemoChange }` props, `{#if item}` 가드, 루트 `fixed inset-0 z-50 flex items-end justify-center`, 백드롭(`bg-navy-deep/80 backdrop-blur-sm`, 클릭 시 onClose), 시트 컨테이너(`max-w-lg bg-navy-surface border-t border-border rounded-t-2xl p-5 pb-[max(2rem,env(safe-area-inset-bottom))] max-h-[85vh] overflow-y-auto`, Svelte `transition:fly={{ y: 400, duration: 300 }}` 적용), 핸들 막대, 닫기 버튼(`aria-label="상세 닫기"`), 헤더(시간 뱃지/카테고리/제목 h2/위치), Prize 박스(`bg-orange/10 border-orange/20`, 라벨 "경품"), Mission 박스(`bg-navy-elevated`, 라벨 "미션"), Memo textarea(`aria-label="부스 메모" placeholder="현장 팁·메모…" value={item.memo} oninput={(e) => onMemoChange(item.id, e.currentTarget.value)} focus:ring-1 focus:ring-orange/50`), 액션 버튼 2개("찜하기/찜 완료", "완료 처리/완료 ✓", 각 `active:scale-95 transition-all`)

### Phase 4: 라우트 & 페이지 구성

12. [x] **앱 메인 라우트 생성** — /app 경로 신규
    - [x] `src/routes/app/+page.svelte`: 6개 컴포넌트 + `initialLootItems` import, `let items = $state<LootItem[]>(initialLootItems)` + `let selectedId = $state<string|null>(null)`, `const selectedItem = $derived(items.find(i => i.id === selectedId) ?? null)`, `toggleComplete/toggleBookmark/updateMemo` 함수(map 불변 갱신), 루트 컨테이너(`min-h-dvh bg-navy-deep pb-8 max-w-lg mx-auto safe-top safe-bottom`), `<svelte:head><title>박람회 파밍 | expo-harvest</title></svelte:head>`, AlertBanner("NVIDIA 룰렛 이벤트 12분 전 → Hall A-12") → 헤더(`<h1>🗡️ 박람회 파밍 트래커</h1><p>박람회 사은품, 하나도 놓치지 마세요</p>`) → ExhibitionMap → 구분선 → LootFeed → BoothDetailSheet 순서
    - [x] `src/routes/app/+page.svelte`: (Phase 0 점검 결과에 따라) 전역 그라데이션 배경이 어울리지 않으면 `src/routes/app/+layout.svelte` 생성해 `<div class="bg-navy-deep min-h-dvh">{@render children()}</div>`로 격리 — Phase 0에서 결정된 경우에만 수행, 아니면 생략

13. [x] **랜딩 페이지에 /app 진입 CTA 추가** — 파밍 화면 이동 버튼
    - [x] `src/routes/+page.svelte`: "다음 단계 후보" 카드 내부 또는 "Current Build Scope" 섹션 하단에 `<a href="/app" class="inline-flex items-center gap-2 rounded-full bg-[#ff5e00] px-5 py-3 text-sm font-semibold text-black active:scale-95 transition-transform">파밍 화면 열기 →</a>` 1개 추가

### Phase 4.5: 접근성 & 모달 UX 보강

14. [x] **BoothDetailSheet a11y 속성** — role/aria-* + 포커스 이동
    - [x] `src/lib/components/BoothDetailSheet.svelte`: 시트 컨테이너에 `role="dialog" aria-modal="true" aria-labelledby="sheet-title-{item.id}"`, 제목 `<h2 id="sheet-title-{item.id}">` 부여
    - [x] `src/lib/components/BoothDetailSheet.svelte`: 닫기 버튼에 `bind:this={closeBtn}` + `$effect(() => { if (item) closeBtn?.focus(); })`로 시트 진입 시 포커스 이동
    - [x] `src/lib/components/BoothDetailSheet.svelte`: 백드롭은 `<button type="button" aria-label="배경 클릭으로 닫기" class="absolute inset-0 ...">` 또는 div + role/tabindex 중 svelte-check 경고 없는 쪽 채택(구현 시 결정 + 주석)

15. [x] **모달 동작 보강** — Escape + body scroll lock
    - [x] `src/lib/components/BoothDetailSheet.svelte`: `<svelte:window onkeydown={(e) => { if (item && e.key === 'Escape') onClose(); }} />`로 Escape 닫기
    - [x] `src/lib/components/BoothDetailSheet.svelte`: `$effect(() => { if (!item) return; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = ''; }; })`로 시트 열릴 때 body 스크롤 잠금 (SSR guard: `if (typeof document === 'undefined') return;`)

16. [x] **핀·카드·배너 aria 속성 최종 점검** — 각 컴포넌트 보강 후 확인
    - [x] `ExhibitionMap.svelte`: 핀 버튼의 `aria-label="{boothName} — {상태}"` 동적 구성(상태: "완료"/"찜"/"기본")
    - [x] `LootCard.svelte`: 체크 토글 `aria-label`/`aria-pressed`, 콘텐츠 버튼 `aria-label="{boothName} 상세 보기"`
    - [x] `AlertBanner.svelte`/`FilterChips.svelte`: `role="status"` / `aria-pressed` 최종 확인

### Phase 5: 검증

17. [x] **타입 체크 통과** — svelte-check 에러 0 + a11y 경고 확인
    - [x] `npm run check`: 에러 0개 확인
    - [x] a11y 경고: 0 또는 의도적 억제 경고만 (해당 경고에 주석으로 근거 기재)

18. [x] **프로덕션 빌드 성공** — vite build
    - [x] `npm run build`: 빌드 성공. Cloudflare adapter 관련 경고는 허용

19. [ ] **브라우저 육안 검증** — /app 인터랙션 8종
    - [ ] `npm run dev` 후 `http://localhost:5173/app`: AlertBanner 티커 좌→우 스크롤 / ExhibitionMap 핀 8개 표시 / 핀 클릭 시 BoothDetailSheet 열림 / LootFeed 검색 입력 실시간 필터링 / FilterChips 다중선택 / LootCard 체크 토글 시 opacity 60% 전환 / BoothDetailSheet에서 찜하기·완료 처리 동작 / Memo textarea 입력 반영 — 8개 모두 동작
    - [ ] 모바일 viewport(360×800 · DevTools Device Mode)에서 `max-w-lg` 컬럼이 중앙 정렬 + 상·하 safe-area 확보 확인

20. [ ] **키보드 접근성 검증** — Escape/Tab 순회
    - [ ] Tab 키로 검색 → 필터 칩 → 카드 내 토글/콘텐츠 → 핀 → 시트 내 요소 순회 가능
    - [ ] 시트 열린 상태에서 Escape 누르면 닫힘, 백드롭 포커스 시 스페이스/엔터로도 닫힘

---

## 🔴 백엔드/Python 변경 없음

이식 대상은 Svelte 프론트엔드 컴포넌트 + 라우트 + Tailwind 설정 + CSS. Python 코드 수정 없음 → **T1~T5 pytest Phase 해당 없음**. 검증은 Phase 5 (svelte-check + vite build + 브라우저 육안 + 키보드 a11y).

---

## 검증 (프론트엔드 기준)

### 실행 명령

```powershell
cd "D:\work\project\service\wtools\expo-harvest"
npm run check
npm run build
npm run dev
```

- `npm run check`: 에러 0, a11y 경고 0 (억제 시 주석)
- `npm run build`: `.svelte-kit/output` 정상 생성
- `npm run dev`: `/app` 라우트 200 + 6개 컴포넌트 렌더 + 인터랙션 8종 + 키보드 a11y

### 검증 기준 (참고 — TODO Phase 5와 동일, 진행률 카운트 제외)

- svelte-check 에러 0 / a11y 경고 0
- vite build 성공
- 랜딩(`/`)이 기존과 동일하게 렌더 (이식 작업이 랜딩 레이아웃을 깨뜨리지 않음)
- `/app`에서 인터랙션 8종 모두 동작
- Escape로 시트 닫힘, Tab 포커스 순회 정상
- 모바일 viewport(360×800)에서 safe-area + `max-w-lg` 중앙 정렬 확인

---

*상태: 구현중 | 진행률: 48/54 (89%)*
