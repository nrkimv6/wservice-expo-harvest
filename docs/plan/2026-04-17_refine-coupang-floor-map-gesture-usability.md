# refine: coupang floor map gesture usability

> 작성일시: 2026-04-17 18:31
> 기준커밋: f38947e
> 대상 프로젝트: expo-harvest
> branch: impl/refine-coupang-floor-map-gesture-usability
> worktree: .worktrees/impl-refine-coupang-floor-map-gesture-usability
> worktree-owner: D:/work/project/service/wtools/expo-harvest/.worktrees/impl-refine-coupang-floor-map-gesture-usability/docs/plan/2026-04-17_refine-coupang-floor-map-gesture-usability.md
> 상태: 구현중
> 진행률: 32/34 (94%)
> 요약: 현재 `ExhibitionMap`의 pinch/pan은 코드상 구현돼 있지만 확대 여유, pan 체감, tap 충돌 방지가 모두 보수적으로 잡혀 있어 모바일에서 거의 작동하지 않는 것처럼 느껴진다. 이번 계획은 제스처 체감을 실제 탐색 가능한 수준으로 끌어올리고, 이전 계획에서 제외했던 명시적 확대/축소 버튼을 별도 UX 보강 항목으로 재도입하는 데 목적이 있다.

---

## 개요

기존 [`docs/archive/2026-04-17_refine-coupang-floor-map-readability-mobile.md`](D:/work/project/service/wtools/expo-harvest/docs/archive/2026-04-17_refine-coupang-floor-map-readability-mobile.md)에서는 모바일 단일층 탐색을 위해 pinch-zoom과 drag pan을 넣되, 확대/축소 버튼은 넣지 않기로 결정했다. 하지만 실제 구현 상태를 보면 [`src/lib/components/ExhibitionMap.svelte`](D:/work/project/service/wtools/expo-harvest/src/lib/components/ExhibitionMap.svelte)에서 기본 배율과 최대 배율 사이 여유가 작고, pan clamp와 클릭 억제가 공격적으로 조율되지 않아 사용자가 드래그와 pinch를 해도 "거의 안 된다"는 체감이 생긴다. 이번 계획은 기존 지도 가독성 리팩터를 되돌리는 것이 아니라, 현 제스처 모델을 실제 모바일 사용성에 맞게 재튜닝하고 필요 시 명시적 zoom controls를 보강하는 후속 refinement다.

## 기술적 고려사항

- 현재 단일층 viewport는 `viewBox`를 동적으로 잘라 쓰는 구조라서, `DEFAULT_SINGLE_FLOOR_SCALE`, `MIN_SINGLE_FLOOR_SCALE`, `MAX_SINGLE_FLOOR_SCALE` 값 조정이 pan 가능 범위와 직접 연결된다.
- pan은 [`clampViewportCenter()`](D:/work/project/service/wtools/expo-harvest/src/lib/components/ExhibitionMap.svelte:221)에서 중앙점 기준으로 제한되므로, 제스처 체감 개선은 단순히 이벤트를 더 받는 문제가 아니라 viewport 모델과 선택 포커스 복원 규칙을 함께 봐야 한다.
- 현재 부스 클릭 억제는 시간 기반 `suppressPinClickUntil`만 사용하므로, 실제 이동량 기준 gesture intent 플래그로 바꾸지 않으면 pan 후 오탭이 계속 남을 수 있다.
- 지도 탭 재진입과 층 복귀는 [`src/routes/+page.svelte`](D:/work/project/service/wtools/expo-harvest/src/routes/+page.svelte)의 `selectItem()` 및 `mapFloorOverride` 흐름과 연결돼 있으므로, 확대/선택 상태 보강이 이 흐름을 깨지 않는지 같이 확인해야 한다.
- `floorViewportStates`는 같은 날 [`docs/report/2026-04-17_root-route-button-freeze-fix.md`](D:/work/project/service/wtools/expo-harvest/docs/report/2026-04-17_root-route-button-freeze-fix.md)에서 `untrack` 회귀를 한 번 막은 영역이므로, 저장 viewport 읽기/병합 경로를 다시 건드릴 때는 `effect_update_depth_exceeded`가 재발하지 않게 같은 패턴을 유지해야 한다.

---

## TODO

### Phase 1: viewport 배율과 복원 규칙을 함수 단위로 재정리한다

1. - [x] **기본 zoom 계산 경로를 helper 단위로 분리한다**
   - [x] `src/lib/components/ExhibitionMap.svelte`: 단일층 기본 배율 결정을 상수 직접 참조 대신 `getDefaultFloorScale(floor: FloorMap) -> number` helper로 분리한다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: viewport 가로/세로 계산을 `getViewportMetrics(floor: FloorMap, scale = zoomScale) -> { width: number; height: number }` helper로 분리한다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: `resetViewport(nextFloor)`가 기본 center 계산은 그대로 두되, scale 선택은 `getDefaultFloorScale()`를 사용하도록 수정한다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: `getViewportWidth()`, `getViewportHeight()`, `getRenderedViewBox()`가 같은 viewport size helper를 공유하도록 중복 계산을 정리한다.

