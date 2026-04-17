# refine: coupang floor map readability and mobile flow

> 완료일: 2026-04-17
> 아카이브됨
> 진행률: 72/72 (100%)
> 작성일시: 2026-04-17 16:59
> 기준커밋: 419b177
> 대상 프로젝트: expo-harvest
> 상태: 구현완료
> 반영일시: 2026-04-17 17:46
> 머지커밋: 333d633
> 진행률: 72/72 (100%)
> 요약: 현재 쿠팡 메가뷰티쇼 지도는 원본 SVG 좌표를 충실히 옮겼지만, 실제 현장 탐색 기준으로는 부스가 작고 라벨이 약해 한눈에 들어오지 않는다. 이번 계획은 원본 좌표는 유지하되 화면 렌더 정책을 가독성 우선으로 재정의하고, hover 의존도를 줄인 모바일 터치 흐름까지 함께 정리하는 데 목적이 있다.

---

## 개요

현재 [`src/lib/components/ExhibitionMap.svelte`](D:/work/project/service/wtools/expo-harvest/src/lib/components/ExhibitionMap.svelte)는 층별 SVG를 `viewBox + w-full`로 그대로 축소 렌더하고, 브랜드 라벨은 `item.englishTitle ?? item.title`를 한 줄 `<text>`로 출력한다. 이 구조는 원본 도면 보존에는 유리하지만, 실제 사용자는 "지금 어느 부스가 어디 있는지"를 빠르게 읽어야 하므로 부스 크기, 라벨 선택 기준, 줄바꿈, 강조 우선순위가 더 중요하다.

모바일에서는 문제가 더 분명하다. 현재 앱 셸은 [`src/routes/+page.svelte`](D:/work/project/service/wtools/expo-harvest/src/routes/+page.svelte)의 `max-w-lg` 단일 컬럼이며 지도 탭 안에서도 hover 요약 패널이 남아 있어, 터치 환경에서 공간을 차지하지만 정보 전달력은 낮다. 또한 [`src/lib/components/LootFeed.svelte`](D:/work/project/service/wtools/expo-harvest/src/lib/components/LootFeed.svelte)와 상세 시트 흐름은 이미 잘 갖춰져 있으므로, 지도는 "탐색", 리스트는 "검색", 시트는 "상세" 역할을 더 명확히 나눌 필요가 있다.

이번 계획의 목표는 다음 네 가지다.

1. 원본 좌표 데이터와 화면용 렌더 규칙을 분리한다.
2. 단일 층에서 브랜드 부스가 더 크게, 더 균일하게 보이도록 렌더 정책을 바꾼다.
3. 짧은 한글명 우선, 필요 시 자동 줄바꿈되는 라벨 시스템을 도입한다.
4. 모바일에서는 hover 대신 탭, 선택 상태, 층 전환, 리스트 점프로 탐색 흐름을 완성한다.

## 관련 계획

- [`docs/plan/2026-04-17_refine-map-pin-hover-ux.md`](D:/work/project/service/wtools/expo-harvest/docs/plan/2026-04-17_refine-map-pin-hover-ux.md)의 hover/mobile 상호작용 범위는 이 문서의 Phase 4에 병합한다.
- 따라서 `Hover Booth` 패널 정리, mobile tap 흐름, 선택 요약은 이 계획을 기준으로 실행하고, 기존 hover plan은 별도 구현 큐로 분리하지 않는다.

## 기술적 고려사항

