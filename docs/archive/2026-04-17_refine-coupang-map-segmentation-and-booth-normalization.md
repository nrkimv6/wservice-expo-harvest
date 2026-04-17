# refine: coupang map segmentation and booth normalization

> 완료일: 2026-04-17
> 아카이브됨
> 진행률: 43/43 (100%)
> 작성일시: 2026-04-17 18:40
> 기준커밋: 849b4f1
> 대상 프로젝트: expo-harvest
> 상태: 구현완료
> 반영일시: 2026-04-17 19:48
> 머지커밋: 9622a22
> 진행률: 43/43 (100%)
> 요약: 현재 쿠팡 메가뷰티쇼 지도는 `1F/2F` 층 개념에 브랜드 부스와 `뷰티박스 수령존` 오버레이를 같이 얹는 구조라서, 사용자가 실제 동선상 별도 구역으로 인식하는 `1F 전시관`, `2F 전시관`, `뷰티박스 수령존(1F 외부)`을 독립 지도로 보기 어렵다. 이번 계획은 지도 모델을 층 중심에서 전시 구역 중심으로 재정의하고, 부스 정보가 부족한 항목도 다른 브랜드와 동일한 4:3 박스 규격으로 렌더되게 정규화하며, SVG 장식과 부스 내부 여백을 줄여 한 화면에 더 많은 부스를 읽을 수 있게 만들고, `인생네컷/포렌코즈/파페치` 우측 구역을 세로 축으로 정렬하는 데 목적이 있다.

---

## 개요

현재 [`src/lib/data/lootItems.ts`](D:/work/project/service/wtools/expo-harvest/src/lib/data/lootItems.ts)에서는 `FloorId = '1F' | '2F'`가 지도 탭, 부스 위치, 오버레이 귀속을 모두 동시에 표현한다. 이 구조 때문에 `뷰티박스 수령존`은 실제로는 1층 외부 수령 구역에 가깝지만, 데이터상으로는 1F 지도 내부 `eventZone` 오버레이 하나로만 존재한다. 또한 [`src/routes/+page.svelte`](D:/work/project/service/wtools/expo-harvest/src/routes/+page.svelte)의 `selectItem()`은 `mapFloorOverride = nextItem.floorId`로 바로 연결되어 있어서, 리스트/상세에서 지도로 돌아갈 때도 "물리적 층"과 "현재 보여줄 지도"가 같은 개념이라는 전제를 깔고 있다.

사용자 요청은 이 전제를 깨고, 지도를 `1F 전시관`, `2F 전시관`, `뷰티박스 수령존(1F, 외부)` 3개 구역으로 분리해 탐색하게 만드는 것이다. 동시에 현재 일부 항목이 소스 도면의 긴 가로형 부스 흔적을 유지할 수 있는 경로를 정리해, 부스 정보가 빈약한 항목도 다른 브랜드와 동일한 4:3 박스 형태로 보이도록 렌더 기준을 통일해야 한다. 추가로 현재 지도는 부스 내부 여백, SVG 전체 패딩, 녹색 외곽선, 둥근 부스 모서리 때문에 실제 정보 밀도가 낮아 보이므로, 확대 의존도를 낮추는 방향으로 박스 내부 타이포와 부스 간격까지 함께 재조정해야 한다. 특히 `2F` 우측 구역의 `인생네컷 포토존`, `포렌코즈`, `파페치 / TW 홍보 부스`는 가로로 흩어지지 않고 세로로 나란한 흐름으로 재배치해야 한다.

## 기술적 고려사항

