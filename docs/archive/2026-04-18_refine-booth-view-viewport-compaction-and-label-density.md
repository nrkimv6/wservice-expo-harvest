# refine: booth view viewport compaction and label density

> 완료일: 2026-04-18
> 아카이브됨
> 작성일시: 2026-04-18 09:21
> 기준커밋: cca5d8d
> 대상 프로젝트: expo-harvest
> 상태: 구현완료
> 반영일시: 2026-04-18 09:40
> 머지커밋: a551d4b
> 진행률: 9/9 (100%)
> 요약: 현재 `부스보기`는 계단 삭제와 우측 lane 재배치 이후에도 `1F/2F` single-section viewport가 원본 bounds를 거의 그대로 유지해 실제로 비어 있는 공간이 많이 남는다. 이번 계획은 `THE FACE SHOP` 우측/`AHC` 사이 여백, `2F` 우측 column 상단 여백을 viewport와 좌표 양쪽에서 다시 압축하고, booth/eventZone 라벨 개행과 폰트 점유율을 함께 높여 지도가 더 꽉 차 보이게 만드는 데 목적이 있다.

> 관련 계획:
> - [docs/archive/2026-04-18_fix-map-booth-viewport-normalization.md](D:/work/project/service/wtools/expo-harvest/docs/archive/2026-04-18_fix-map-booth-viewport-normalization.md): section별 기본 확대 체감을 1F 기준으로 맞춘 1차 보정이다. 이번 문서는 그 위에서 실제 배치가 비워 둔 우측/하단 여백을 다시 잘라내는 2차 압축에 해당한다.
> - [docs/archive/2026-04-18_refine-booth-view-stair-removal-and-2f-lane-spacing.md](D:/work/project/service/wtools/expo-harvest/docs/archive/2026-04-18_refine-booth-view-stair-removal-and-2f-lane-spacing.md): 계단 삭제와 2F 우측 3블록 column 재배치를 반영한 직전 후속이다. 이번 문서는 그 결과로 생긴 새 공백과 라벨 밀도 문제를 후속 보정한다.

---

## 개요

현재 [`src/lib/data/lootItems.ts`](D:/work/project/service/wtools/expo-harvest/src/lib/data/lootItems.ts)의 `hall-1f`/`hall-2f`는 single-section에서 `displayViewBox`가 사실상 raw `viewBox`와 거의 같게 유지돼 있다. 그래서 `1F`는 `THE FACE SHOP` column 우측과 하단에 실제로 부스/overlay가 없는 영역이 계속 보이고, `AHC` 오른쪽 끝과 `THE FACE SHOP` column 시작점 사이도 좌측 `롬앤 ~ 에스트라` 사이보다 훨씬 크게 벌어져 있다. `2F`도 우측 column을 `아리얼` 아래로 내렸지만, `인생네컷 포토존`의 `x/y`와 `displayViewBox`가 예전 여백을 많이 남긴 채라 체감상 여전히 듬성듬성해 보인다.

또한 [`src/lib/components/ExhibitionMap.svelte`](D:/work/project/service/wtools/expo-harvest/src/lib/components/ExhibitionMap.svelte)는 현재 `인생네컷 포토존`, `쿠팡 와우회원 인증존`, `헤어쇼 이벤트(4/18)`만 수동 줄바꿈하고 있고, booth 기본 글자 크기도 `12.4` fallback과 개별 `mapLabelFontSize` 예외에 의존한다. 사용자가 지적한 `쿠팡 어워즈 체험존`, `피부측정 이벤트`, `뷰티 디바이스 체험존`, `쿠팡 메가뷰티쇼 스토리`, `뷰티박스 수령존`은 아직 한 줄 또는 느슨한 line gap으로 남아 있어, viewport를 줄인 뒤에도 텍스트가 박스를 충분히 채우지 못할 수 있다.

이번 계획은 `1F`와 `2F` 모두에서 "비어 있는 시야를 줄이고, 남은 박스 내부 텍스트 점유율을 높인다"는 한 가지 목적 아래 묶는다. 구현 범위는 `displayViewBox/defaultScale`, `renderX/renderY`, event zone helper의 `centerX/centerY` 입력과 결과 `x/y`, 라벨 개행 helper, booth/eventZone font sizing, 그리고 그에 따라 바뀌는 수동 검증 항목으로 제한한다.

