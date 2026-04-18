# refine: booth view viewport compaction and label density

> 작성일시: 2026-04-18 09:21
> 기준커밋: cca5d8d
> 대상 프로젝트: expo-harvest
> 상태: 초안
> 진행률: 0/9 (0%)
> 요약: 현재 `부스보기`는 계단 삭제와 우측 lane 재배치 이후에도 `1F/2F` single-section viewport가 원본 bounds를 거의 그대로 유지해 실제로 비어 있는 공간이 많이 남는다. 이번 계획은 `THE FACE SHOP` 우측/`AHC` 사이 여백, `2F` 우측 column 상단 여백을 viewport와 좌표 양쪽에서 다시 압축하고, booth/eventZone 라벨 개행과 폰트 점유율을 함께 높여 지도가 더 꽉 차 보이게 만드는 데 목적이 있다.

> 관련 계획:
> - [docs/archive/2026-04-18_fix-map-booth-viewport-normalization.md](D:/work/project/service/wtools/expo-harvest/docs/archive/2026-04-18_fix-map-booth-viewport-normalization.md): section별 기본 확대 체감을 1F 기준으로 맞춘 1차 보정이다. 이번 문서는 그 위에서 실제 배치가 비워 둔 우측/하단 여백을 다시 잘라내는 2차 압축에 해당한다.
> - [docs/archive/2026-04-18_refine-booth-view-stair-removal-and-2f-lane-spacing.md](D:/work/project/service/wtools/expo-harvest/docs/archive/2026-04-18_refine-booth-view-stair-removal-and-2f-lane-spacing.md): 계단 삭제와 2F 우측 3블록 column 재배치를 반영한 직전 후속이다. 이번 문서는 그 결과로 생긴 새 공백과 라벨 밀도 문제를 후속 보정한다.

---

## 개요

현재 [`src/lib/data/lootItems.ts`](D:/work/project/service/wtools/expo-harvest/src/lib/data/lootItems.ts)의 `hall-1f`/`hall-2f`는 single-section에서 `displayViewBox`가 사실상 raw `viewBox`와 거의 같게 유지돼 있다. 그래서 `1F`는 `THE FACE SHOP` column 우측과 하단에 실제로 부스/overlay가 없는 영역이 계속 보이고, `AHC` 오른쪽 끝과 `THE FACE SHOP` column 시작점 사이도 좌측 `롬앤 ~ 에스트라` 사이보다 훨씬 크게 벌어져 있다. `2F`도 우측 column을 `아리얼` 아래로 내렸지만, `인생네컷 포토존`의 `x/y`와 `displayViewBox`가 예전 여백을 많이 남긴 채라 체감상 여전히 듬성듬성해 보인다.

또한 [`src/lib/components/ExhibitionMap.svelte`](D:/work/project/service/wtools/expo-harvest/src/lib/components/ExhibitionMap.svelte)는 현재 `인생네컷 포토존`, `쿠팡 와우회원 인증존`, `헤어쇼 이벤트(4/18)`만 수동 줄바꿈하고 있고, booth 기본 글자 크기도 `12.4` fallback과 개별 `mapLabelFontSize` 예외에 의존한다. 사용자가 지적한 `쿠팡 어워즈 체험존`, `피부측정 이벤트`, `뷰티 디바이스 체험존`, `쿠팡 메가뷰티쇼 스토리`, `뷰티박스 수령존`은 아직 한 줄 또는 느슨한 line gap으로 남아 있어, viewport를 줄인 뒤에도 텍스트가 박스를 충분히 채우지 못할 수 있다.

이번 계획은 `1F`와 `2F` 모두에서 "비어 있는 시야를 줄이고, 남은 박스 내부 텍스트 점유율을 높인다"는 한 가지 목적 아래 묶는다. 구현 범위는 `displayViewBox/defaultScale`, `renderX/renderY`, event zone `center`, 라벨 개행 helper, booth/eventZone font sizing, 그리고 그에 따라 바뀌는 수동 검증 항목으로 제한한다.

## 기술적 고려사항

