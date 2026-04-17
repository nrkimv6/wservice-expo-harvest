# root route bottom nav onboarding

> 완료일: 2026-04-17
> 아카이브됨
> 진행률: 42/42 (100%)
> 작성일시: 2026-04-17 09:40
> 기준커밋: 5b9f104
> 대상 프로젝트: expo-harvest
> 상태: 구현완료
> 반영일시: 2026-04-17 10:02
> 머지커밋: 0e62843
> 진행률: 42/42 (100%)
> 요약: 현재 실사용 화면이 `/app`에 몰려 있고 `/`는 랜딩 역할만 하고 있어 모바일 앱 진입 구조가 이원화되어 있다. 이번 계획은 `/`를 실사용 엔트리로 올리고, 긴 세로 스크롤 화면을 하단 네비게이션 기반 탭 구조로 나누며, 상단 소개 카드는 첫 실행 1회 모달로 전환하는 것이다.
> 출처: 사용자 요청

---

## 요구사항 정리

1. `/app` 대신 `/`를 실제 앱 진입점으로 올리고, `/`가 왜 존재하는지 모호한 상태를 정리한다.
2. 한 페이지에 길게 이어진 정보 배치를 하단 네비게이션 중심 구조로 바꿔 상황별 중요도를 분리한다.
3. `/app` 상단 소개 카드(`Map First`, `Search + Filter`, `Separate State`)는 상시 노출 대신 첫 실행 1회 모달로 이동한다.

## 현재 코드 관찰

- `src/routes/+page.svelte`: 마케팅 랜딩 성격의 소개 페이지이며, 실제 사용 흐름은 `/app` 링크로 넘긴다.
- `src/routes/app/+page.svelte`: 알림 배너, 소개 카드, 박람회 선택, 요약 카드, 지도, 리스트와 상태 로직이 한 파일에 모두 쌓여 있다.
- `src/lib/stores/farmState.ts`: 전시회별 로컬 상태와 마지막 선택 박람회만 저장하며, 온보딩 노출 여부는 저장하지 않는다.
- `src/service-worker.ts`: 앱 셸과 네비게이션 fallback이 `/app`을 포함한 현재 라우팅을 전제로 한다.
- `static/manifest.webmanifest`: PWA `start_url`이 아직 `/app`이라 루트 엔트리 전환 후에도 설치 진입점이 예전 경로를 바라보게 된다.
- `README.md`: 메인 동작 설명과 오프라인 진입 설명이 `/app` 기준으로 작성되어 있다.

## main 드리프트 점검

- `git diff --name-only 5b9f104..main` 결과, 기준커밋 이후 main 변경은 `TODO.md`, 새 plan 문서, archive 문서뿐이었다.
- 이번 계획의 실제 수정 대상인 `src/routes/+page.svelte`, `src/routes/app/+page.svelte`, `src/lib/stores/farmState.ts`, `src/service-worker.ts`, `static/manifest.webmanifest`, `src/lib/components/LootFeed.svelte`, `src/lib/components/ExhibitionMap.svelte`, `src/lib/components/BoothDetailSheet.svelte`, `src/app.css`, `README.md`에는 기준커밋 이후 코드 드리프트가 없다.
- 따라서 구현 체크리스트는 코드 충돌 흡수보다 루트 엔트리 전환과 PWA 경로 정합성 확보에 집중한다.

## 구현 순서 제안

### Phase 1: 루트 라우트 정리 (9개 작업)

1. [x] **실사용 엔트리를 `/`로 통합한다** — 랜딩과 앱 진입을 분리하지 않고 모바일 앱의 기본 URL을 하나로 고정
   - [x] `src/routes/+page.svelte`: `onMount`, realtime/store helper, 공용 컴포넌트 import를 `/app` 페이지와 동일하게 옮겨 루트가 앱 상태를 직접 소유하게 만든다.
   - [x] `src/routes/+page.svelte`: `createInitialItemMap()`, `parseTimeValue()`, 파생 상태(`selectedExhibition`, `items`, `selectedItem`, 카운트), 변경 핸들러를 루트 파일에 이식해 `/app` 없이도 동일 상태가 계산되게 만든다.

2. [x] **`/app` 호환 진입을 가볍게 정리한다** — 기존 북마크와 PWA 진입을 깨지 않으면서 주 진입점만 `/`로 단순화
   - [x] `src/routes/+page.svelte`: 랜딩 hero/feature/build-scope 섹션을 제거하고 `AlertBanner`, 박람회 선택, 요약 카드, 탭 패널 슬롯, 상세 시트 mount를 포함한 앱 셸 마크업으로 교체한다.
   - [x] `src/routes/+page.svelte`: `<svelte:head>`의 정적 랜딩 title/description을 `selectedExhibition` 기반 동적 메타데이터로 바꿔 루트가 실사용 페이지임을 반영한다.

