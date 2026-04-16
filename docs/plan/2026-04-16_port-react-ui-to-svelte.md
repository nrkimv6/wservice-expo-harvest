# React exhibition-loot-boss → Svelte expo-harvest UI 이식

> 작성일시: 2026-04-16 14:14
> 기준커밋: e2923b9
> 대상 프로젝트: expo-harvest
> 상태: 초안
> 진행률: 0/32 (0%)
> 요약: 랜딩 페이지만 있어 실제 파밍 UX 확인 불가 — AI 생성 React 프로토타입(exhibition-loot-boss)의 레이아웃/컴포넌트/타이포그래피/간격을 Svelte 5로 이식, 색상만 타겟 Pitch Black + Neon Orange 테마로 재매핑

---

## 개요

### 배경

- 타겟 프로젝트 `expo-harvest`는 PRD + 랜딩 페이지(`src/routes/+page.svelte`)만 있고 실제 파밍 UI가 없다.
- AI 디자인 도구(lovable/v0 추정)가 생성한 React 프로토타입 `exhibition-loot-boss-main.zip`에 Index 페이지 + 6개 컴포넌트가 모바일 우선 레이아웃으로 잘 구현되어 있다.
- 소스 테마는 **다크 네이비 + 골드**, 타겟 테마는 **Pitch Black + Neon Orange** — 색상만 타겟 가이드 유지, 나머지(레이아웃/간격/타이포/상호작용)는 그대로 이식.

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

### 색상 재매핑 규칙