- [`src/lib/data/lootItems.ts`](D:/work/project/service/wtools/expo-harvest/src/lib/data/lootItems.ts)는 현재 `englishTitle`, `floorId`, `mapX`, `boxWidth`, `fontSize` 정도만 가지고 있어 "지도에 무엇을 어떻게 적을지"를 결정하는 표현 계층이 부족하다. `mapLabel`, `mapLabelLines`, `renderBoxPreset` 같은 화면용 메타가 필요하다.
- [`src/lib/components/ExhibitionMap.svelte`](D:/work/project/service/wtools/expo-harvest/src/lib/components/ExhibitionMap.svelte)는 hover/focus 이벤트와 상단 요약 패널을 함께 관리하고 있어, 데스크톱/모바일의 상호작용 차이를 분기하기 어렵다. `pointer fine`와 `pointer coarse` 기준으로 표시 정책을 나누는 편이 낫다.
- [`src/routes/+page.svelte`](D:/work/project/service/wtools/expo-harvest/src/routes/+page.svelte)는 `mapFloorOverride`와 `activeTab` 연동이 이미 있으므로, 모바일 quick jump나 "리스트에서 선택하면 해당 층으로 이동" 같은 흐름은 기존 상태를 확장해서 해결할 수 있다.
- 하지만 현재 선택 상태는 `selectedId`가 [`src/routes/+page.svelte`](D:/work/project/service/wtools/expo-harvest/src/routes/+page.svelte)에만 있고, [`src/lib/components/ExhibitionMap.svelte`](D:/work/project/service/wtools/expo-harvest/src/lib/components/ExhibitionMap.svelte)는 `onPinClick`만 받아 내부에서 선택 강조를 할 수 없다. 선택 강조와 모바일 미니 요약을 구현하려면 `selectedId` 또는 `selectedItem`을 지도 컴포넌트까지 내려야 한다.
- [`src/lib/components/LootCard.svelte`](D:/work/project/service/wtools/expo-harvest/src/lib/components/LootCard.svelte)와 [`src/lib/components/BoothDetailSheet.svelte`](D:/work/project/service/wtools/expo-harvest/src/lib/components/BoothDetailSheet.svelte)는 층 배지와 상세 위치 문구를 이미 보여주므로, 모바일에서는 지도를 과하게 설명하지 말고 선택된 부스를 보조하는 형태가 적절하다.
- `git diff --name-only 419b177..main` 기준으로 코드 드리프트는 없고, 현재 `main` 변화는 문서 파일만 포함한다. 따라서 이 plan의 구현 범위는 현재 읽은 코드 상태를 기준으로 고정해도 된다.
- 375px 모바일 폭 기준 현재 지도 카드의 실제 SVG 가시 폭은 대략 270px대, 390px 기준으로는 280px대 후반이다. 기존 원본 박스(`60~90 x 35~45`)를 전체 floor 축소로 쓰면 대표 부스가 대략 25~35px 폭으로 줄어들고, `NATURE REPUBLIC`, `THE FACE SHOP`, `FORENCOS` 같은 긴 라벨은 한 줄 `<text>`에서 읽기 어려워진다.
- 이번 단계의 지도는 **정확한 평면도보다 현장 탐색 가독성을 우선한 도식도**다. 브랜드 부스는 `renderX/renderY/renderWidth/renderHeight` 기준으로 재배치하고, 이벤트존/계단/화살표는 원본 동선의 의미만 남긴 저강도 안내 레이어로 다룬다.

## UX 방향

- 기본 진입은 계속 `1F`로 유지하되, 단일층에서는 **한 번에 보이는 영역을 줄이는 대신 더 크게 읽히는 줌된 viewport**를 기본값으로 쓴다. `전체` 뷰는 상세 탐색이 아니라 층 구조 훑기 용도의 축약 overview로 유지한다.
- 확대/축소 버튼은 넣지 않는다. 대신 단일층에서는 손가락 pinch-zoom과 drag pan을 허용하고, 데스크톱에서는 휠/트랙패드 또는 드래그 기반 pan을 검토한다. `max-w-lg` 앱 셸 폭은 유지하되, viewport 자체를 확대 가능한 상태로 바꾼다.
- 모바일 입력 소유권은 `touch-action: none` 기반으로 **지도 영역 안에서는 한 손가락 drag가 지도 pan을 우선 소유**하고, 페이지 세로 스크롤은 지도 바깥에서 계속 수행하는 계약으로 고정한다. 두 손가락 pinch만 확대를 담당하고, 더블탭 확대는 넣지 않는다.
- 원본 `mapX/mapY` 좌표는 계속 보존하되, 이번 단계에서는 **화면용 재배치 좌표까지 허용**한다. 즉 3:4 통일은 단순 스타일 통일이 아니라 `renderX/renderY/renderWidth/renderHeight` 수준의 별도 레이아웃 계층을 둬 실제 배치도 함께 다듬는 방향으로 본다. 이벤트존/계단/화살표는 한 단계 더 연한 톤으로 내려 시선 분산을 줄인다. 이는 원본 도면 재현이 아니라 브랜드 탐색용 도식도라는 전제를 따른다.
- 지도 라벨은 "짧은 한글 우선, 아니면 영문, 필요 시 2줄" 규칙으로 통일한다.
- 모바일에서는 hover 패널보다 `선택된 부스 미니 요약`, `sticky 층 전환`, `리스트/검색에서 지도로 점프`가 더 중요하다.

---

## TODO

### Phase 0: 현재 렌더 가독성을 정량화한다 (2개 상위 작업)