- [`src/lib/data/lootItems.ts`](D:/work/project/service/wtools/expo-harvest/src/lib/data/lootItems.ts)에서 `FloorMap`, `LootItem.floorId`, `MapOverlay.floorId`, `defaultFloorId`가 모두 같은 타입을 공유하므로, 3개 지도 분리는 단순 데이터 추가가 아니라 타입 의미 분리가 먼저 필요하다.
- [`src/lib/components/ExhibitionMap.svelte`](D:/work/project/service/wtools/expo-harvest/src/lib/components/ExhibitionMap.svelte)는 `activeFloor`, `getFloorItems()`, `focusViewportOnItem()`에서 `item.floorId === activeFloor`를 직접 가정한다. `뷰티박스 수령존`처럼 오버레이만 있는 지도까지 허용하려면 "현재 지도 구역"과 "부스의 물리적 층/위치"를 분리해야 한다.
- [`src/routes/+page.svelte`](D:/work/project/service/wtools/expo-harvest/src/routes/+page.svelte), [`src/lib/components/LootCard.svelte`](D:/work/project/service/wtools/expo-harvest/src/lib/components/LootCard.svelte), [`src/lib/components/BoothDetailSheet.svelte`](D:/work/project/service/wtools/expo-harvest/src/lib/components/BoothDetailSheet.svelte)는 모두 `floorId`를 직접 배지나 지도 이동 기준으로 사용한다. 지도 분리 후에도 사용자에게는 `1F`, `2F`, `1F 외부` 같은 위치 정보가 유지돼야 하므로, 표시용 위치 문자열을 새 지도 구역 식별자와 혼동하지 않게 해야 한다.
- [`src/lib/components/ExhibitionMap.svelte`](D:/work/project/service/wtools/expo-harvest/src/lib/components/ExhibitionMap.svelte)의 `getBoothRect()`는 `renderWidth ?? boxWidth`, `renderHeight ?? boxHeight` fallback을 사용한다. 현재 쿠팡 레이아웃 데이터는 대부분 `renderWidth/renderHeight`를 채우고 있지만, 정보 부족 항목을 정규화할 때는 "어떤 항목이 4:3 공통 박스를 강제 적용받는지"를 명시적으로 관리해야 긴 가로형 소스 폭이 다시 노출되지 않는다.
- [`src/lib/components/ExhibitionMap.svelte`](D:/work/project/service/wtools/expo-harvest/src/lib/components/ExhibitionMap.svelte)에는 현재 `<svg class="h-full w-full p-2">` 패딩과 외곽 녹색 `rect`(`stroke="#4caf50"`)가 있어 실제 지도에 쓸 수 있는 영역이 줄어든다. 한 화면 정보량을 높이려면 이 외곽 장식을 걷어내고 viewport 안쪽 여백 자체를 다시 계산해야 한다.
- 같은 파일에서 부스 본체는 `rx="10"`, 선택 outline은 `rx="14"`를 사용하고, 라벨은 보수적인 폰트 크기와 중앙 정렬만 적용한다. 사용자가 요구한 "꽉 찬 글씨"와 좁은 간격을 만족하려면 박스 모서리, outline 여백, 라벨 줄간격/폰트 크기, 부스 간 render 좌표를 한 번에 조정해야 한다.
- [`src/lib/data/lootItems.ts`](D:/work/project/service/wtools/expo-harvest/src/lib/data/lootItems.ts) 기준으로 `포렌코즈`는 부스 layout이고, `인생네컷 포토존`, `파페치 / TW 홍보 부스`는 `2F` overlay다. 사용자가 요구한 "세로로 나란함"을 만족하려면 박스와 오버레이가 같은 우측 컬럼 축을 공유하도록 좌표 체계를 함께 손봐야 한다.

---

## TODO

### Phase 1: 층 중심 데이터 모델을 지도 구역 중심으로 분리한다

1. - [x] **지도 구역 식별자와 물리적 층 표기를 다른 필드로 나눈다**
   - [x] `src/lib/data/lootItems.ts`: `FloorId`와 별도로 `MapSectionId`(가칭) 및 지도 메타 타입을 추가해 `1F 전시관`, `2F 전시관`, `뷰티박스 수령존` 3개 구역을 표현한다.
   - [x] `src/lib/data/lootItems.ts`: `FloorMap`/`defaultFloorId`/`MapOverlay.floorId` 등 지도 자체를 가리키는 타입 이름과 필드를 구역 중심 이름으로 바꾸거나 래핑해 의미 충돌을 제거한다.
   - [x] `src/lib/data/lootItems.ts`: `LootItem`에는 계속 물리적 위치를 나타내는 `floorId`/`location`을 유지하고, 지도 진입용으로는 **별도 필드 `mapSectionId`를 추가**한다(helper only로 우회 금지 — 데이터 자체에 귀속을 박아 Phase 2의 매핑이 단일 경로를 갖게 한다).
   - [x] `src/lib/data/lootItems.ts`: `getFloorLabel()` 성격의 helper를 지도 구역 라벨과 물리적 층 배지 용도로 분리해 이후 UI가 어느 값을 써야 하는지 명확히 한다.