## 기술적 고려사항

- [`src/lib/data/lootItems.ts`](D:/work/project/service/wtools/expo-harvest/src/lib/data/lootItems.ts): 현재 `HALL_1F_VIEW_BOX = '12 16 666 364'`, `HALL_2F_VIEW_BOX = '12 16 726 308'`이고 `hall-1f.displayViewBox`는 raw와 동일하다. `beauty-box-pickup`만 별도 `createCenteredDisplayViewBox()`를 쓰므로, `1F/2F`의 비대칭 공백을 자르려면 centered helper만으로는 부족할 수 있다.
- [`src/lib/data/lootItems.ts`](D:/work/project/service/wtools/expo-harvest/src/lib/data/lootItems.ts): `AHC`의 오른쪽 끝은 `renderX 348 + width 72 = 420`인데, `THE FACE SHOP` column은 `renderX 522`에서 시작해 두 그룹 사이가 `102`만큼 비어 있다. 반면 `롬앤` 오른쪽 끝 `96`과 `에스트라` 시작 `132` 사이 간격은 `36`이라 사용자가 느끼는 불균형이 실제 데이터에도 존재한다.
- [`src/lib/data/lootItems.ts`](D:/work/project/service/wtools/expo-harvest/src/lib/data/lootItems.ts): `2F` 우측 lane은 현재 `인생네컷 포토존` center `690,189`, `포렌코즈 renderX/renderY 654,216`, `파페치 / TW 홍보 부스` center `690,297` 조합이다. `아리얼` 하단보다 아래에서 시작하더라도 column 자체가 여전히 오른쪽 끝에 치우쳐 있어 top/right blank가 남는다.
- [`src/lib/data/lootItems.ts`](D:/work/project/service/wtools/expo-harvest/src/lib/data/lootItems.ts): `createBoothSizedEventZoneAtCenter(mapSectionId, label, centerX, centerY, fontSize)`는 center 입력을 overlay의 최종 `x/y`로 환산한다. 따라서 `2F` 우측 event zone을 옮길 때는 helper 호출의 center 좌표와 assertion이 읽는 실제 `x/y`를 함께 맞춰야 한다.
- [`src/lib/components/ExhibitionMap.svelte`](D:/work/project/service/wtools/expo-harvest/src/lib/components/ExhibitionMap.svelte): single-section viewport는 `getDisplayMapSectionMetrics()` 기준, overview placement는 `getSourceMapSectionMetrics()` 기준으로 이미 분리돼 있다. 따라서 이번 후속은 overview 배치를 건드리지 않고 section `displayViewBox`와 `defaultCenter/defaultScale`만 조정하는 편이 안전하다.
- [`src/lib/components/ExhibitionMap.svelte`](D:/work/project/service/wtools/expo-harvest/src/lib/components/ExhibitionMap.svelte): section 초기 진입은 `resetViewport()`, `리셋` 버튼은 `handleZoomReset()`, 상세 시트의 `지도에서 보기` 포커스는 `focusViewportOnItem()`을 탄다. `displayViewBox`를 바꾸면 세 경로 모두 `createSectionViewportTarget()`의 새 metric을 재사용하는지 같이 확인해야 한다.
- [`src/lib/components/ExhibitionMap.svelte`](D:/work/project/service/wtools/expo-harvest/src/lib/components/ExhibitionMap.svelte): `getLabelFontSize()`, `getBoothLineGap()`, `getOverlayLabelLines()`, `getEventZoneFontSize()`, `getEventZoneLineGap()`를 함께 조정하지 않으면 viewport만 줄여도 박스 내부가 여전히 헐거워 보일 수 있다.
- [`src/routes/+page.svelte`](D:/work/project/service/wtools/expo-harvest/src/routes/+page.svelte): `ExhibitionMap` 소비처는 여전히 한 곳이라 prop surface를 바꾸지 않고 map data/render helper 내부 수정만으로 닫는 것이 안전하다.
- [`MANUAL_TASKS.md`](D:/work/project/service/wtools/expo-harvest/MANUAL_TASKS.md): 현재 수동 검증은 `2F` 우측 3부스 순서와 일부 2줄 라벨까지만 다룬다. viewport 압축과 텍스트 밀도 조정 뒤에는 `1F/2F` 첫 진입 시야와 라벨 충전도까지 확인 항목을 확장해야 한다.
- `git diff --name-only cca5d8d..main` 기준 대상 코드 드리프트는 없다. 기준커밋 이후 `main` 변경은 `TODO.md`와 계획 문서뿐이라, 이번 plan은 현재 `src/lib/data/lootItems.ts` / `src/lib/components/ExhibitionMap.svelte` 스냅샷을 그대로 구현 기준으로 삼아도 된다.