1. - [x] **현재 SVG 렌더 기준치를 기록한다** — single-floor 확대 목표의 출발점 확보
   - [x] `src/lib/components/ExhibitionMap.svelte`: `viewBox={floor.viewBox}`와 `class="w-full ... p-2"`가 실제 렌더 폭을 어떻게 결정하는지 정리하고, 375px/390px 모바일 폭에서 SVG 래퍼의 예상 가시 폭을 기록한다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: 브랜드 `<rect>`가 `item.mapX/item.mapY/item.boxWidth/item.boxHeight`를 그대로 쓰는 현재 구조를 기준으로, 1F와 2F에서 대표 부스 3개씩의 예상 화면 픽셀 크기를 계산해 계획서에 남긴다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: `<text font-size={item.fontSize ?? 10}>`가 현재 어떤 브랜드에서 가장 작게 보이는지 추리고, `NATURE REPUBLIC`, `THE FACE SHOP`, `FORENCOS`를 대표 실패 사례로 고정한다.

2. - [x] **뷰 모드별 공간 사용 방식을 분리해 기록한다** — zoom viewport 정책의 경계 정의
   - [x] `src/lib/components/ExhibitionMap.svelte`: `activeFloor === 'all'`일 때 `visibleFloors`가 1F/2F를 세로 스택으로 렌더하는 현재 구조를 기록하고, overview 모드의 목표를 "전체 구조 훑기"로 명시한다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: 단일층 모드에서 지금은 zoom/pan이 없고 전체 floor가 한 번에 축소 렌더된다는 점을 기록해, 이후 "보이는 영역 축소 + 확대 상태"로 바뀌는 기준을 명시한다.
   - [x] `src/routes/+page.svelte`: 지도 탭이 `max-w-lg` 앱 셸 내부에서 렌더된다는 점을 기록하고, viewport 확대는 컨테이너 확장이 아니라 지도 내부 상태로 해결한다는 전제를 덧붙인다.

### Phase 1: 화면용 렌더 규칙을 데이터 모델로 분리한다 (5개 상위 작업)

3. - [x] **지도 전용 라벨 필드를 타입에 추가한다** — `englishTitle ?? title` 즉석 분기 제거 준비
   - [x] `src/lib/data/lootItems.ts`: `LootItem`에 `mapLabel?: string`, `mapLabelLines?: string[]`, `mapLabelFontSize?: number` 필드를 추가한다.
   - [x] `src/lib/data/lootItems.ts`: `BaseLootItem`의 `Omit<>` 목록에 새 지도 라벨 필드를 포함해 `applyCoupangMegaBeautyBoothLayout()`에서 병합할 수 있게 정리한다.
   - [x] `src/lib/data/lootItems.ts`: 지도 라벨 필드가 "상세 시트 제목"이 아니라 지도 박스 안 라벨만 위한 데이터라는 주석을 타입 근처에 추가한다.

4. - [x] **화면용 재배치 레이아웃 필드를 타입에 추가한다** — 원본 좌표와 render 좌표 분리
   - [x] `src/lib/data/lootItems.ts`: `LootItem`에 `renderX?: number`, `renderY?: number`, `renderWidth?: number`, `renderHeight?: number` 또는 동등한 `renderLayout` 필드를 추가한다.
   - [x] `src/lib/data/lootItems.ts`: `BoothLayout` 타입에 같은 render 계층을 추가해 쿠팡 메가뷰티쇼 상수에서 함께 정의할 수 있게 맞춘다.
   - [x] `src/lib/data/lootItems.ts`: `mapX/mapY/boxWidth/boxHeight`는 원본 viewBox 보존값, render 계층은 가독성용 화면값이라는 주석을 `BoothLayout` 근처에 남긴다.

5. - [x] **쿠팡 메가뷰티쇼 브랜드별 라벨/재배치 초안을 데이터에 채운다** — 19개 브랜드 기본값 확정
   - [x] `src/lib/data/lootItems.ts`: `COUPANG_MEGA_BEAUTY_BOOTH_LAYOUTS`에 1F 브랜드 10개의 `renderWidth/renderHeight` 초안을 추가한다.
   - [x] `src/lib/data/lootItems.ts`: `COUPANG_MEGA_BEAUTY_BOOTH_LAYOUTS`에 2F 브랜드 9개의 `renderWidth/renderHeight` 초안을 추가한다.
   - [x] `src/lib/data/lootItems.ts`: `coupangMegaBeautyShow2026Items`에서 짧은 한글명을 우선 적용할 브랜드에 `mapLabel` 값을 추가한다.
   - [x] `src/lib/data/lootItems.ts`: 영문 유지가 더 읽기 쉬운 브랜드에만 `mapLabel`을 영문으로 채우고, 이유가 있는 예외(`Dr.G`, `AHC`, `AGE20'S`)만 남긴다.