2. - [x] **쿠팡 메가뷰티쇼 지도 데이터를 3개 구역으로 다시 나눈다**
   - [x] `src/lib/data/lootItems.ts`: 현재 `coupangMegaBeautyShow2026Floors`를 3개 지도 구역 배열로 재구성하고, `1F 전시관`, `2F 전시관`, `뷰티박스 수령존(1F 외부)` 라벨과 `viewBox`를 정의한다. **Phase 3-7에서 외곽 녹색 `rect`/SVG `p-2` 패딩을 제거하므로, 각 구역 `viewBox`는 부스 최외곽 좌표 + 최소 안쪽 여백만 포함하도록 여기에서 미리 맞춘다**(Phase 3에서 bounding 기준이 사라진 뒤 재계산 파편화 방지).
   - [x] `src/lib/data/lootItems.ts`: 현재 1F 오버레이에 섞여 있는 `뷰티박스 수령존` 관련 `eventZone`, 화살표, 장식 요소를 외부 수령존 전용 지도 구역으로 이동한다.
   - [x] `src/lib/data/lootItems.ts`: 브랜드 부스는 `1F 전시관`/`2F 전시관`에만 남기고, `뷰티박스 수령존` 지도는 오버레이 전용이어도 깨지지 않도록 데이터 조건을 정리한다.
   - [x] `src/lib/data/lootItems.ts`: `venue`, `description`, `mapNote`, `defaultFloorId` 성격의 전시 설명 문구를 3개 지도 구역 탐색 기준에 맞게 갱신한다.

### Phase 2: 지도 선택과 부스 포커스를 구역 기준으로 다시 연결한다

3. - [x] **ExhibitionMap의 내부 상태를 floor가 아니라 map section 기준으로 바꾼다**
   - [x] `src/lib/components/ExhibitionMap.svelte`: `ActiveFloor`, `selectedFloor`, `activeFloor`, `visibleFloors` 등 상태 이름을 지도 구역 의미에 맞게 치환한다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: `getFloorItems()`와 `getActiveFloorData()`가 `item.floorId` 직접 비교 대신 부스-지도 구역 매핑 helper를 사용하도록 바꾼다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: `resetViewport()`, `focusViewportOnItem()`, `floorViewportStates` 저장 키를 새 지도 구역 식별자 기준으로 재연결한다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: 오버레이만 있는 `뷰티박스 수령존` 지도에서도 헤더, 빈 상태, booth count가 어색하지 않도록 요약 문구와 조건부 렌더를 정리한다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: `focusViewportOnItem()` 호출 시 대상 부스가 활성 지도 구역에 없는 경우(예: `뷰티박스 수령존` 지도 활성 상태에서 브랜드 부스 포커스 요청, 혹은 그 반대) **전체 viewport 리셋(resetViewport)으로 fallback**하고, 경고가 아닌 정상 경로로 처리한다.

4. - [x] **리스트/상세에서 지도 탭으로 돌아가는 흐름을 새 구역 모델에 맞춘다**
   - [x] `src/routes/+page.svelte`: `mapFloorOverride`를 지도 구역 중심 이름으로 바꾸고, 전시 전환 초기값도 새 기본 지도 구역을 사용하도록 수정한다.
   - [x] `src/routes/+page.svelte`: `selectItem(id, focusMap, openDetail)`가 `nextItem.floorId` 대신 "해당 부스를 보여줄 지도 구역"을 계산해 이동하도록 변경한다.
   - [x] `src/lib/components/LootCard.svelte`: 카드 배지는 계속 물리적 층/위치 정보를 보여주되, 지도 이동 설명 문구가 새 3구역 구조와 충돌하지 않게 정리한다.
   - [x] `src/lib/components/BoothDetailSheet.svelte`: 상세 시트의 층 배지와 `지도에서 보기` 동작이 새 지도 구역 모델에서도 사용자가 예상한 위치로 이동하는지 보장한다.

### Phase 3: 정보 부족 부스를 정규화하고 기본 렌더 밀도를 끌어올린다

5. - [x] **어떤 항목을 공통 부스 모양으로 강제할지 판정 기준을 고정한다**
   - [x] `src/lib/data/lootItems.ts`: 현재 쿠팡 부스 데이터 중 "부스 정보가 부족한 항목"의 판정 기준을 **명시적 id 목록(상수)로 고정**한다(암묵적 빈 문자열/조건식 금지 — 재발 방지 목적이므로 목록 방식으로 단일화).
   - [x] `src/lib/data/lootItems.ts`: 4:3 공통 렌더 박스를 위한 `NORMALIZED_BOOTH_RENDER_WIDTH/HEIGHT` 상수 또는 layout helper를 추가한다.
   - [x] `src/lib/data/lootItems.ts`: 공통 박스 적용 대상이 소스 `boxWidth/boxHeight`와 무관하게 동일한 `renderWidth/renderHeight`를 쓰도록 레이아웃 정의를 재구성한다.
   - [x] `src/lib/data/lootItems.ts`: 향후 다른 박람회 데이터에서도 같은 정규화 규칙을 재사용할 수 있게 쿠팡 전용 하드코딩과 공통 helper의 경계를 정리한다.

