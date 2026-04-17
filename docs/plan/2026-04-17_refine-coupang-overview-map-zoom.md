# refine: coupang overview map zoom

> 작성일시: 2026-04-17 19:43
> 기준커밋: 11be920
> 대상 프로젝트: expo-harvest
> 상태: 초안
> 진행률: 0/48 (0%)
> 요약: 현재 `ExhibitionMap`의 `전체` 뷰는 `mapSections`를 카드 단위로 나열하는 overview라서, 단일 섹션에서만 제공되는 zoom/pan/button 제어를 재사용할 수 없다. 이번 계획은 `전체` 뷰를 통합 좌표계 기반 overview map으로 재구성하고, 동일한 확대/축소 인터랙션을 제공하되 `activeMapSectionOverride`, 선택 포커스, 상세 시트 흐름과 충돌하지 않도록 상태 모델을 분리하는 데 목적이 있다.

---

## 개요

지금 [`src/lib/components/ExhibitionMap.svelte`](D:/work/project/service/wtools/expo-harvest/src/lib/components/ExhibitionMap.svelte)는 `activeMapSection === 'all'`일 때 `visibleMapSections`를 순회해 `hall-1f`, `hall-2f`, `beauty-box-pickup` 같은 섹션 카드를 각각 렌더한다. 이 구조에서는 각 섹션이 자기 `viewBox`를 그대로 쓰기 때문에 "전체를 한 장의 지도처럼 보고 확대/축소한다"는 개념이 성립하지 않고, 현재 zoom/pan helper와 pointer 제스처도 `activeMapSection === section.id`인 단일 섹션에만 연결돼 있다.

사용자가 원하는 것은 overview에서도 전체 구성을 한 번에 훑다가 필요한 영역을 확대해 읽을 수 있는 흐름이다. 따라서 `전체`를 단순 카드형 overview가 아니라, 모든 `mapSection`을 하나의 통합 SVG 좌표계로 배치한 combined map으로 바꾸고 여기에 기존 zoom model을 연결해야 한다. 다만 [`src/routes/+page.svelte`](D:/work/project/service/wtools/expo-harvest/src/routes/+page.svelte)의 `selectItem()`은 현재 선택 시 바로 `mapSectionOverride = nextItem.mapSectionId`를 덮어쓰므로, overview에서 부스를 눌렀을 때도 무조건 섹션 전환이 일어나면 새 기능 체감이 약해진다.

이번 계획의 목표는 다음 네 가지다.

1. `전체` 뷰 전용 통합 좌표계와 viewport 상태를 정의한다.
2. 모든 `mapSection`을 한 SVG 안에 재배치해 overview에서도 확대 가능한 지도를 만든다.
3. wheel/pinch/drag/button helper를 overview에도 연결한다.
4. 선택/상세 이동은 유지하되, overview에서 탐색하다가 곧바로 섹션 강제 전환되는 흐름을 줄인다.

## 관련 계획

- [`docs/archive/2026-04-17_refine-coupang-floor-map-readability-mobile.md`](D:/work/project/service/wtools/expo-harvest/docs/archive/2026-04-17_refine-coupang-floor-map-readability-mobile.md)에서는 `전체` 뷰를 "층 구조 훑기" overview로 유지하는 방향을 택했다.
- [`docs/archive/2026-04-17_refine-coupang-floor-map-gesture-usability.md`](D:/work/project/service/wtools/expo-harvest/docs/archive/2026-04-17_refine-coupang-floor-map-gesture-usability.md)에서는 단일층에만 zoom/pan/button helper를 넣었다.
- 이번 계획은 위 두 문서를 되돌리는 것이 아니라, `전체` 뷰에 한정해 동일한 인터랙션 계층을 확장하는 후속 refinement다.

## 기술적 고려사항

