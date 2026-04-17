# refine: coupang overview map zoom

> 작성일시: 2026-04-17 19:43
> 기준커밋: 11be920
> 대상 프로젝트: expo-harvest
> 상태: 초안
> 진행률: 0/24 (0%)
> 요약: 현재 `ExhibitionMap`의 `전체` 뷰는 1F/2F를 세로 스택으로 나열하는 overview라서, 단일층에서만 제공되는 zoom/pan/button 제어를 재사용할 수 없다. 이번 계획은 `전체` 뷰를 통합 좌표계 기반 overview map으로 재구성하고, 동일한 확대/축소 인터랙션을 제공하되 단일층 탐색 UX를 깨지 않도록 상태 모델을 분리하는 데 목적이 있다.

---

## 개요

지금 [`src/lib/components/ExhibitionMap.svelte`](D:/work/project/service/wtools/expo-harvest/src/lib/components/ExhibitionMap.svelte)는 `activeFloor === 'all'`일 때 `visibleFloors`를 그대로 순회해 1F/2F 카드를 세로로 쌓는다. 이 구조에서는 각 floor가 자기 `viewBox`를 그대로 쓰기 때문에 "전체를 한 장의 지도처럼 보고 확대/축소한다"는 개념이 성립하지 않고, 현재 zoom/pan helper와 pointer 제스처도 `activeFloor === floor.id`인 단일층에만 연결돼 있다.

사용자가 원하는 것은 overview에서도 층별 구성을 한 번에 훑다가 필요한 영역을 확대해 읽을 수 있는 흐름이다. 따라서 `전체`를 단순 리스트형 overview가 아니라, 1F/2F를 하나의 통합 SVG 좌표계로 배치한 combined map으로 바꾸고, 여기에 단일층과 같은 zoom model을 연결해야 한다. 다만 리스트/상세 시트가 쓰는 `selectItem()`은 현재 선택 시 바로 해당 `floorId`로 이동시키므로, overview에서 부스를 눌렀을 때도 무조건 층 전환이 일어나면 새 기능 체감이 약해진다.

이번 계획의 목표는 다음 네 가지다.

1. `전체` 뷰 전용 통합 좌표계와 viewport 상태를 정의한다.
2. 1F/2F를 한 SVG 안에 재배치해 overview에서도 확대 가능한 지도를 만든다.
3. wheel/pinch/drag/button helper를 overview에도 연결한다.
4. 선택/상세 이동은 유지하되, overview에서 탐색하다가 곧바로 층 강제 전환되는 흐름을 줄인다.

## 관련 계획

- [`docs/archive/2026-04-17_refine-coupang-floor-map-readability-mobile.md`](D:/work/project/service/wtools/expo-harvest/docs/archive/2026-04-17_refine-coupang-floor-map-readability-mobile.md)에서는 `전체` 뷰를 "층 구조 훑기" overview로 유지하는 방향을 택했다.
- [`docs/archive/2026-04-17_refine-coupang-floor-map-gesture-usability.md`](D:/work/project/service/wtools/expo-harvest/docs/archive/2026-04-17_refine-coupang-floor-map-gesture-usability.md)에서는 단일층에만 zoom/pan/button helper를 넣었다.
- 이번 계획은 위 두 문서를 되돌리는 것이 아니라, `전체` 뷰에 한정해 동일한 인터랙션 계층을 확장하는 후속 refinement다.

## 기술적 고려사항

- 현재 `zoomScale`, `viewCenterX`, `viewCenterY`, `floorViewportStates`는 단일층 `viewBox`를 자르는 모델을 전제로 설계돼 있다. overview를 같은 상태에 억지로 섞으면 층별 saved viewport와 충돌할 수 있으므로, `all` 전용 viewport key 또는 별도 state가 필요하다.
- `getRenderedViewBox(floor)`는 `activeFloor === 'all'`이면 원본 `floor.viewBox`를 그대로 반환한다. 통합 overview를 만들려면 floor 개별 `viewBox`가 아니라 combined map bounds와 floor offset을 계산하는 helper 계층이 먼저 필요하다.
- [`src/routes/+page.svelte`](D:/work/project/service/wtools/expo-harvest/src/routes/+page.svelte)의 `selectItem(id, focusMap = false, openDetail = false)`는 항상 `mapFloorOverride = nextItem.floorId`를 덮어쓴다. overview에서 부스 선택 후에도 `all`을 유지하려면 호출 경로별로 floor override 정책을 분리해야 한다.
- 기존 gesture usability 변경에서 `gestureIntent`, `applyZoomScale()`, `handleZoomStep()`, `handleZoomReset()`를 공통화했으므로, overview 지원은 새 제스처 모델을 복제하기보다 "현재 active map이 floor인지 overview인지"만 바꾸는 쪽이 안전하다.
- 모바일에서는 overview까지 한 손가락 pan을 허용하면 페이지 스크롤 점유 면적이 늘어난다. 따라서 단일층과 동일한 `touch-action: none`을 바로 복제할지, `전체` 뷰에서만 버튼+pinch 중심으로 제한할지 UX 결정을 먼저 고정해야 한다.

---

## TODO