6. - [x] **실제 SVG 렌더가 항상 정규화 박스를 사용하게 만든다**
   - [x] `src/lib/components/ExhibitionMap.svelte`: `getBoothRect()`가 정규화 대상 항목에서 긴 가로형 `boxWidth/boxHeight`로 되돌아가지 않도록 입력 경로를 단일화한다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: 선택 outline, 상태 배지, 라벨 중심 계산이 4:3 공통 박스에서도 어긋나지 않게 같은 rect helper를 기준으로 유지한다.
   - [x] `src/lib/data/lootItems.ts`, `src/lib/components/ExhibitionMap.svelte`: `THE FACE SHOP`, `NATURE REPUBLIC`, `AGE20'S`처럼 다행 라벨을 쓰는 항목이 공통 박스 안에서 넘치지 않는지 폰트 크기와 줄 수 규칙을 함께 점검한다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: 지도 구역 분리 후에도 특정 항목만 유독 넓게 보이는 fallback이 남아 있는지 렌더 경로를 다시 검색해 정리한다.

7. - [x] **부스 내부 여백과 지도 장식을 줄여 한 화면 정보량을 높인다**
   - [x] `src/lib/components/ExhibitionMap.svelte`: 부스 텍스트가 더 꽉 차게 보이도록 라벨 폰트 크기, 다행 라벨 `tspan` 간격, 텍스트 기준점 보정을 밀도 우선 규칙으로 다시 조정한다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: `<svg class="h-full w-full p-2">`와 외곽 녹색 `rect`를 제거하거나 동등한 방식으로 축소해, 실제 지도에 쓸 수 있는 렌더 영역을 늘린다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: 부스 본체 `rx="10"`과 선택 outline `rx="14"`를 제거(또는 `rx="2"` 이하)하고, 모서리 radius 없이도 selection이 읽히도록 **stroke-width 증가(예: 1.5→2.5) + 강조 색 대비 상승** 두 가지를 기본안으로 한다(대시/글로우는 보조 옵션).
   - [x] `src/lib/data/lootItems.ts`, `src/lib/components/ExhibitionMap.svelte`: 브랜드 부스 간 `renderX/renderY` 간격을 다시 조여, 겹침 없이 한 화면에 최대한 많은 박스가 보이도록 배치 밀도를 재조정한다.
   - [x] `src/lib/data/lootItems.ts`, `src/lib/components/ExhibitionMap.svelte`: `2F` 우측의 `인생네컷 포토존`, `포렌코즈`, `파페치 / TW 홍보 부스`가 같은 세로 축에서 위아래로 나란히 보이도록 overlay와 booth 좌표를 함께 재배치한다.

### Phase 4: 검증 기준을 3개 지도와 부스 모양 변화에 맞춰 갱신한다

8. - [x] **수동 검증과 정적 검증 기준을 새 구조에 맞춰 업데이트한다**
   - [x] `MANUAL_TASKS.md`: `1F 전시관/2F 전시관/뷰티박스 수령존` 3개 지도 선택, 지도별 viewport 표시, 오버레이 전용 지도 진입, 리스트에서 지도 이동 동작을 확인하는 체크리스트를 추가한다.
   - [x] `MANUAL_TASKS.md`: **구역 간 왕복 시나리오**를 별도 항목으로 추가한다 — (a) 1F 브랜드 카드→상세→"지도에서 보기"로 1F 전시관 이동, (b) 거기서 뷰티박스 수령존 탭 전환→다시 2F 브랜드 상세 진입→2F 전시관 이동, (c) 오버레이 전용 지도 활성 상태에서 브랜드 부스 포커스 요청 시 viewport 리셋 fallback 확인.
   - [x] `MANUAL_TASKS.md`: 정보 부족 부스가 긴 가로형이 아니라 다른 브랜드와 동일한 4:3 박스로 보이는지, 내부 글씨가 더 꽉 차서 확대 의존이 줄었는지 확인하는 육안 검증 항목을 추가한다.
   - [x] `package.json`, `src/lib/data/lootItems.ts`, `src/lib/components/ExhibitionMap.svelte`, `src/routes/+page.svelte`: 구현 후 `npm run check`로 타입/템플릿 회귀가 없는지 확인하는 검증 단계를 유지한다.
   - [x] `src/lib/components/LootCard.svelte`, `src/lib/components/BoothDetailSheet.svelte`, `src/lib/components/ExhibitionMap.svelte`: 층 배지와 지도 구역 라벨이 뒤섞여 보이지 않는지, 외곽 장식 제거 후에도 선택 상태가 충분히 식별되는지 최종 문구/스타일 점검 항목을 계획에 포함한다.

---

*상태: 구현완료 | 진행률: 43/43 (100%)*