- [`src/lib/data/lootItems.ts`](D:/work/project/service/wtools/expo-harvest/src/lib/data/lootItems.ts): 현재 `HALL_1F_VIEW_BOX = '12 16 666 364'`, `HALL_2F_VIEW_BOX = '12 16 726 308'`이고 `hall-1f.displayViewBox`는 raw와 동일하다. `beauty-box-pickup`만 별도 `createCenteredDisplayViewBox()`를 쓰므로, `1F/2F`의 비대칭 공백을 자르려면 centered helper만으로는 부족할 수 있다.
- [`src/lib/data/lootItems.ts`](D:/work/project/service/wtools/expo-harvest/src/lib/data/lootItems.ts): `AHC`의 오른쪽 끝은 `renderX 348 + width 72 = 420`인데, `THE FACE SHOP` column은 `renderX 522`에서 시작해 두 그룹 사이가 `102`만큼 비어 있다. 반면 `롬앤` 오른쪽 끝 `96`과 `에스트라` 시작 `132` 사이 간격은 `36`이라 사용자가 느끼는 불균형이 실제 데이터에도 존재한다.
- [`src/lib/data/lootItems.ts`](D:/work/project/service/wtools/expo-harvest/src/lib/data/lootItems.ts): `2F` 우측 lane은 현재 `인생네컷 포토존` center `690,189`, `포렌코즈 renderX/renderY 654,216`, `파페치 / TW 홍보 부스` center `690,297` 조합이다. `아리얼` 하단보다 아래에서 시작하더라도 column 자체가 여전히 오른쪽 끝에 치우쳐 있어 top/right blank가 남는다.
- [`src/lib/components/ExhibitionMap.svelte`](D:/work/project/service/wtools/expo-harvest/src/lib/components/ExhibitionMap.svelte): single-section viewport는 `getDisplayMapSectionMetrics()` 기준, overview placement는 `getSourceMapSectionMetrics()` 기준으로 이미 분리돼 있다. 따라서 이번 후속은 overview 배치를 건드리지 않고 section `displayViewBox`와 `defaultCenter/defaultScale`만 조정하는 편이 안전하다.
- [`src/lib/components/ExhibitionMap.svelte`](D:/work/project/service/wtools/expo-harvest/src/lib/components/ExhibitionMap.svelte): `getLabelFontSize()`, `getBoothLineGap()`, `getOverlayLabelLines()`, `getEventZoneFontSize()`, `getEventZoneLineGap()`를 함께 조정하지 않으면 viewport만 줄여도 박스 내부가 여전히 헐거워 보일 수 있다.
- [`src/routes/+page.svelte`](D:/work/project/service/wtools/expo-harvest/src/routes/+page.svelte): `ExhibitionMap` 소비처는 여전히 한 곳이라 prop surface를 바꾸지 않고 map data/render helper 내부 수정만으로 닫는 것이 안전하다.
- [`MANUAL_TASKS.md`](D:/work/project/service/wtools/expo-harvest/MANUAL_TASKS.md): 현재 수동 검증은 `2F` 우측 3부스 순서와 일부 2줄 라벨까지만 다룬다. viewport 압축과 텍스트 밀도 조정 뒤에는 `1F/2F` 첫 진입 시야와 라벨 충전도까지 확인 항목을 확장해야 한다.

---

## TODO

### Phase 1: 1F 우측 열과 section viewport를 실제 점유 영역에 맞춰 압축한다

1. - [ ] **1F 우측 세로 3열을 중앙 4부스에 더 가깝게 당긴다** — `AHC`와 `THE FACE SHOP` 사이 과도한 수평 공백을 줄인다
   - [ ] `src/lib/data/lootItems.ts`: `cmbs-2026-thefaceshop`, `cmbs-2026-espoir`, `cmbs-2026-tonymoly`의 `renderX` 목표값을 다시 계산해 `AHC` 오른쪽 끝과의 간격이 좌측 `롬앤 ~ 에스트라` gap과 비슷한 수준으로 줄어들게 만든다.
   - [ ] `src/lib/data/lootItems.ts`: 우측 3부스의 `renderY`는 그대로 유지한 채 column `x`만 함께 이동해 세로 packing 계약은 보존한다.
   - [ ] `src/lib/data/lootItems.ts`: `assertCoupangMegaBeautyLayoutContract()`의 `hall1fRightColumnX`/`hall1fCenterRowX` 관련 검증이 새 간격에서도 의도한 row/column 계약만 강제하도록 확인하고, 필요하면 gap 기준 메시지를 보강한다.