3. [x] **`/app`과 PWA 진입 경로를 루트 기준으로 맞춘다** — 호환 라우트는 남기되 기본 진입점은 `/` 하나로 정리
   - [x] `src/routes/app/+page.svelte`: 기존 전체 UI를 제거하고 `onMount(() => goto('/'))` + 수동 앵커 fallback만 남는 가벼운 호환 페이지로 단순화한다.
   - [x] `src/service-worker.ts`, `static/manifest.webmanifest`: offline fallback과 `start_url`을 `/` 우선으로 바꾸고 `/app`은 기존 링크 호환 목적의 캐시 경로로만 유지한다.

### Phase 2: 하단 네비게이션 정보 구조 (18개 작업)

4. [x] **탭 상태와 탭별 파생 데이터를 분리한다** — 한 화면에 몰린 정보를 `홈/지도/리스트/저장됨` 성격으로 나눈다
   - [x] `src/routes/+page.svelte`: `type AppTab = 'home' | 'map' | 'list' | 'saved'`와 `activeTab` 상태를 추가해 루트 화면 전환 기준을 명시한다.
   - [x] `src/routes/+page.svelte`: 현재 아이템 배열에서 `bookmarkedItems`, `completedItems`, `savedItems` 파생값을 따로 계산해 저장됨 탭이 별도 데이터 소스를 쓰게 만든다.

5. [x] **홈 탭을 요약 전용 패널로 줄인다** — 항상 봐야 하는 정보만 남기고 첫 화면 밀도를 낮춘다
   - [x] `src/routes/+page.svelte`: `AlertBanner`, 박람회 선택, 핵심 카운트 카드, 도움말 재오픈 버튼을 `home` 탭 패널 안으로 묶어 기본 진입 화면을 짧게 재배치한다.
   - [x] `src/routes/+page.svelte`: 기존 상시 소개 카드와 구분선 블록을 제거해 홈 탭 바깥에 불필요한 고정 섹션이 남지 않게 정리한다.

6. [x] **지도·리스트·저장됨 탭 패널을 각각 연결한다** — 탭을 바꿔도 현재 박람회 맥락과 상세 시트가 끊기지 않게 유지
   - [x] `src/routes/+page.svelte`: `map` 탭에는 `ExhibitionMap`, `list` 탭에는 전체 `LootFeed`, `saved` 탭에는 `savedItems` 기반 `LootFeed`를 조건부 렌더링으로 연결한다.
   - [x] `src/routes/+page.svelte`: 탭 전환과 무관하게 `selectedId`, `toggleBookmark()`, `toggleComplete()`, `updateMemo()`가 같은 상태 소스를 쓰도록 시트 연결을 유지한다.

7. [x] **하단 네비게이션과 컨테이너 여백을 추가한다** — 고정 네비가 콘텐츠와 시트 액션을 가리지 않게 맞춘다
   - [x] `src/routes/+page.svelte`: 하단 고정 네비 버튼 4개와 active 상태 class를 추가해 탭 전환 UI를 화면 하단에 고정한다.
   - [x] `src/app.css`: 컨테이너 하단 padding, safe-area inset, 고정 네비 높이 유틸을 추가해 메인 콘텐츠와 바텀 시트 버튼이 하단 네비 뒤로 숨지 않게 만든다.

8. [x] **하위 컴포넌트 문구를 탭 문맥에 맞게 조정한다** — 단일 긴 페이지 전제를 제거하고 탭별 재사용성을 높인다
   - [x] `src/lib/components/LootFeed.svelte`: `eyebrow`, `title`, `summaryLabel`, `emptyTitle`, `emptyBody` prop을 추가해 기본 리스트와 저장됨 리스트가 다른 헤더/빈 상태 문구를 쓸 수 있게 만든다.
   - [x] `src/lib/components/LootFeed.svelte`: 새 prop을 헤더와 빈 상태에 반영하되 기존 검색·필터·정렬 로직은 그대로 유지해 동작 회귀를 막는다.

9. [x] **지도 탭과 상세 시트의 단독 화면 밀도를 조정한다** — 탭 전환 후에도 정보량이 과하지 않게 맞춘다
   - [x] `src/lib/components/ExhibitionMap.svelte`: 지도 탭 단독 사용을 전제로 헤더 설명과 badge 문구를 짧게 줄여 첫 화면 대비 과한 설명량을 덜어낸다.
   - [x] `src/lib/components/BoothDetailSheet.svelte`: 하단 액션 영역에 safe-area 또는 추가 bottom padding을 넣어 고정 네비가 북마크/완료 버튼을 가리지 않게 조정한다.