- 현재 코드는 이미 `floor`가 아니라 `mapSection` 모델로 이동했고, 상태도 `activeMapSection`, `mapSectionViewportStates`, `activeMapSectionOverride`를 사용한다. 따라서 plan은 옛 `floor` 용어를 쓰지 말고 현재 시그니처에 맞춰야 한다.
- `beauty-box-pickup`처럼 실제 물리 층과 1:1 대응하지 않는 섹션이 있으므로, combined overview는 단순 `1F/2F` 배치가 아니라 `mapSections` 배열 전체를 다루는 구조여야 한다.
- `getRenderedViewBox(section)`는 `activeMapSection === 'all'`이면 원본 `section.viewBox`를 그대로 반환한다. 통합 overview를 만들려면 section 개별 `viewBox`가 아니라 combined map bounds와 section offset을 계산하는 helper 계층이 먼저 필요하다.
- `getActiveMapSectionData()`가 `all`에서 `null`을 반환하므로, 현재 `handleZoomStep()`, `handleZoomReset()`, `handleViewportWheel()`, `handleViewportPointerDown/Move()`는 overview에서 전부 비활성화된다. 새 기능은 helper 일부만 추가하는 수준이 아니라 "active viewport target" 판정을 함께 재설계해야 한다.
- [`src/routes/+page.svelte`](D:/work/project/service/wtools/expo-harvest/src/routes/+page.svelte)의 `selectItem(id, focusMap = false, openDetail = false)`는 항상 `mapSectionOverride = nextItem.mapSectionId`를 덮어쓴다. overview에서 부스 선택 후에도 `all`을 유지하려면 호출 경로별로 override 정책을 분리해야 한다.
- [`src/lib/components/ExhibitionMap.svelte`](D:/work/project/service/wtools/expo-harvest/src/lib/components/ExhibitionMap.svelte)의 `selectedItem` 기반 `$effect`는 `activeMapSection === 'all'`이면 바로 빠져나가므로, overview에서 선택 부스를 viewport 중심으로 가져가려면 별도 포커스 규칙이 필요하다.
- 모바일에서는 overview까지 한 손가락 pan을 허용하면 페이지 스크롤 점유 면적이 늘어난다. 따라서 단일 섹션과 동일한 `touch-action: none`을 복제할지, `전체` 뷰에서는 버튼+pinch 중심으로 제한할지 UX 결정을 먼저 고정해야 한다.

---

## TODO

### Phase 1: 현재 `mapSection` 모델 기준으로 통합 overview 경계를 고정한다

1. - [ ] **통합 overview가 포함할 섹션 집합과 배치 순서를 먼저 고정한다** — `hall-1f/hall-2f/beauty-box-pickup` 범위를 구현 전에 명시
   - [ ] `src/lib/data/lootItems.ts`: `selectedExhibition.mapSections`의 실제 id/label/viewBox를 다시 읽고, combined overview가 모든 섹션을 포함한다는 전제를 계획 본문에 반영한다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: `visibleMapSections`가 현재 `activeMapSection === 'all'`에서 어떤 순서로 렌더되는지 확인하고, combined overview에서도 같은 순서를 유지할지 결정한다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: `beauty-box-pickup`를 메인 홀과 같은 스케일로 붙일지, 축약 inset/보조 섹션으로 붙일지 한 가지 규칙으로 고정한다.

2. - [ ] **overview 전용 metrics helper 묶음을 함수 단위로 정의한다** — 이후 zoom/viewBox 계산이 같은 기준을 보게 만든다
   - [ ] `src/lib/components/ExhibitionMap.svelte`: `getOverviewMapMetrics() -> { viewBox, width, height, placements }` 수준의 반환 shape를 문서에 명시한다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: `placements`가 section id별 `offsetX`, `offsetY`, `width`, `height`를 포함하도록 적어 렌더와 clamp가 같은 값을 쓰게 한다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: 섹션 간 세로 간격, outer padding, 제목 영역 높이를 overview metrics helper가 함께 책임지도록 범위를 고정한다.

