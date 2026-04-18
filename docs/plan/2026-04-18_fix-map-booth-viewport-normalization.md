# fix: map booth viewport normalization

> 작성일시: 2026-04-18 00:41
> 기준커밋: cb1daf7
> branch: main
> worktree: .
> 대상 프로젝트: expo-harvest
> 상태: main 반영 완료
> 진행률: 8/8 (100%)
> 요약: 현재 부스보기의 체감 크기 차이는 section별 zoom 값보다 raw `viewBox` 크기 차이에서 온다. `1F`를 기준 부스 체감 크기로 삼고 `2F`와 `뷰티박스 수령존`이 같은 기준 viewport를 쓰도록 section viewport 계약을 분리한다.

---

## 개요

사용자 요구사항은 "층별 확대율을 맞춘다"가 아니라 "`1F`에서 보이는 기본 부스 크기를 다른 section에서도 그대로 느끼게 한다"는 것이다. 현재 [`src/lib/components/ExhibitionMap.svelte`](D:/work/project/service/wtools/expo-harvest/src/lib/components/ExhibitionMap.svelte)는 section viewport를 [`src/lib/data/lootItems.ts`](D:/work/project/service/wtools/expo-harvest/src/lib/data/lootItems.ts)의 raw `viewBox`에 직접 묶고 있어서, 부스 render box가 대부분 `72x54`로 정규화돼 있어도 section 캔버스 면적 차이 때문에 `2F`와 `뷰티박스 수령존`의 체감 부스 크기가 달라진다.

이번 계획은 source SVG 좌표와 "사용자가 보게 될 기본 viewport bounds"를 분리하는 데 초점을 둔다. `1F`의 booth density를 기준값으로 삼아 `2F`와 `뷰티박스 수령존`도 같은 booth visual scale로 보이도록 section별 padded viewport bounds를 데이터에 명시하고, `ExhibitionMap.svelte`가 초기 진입·리셋·포커스 계산에서 그 bounds를 사용하도록 재구성한다.

## 기술적 고려사항

- [`src/lib/data/lootItems.ts`](D:/work/project/service/wtools/expo-harvest/src/lib/data/lootItems.ts): 부스 render 크기는 이미 `NORMALIZED_BOOTH_RENDER_WIDTH = 72`, `NORMALIZED_BOOTH_RENDER_HEIGHT = 54`로 정규화돼 있지만 section `viewBox`는 `1F = 666x364`, `2F = 726x308`, `뷰티박스 수령존 = 144x96`이라 같은 scale에서도 화면 체감이 달라진다.
- [`src/lib/components/ExhibitionMap.svelte`](D:/work/project/service/wtools/expo-harvest/src/lib/components/ExhibitionMap.svelte): `getMapSectionMetrics()`, `createSectionViewportTarget()`, `resetViewport()`, `focusViewportOnItem()`가 모두 raw section metrics를 기준으로 움직이고, single-section wrapper의 `aspect-ratio`도 같은 값을 쓰고 있어서 viewport bounds만 분리하면 다시 어긋날 수 있다.
- [`src/routes/+page.svelte`](D:/work/project/service/wtools/expo-harvest/src/routes/+page.svelte): 리스트/상세의 `mapSectionOverride`는 section id 기준으로만 동작하므로, section identity를 유지한 채 viewport bounds만 바꾸면 소비 surface는 유지할 수 있다.
- [`MANUAL_TASKS.md`](D:/work/project/service/wtools/expo-harvest/MANUAL_TASKS.md): 현재도 `뷰티박스 수령존` 과대 확대 여부를 육안 확인하도록 적혀 있으므로, 이번 후속에서는 `1F` 대비 체감 부스 크기 일치 여부를 명시적으로 확인 항목으로 추가해야 한다.
- [`docs/archive/2026-04-17_fix-coupang-map-layout-regressions-after-section-split.md`](D:/work/project/service/wtools/expo-harvest/docs/archive/2026-04-17_fix-coupang-map-layout-regressions-after-section-split.md): 이미 "단일 booth section은 최소 padding이 아니라 공통 기준 폭/높이 대비 스케일 상한이 필요하다"는 회고가 남아 있으므로, 이번 계획은 그 결론을 데이터 계약으로 승격하는 후속으로 봐야 한다.

---

## TODO

### Phase 1: 1F 기준 viewport 계약을 정의한다

1. [x] **section별 raw `viewBox`와 display viewport를 분리할 데이터 계약을 정한다** — source 좌표와 초기 표시 bounds를 같은 값으로 쓰지 않게 만든다
   - [x] `src/lib/data/lootItems.ts`: `MapSection`에 raw `viewBox`와 별도로 single-section 기본 표시용 `displayViewBox`와 `defaultScale` 계약을 추가하고, raw 좌표는 overview placement 전용으로 유지하게 정리했다.
   - [x] `src/lib/data/lootItems.ts`: `hall-1f` raw `viewBox`를 기준으로 `HALL_1F_REFERENCE_DISPLAY_WIDTH`, `HALL_1F_REFERENCE_DISPLAY_HEIGHT` 상수를 도입해 "1F 체감 크기" 기준을 고정했다.