2. - [ ] **1F right/bottom blank를 줄이는 display viewport를 다시 정의한다** — 계단 삭제 뒤 남은 빈 시야를 잘라낸다
   - [ ] `src/lib/data/lootItems.ts`: `hall-1f`에서 가장 오른쪽/아래에 남는 booth, event zone, arrow의 점유 bounds를 다시 계산해 `displayViewBox`가 raw `viewBox`보다 좁아질 근거 숫자를 고정한다.
   - [ ] `src/lib/data/lootItems.ts`: centered helper만으로 부족하면 `createDisplayViewBoxFromBounds(...)` 수준의 비대칭 helper를 추가하거나 동등한 상수를 도입해 `hall-1f.displayViewBox`를 새 bounds로 교체한다.
   - [ ] `src/lib/data/lootItems.ts`: `hall-1f.defaultScale`이 새 `displayViewBox` 기준에서도 과대 확대처럼 보이지 않도록 유지 또는 미세 조정한다.

3. - [ ] **1F 첫 진입과 리셋 viewport가 새 압축 bounds를 그대로 쓰는지 고정한다** — 좌표만 움직이고 시야가 예전 폭으로 남지 않게 막는다
   - [ ] `src/lib/components/ExhibitionMap.svelte`: `createSectionViewportTarget()`, `resetViewport()`, `getRenderedViewBox()`가 `hall-1f`의 새 `displayViewBox`를 그대로 사용한다는 전제를 확인하고, 별도 raw metric fallback이 남아 있으면 plan 범위에 포함한다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: single-section wrapper `aspect-ratio`가 새 `hall-1f.displayViewBox` 비율을 따라가도록 유지해, 좌우 여백만 줄이고 세로 스케일이 다시 어색해지지 않게 한다.

### Phase 2: 2F 우측 column을 아리얼 아래로 재정렬하고 viewport를 같이 줄인다

4. - [ ] **2F 우측 3블록 column을 아리얼 아래쪽으로 다시 붙인다** — `인생네컷 포토존`부터 시작하는 세로열의 상단 공백을 실제로 해소한다
   - [ ] `src/lib/data/lootItems.ts`: `아리얼` 하단(`renderY + renderHeight`)과 첫 번째 우측 block 시작점 사이 목표 gap을 다시 정해 `인생네컷 포토존`의 `x/y`를 재배치한다.
   - [ ] `src/lib/data/lootItems.ts`: `포렌코즈`의 `renderX/renderY`를 새 column 기준으로 다시 맞춰 `인생네컷 포토존`과 같은 vertical lane에 붙인다.
   - [ ] `src/lib/data/lootItems.ts`: `파페치 / TW 홍보 부스`의 center `x/y`도 같은 lane 기준으로 내려 맞추고, `HALL_2F_RIGHT_LANE_LABELS`/assertion이 새 순서와 공백 규칙을 그대로 검증하게 유지한다.

5. - [ ] **2F top/right blank를 줄이는 display viewport를 새 lane 형상에 맞춰 다시 잡는다** — column 이동 뒤 남는 공백까지 함께 잘라낸다
   - [ ] `src/lib/data/lootItems.ts`: `hall-2f`의 새 우측 column 좌표와 좌측 lane/top-row 최대 bounds를 같이 읽어 `displayViewBox`가 실제 점유 영역에 더 가깝게 좁아지도록 새 값을 정한다.
   - [ ] `src/lib/data/lootItems.ts`: `hall-2f.defaultScale`은 `1F` 대비 booth 체감 크기를 크게 벗어나지 않는 범위에서 재계산하거나 유지 근거를 문서에 남긴다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: `hall-2f` 첫 진입, 리셋, `지도에서 보기` 포커스가 새 display bounds에서도 좌측 lane과 우측 column을 같이 보여 주는지 확인 대상으로 묶는다.

### Phase 3: 이벤트존 개행과 부스 글자 점유율을 높인다