2. - [x] **선택 포커스와 saved viewport 복원 규칙을 덮어쓰기 단위로 나눈다**
   - [x] `src/lib/components/ExhibitionMap.svelte`: `focusViewportOnItem(item, preserveZoom = false)`가 `DEFAULT_SINGLE_FLOOR_SCALE` 직접 참조 대신 `getDefaultFloorScale(floor)` 기준으로 preserve zoom을 계산하도록 바꾼다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: `selectedItem` 기반 `$effect`가 동일 `lastFocusedSelectionKey`에서는 재센터링하지 않는 현재 가드를 유지하면서, 새 선택에서만 `focusViewportOnItem()`을 호출하는 조건을 함수명 기준으로 다시 명시한다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: `resetViewport()`와 `setViewportCenter()`의 `untrack(() => floorViewportStates...)` 읽기 패턴을 유지하는 작업을 별도 체크포인트로 고정해 reactive loop 회귀를 막는다.

### Phase 2: drag/pinch intent를 시간 기반이 아니라 이동 기반으로 바꾼다

3. - [x] **gesture intent 상태를 클릭 억제 전용으로 분리한다**
   - [x] `src/lib/components/ExhibitionMap.svelte`: `let suppressPinClickUntil = 0`를 제거하고, drag/pinch 제스처 여부만 저장하는 `gestureIntent` 상태로 대체한다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: `markPanIntent()`를 제거하고 `markGestureIntent(kind: 'drag' | 'pinch') -> void` helper로 교체한다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: `clearGestures()`가 `activePointers`, `dragGesture`, `pinchGesture`와 함께 `gestureIntent`도 항상 초기화하도록 맞춘다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: floor/exhibition 전환 `$effect`에서 `clearGestures()` 이후 이전 gesture intent가 남지 않도록 reset 순서를 점검한다.

4. - [x] **drag threshold와 포인터 전환을 move/up 블록별로 나눈다**
   - [x] `src/lib/components/ExhibitionMap.svelte`: `DragGesture` 타입에 실제 pan threshold 통과 여부를 저장할 필드를 추가한다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: `handleViewportPointerMove(event)`의 drag 분기에서 threshold 전에는 click 가능한 상태를 유지하고, threshold 초과 시점에만 `markGestureIntent('drag')`를 호출하도록 바꾼다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: `handleViewportPointerUp(event)`가 pinch 종료 후 포인터 1개가 남을 때 현재 남은 포인터 좌표로 새 `dragGesture`를 다시 심도록 유지/보정한다.

5. - [x] **pinch 종료와 booth click 억제를 각각 한 지점씩 고친다**
   - [x] `src/lib/components/ExhibitionMap.svelte`: `handleViewportPointerDown(event)`의 2포인터 분기에서 midpoint와 distance가 유효할 때만 `pinchGesture`를 시작하도록 guard를 고정한다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: `handleViewportPointerMove(event)`의 pinch 분기에서 실제 scale 변화가 발생한 경우에만 `markGestureIntent('pinch')`가 기록되도록 조건을 좁힌다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: booth `<g role="button">`의 `onclick` guard가 `Date.now() < suppressPinClickUntil` 대신 `gestureIntent !== null` 기준으로 클릭 차단을 판정하도록 바꾼다.

### Phase 3: zoom update 경로와 명시적 controls를 같은 helper로 묶는다

6. - [x] **wheel, pinch, button이 같은 zoom helper를 타도록 공통화한다**
   - [x] `src/lib/components/ExhibitionMap.svelte`: scale clamp와 center 반영을 한 번에 처리하는 `applyZoomScale(nextScale: number, floor: FloorMap, centerX = viewCenterX, centerY = viewCenterY) -> void` helper를 추가한다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: `handleViewportWheel(event)`가 `nextScale` 계산 뒤 직접 `zoomScale`를 쓰지 않고 `applyZoomScale()`를 호출하도록 바꾼다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: `handleViewportPointerMove(event)`의 pinch 분기도 `zoomScale` 직접 대입 대신 `applyZoomScale()`를 호출하도록 맞춘다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: 단일층 확대 버튼이 재사용할 `handleZoomStep(delta: number) -> void` helper를 추가한다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: 기본 viewport로 복귀하는 `handleZoomReset() -> void` helper를 추가해 현재 active floor의 기본 center/scale을 복원하게 한다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: floor 카드 헤더 또는 viewport 상단에 단일층 전용 `+ / - / reset` control group을 렌더하고, `aria-label`과 min/max/default 비활성 조건을 각각 연결한다.

### Phase 4: 재진입 흐름과 검증 기준을 구현 직후 확인 가능한 수준으로 낮춘다

7. - [ ] **지도 재진입과 검증 항목을 구현 후 바로 확인 가능한 수준으로 쪼갠다**
   - [x] `src/routes/+page.svelte`, `src/lib/components/ExhibitionMap.svelte`: `selectItem(id, focusMap = false, openDetail = false)`가 갱신하는 `mapFloorOverride`, `selectedId`, `selectedItemId` 흐름에 새 prop 없이 유지 가능한지 확인하고, 충돌이 있으면 동기화 지점을 한 곳으로만 제한한다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: coarse pointer 안내 문구를 현재 제스처 계약에 맞춰 `핀치 확대 + 드래그 이동 + 버튼 확대/축소`를 함께 설명하는 문구로 갱신한다.
   - [x] `MANUAL_TASKS.md`: 모바일 또는 디바이스 모드에서 확인할 `pinch 확대/축소`, `drag pan`, `zoom 버튼`, `pan 후 부스 탭`, `층 전환 후 viewport 복원` 체크리스트를 추가한다.
   - [ ] `package.json`, `src/lib/components/ExhibitionMap.svelte`, `src/routes/+page.svelte`: 구현 후 `npm run check`를 실행해 `svelte-check` 기준 0 errors / 0 warnings를 확인하는 검증 항목을 유지한다.

---

*상태: 구현중 | 진행률: 32/34 (94%)*