6. - [x] **레이아웃 병합 헬퍼를 render 계층까지 확장한다** — 단일 병합 경로 유지
   - [x] `src/lib/data/lootItems.ts`: `applyCoupangMegaBeautyBoothLayout(item: BaseLootItem): LootItem`가 새 render 필드도 함께 병합하도록 수정 대상으로 기록한다.
   - [x] `src/lib/data/lootItems.ts`: `applyCoupangMegaBeautyBoothLayout()` 안의 `location` 보정 주석은 유지하되, 지도 렌더는 render 좌표를 우선 쓴다는 설명을 함수 근처에 추가한다.
   - [x] `src/lib/data/lootItems.ts`: render 좌표가 비어 있는 경우 원본 좌표를 fallback으로 쓸 수 있도록 필요한 기본값 규칙을 함수 명세에 남긴다.

7. - [x] **선택 상태를 지도까지 내려줄 prop 계약을 설계한다** — 선택 강조와 선택 요약의 상태 소스 통일
   - [x] `src/routes/+page.svelte`: `selectedId`와 `selectedItem` 중 어느 값을 `ExhibitionMap`에 내릴지 결정하고, 새 prop 이름을 계획서에 고정한다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: 새 prop이 추가되면 현재 선택 부스를 찾는 파생 상태를 어디에 둘지(`$derived` 또는 helper) 계획서에 명시한다.
   - [x] `src/lib/components/ExhibitionMap.svelte`, `src/routes/+page.svelte`: `onPinClick(id)`로 열리는 상세 시트와 선택 강조가 동일 상태를 바라보도록 이벤트 흐름을 한 줄로 요약해 남긴다.

### Phase 2: 데스크톱 가독성 중심으로 지도 렌더를 재정렬한다 (5개 상위 작업)

8. - [x] **단일층 viewport 구조를 새로 잡는다** — overview와 zoomed floor를 같은 SVG 트리 안에서 분리
   - [x] `src/lib/components/ExhibitionMap.svelte`: `all` 뷰와 단일층 뷰의 SVG 래퍼 구조를 분리할지, 같은 컴포넌트에서 클래스/상태만 바꿀지 결정한다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: 단일층 모드에서 기본 zoom 상태를 적용할 래퍼 요소와 transform 적용 지점을 지정한다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: `all` 뷰에서는 zoom/pan 상태를 비활성화하고 현재 세로 스택 overview를 유지한다는 분기 규칙을 명시한다.

9. - [x] **브랜드 박스 렌더를 render 좌표 기준으로 바꾼다** — 원본 좌표 fallback 포함
   - [x] `src/lib/components/ExhibitionMap.svelte`: 브랜드 `<rect>`의 `x/y/width/height`가 `renderX/renderY/renderWidth/renderHeight ?? mapX/mapY/boxWidth/boxHeight`를 쓰도록 교체 지점을 명시한다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: 상태 배지 `<circle>` 위치 계산이 새 render 박스 우상단을 기준으로 다시 계산되도록 변경 지점을 적는다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: 선택된 부스는 새 prop 기반으로 stroke, fill, 또는 outer halo를 다르게 주는 렌더 분기를 추가한다.

10. - [x] **브랜드와 오버레이의 시각 우선순위를 분리한다** — 도식도 읽기 순서 보장
   - [x] `src/lib/components/ExhibitionMap.svelte`: `getBoothVisual(item)`는 브랜드 부스 상태색만 담당하도록 두고, 오버레이 색상은 별도 상수/헬퍼로 분리할 위치를 적는다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: 이벤트존 `<rect>`와 `<text>`의 fill/stroke/text 색상을 한 단계 낮춘 palette로 바꿀 변경 지점을 적는다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: 계단, 입출구 화살표, 장식 rect의 stroke/fill 농도를 브랜드보다 낮게 둘 구체 블록을 지정한다.