### Phase 1: `전체` 뷰를 통합 viewport 모델로 분리한다

1. [ ] **overview 좌표계와 기본 배율 규칙을 helper로 정의한다** — floor별 `viewBox` 나열이 아니라 combined map bounds를 계산
   - [ ] `src/lib/components/ExhibitionMap.svelte`: 1F/2F 원본 `viewBox`를 읽어 세로 간격, outer padding, 전체 width/height를 반환하는 `getOverviewMapMetrics()` 또는 동등 helper를 계획 범위에 포함한다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: `전체` 뷰의 기본 center/scale을 계산하는 `getDefaultOverviewViewport()` 계열 helper를 추가 대상으로 고정한다.

2. [ ] **floor와 overview 저장 viewport를 충돌 없이 분리한다** — 기존 `floorViewportStates` 회귀 방지
   - [ ] `src/lib/components/ExhibitionMap.svelte`: `floorViewportStates`에 `all` key를 포함할지, `overviewViewportState`를 별도로 둘지 한 가지 방식으로 결정하고 계획서에 고정한다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: `resetViewport()`, `setViewportCenter()`, `clearGestures()`가 `all` 전환 시 어떤 state를 읽고 쓰는지 함수별 책임을 다시 나눈다.

### Phase 2: `전체` 뷰 렌더를 세로 카드 스택에서 통합 SVG로 바꾼다

3. [ ] **overview 전용 SVG 래퍼를 도입한다** — `visibleFloors` 카드 반복과 분리된 단일 canvas 구성
   - [ ] `src/lib/components/ExhibitionMap.svelte`: `activeFloor === 'all'`일 때는 floor 카드 2개를 렌더하지 않고, 통합 overview SVG를 한 번만 그리는 분기 구조로 바꾼다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: overview SVG 래퍼에도 단일층과 같은 `zoomViewport` 역할을 줄지, 별도 ref를 둘지 정해서 pointer/wheel 연결 지점을 명시한다.

4. [ ] **각 층을 combined map 안으로 옮기는 배치 helper를 추가한다** — floor별 offset과 라벨을 한 곳에서 관리
   - [ ] `src/lib/components/ExhibitionMap.svelte`: 1F/2F `<g>`에 적용할 `translate(x,y)` offset과 층 제목/구분 배경을 반환하는 helper를 추가 대상으로 적는다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: 기존 booth/overlay 렌더 블록은 재사용하되 overview에서는 floor transform 안에서만 렌더되게 구조를 조정한다.

### Phase 3: 기존 zoom/pan/button helper를 overview에도 연결한다

5. [ ] **zoom helper가 active map 종류를 인식하도록 일반화한다** — floor와 overview가 같은 코드 경로를 타게 정리
   - [ ] `src/lib/components/ExhibitionMap.svelte`: `getViewportMetrics()`, `clampViewportCenter()`, `getRenderedViewBox()`가 floor metrics와 overview metrics를 모두 받을 수 있도록 파라미터 또는 helper 분리를 설계한다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: `applyZoomScale()`, `handleZoomStep()`, `handleZoomReset()`가 `activeFloor === 'all'`에서도 min/max/default 기준을 올바르게 계산하도록 변경 경로를 고정한다.

6. [ ] **overview 제스처 계약을 단일층과 나란히 정의한다** — wheel, pinch, drag, button의 지원 범위를 명시
   - [ ] `src/lib/components/ExhibitionMap.svelte`: `handleViewportWheel()`, `handleViewportPointerDown/Move/Up()`를 overview에서도 재사용할지, `all` 전용 guard만 추가할지 결정한다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: `전체` 뷰에서 한 손가락 drag pan을 허용할지, pinch + 버튼만 허용할지 정책을 문구와 함께 확정한다.

### Phase 4: 선택/상세 흐름을 overview 탐색과 양립시킨다

7. [ ] **overview에서 부스 선택 시 층 강제 전환 여부를 호출 경로별로 분리한다** — 탐색용 탭과 상세용 탭의 계약 재정의
   - [ ] `src/routes/+page.svelte`: `selectItem()`에 "floor override를 유지할지 강제할지"를 넘길 수 있는 인자 또는 별도 helper를 추가할지 결정한다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`, `src/routes/+page.svelte`: overview에서 지도 내 부스 탭은 `all` 유지, 리스트/시트에서 `지도에서 보기`는 해당 층으로 이동 같은 흐름 분리를 계획서에 명시한다.

8. [ ] **overview 포커스와 안내 문구를 새 계약에 맞춘다** — 사용자가 전체보기에서도 제어 가능하다는 사실을 명확히 노출
   - [ ] `src/lib/components/ExhibitionMap.svelte`: 상단 focus 패널과 coarse pointer 안내 문구를 `전체` 뷰 지원 범위에 맞춰 갱신 대상으로 포함한다.
   - [ ] `MANUAL_TASKS.md`: `전체` 뷰 pinch/wheel/button 확대, drag pan, 부스 탭 후 floor 유지 여부, 리스트에서 지도로 점프 시 floor 전환 여부를 수동 검증 항목으로 추가한다.

---

*상태: 초안 | 진행률: 0/24 (0%)*