---

## TODO

### Phase 1: 1F 우측 열과 section viewport를 실제 점유 영역에 맞춰 압축한다
> 원자 작업: 13개

1. - [x] **1F 우측 세로 3열을 중앙 4부스에 더 가깝게 당긴다** — `AHC`와 `THE FACE SHOP` 사이 과도한 수평 공백을 줄인다
   - [x] `src/lib/data/lootItems.ts`: `COUPANG_MEGA_BEAUTY_BOOTH_LAYOUTS` 상단 계산 근거에 `AHC` 오른쪽 끝 `420`, 좌측 기준 gap `36`, 새 우측 column 목표 gap을 주석이나 상수로 고정해 다음 좌표 수정 때 같은 수치를 다시 읽을 수 있게 만든다.
   - [x] `src/lib/data/lootItems.ts`: `COUPANG_MEGA_BEAUTY_BOOTH_LAYOUTS['cmbs-2026-thefaceshop']`의 `renderX`만 새 column X로 수정해 `renderY = 24`, `renderWidth = 72`, `renderHeight = 54`는 그대로 둔다.
   - [x] `src/lib/data/lootItems.ts`: `COUPANG_MEGA_BEAUTY_BOOTH_LAYOUTS['cmbs-2026-espoir']`의 `renderX`만 같은 column X로 수정해 `renderY = 78`은 유지한다.
   - [x] `src/lib/data/lootItems.ts`: `COUPANG_MEGA_BEAUTY_BOOTH_LAYOUTS['cmbs-2026-tonymoly']`의 `renderX`만 같은 column X로 수정해 `renderY = 132`는 유지한다.
   - [x] `src/lib/data/lootItems.ts`: `assertCoupangMegaBeautyLayoutContract()`에서 `hall1fRightColumnX` / `hall1fCenterRowX` 검증 메시지를 새 gap 의도와 맞게 보강하고, row/column packing 외 값을 불필요하게 고정하지 않도록 확인한다.

2. - [x] **1F right/bottom blank를 줄이는 display viewport를 다시 정의한다** — 계단 삭제 뒤 남은 빈 시야를 잘라낸다
   - [x] `src/lib/data/lootItems.ts`: `hall-1f`의 오른쪽 끝 후보를 우측 3부스 `renderX + renderWidth`, 하단 끝 후보를 하단 event zone / `IN` / `OUT` arrow 좌표로 각각 계산해 새 bounds 근거 수치를 문서화한다.
   - [x] `src/lib/data/lootItems.ts`: `createCenteredDisplayViewBox()` 옆에 `createDisplayViewBoxFromBounds(minX, minY, maxX, maxY) -> string` helper를 추가해 비대칭 blank trimming을 문자열 상수 계산으로 고정한다.
   - [x] `src/lib/data/lootItems.ts`: `coupangMegaBeautyShow2026MapSections`의 `hall-1f.displayViewBox`를 새 helper 또는 동등 상수 호출로 교체해 raw `HALL_1F_VIEW_BOX` fallback이 남지 않게 만든다.
   - [x] `src/lib/data/lootItems.ts`: `hall-1f.defaultScale` 값을 유지 또는 미세 조정하고, 새 `displayViewBox`에서 1F가 과대 확대처럼 보이지 않는 판단 근거를 TODO/주석으로 남긴다.