11. - [x] **다중 행 라벨 렌더 헬퍼를 정의한다** — 2줄 허용, 짧은 이름 확대
   - [x] `src/lib/components/ExhibitionMap.svelte`: 현재 단일 `<text>` 렌더 블록을 `mapLabelLines ?? derived lines`를 순회하는 `tspan` 구조로 바꿀 삽입 지점을 기록한다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: `mapLabelFontSize ?? item.fontSize ?? 10` 순서의 폰트 fallback 규칙을 라벨 블록 근처에 명시한다.
   - [x] `src/lib/components/ExhibitionMap.svelte`, `src/lib/data/lootItems.ts`: 긴 브랜드 3종과 짧은 브랜드 3종의 라벨 줄바꿈 예시를 계획서에 남겨 구현 후 비교 기준으로 삼는다.

12. - [x] **선택 요약과 선택 강조를 연결한다** — 선택 상태가 지도 상단 요약과 박스 강조를 동시에 구동
   - [x] `src/lib/components/ExhibitionMap.svelte`: 현재 `hoveredItemId` 기반 상단 패널을 `selectedId`/`selectedItem`과 함께 쓰는지, 모바일에서만 선택 우선으로 바꾸는지 분기 기준을 정한다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: 선택된 부스가 바뀌면 상단 요약에 표시할 필드(이름, 층, 선착순 여부)를 어떤 우선순위로 보여줄지 적는다.
   - [x] `src/routes/+page.svelte`: 리스트에서 선택된 부스가 지도 탭으로 넘어올 때 상단 요약과 박스 강조가 동시에 업데이트된다는 흐름을 계획서에 고정한다.

### Phase 3: 확대 viewport 상호작용을 정리한다 (4개 상위 작업)

13. - [x] **zoom 상태 모델을 정한다** — scale, translate, reset의 최소 상태 집합 정의
   - [x] `src/lib/components/ExhibitionMap.svelte`: 단일층용 `zoomScale`, `panX`, `panY` 또는 동등한 viewport 상태 이름을 정하고, 기본값을 기록한다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: floor 전환 또는 exhibition 전환 시 zoom 상태를 리셋할지 유지할지 `$effect` 기준을 명시한다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: `all` 뷰 진입 시 확대 상태를 강제로 기본값으로 돌릴지 여부를 분기 규칙으로 적는다.

14. - [x] **터치 입력 계약을 구체화한다** — 브라우저 기본 스크롤과 충돌 방지
   - [x] `src/lib/components/ExhibitionMap.svelte`: 단일층 확대 래퍼에 `touch-action`을 어떻게 줄지(`none`, `pan-y`, 조건부 적용)를 결정한다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: 한 손가락 drag pan과 페이지 세로 스크롤이 충돌하지 않게 하는 조건을 적는다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: 두 손가락 pinch-zoom만 확대를 담당하게 할지, 더블탭 확대를 제외할지 입력 정책을 명시한다.

15. - [x] **탭 선택과 pan 제스처의 충돌을 분리한다** — 부스 탭이 pan 중 오작동하지 않게 함
   - [x] `src/lib/components/ExhibitionMap.svelte`: pointer down/up 이동량 임계값으로 tap과 drag를 구분할지 여부를 결정한다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: 확대 상태에서 `<g role="button">`의 클릭 이벤트를 유지할지, 래퍼에서 제스처 판별 후 선택을 위임할지 결정한다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: 키보드 `Enter`/`Space` 선택은 pan 상태와 무관하게 계속 동작하도록 유지 지점을 적는다.

16. - [x] **데스크톱 포인터 상호작용을 모바일과 분기한다** — hover/focus와 pan/zoom 공존
   - [x] `src/lib/components/ExhibitionMap.svelte`: `pointer fine` 환경에서 hover/focus 문맥 안내를 유지할지, 선택 요약만 둘지 분기 기준을 문서화한다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: 휠/트랙패드 확대를 지원할 경우 scale 변경 지점과 스크롤 차단 조건을 기록한다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: 드래그 pan이 필요한 경우 마우스 드래그와 부스 클릭이 충돌하지 않게 할 처리 순서를 적는다.

### Phase 4: 모바일 터치 흐름을 별도 기준으로 설계한다 (4개 상위 작업)

17. - [x] **상단 `Hover Booth` 패널을 모바일 선택 요약으로 전환한다** — hover 문구 제거, 선택 문구 우선
   - [x] `src/lib/components/ExhibitionMap.svelte`: 현재 상단 패널의 정적 문구 "브랜드 박스에 커서를 올리면..."를 모바일용 선택 안내 문구로 바꿀 위치를 지정한다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: 모바일에서는 `selectedItem`, 데스크톱에서는 `hoveredItem`을 우선 노출하는 분기 규칙을 상단 패널 블록에 반영 대상으로 적는다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: 선택 요약에 노출할 필드를 `title/mapLabel`, `floorId`, `firstComeEvent` 순서로 고정한다.