3. - [ ] **overview 기본 viewport 계산을 saved state와 분리한다** — 단일 섹션 복원 경로와 섞이지 않게 모델을 나눈다
   - [ ] `src/lib/components/ExhibitionMap.svelte`: `getDefaultOverviewViewport() -> { scale, centerX, centerY }` helper를 별도로 두고, 단일 섹션 `getDefaultMapSectionScale()`와 분리한다고 명시한다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: `mapSectionViewportStates`에 `all` key를 섞을지 `overviewViewportState`를 별도로 둘지 하나를 선택하고, 선택 이유를 기술적 고려사항에 남긴다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: `resetViewport(nextSection)`가 `all`일 때 `zoomScale = 1`로 리셋하는 현재 동작을 overview 기본 viewport 복원으로 교체할 계획을 명시한다.

### Phase 2: 카드형 `all` 뷰를 단일 overview canvas로 바꾼다

4. - [ ] **`all` 분기에서 카드 반복을 끊고 단일 SVG 래퍼를 렌더한다** — 현재 `#each visibleMapSections` 구조와 overview 렌더를 분리
   - [ ] `src/lib/components/ExhibitionMap.svelte`: `activeMapSection === 'all'`일 때는 현재 section 카드 헤더/버튼/booth count 반복을 건너뛰는 별도 렌더 분기를 추가 대상으로 적는다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: overview 전용 래퍼가 `bind:this={zoomViewport}`를 계속 재사용할지, `overviewZoomViewport` ref를 분리할지 한 가지로 결정한다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: 단일 섹션 렌더와 overview 렌더가 같은 JSX 블록을 무리하게 공유하지 않도록, 분기 위치를 `<div role="group">` 바깥으로 뺄지 안쪽으로 둘지 명시한다.

5. - [ ] **section placement helper를 기반으로 `<g>` 배치를 만든다** — 각 섹션을 combined map 안으로 안전하게 이동
   - [ ] `src/lib/components/ExhibitionMap.svelte`: overview SVG 안에서 section별 `<g transform="translate(...)">`를 만드는 블록을 새로 두겠다고 적는다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: 각 section `<g>` 위에 섹션 제목과 subtle 배경 패널을 넣을지, 외부 HTML 헤더를 없앨지 렌더 책임을 정한다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: booth와 overlay는 기존 루프를 재사용하되, overview에서는 placement offset을 더한 좌표로 렌더되도록 helper 호출 경로를 명시한다.

6. - [ ] **overview에서 booth/overlay 좌표 변환 경로를 고정한다** — render 좌표와 placement offset이 충돌하지 않게 한다
   - [ ] `src/lib/components/ExhibitionMap.svelte`: `getBoothRect(item)` 반환값에 직접 offset을 섞지 말고, overview 전용 `getOverviewBoothRect(item, placement)` 같은 helper를 둘지 결정한다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: overlay 렌더도 section 원본 좌표를 보존한 채 `<g transform>` 안에서 처리할지, 숫자 좌표를 직접 더할지 한 가지 방식으로 고정한다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: selection halo, badge circle, overlay text 같은 보조 요소도 같은 좌표 변환 방식만 쓰도록 변경 범위를 명시한다.

### Phase 3: zoom helper와 이벤트 경로를 overview에도 일반화한다

7. - [ ] **active viewport target 판정을 helper로 분리한다** — `getActiveMapSectionData() === null` 때문에 막히는 overview 경로를 해소
   - [ ] `src/lib/components/ExhibitionMap.svelte`: `getActiveViewportTarget()` 또는 동등 helper를 추가해 단일 섹션이면 section metrics, `all`이면 overview metrics를 반환하도록 명시한다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: `handleZoomStep()`, `handleZoomReset()`, `handleViewportWheel()`가 더 이상 `getActiveMapSectionData()`에 직접 의존하지 않도록 교체 계획을 적는다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: `focusViewportOnItem()`은 단일 섹션용과 overview용 포커스 helper를 분리할지 여부를 결정한다.