3. - [x] **1F 첫 진입, 리셋, `지도에서 보기` viewport가 새 압축 bounds를 그대로 쓰는지 고정한다** — 좌표만 움직이고 시야가 예전 폭으로 남지 않게 막는다
   - [x] `src/lib/components/ExhibitionMap.svelte`: `createSectionViewportTarget(section)`가 `getDisplayMapSectionMetrics(section)`의 새 `hall-1f.displayViewBox`만 읽고 `viewBox` raw metric을 다시 참조하지 않는지 확인한다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: `resetViewport(nextSection)`의 `hall-1f` 초기 진입 경로가 새 `defaultCenter/defaultScale`를 `mapSectionViewportStates`에 저장하는지 확인하고, raw metric 기반 fallback이 있으면 제거 대상으로 기록한다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: `handleZoomReset()`와 `focusViewportOnItem(item, preserveZoom)`가 둘 다 `createSectionViewportTarget()`를 통해 새 bounds를 재사용하는지 확인한다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: single-section wrapper `aspect-ratio`, `getRenderedViewBox()`, `clampViewportCenter()`가 새 metric에서도 오른쪽 column과 하단 overlay를 잘리지 않게 유지하는지 확인한다.

### Phase 2: 2F 우측 column을 아리얼 아래로 재정렬하고 viewport를 같이 줄인다
> 원자 작업: 9개

4. - [x] **2F 우측 3블록 column을 아리얼 아래쪽으로 다시 붙인다** — `인생네컷 포토존`부터 시작하는 세로열의 상단 공백을 실제로 해소한다
   - [x] `src/lib/data/lootItems.ts`: `cmbs-2026-ariul`의 `renderY + renderHeight`로 현재 `아리얼` 하단을 계산하고, 우측 lane 첫 block이 가져야 할 목표 top gap 수치를 상수 또는 주석으로 남긴다.
   - [x] `src/lib/data/lootItems.ts`: `createBoothSizedEventZoneAtCenter('hall-2f', '인생네컷 포토존', centerX, centerY, fontSize)` 호출의 `centerX/centerY`만 새 lane 시작점에 맞춰 수정한다.
   - [x] `src/lib/data/lootItems.ts`: `COUPANG_MEGA_BEAUTY_BOOTH_LAYOUTS['cmbs-2026-forencos']`의 `renderX`와 `renderY`를 새 우측 lane column 기준으로 다시 맞춘다.
   - [x] `src/lib/data/lootItems.ts`: `createBoothSizedEventZoneAtCenter('hall-2f', '파페치 / TW 홍보 부스', centerX, centerY, fontSize)` 호출의 `centerX/centerY`를 같은 lane 기준으로 재배치한다.
   - [x] `src/lib/data/lootItems.ts`: `HALL_2F_RIGHT_LANE_LABELS`와 `assertCoupangMegaBeautyLayoutContract()`의 right-lane 검증이 새 column X 단일축, `아리얼` 아래 시작, top-to-bottom 순서를 계속 보장하는지 확인하고 메시지를 새 형상 기준으로 정리한다.

5. - [x] **2F top/right blank를 줄이는 display viewport를 새 lane 형상에 맞춰 다시 잡는다** — column 이동 뒤 남는 공백까지 함께 잘라낸다
   - [x] `src/lib/data/lootItems.ts`: `hall-2f`의 top-row booth, 좌측 lane event zone, 새 우측 lane item의 최소/최대 bounds를 함께 읽어 trimming 가능한 `minX/minY/maxX/maxY` 후보를 계산한다.
   - [x] `src/lib/data/lootItems.ts`: `coupangMegaBeautyShow2026MapSections`의 `hall-2f.displayViewBox`를 새 bounds helper 또는 동등 상수로 교체해 top/right blank가 raw `HALL_2F_VIEW_BOX`보다 줄어든 상태를 고정한다.
   - [x] `src/lib/data/lootItems.ts`: `hall-2f.defaultScale`을 유지 또는 재조정하고, `HALL_2F_REFERENCE_DEFAULT_SCALE`에서 얼마나 벗어나는지 판단 근거를 기록한다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: `resetViewport()`, `handleZoomReset()`, `focusViewportOnItem()`가 새 `hall-2f.displayViewBox`에서도 좌측 lane과 우측 column을 함께 보여 주는지 확인 대상으로 묶는다.

### Phase 3: 이벤트존 개행과 부스 글자 점유율을 높인다
> 원자 작업: 12개