18. - [x] **기존 hover plan 병합 흔적을 구현 경로에 맞게 정리한다** — 중복 큐 제거
   - [x] `docs/plan/2026-04-17_refine-coupang-floor-map-readability-mobile.md`: Phase 4가 `refine-map-pin-hover-ux`의 구현 범위를 대체한다는 문구를 유지한다.
   - [x] `docs/plan/2026-04-17_refine-map-pin-hover-ux.md`: 보류 상태와 병합 메모가 실제 구현 경로를 가리키는지 확인한다.
   - [x] `TODO.md`: `refine: map pin hover UX` 항목이 새 plan의 하위 참조라는 점을 더 명확히 할 필요가 있는지 검토 메모를 남긴다.

19. - [x] **모바일 층 전환과 지도 재진입 규칙을 고정한다** — sticky control + viewport 복귀 정책
   - [x] `src/lib/components/ExhibitionMap.svelte`: 층 토글 버튼 블록을 sticky 래퍼로 옮길 위치와 sticky가 적용될 스크롤 컨테이너를 지정한다.
   - [x] `src/routes/+page.svelte`: `selectItem(id, focusMap = false)`가 지도 탭 진입 시 `mapFloorOverride`와 `selectedId`를 함께 갱신하는 현재 흐름을 유지한다고 명시한다.
   - [x] `src/routes/+page.svelte`, `src/lib/components/ExhibitionMap.svelte`: 지도 탭으로 돌아올 때 마지막 zoom 상태를 복원할지, 선택 부스 기준으로 viewport를 다시 맞출지 둘 중 하나를 결정한다.

20. - [x] **리스트/상세 시트에서 지도 복귀 경로를 보강한다** — 한 손 탐색 재진입 비용 축소
   - [x] `src/lib/components/LootFeed.svelte`: 카드 선택 시 이미 `onSelectItem`으로 지도로 점프하는 흐름을 유지하면서, 추가 안내 문구가 필요한지 검토한다.
   - [x] `src/lib/components/LootCard.svelte`: 층 배지와 상세 진입 버튼이 지도 복귀 맥락을 더 잘 전달하도록 텍스트/배지 강조 변경 지점을 적는다.
   - [x] `src/lib/components/BoothDetailSheet.svelte`: 상세 시트에 "현재 부스 지도에서 보기" CTA를 넣을지, 기존 닫기 후 지도 강조만으로 충분한지 결정한다.
   - [x] `src/lib/components/BoothDetailSheet.svelte`, `src/routes/+page.svelte`: 상세 시트 CTA를 넣는다면 `onClose()` 이후 어떤 상태를 유지해야 하는지(`selectedId`, `activeTab`) 규칙을 적는다.

### Phase 5: 정적 검증과 모바일 수동 시나리오를 고정한다 (3개 상위 작업)

21. - [x] **정적 검증 명령과 대상 파일을 고정한다** — 구현 후 바로 실행 가능한 검증 체크 정의
   - [x] `package.json`: `npm run check`가 `svelte-kit sync && svelte-check --tsconfig ./tsconfig.json`임을 계획서에 유지해 타입 검증 명령을 고정한다.
   - [x] `package.json`: `npm run build`가 `node ./scripts/run-build.mjs`임을 계획서에 유지해 최종 빌드 검증 명령을 고정한다.
   - [x] `src/lib/components/ExhibitionMap.svelte`, `src/lib/data/lootItems.ts`, `src/routes/+page.svelte`: 정적 검증 대상 핵심 파일 3개를 구현 후 우선 확인 파일로 남긴다.

### Phase T4

> T4 해당 없음: `tests/` 디렉토리와 E2E harness가 없다. 이 프로젝트의 통합 게이트는 `npm run check`와 `npm run build`이며, 모바일 pinch/drag와 지도 시트 연결은 수동 브라우저 확인 메모로 남긴다.

### Phase T5

> T5 해당 없음: HTTP 백엔드와 API 테스트 대상이 없다. `expo-harvest`는 정적/클라이언트 중심 SvelteKit 앱이므로 실서버 HTTP 통합 테스트 대신 프런트엔드 verify만 수행한다.

---

*상태: 구현완료 | 진행률: 72/72 (100%)*