2. [x] **2F와 수령존의 기본 표시 bounds를 1F 기준으로 다시 잡는다** — 부스 render box 체감 크기가 같아지도록 조정
   - [x] `src/lib/data/lootItems.ts`: `hall-2f`에 `hall-1f` 기준 density를 따르는 `defaultScale`을 부여해 top row, 좌측 lane, 우측 column이 같이 보이도록 맞췄다.
   - [x] `src/lib/data/lootItems.ts`: `beauty-box-pickup`에는 raw `viewBox`를 유지한 채 padded `displayViewBox`를 추가해 단일 zone 과대 확대를 줄였다.

### Phase 2: viewport 로직을 새 bounds 계약으로 연결한다

3. [x] **section viewport target이 raw `viewBox` 대신 display bounds를 읽게 바꾼다** — 초기 진입과 리셋이 같은 기준을 쓰게 만든다
   - [x] `src/lib/components/ExhibitionMap.svelte`: `getSourceMapSectionMetrics()`와 `getDisplayMapSectionMetrics()`로 metric helper를 분리해 overview와 single-section 책임을 나눴다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: `createSectionViewportTarget()`와 `resetViewport()`가 display bounds 중심과 `DEFAULT_MAP_SECTION_SCALE = 1`을 기준으로 동작하게 연결했다.

4. [x] **부스 포커스와 선택 시 viewport 이동 기준을 새 bounds에 맞춘다** — 아이템 포커스 시 다시 과대 확대되지 않게 막는다
   - [x] `src/lib/components/ExhibitionMap.svelte`: `focusViewportOnItem()`, `clampViewportCenter()`, `getRenderedViewBox()`가 single-section에서는 display bounds를 clamp 기준으로 쓰도록 조정했다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: `handleZoomReset()`과 zoom button disable 기준도 새 default viewport와 `scale=1` 조합에 맞춰 정리했다.

5. [x] **single-section wrapper의 비율 계산도 새 계약에 맞춘다** — viewport만 바꾸고 container ratio가 raw 기준으로 남지 않게 막는다
   - [x] `src/lib/components/ExhibitionMap.svelte`: single-section wrapper `aspect-ratio`가 display bounds 기준으로 계산되게 바꿔 viewport와 container 비율이 다시 엇갈리지 않게 했다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: section header count, zoom control, viewport wrapper 구조는 유지한 채 display bounds만 교체되도록 반영했다.

### Phase R: 재발 경로 분석 (fix 계획 필수)

6. [x] **raw/display metric 경로가 다시 섞이지 않도록 참조 전수를 잠근다** — 이번 수정 후 재발 가능 경로를 명시적으로 닫는다
   - [x] `src/lib/components/ExhibitionMap.svelte`: overview placement는 source metrics, single-section viewport와 wrapper는 display metrics를 읽도록 호출 경로를 정리했다.
   - [x] `src/lib/components/ExhibitionMap.svelte`, `src/routes/+page.svelte`: `activeMapSectionOverride`, `preserveMapSectionOverride`, 리스트/상세의 `지도에서 보기`는 section id 기준으로 유지되는 것을 대조했다.

### Phase 3: 검증과 육안 확인 기준을 고정한다

7. [x] **체감 크기 회귀를 확인할 수 있는 수동 검증 기준을 보강한다** — 다음 수정 때 같은 혼선이 반복되지 않게 만든다
   - [x] `MANUAL_TASKS.md`: `1F`, `2F`, `뷰티박스 수령존`을 순서대로 열었을 때 기본 진입 부스 크기가 `1F`와 비슷하게 느껴지는지 확인하는 항목을 추가했다.
   - [x] `MANUAL_TASKS.md`: `2F`에서 좌측 lane과 우측 column이 모두 보이는 상태로 시작하면서도 `1F`보다 작게 보이지 않는지 확인 항목을 추가했다.
   - [x] `MANUAL_TASKS.md`: `뷰티박스 수령존`이 더 이상 단독 과대 확대처럼 보이지 않고, `리셋` 후에도 같은 시야로 돌아오는지 확인 항목을 추가했다.

8. [x] **정적 검증으로 viewport 변경 회귀를 막는다** — 데이터/렌더 계약이 깨지지 않았는지 확인
   - [x] `package.json`, `src/lib/components/ExhibitionMap.svelte`, `src/lib/data/lootItems.ts`: `npm run check`를 실행해 타입/컴파일 회귀가 없는지 확인했다.
   - [x] `package.json`, `src/lib/components/ExhibitionMap.svelte`, `src/lib/data/lootItems.ts`: `npm run build`는 dev server guard에 걸려 `npm run build:raw`로 production build를 검증했고 통과했다.

---

*상태: main 반영 완료 | 진행률: 8/8 (100%)*