| React 소스 토큰 | Svelte 타겟 대응 | 비고 |
|----------------|-----------------|------|
| `--primary` / `gold` / `gold-glow` | `orange` (#ff5e00 / dim #cc4b00 / glow #ff8b4d) | Neon Orange 포인트 |
| `--primary-foreground` | 블랙(#0a0a0a) | 오렌지 위 전경색 |
| `navy-deep` | #050505 | body 배경 (PRD에 명시) |
| `navy-surface` | #0f0f0f | 카드 배경 |
| `navy-elevated` | #1a1a1a | 입력/뱃지 배경 |
| `border` | `rgba(255,255,255,0.1)` | 공통 보더 |
| `foreground` | `#f6efe9` | 기본 텍스트(app.css 기존 --eh-text 재사용) |
| `muted-foreground` | `rgba(255,255,255,0.5)` | 서브 텍스트 |
| `mint` / `mint-dim` | 유지 (#34d399 / #065f46) | 완료 상태 의미색 — 테마와 분리, 상태 가독성 위해 녹색 유지 |
| `destructive` | (이번 이식에서는 미사용) | — |
| `secondary` | `bg-white/5` | 비활성 뱃지 |

> **원칙**: 색상은 재매핑하지만 **간격/border-radius/font-size/폰트/애니메이션 타이밍/레이아웃 구조는 소스 그대로** 유지.

## 기술적 고려사항

### React → Svelte 5 변환 표

| React | Svelte 5 |
|-------|----------|
| `useState<T>(init)` | `let x = $state<T>(init)` |
| 파생 계산 (렌더링 중) | `$derived()` |
| `({prop}: Props) =>` | `let { prop }: Props = $props()` |
| `className` | `class` |
| `onClick={fn}` | `onclick={fn}` |
| `onChange={fn}` (input) | `oninput={fn}` |
| `{cond && <X/>}` | `{#if cond}<X/>{/if}` |
| `{a.map(x => <X/>)}` | `{#each a as x (x.id)}<X/>{/each}` |
| `@/data/...` import | `$lib/data/...` |
| `lucide-react` | `lucide-svelte` (이미 설치됨) |
| `e.stopPropagation()` | `onclick={(e) => { e.stopPropagation(); ... }}` |

### 상태 관리

- React `Index.tsx`는 최상위에서 `useState<LootItem[]>` + `useState<string|null>` 2개로 모든 상태를 들고 있다.
- Svelte 이식에서도 동일하게 `/app/+page.svelte`에 `let items = $state(initialLootItems)` + `let selectedId = $state<string|null>(null)` 2개로 시작.
- PRD의 localStorage 영속화는 **이번 이식 범위 아님** (별도 plan에서 진행). 이식 단계에서는 메모리 상태만.

### 애니메이션

- 소스의 `@keyframes ticker-scroll` (100% → -100%)와 타겟 기존 `@keyframes ticker-scroll` (0 → -50%)가 다르다. 소스 방식은 2회 복제 없이 단일 컨텐츠로 돌릴 때 쓴다.
- AlertBanner는 **단일 메시지**를 받아 돌리므로 소스 방식(100% → -100%)이 맞다. 타겟 기존 랜딩은 배열을 2회 복제해 돌리므로 그대로 두고, **새 컴포넌트 전용 클래스명을 분리**(`.animate-ticker-scroll` 등)하거나 기존 `.animate-ticker`를 소스 방식으로 통일.
- 통일 방향: `.animate-ticker` = 100% → -100% (소스 방식). 기존 랜딩은 배열 2회 복제 구조이므로 0 → -50%를 유지해야 하므로 **랜딩은 별도 `.ticker-track` 클래스로 유지**, 신규 `AlertBanner`는 `.animate-ticker` 신설.

### 아이콘 매핑 (lucide-react → lucide-svelte)

동일 이름이 모두 존재한다: `Clock`, `Zap`, `MapPin`, `Bookmark`, `CheckCircle2`, `Circle`, `Gift`, `X`, `Scroll`, `MessageSquare`, `Search`.

### 시트 애니메이션

- 소스의 `animate-in slide-in-from-bottom duration-300`은 `tailwindcss-animate` 플러그인 문법. 타겟에는 해당 플러그인이 없다.
- 대응: `app.css`에 `@keyframes slide-in-from-bottom` + `.animate-sheet-in` 유틸을 추가하거나, Svelte transition(`fly`)을 사용. **Svelte transition 사용 권장** — 런타임 제어 용이.

### 라우트 추가 영향

- `/app`은 신규 경로. 기존 랜딩(`/`), `auth/callback`과 충돌 없음.
- 랜딩 페이지 "Current Build Scope" 섹션 하단에 `/app` 진입 CTA 버튼 1개 추가 (선택).

---

## TODO

### Phase 1: 디자인 토큰 & 데이터 기반 셋업

1. [ ] **Tailwind 색상 팔레트 확장** — React 토큰명을 타겟 Pitch Black+Orange 값으로 재매핑
   - [ ] `tailwind.config.js`: `theme.extend.colors`에 `orange: {DEFAULT: '#ff5e00', dim: '#cc4b00', glow: '#ff8b4d'}`, `navy: {deep: '#050505', surface: '#0f0f0f', elevated: '#1a1a1a'}`, `mint: {DEFAULT: '#34d399', dim: '#065f46'}`, `border: 'rgba(255,255,255,0.1)'`, `foreground: '#f6efe9'`, `muted-foreground: 'rgba(255,255,255,0.5)'` 추가
   - [ ] `tailwind.config.js`: `fontFamily.heading` 확장(`['"Space Grotesk"', '"IBM Plex Sans KR"', 'system-ui']`)하여 소스의 `font-heading` 유틸 대응

2. [ ] **app.css 유틸리티 & 키프레임 추가** — 소스 index.css의 ticker/glow/pulse 유틸 Svelte 환경으로 이관
   - [ ] `src/app.css`: `@keyframes pulse-glow` 추가(0,100%: opacity 1 / 50%: opacity 0.7)
   - [ ] `src/app.css`: `@layer utilities`에 `.animate-ticker` (100%→-100%, 12s linear infinite), `.animate-pulse-glow` (2s ease-in-out infinite) 추가 (기존 `.ticker-track`은 랜딩 전용으로 유지)
   - [ ] `src/app.css`: `@layer utilities`에 `.glow-orange` (box-shadow 0 0 20px hsl 20/3deg/…), `.glow-mint`, `.no-scrollbar` (`-ms-overflow-style: none; scrollbar-width: none;` + `&::-webkit-scrollbar { display:none }`) 추가
   - [ ] `src/app.css`: `@keyframes slide-in-from-bottom` (translateY(100%)→0) + `.animate-sheet-in` (0.3s ease-out) 추가 (BoothDetailSheet용 대체)

3. [ ] **데이터 타입 & mock 데이터 이식** — LootItem 타입 + CATEGORIES + initialLootItems 8건
   - [ ] `src/lib/data/lootItems.ts`: `LootCategory` 유니온 타입, `LootItem` 인터페이스, `CATEGORIES` 배열, `initialLootItems: LootItem[]` 8건을 React `mockData.ts` 내용 그대로 이식

### Phase 2: 원자 컴포넌트 이식

4. [ ] **FilterChips.svelte** — 카테고리 다중선택 칩 (의존성 없음)
   - [ ] `src/lib/components/FilterChips.svelte`: `{ active: LootCategory[]; onToggle: (c: LootCategory) => void }` props ($props), `chipIcons` 맵 6종, `CATEGORIES.map` → `{#each}`, 활성(`bg-orange text-black glow-orange`) / 비활성(`bg-navy-elevated border border-[--color-border]`) 스타일, 가로 스크롤(`.no-scrollbar`) 유지

5. [ ] **AlertBanner.svelte** — 단일 메시지 티커 배너
   - [ ] `src/lib/components/AlertBanner.svelte`: `{ message: string }` props, 바깥 컨테이너에 오렌지 그라데이션(`bg-gradient-to-r from-orange via-orange-glow to-orange`), Zap 아이콘(`animate-pulse-glow`) + Clock 아이콘 인라인, 메시지 span에 `animate-ticker font-heading font-semibold`

6. [ ] **LootCard.svelte** — 리스트 아이템 카드 (완료/북마크/기본 3상태)
   - [ ] `src/lib/components/LootCard.svelte`: `{ item: LootItem; onToggleComplete: (id:string)=>void; onSelect: (id:string)=>void }` props, `isTimeLimited = item.time !== 'Always'` 로컬 파생, 좌측 체크 토글 버튼(CheckCircle2/Circle) + 콘텐츠 버튼(`onclick={() => onSelect(item.id)}`), 시간 뱃지(시간제한=오렌지/Always=회색), 카테고리 라벨, 제목(완료 시 line-through), Gift 아이콘+상품명(오렌지), MapPin+위치, 북마크 인디케이터 삼각형(top-right, 북마크 && !완료일 때만)

### Phase 3: 조합 컴포넌트 이식

7. [ ] **LootFeed.svelte** — 검색 + 필터 + 정렬된 리스트
   - [ ] `src/lib/components/LootFeed.svelte`: `{ items: LootItem[]; onToggleComplete; onSelectItem }` props, `let search = $state('')` + `let activeFilters = $state<LootCategory[]>([])`, `const filtered = $derived(items.filter(...))`, `const sorted = $derived([...filtered].sort(...))`, `const doneCount = $derived(items.filter(i => i.isCompleted).length)`, 헤더(Loot Feed 라벨 + Farmed 카운터 오렌지), 검색 input(`oninput`), FilterChips 조합, `{#each sorted as item (item.id)}<LootCard />{/each}`, 빈 상태 메시지

8. [ ] **ExhibitionMap.svelte** — 이미지 맵 + 핀 오버레이
   - [ ] `src/lib/components/ExhibitionMap.svelte`: `{ items: LootItem[]; onPinClick: (id:string)=>void }` props, `aspect-[16/10] bg-navy-surface` 컨테이너, 8×12 그리드 오버레이(`Array.from({length:8})` → `{#each Array.from({length:8}) as _, i}`), Hall A/B/C 라벨(top-2 좌/중/우), 핀 버튼(`style="left:{item.mapX}%; top:{item.mapY}%"`), 상태별 배경(완료=mint/20, 북마크=orange/20 glow, 기본=navy-elevated), 아이콘 분기(CheckCircle2/Bookmark/MapPin), group-active 툴팁

9. [ ] **BoothDetailSheet.svelte** — 바텀 시트 모달
   - [ ] `src/lib/components/BoothDetailSheet.svelte`: `{ item: LootItem | null; onClose; onToggleBookmark; onToggleComplete; onMemoChange }` props, `{#if item}` 가드, `fixed inset-0 z-50` 레이아웃, 백드롭(`bg-navy-deep/80 backdrop-blur-sm`, click→onClose), 시트(`max-w-lg bg-navy-surface rounded-t-2xl max-h-[85vh] overflow-y-auto`), Svelte `fly` transition (`transition:fly={{ y: 400, duration: 300 }}`) 사용해 소스의 slide-in 대체, 핸들 막대 + 닫기 버튼, 헤더(시간 뱃지/카테고리/제목/위치), Prize 박스(오렌지 톤), Mission 박스(navy-elevated), Memo textarea(`bind:value` 대신 `value={item.memo} oninput={(e) => onMemoChange(item.id, e.currentTarget.value)}`), 액션 버튼 2개(Bookmark 토글 / Mark Farmed)

### Phase 4: 페이지 라우트 생성

10. [ ] **앱 메인 라우트** — /app 경로 신규 생성
    - [ ] `src/routes/app/+page.svelte`: `import { initialLootItems } from '$lib/data/lootItems'` + 6개 컴포넌트 import, `let items = $state<LootItem[]>(initialLootItems)` + `let selectedId = $state<string|null>(null)`, `const selectedItem = $derived(items.find(i => i.id === selectedId) ?? null)`, `toggleComplete(id) / toggleBookmark(id) / updateMemo(id, memo)` 함수(map 이용, 불변 갱신), 컨테이너(`min-h-dvh bg-navy-deep pb-8 max-w-lg mx-auto`), `<svelte:head>` 제목, AlertBanner → 헤더(이모지+제목+서브) → ExhibitionMap → 구분선 → LootFeed → BoothDetailSheet 순서, AlertBanner 메시지는 React 소스 그대로 "12 minutes left until NVIDIA Roulette event! → Hall A-12"

11. [ ] **랜딩 페이지에 /app 진입 CTA 추가** — 파밍 화면으로 이동하는 버튼
    - [ ] `src/routes/+page.svelte`: "Current Build Scope" 섹션 `lg:grid-cols-[1.1fr_0.9fr]` 그리드 하단 또는 "다음 단계 후보" 카드 내부에 `<a href="/app" class="... bg-[#ff5e00] text-black font-semibold ...">파밍 화면 열기</a>` 1개 추가

### Phase 5: 검증

12. [ ] **타입 체크 통과** — svelte-check 에러 0
    - [ ] `npm run check`: 에러 0개 확인. 경고가 있으면 해당 체크박스 밑에 사유 기록 후 진행

13. [ ] **프로덕션 빌드 성공** — vite build
    - [ ] `npm run build`: 빌드 성공. Cloudflare adapter 관련 경고는 허용

14. [ ] **브라우저 육안 검증** — /app에서 소스 레이아웃과 시각적 일치 확인 (색상은 오렌지로 재매핑된 상태)
    - [ ] `npm run dev` 후 `http://localhost:5173/app` 접속 — AlertBanner 티커 좌→우 스크롤 / ExhibitionMap 핀 8개 표시 / 핀 클릭 시 BoothDetailSheet 열림 / LootFeed 검색 input 입력 시 필터링 / FilterChips 다중선택 / LootCard 체크 토글 시 완료 상태 전환(opacity 60%) / BoothDetailSheet에서 Bookmark/Mark Farmed 동작 / Memo textarea 입력 반영 — 8개 인터랙션 모두 동작 확인

---

## 🔴 백엔드/Python 변경 없음

이식 대상은 Svelte 프론트엔드 컴포넌트 + 라우트 + Tailwind 설정 + CSS. Python 코드 수정 없음 → **T1~T5 pytest Phase 해당 없음**. 검증은 Phase 5 (svelte-check + vite build + 브라우저 육안).

---

## 검증 (프론트엔드 기준)

### 실행 명령

```powershell
cd "D:\work\project\service\wtools\expo-harvest"
npm run check
npm run build
npm run dev
```

- `npm run check`: 에러 0, 경고는 허용
- `npm run build`: `.svelte-kit/output` 정상 생성
- `npm run dev`: `/app` 라우트 200 응답 + 6개 컴포넌트 렌더

### 검증 기준 (참고 — TODO Phase 5와 동일, 진행률 카운트에서 제외)

- svelte-check 에러 0
- vite build 성공
- 랜딩(`/`)이 기존과 동일하게 렌더 (이식 작업이 랜딩 레이아웃을 깨뜨리지 않음)
- `/app`에서 AlertBanner 티커 애니메이션 동작
- `/app`에서 ExhibitionMap 핀 8개 표시 및 클릭 → BoothDetailSheet 개폐
- `/app`에서 LootFeed 검색어 입력 시 실시간 필터링
- `/app`에서 FilterChips 다중선택 동작
- `/app`에서 LootCard 체크 토글 시 완료 opacity 전환
- `/app`에서 Memo textarea 입력 시 상위 상태 업데이트 반영

---

*상태: 초안 | 진행률: 0/32 (0%)*