6. - [x] **요청된 event zone 라벨을 명시적으로 2줄 분기한다** — 긴 문구가 한 줄로 눌려 보이지 않게 만든다
   - [x] `src/lib/components/ExhibitionMap.svelte`: `getOverlayLabelLines(label)`에 `쿠팡 어워즈 체험존`, `피부측정 이벤트`, `뷰티 디바이스 체험존`의 2줄 반환 배열을 각각 추가한다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: 같은 helper에 `쿠팡 메가뷰티쇼 스토리` 전용 2줄 분기를 추가한다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: 같은 helper에 `뷰티박스 수령존` 전용 2줄 분기를 추가한다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: 기존 `인생네컷 포토존`, `쿠팡 와우회원 인증존`, `헤어쇼 이벤트(4/18)`, `파페치 / TW 홍보 부스` 분기와 충돌하지 않게 순서를 정리하고, overview/section 렌더 양쪽이 같은 helper 호출을 유지하는지 확인한다.

7. - [x] **booth 글자 기본 크기와 line gap을 더 조밀하게 조정한다** — viewport를 줄인 뒤 박스 안이 더 꽉 차 보이게 만든다
   - [x] `src/lib/components/ExhibitionMap.svelte`: `getLabelFontSize(item)`의 fallback `12.4`를 새 기본 booth density 목표에 맞는 값으로 상향 조정한다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: `getBoothLineGap(item)`의 배수를 현재 `0.84`보다 조밀한 값으로 줄여 multi-line 간격을 압축한다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: `getBoothTextOffset(item, lineCount)`가 새 폰트/line gap 조합에서도 2줄 라벨을 너무 위로 띄우지 않게 보정한다.
   - [x] `src/lib/data/lootItems.ts`: `THE FACE SHOP`, `NATURE REPUBLIC`, `포렌코즈`의 `mapLabelFontSize`만 새 기본값 위에서 다시 맞춰 예외 브랜드가 과소/과대 텍스트가 되지 않게 한다.

8. - [x] **event zone 폰트와 line gap도 booth 밀도에 맞춰 상향한다** — 박스 내부 체감 밀도가 booth와 따로 놀지 않게 만든다
   - [x] `src/lib/components/ExhibitionMap.svelte`: `getEventZoneFontSize(overlay)`에서 booth-sized event zone 기본값 `9`를 상향 조정한다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: `getEventZoneLineGap(overlay)`의 배수를 현재 `0.82`보다 조밀한 값으로 줄인다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: `getEventZoneTextOffset(overlay, lineCount)`가 2줄 라벨에서도 상하 여백을 과도하게 남기지 않도록 보정한다.
   - [x] `src/lib/data/lootItems.ts`: `COUPANG_MEGA_BEAUTY_OVERLAYS` 안 event zone `fontSize` 예외값만 새 기본값 위에서 다시 미세 조정해 넘치거나 답답한 라벨이 남지 않게 한다.

### Phase 4: 회귀 방지 계약과 수동 확인 기준을 새 형상으로 갱신한다
> 원자 작업: 5개

9. - [x] **새 viewport/타이포 기대치를 문서와 검증 루틴에 고정한다** — 다음 좌표 수정 때 같은 여백 문제가 다시 생겨도 바로 잡을 수 있게 만든다
   - [x] `MANUAL_TASKS.md`: `1F` 첫 진입에서 `THE FACE SHOP` 우측/하단 blank가 줄고, `AHC`와 우측 column 사이 간격이 좌측 gap과 비슷하게 보이는지 확인 항목을 추가한다.
   - [x] `MANUAL_TASKS.md`: `2F` 첫 진입에서 `인생네컷 포토존 / 포렌코즈 / 파페치·TW 홍보 부스`가 `아리얼` 아래에서 시작하면서 top/right blank가 줄어든 상태를 확인하는 항목을 추가한다.
   - [x] `MANUAL_TASKS.md`: `쿠팡 어워즈 체험존`, `피부측정 이벤트`, `뷰티 디바이스 체험존`, `쿠팡 메가뷰티쇼 스토리`, `뷰티박스 수령존`이 2줄 라벨로 읽히는지 확인 항목을 추가한다.
   - [x] `MANUAL_TASKS.md`: booth 글자와 booth-sized event zone 글자가 이전보다 더 크게, 더 촘촘하게 느껴지는지 확인하는 항목을 추가한다.
   - [x] `package.json`, `src/lib/data/lootItems.ts`, `src/lib/components/ExhibitionMap.svelte`: 완료 기준에 `npm run check`, `npm run build`, `assertCoupangMegaBeautyLayoutContract()` 통과를 모두 요구한다는 문장을 계획서에 남긴다.

---

*상태: 구현완료 | 진행률: 9/9 (100%)*