### Phase 3: 첫 실행 온보딩 모달 (9개 작업)

10. [x] **온보딩 노출 여부를 별도 로컬 키로 저장한다** — 기존 박람회 상태 저장과 충돌하지 않게 분리한다
   - [x] `src/lib/stores/farmState.ts`: 온보딩 전용 storage key와 `hydrateOnboardingDismissed() -> boolean` helper를 추가해 첫 방문 여부를 읽을 수 있게 만든다.
   - [x] `src/lib/stores/farmState.ts`: `persistOnboardingDismissed(dismissed: boolean)` helper를 추가해 기존 전시회/아이템 저장 키를 건드리지 않고 dismiss 상태만 따로 저장한다.

11. [x] **루트 화면에 온보딩 상태와 재오픈 흐름을 연결한다** — 최초 1회 자동 노출과 수동 재진입을 같은 상태 모델로 묶는다
   - [x] `src/routes/+page.svelte`: `showOnboarding` 상태와 hydrate/dismiss/reopen 핸들러를 추가해 첫 방문 자동 오픈과 닫기 저장 흐름을 연결한다.
   - [x] `src/routes/+page.svelte`: 홈 탭의 도움말 버튼이 `showOnboarding = true`만 수행하도록 연결해 재오픈 경로를 별도 로직 없이 단순화한다.

12. [x] **소개 카드를 첫 실행 모달 마크업으로 바꾼다** — 상시 노출 대신 처음 진입할 때만 핵심 사용법을 안내한다
   - [x] `src/routes/+page.svelte`: 기존 `Map First`, `Search + Filter`, `Separate State` 카드 내용을 모달 본문 카드로 옮겨 첫 실행 안내가 기존 정보 구조를 그대로 재사용하게 만든다.
   - [x] `src/app.css`: 모달 오버레이, 백드롭, 대화상자 z-index 유틸을 추가해 온보딩이 하단 네비와 상세 시트 위에서 안정적으로 보이게 만든다.

### Phase 4: 회귀 점검 및 문구 정리 (6개 작업)

13. [x] **카피와 문서를 루트 엔트리 기준으로 정리한다** — 사용자가 `/`에서 바로 앱을 시작한다는 전제가 코드와 문서에 같이 남게 한다
   - [x] `src/routes/+page.svelte`: 탭 라벨, 도움말 버튼, 메타 description 문구를 루트 엔트리 + 하단 네비 구조에 맞게 조정한다.
   - [x] `README.md`: `/app` 중심 설명을 `/` 루트 진입, 하단 네비, 첫 실행 모달, PWA 시작 경로 설명으로 교체한다.

14. [x] **검증 단계에서 `/app` 잔존 참조를 정리한다** — 호환 라우트 외에는 예전 경로 의존이 남지 않게 확인한다
   - [x] `src/service-worker.ts`, `static/manifest.webmanifest`, `README.md`: 구현 후 `/app` 문자열이 호환 목적 외에 남아 있는지 grep 기준으로 재확인하고 남은 참조를 정리한다.
   - [x] `package.json`: 기존 `check` 스크립트를 최종 검증 명령으로 사용해 구현 마무리 단계가 `npm run check` 통과까지 포함됨을 확인한다.

## 기대 결과

- 사용자는 `/`에서 바로 앱을 시작하고, `/app`은 과거 링크 호환용 진입점으로만 남는다.
- 첫 화면은 길게 늘어진 종합 페이지가 아니라, 하단 네비게이션으로 목적별 화면을 빠르게 오갈 수 있는 구조가 된다.
- 소개 카드는 첫 진입에만 보여 주고, 이후에는 화면을 가리지 않으면서 필요 시 다시 열 수 있다.

## 리스크 및 확인 포인트

- `/app`을 바로 제거하면 기존 북마크나 설치형 PWA 진입이 깨질 수 있으므로 최소한 한 차례는 리다이렉트 호환이 필요하다.
- 하단 네비게이션을 넣으면 기존 상세 바텀시트와 safe-area 여백이 겹칠 수 있어 모바일 실기기 간격 점검이 필요하다.
- 첫 실행 모달 상태 키를 추가할 때 기존 로컬 저장 스키마와 충돌하지 않도록 별도 키로 분리해야 한다.

_상태: 구현완료 | 진행률: 42/42 (100%)_