6. - [ ] **요청된 event zone 라벨을 명시적으로 2줄 분기한다** — 긴 문구가 한 줄로 눌려 보이지 않게 만든다
   - [ ] `src/lib/components/ExhibitionMap.svelte`: `getOverlayLabelLines(label)`에 `쿠팡 어워즈 체험존`, `피부측정 이벤트`, `뷰티 디바이스 체험존`, `쿠팡 메가뷰티쇼 스토리`, `뷰티박스 수령존` 전용 2줄 분기를 추가한다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: 기존 `인생네컷 포토존`, `쿠팡 와우회원 인증존`, `헤어쇼 이벤트(4/18)` 분기와 충돌하지 않도록 분기 순서를 정리한다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: overview와 single-section 양쪽 event zone 렌더가 같은 helper를 재사용하는지 다시 확인해, 한쪽만 개행되는 회귀를 막는다.

7. - [ ] **booth 글자 기본 크기와 line gap을 더 조밀하게 조정한다** — viewport를 줄인 뒤 박스 안이 더 꽉 차 보이게 만든다
   - [ ] `src/lib/components/ExhibitionMap.svelte`: `getLabelFontSize(item)` fallback과 `getBoothLineGap(item)`를 함께 조정해 기본 booth 라벨 점유율을 높인다.
   - [ ] `src/lib/data/lootItems.ts`: `THE FACE SHOP`, `NATURE REPUBLIC`, `포렌코즈`처럼 이미 작은 `mapLabelFontSize`를 가진 예외 브랜드만 새 기본값 위에서 다시 미세 조정한다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: booth `<text>`의 `getBoothTextOffset()` 계산이 multi-line에서도 지나치게 위아래 여백을 남기지 않도록 새 폰트 기준으로 확인한다.

8. - [ ] **event zone 폰트와 line gap도 booth 밀도에 맞춰 상향한다** — 박스 내부 체감 밀도가 booth와 따로 놀지 않게 만든다
   - [ ] `src/lib/components/ExhibitionMap.svelte`: `getEventZoneFontSize(overlay)`의 booth-sized 기본값을 상향 조정하고 `getEventZoneLineGap(overlay)`도 같이 줄인다.
   - [ ] `src/lib/data/lootItems.ts`: 새 기본값에서 넘치거나 답답한 event zone만 `fontSize` 예외값을 다시 보정한다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: event zone `<text>`의 `getEventZoneTextOffset()`가 2줄 라벨에서도 상하 여백을 너무 크게 남기지 않는지 확인한다.

### Phase 4: 회귀 방지 계약과 수동 확인 기준을 새 형상으로 갱신한다

9. - [ ] **새 viewport/타이포 기대치를 문서와 검증 루틴에 고정한다** — 다음 좌표 수정 때 같은 여백 문제가 다시 생겨도 바로 잡을 수 있게 만든다
   - [ ] `MANUAL_TASKS.md`: `1F`에서 `THE FACE SHOP` 우측과 하단 blank가 줄고, `AHC`와 우측 column 사이 간격이 좌측 gap과 비슷해 보이는지 확인 항목을 추가한다.
   - [ ] `MANUAL_TASKS.md`: `2F`에서 `인생네컷 포토존 / 포렌코즈 / 파페치·TW 홍보 부스`가 `아리얼` 아래에서 시작하면서 우측/top blank가 줄어 보이는지 확인 항목을 추가한다.
   - [ ] `MANUAL_TASKS.md`: `쿠팡 어워즈 체험존`, `피부측정 이벤트`, `뷰티 디바이스 체험존`, `쿠팡 메가뷰티쇼 스토리`, `뷰티박스 수령존`이 2줄 라벨로 읽히는지, booth 글자가 이전보다 더 크게 느껴지는지 확인 항목을 추가한다.
   - [ ] `package.json`, `src/lib/data/lootItems.ts`, `src/lib/components/ExhibitionMap.svelte`: 구현 단계의 기본 자동 검증을 `npm run check`와 `npm run build`로 유지하고, viewport/data assertion이 둘 다 통과해야 완료로 본다는 기준을 계획서에 남긴다.

---

*상태: 초안 | 진행률: 0/9 (0%)*