8. - [ ] **viewBox와 clamp 계산을 section/overview 공용 경로로 정리한다** — 확대와 pan이 둘 다 같은 bounds를 보게 만든다
   - [ ] `src/lib/components/ExhibitionMap.svelte`: `getViewportMetrics()`, `clampViewportCenter()`, `setViewportCenter()`가 `MapSection` 전용 시그니처라면 overview target도 받을 수 있게 시그니처를 바꿀 계획을 적는다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: `getRenderedViewBox(section)`가 `all`에서 `section.viewBox`를 반환하는 현재 분기를 overview combined viewBox 반환으로 대체한다고 명시한다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: overview min/max/default scale 기준을 단일 섹션 값과 분리할지, 기존 상수 범위를 재사용할지 한 가지 규칙으로 고정한다.

9. - [ ] **pointer/wheel/button 이벤트를 overview에도 연결한다** — 기존 gesture model을 복제하지 않고 타깃만 바꾼다
   - [ ] `src/lib/components/ExhibitionMap.svelte`: `handleViewportPointerDown/Move/Up()`가 `section` 대신 active viewport target을 사용하도록 바꿀 변경 지점을 적는다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: `gestureIntent`, `DragGesture`, `PinchGesture` 상태는 overview에서도 그대로 재사용하고 새 플래그는 추가하지 않는다는 전제를 문서에 명시한다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: overview에서도 `+ / - / 리셋` 버튼을 같은 control group으로 노출할지, 헤더 위치만 다르게 둘지 UI 배치 규칙을 고정한다.

### Phase 4: overview 선택/포커스 흐름을 현재 앱 상태와 양립시킨다

10. - [ ] **`selectedItem` 기반 포커스 effect가 `all`에서도 동작할지 별도 규칙을 만든다** — overview에서 선택 후 아무 반응 없는 상태를 막는다
   - [ ] `src/lib/components/ExhibitionMap.svelte`: 현재 `$effect`가 `nextSection === 'all'`이면 바로 return하는 경로를 읽고, overview 선택 시에도 포커스를 움직일지 여부를 명시한다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: overview에서 선택된 booth를 combined map 중심으로 가져오는 `focusOverviewViewportOnItem(item)` helper를 추가할지 결정한다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: overview 선택 시 preserve zoom를 유지할지 기본 overview scale로만 재센터링할지 한 가지 정책으로 고정한다.

11. - [ ] **`selectItem()`의 override 정책을 호출 경로별로 분리한다** — 지도 탭 탐색과 리스트/시트 진입을 분리
   - [ ] `src/routes/+page.svelte`: `selectItem()`에 `preserveMapSectionOverride` 또는 동등 인자를 추가할지 검토하고, overview 탭 탭에서는 `all` 유지가 가능하도록 변경 계획을 적는다.
   - [ ] `src/routes/+page.svelte`: `onPinClick`에서 같은 부스를 다시 누르면 detail sheet를 여는 현재 계약은 유지하되, 첫 탭에서 `mapSectionOverride`를 덮어쓰지 않는 조건을 분리한다고 명시한다.
   - [ ] `src/routes/+page.svelte`: `viewItemOnMap()`와 홈/리스트의 `지도에서 보기` 버튼은 기존처럼 해당 `mapSectionId`로 이동시키는 경로를 유지한다고 구분한다.

12. - [ ] **overview 안내 문구와 수동 검증 기준을 새 계약에 맞춘다** — 사용자가 `전체`에서도 확대된다는 사실을 이해하게 만든다
   - [ ] `src/lib/components/ExhibitionMap.svelte`: 상단 focus 패널 설명과 coarse pointer 안내 문구를 `전체` overview zoom 지원 기준으로 갱신 대상으로 적는다.
   - [ ] `MANUAL_TASKS.md`: `전체` 뷰 pinch/wheel/button 확대, drag pan, selection 후 `all` 유지, `지도에서 보기` CTA의 섹션 강제 이동을 각각 별도 체크 항목으로 추가한다고 명시한다.
   - [ ] `package.json`, `src/lib/components/ExhibitionMap.svelte`, `src/routes/+page.svelte`: 구현 후 `npm run check`로 타입/컴파일 회귀가 없는지 확인하는 검증 체크를 마지막 Phase에 포함한다고 적는다.

---

*상태: 초안 | 진행률: 0/48 (0%)*
