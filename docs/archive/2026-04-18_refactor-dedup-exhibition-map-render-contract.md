# refactor: dedup exhibition map render contract

> 완료일: 2026-04-18
> 아카이브됨
> 진행률: 8/8 (100%)
> 요약: `ExhibitionMap.svelte`의 overview/single-section booth·event-zone·stairs SVG를 shared renderer 경로로 수렴시키고, `lootItems.ts` layout assertion을 required render 좌표 selector 기반으로 정리해 다음 지도 수정이 한 경로에서 끝나도록 만들었다.
> 작성일시: 2026-04-18 00:25
> 기준커밋: cd0da6a
> 대상 프로젝트: expo-harvest
> 상태: 구현완료
> 반영일시: 2026-04-18 09:55
> 머지커밋: b55dc09
> 출처: /review에서 자동 생성
> 재검토일시: 2026-04-18
> 재검토 결론: 적용한다. 다만 현재 코드에는 `displayViewBox`/`defaultScale` 기반 viewport 분리가 이미 들어가 있으므로, 이번 plan 범위는 viewport 재설계가 아니라 booth/overlay SVG 중복 제거와 required render contract 강화에만 고정해야 한다. 또한 overview/section 차이는 booth interactive wrapper보다 section `transform`/viewport shell 쪽에 있으므로, 추출 경계는 그 기준으로 다시 잡아야 한다.

---

## 개요

이번 구현은 기능적으로는 마무리됐지만, 회고 관점에서는 두 가지 후속 리스크가 남았다. 첫째, [`src/lib/components/ExhibitionMap.svelte`](D:/work/project/service/wtools/expo-harvest/src/lib/components/ExhibitionMap.svelte)는 overview(`activeMapSection === 'all'`)와 single-section 렌더가 booth text/event-zone/stairs SVG 블록을 거의 복제한 상태라서, 텍스트 offset이나 라벨 분할 규칙을 바꿀 때 같은 수정을 두 번 반복해야 한다. 실제로 이번 카피/배치 정리에서도 `overlayLabelLines`, `getBoothTextOffset()`, `getBoothLineGap()`를 쓰는 마크업이 두 구간에서 나란히 수정됐다.

둘째, [`src/lib/data/lootItems.ts`](D:/work/project/service/wtools/expo-harvest/src/lib/data/lootItems.ts)의 layout contract assertion은 `renderX`/`renderY`가 optional인 원본 booth layout 타입을 그대로 읽다가 `npm run check`에서 한 차례 타입 실패를 냈고, 이후 `getRequiredBoothRenderValue()`로 복구됐다. 현재 수정은 동작하지만, "layout contract를 검사하는 경로는 required render 좌표만 다룬다"는 타입 경계가 여전히 구현 의도보다 약하다.

이번 후속은 UI 동작을 새로 바꾸는 계획이 아니라, 이미 반영된 지도 렌더 규칙을 공통 경로로 수렴시키고 required layout contract를 더 분명히 드러내는 구조 정리다. 범위는 `ExhibitionMap.svelte`와 `lootItems.ts` 내부 재구성에 한정하고, 외부 소비 경로는 [`src/routes/+page.svelte`](D:/work/project/service/wtools/expo-harvest/src/routes/+page.svelte)의 기존 `ExhibitionMap` 사용 계약을 유지한다.

## 기술적 고려사항

- [`src/lib/components/ExhibitionMap.svelte`](D:/work/project/service/wtools/expo-harvest/src/lib/components/ExhibitionMap.svelte): 파일 길이가 1420줄이고, event-zone 렌더 블록이 overview L1000대와 section L1310대에, booth label/배지 렌더 블록이 overview L1160대와 section L1470대에 각각 중복되어 있다.
- [`src/lib/components/ExhibitionMap.svelte`](D:/work/project/service/wtools/expo-harvest/src/lib/components/ExhibitionMap.svelte): `getSourceMapSectionMetrics()`와 `getDisplayMapSectionMetrics()`가 이미 분리돼 있고 section viewport는 `displayViewBox`를 사용한다. 따라서 이번 후속은 viewport metric을 다시 바꾸지 말고, 중복된 booth/overlay 마크업만 공통 경로로 수렴시키는 편이 안전하다.
- [`src/lib/components/ExhibitionMap.svelte`](D:/work/project/service/wtools/expo-harvest/src/lib/components/ExhibitionMap.svelte): overview/section booth `<g role="button">`의 hover/focus/keyboard/pointer 처리 자체는 사실상 동일하고, 실제 차이는 section title shell·overview `transform`·viewport pointer handler 위치다. 따라서 공통화 기준을 booth interaction 밖이 아니라 wrapper 계층에서 잡아야 extraction 후 회귀가 적다.
- [`src/routes/+page.svelte`](D:/work/project/service/wtools/expo-harvest/src/routes/+page.svelte): `ExhibitionMap` 소비처는 현재 이 한 곳뿐이라 prop surface를 유지하면 side effect 범위는 제한적이다.
- [`src/lib/data/lootItems.ts`](D:/work/project/service/wtools/expo-harvest/src/lib/data/lootItems.ts): `getRequiredBoothRenderValue()`와 `assertCoupangMegaBeautyLayoutContract()`는 파일 내부 전용 helper라서, required layout 전용 타입/selector를 도입해도 외부 import 영향은 없다.
- [`src/lib/data/lootItems.ts`](D:/work/project/service/wtools/expo-harvest/src/lib/data/lootItems.ts): `HALL_2F_RIGHT_LANE_LABELS`는 event-zone label과 booth title(`포렌코즈`)를 같은 문자열 배열에 섞어 special case로 읽고 있다. 이번 contract 정리에는 required booth selector를 강화하는 것뿐 아니라 이 stringly typed lane 선언을 분리하는 작업까지 포함돼야 의도가 분명해진다.
- strict main drift 기준 `git diff --name-only cd0da6a..main` 결과, 이번 plan의 핵심 파일은 `src/lib/components/ExhibitionMap.svelte`, `src/lib/data/lootItems.ts`, `src/routes/+page.svelte`, `MANUAL_TASKS.md`다. 따라서 구현 TODO는 이미 main에 반영된 `displayViewBox`/overview viewport 분리를 전제로 써야 하고, `+page.svelte`의 `onPinClick` 시그니처도 현행 형태를 유지해야 한다.
- 현재 저장소에는 별도 `tests/` 디렉터리가 없으므로, 이번 frontend refactor의 완료 기준은 자동 검증 `npm run check`/`npm run build`와 `MANUAL_TASKS.md` 육안 확인 보강에 집중하는 편이 맞다.
- 기존 미완료 plan [`docs/plan/2026-04-18_test-map-booth-interaction-regression-coverage.md`](D:/work/project/service/wtools/expo-harvest/docs/plan/2026-04-18_test-map-booth-interaction-regression-coverage.md)는 pointer/drag 회귀 자동화가 목적이므로, 이번 구조 중복 정리 plan과는 범위가 겹치지 않는다.

---

## TODO

### Phase 1: 중복 렌더와 contract 경계를 고정한다

1. - [x] **overview/section SVG 중복 지점을 렌더 책임 단위로 다시 나눈다** — 어떤 블록을 공통화할지 먼저 고정
   - [x] `src/lib/components/ExhibitionMap.svelte`: overview `<g transform={...}>` 블록과 single-section `<div role="group">` 블록을 나란히 읽고, section title shell·overview placement transform·viewport pointer handler가 booth/overlay SVG와 분리되는 지점을 주석 메모로 고정했다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: overview booth `<g role="button">`와 section booth `<g role="button">`의 `onmouseenter/onmouseleave/onfocus/onblur/onpointerdown/onkeydown`가 완전히 같은지 대조하고, shared booth renderer 안에 남길 이벤트 집합을 확정했다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: overview와 section overlay 루프에서 이번 공통화 범위가 `eventZone`과 `stairs`뿐이라는 점, 그리고 wrapper 바깥에 남길 책임이 `section title`, `bind:this={zoomViewport}`, viewport `onpointerdown/move/up/cancel`, overview placement transform뿐이라는 점을 같은 주석 메모로 고정했다.

2. - [x] **layout assertion이 required render 좌표만 읽도록 입력 경계를 분명히 한다** — optional booth layout을 그대로 흘리지 않게 만든다
   - [x] `src/lib/data/lootItems.ts`: `COUPANG_MEGA_BEAUTY_BOOTH_LAYOUTS[itemId]`를 직접 읽는 현재 `getRequiredBoothRenderValue()` 앞단에 `getRequiredBoothRenderLayout(itemId)` selector를 두고, assertion 본문이 raw optional layout 인덱싱을 직접 하지 않게 바꿨다.
   - [x] `src/lib/data/lootItems.ts`: required booth selector가 `renderX`, `renderY`만 보장하는 `BoothLayoutWithRequiredRenderPosition` 타입으로 제한돼 alias 범위가 과도하게 커지지 않게 고정했다.
   - [x] `src/lib/data/lootItems.ts`: `HALL_2F_RIGHT_LANE_LABELS`를 `kind: 'booth' | 'eventZone'` descriptor 목록으로 분리했다.
   - [x] `src/lib/data/lootItems.ts`: `hall2fRightLaneX`와 `hall2fRightLaneY` 계산에서 `'포렌코즈'` 삼항 분기를 제거하고 booth selector와 overlay selector가 각자 자기 타입만 읽게 바꿨다.

### Phase 2: booth 렌더 경로를 한 곳으로 수렴시킨다

3. - [x] **booth rect/text/badge 계산 입력을 공통 payload로 묶는다** — overview와 section이 같은 계산 결과를 재사용하게 만든다
   - [x] `src/lib/components/ExhibitionMap.svelte`: `getBoothRect(item)`, `getLabelLines(item)`, `getLabelFontSize(item)`, `getBoothTextOffset(item, lineCount)`, `getBoothLineGap(item)`를 묶는 `getBoothRenderModel(item)` helper를 추가했다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: `getBoothVisual(item)`와 `item.id === selectedItemId`를 booth render model 안으로 같이 넣어 shared renderer 입력 개수를 줄였다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: 완료/북마크/선착순 badge 분기에서 공통으로 쓰는 glyph(`✓`, `★`, `!`) 계산을 `getBoothBadgeSymbol(item)` 한 군데로 모았다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: selection halo `x/y/width/height` 보정값 `-3/+6`과 booth rect stroke literal이 render model/renderer 한 경로에서만 쓰이게 정리했다.

4. - [x] **overview booth SVG와 section booth SVG를 같은 마크업 경로로 통합한다** — 좌표계 차이는 wrapper에서만 처리
   - [x] `src/lib/components/ExhibitionMap.svelte`: booth `<g role="button">` 내부 `<title>`, selection halo `<rect>`, 본체 `<rect>`, 라벨 `<text>`, badge `<circle>/<text>`를 `renderBooth(item, boothModel)` snippet으로 옮겼다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: shared booth renderer 입력을 `item`, payload, `gestureIntent`, `handleItemPinClick`과 hover/focus helper 수준으로 제한해 이벤트 핸들러 서명이 overview/section에서 다시 갈라지지 않게 고정했다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: overview 루프는 현재처럼 `<g transform>` 안에서 shared booth renderer를 호출해 숫자 offset 재계산을 만들지 않게 유지했다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: section 루프는 raw booth 좌표를 그대로 shared booth renderer에 넘기고, viewport 제스처 handler는 section wrapper에만 남겼다.

### Phase 3: overlay 렌더 경로를 한 곳으로 수렴시킨다

5. - [x] **event-zone typography 계산을 공통 overlay 모델로 묶는다** — 라벨 줄바꿈 규칙 변경이 두 경로에서 따로 놀지 않게 만든다
   - [x] `src/lib/components/ExhibitionMap.svelte`: `getOverlayLabelLines(label)`, `getEventZoneFontSize(overlay)`, `getEventZoneTextOffset(overlay, lineCount)`, `getEventZoneLineGap(overlay)`를 묶는 `getEventZoneTextModel(overlay)` helper를 추가했다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: `쿠팡 뉴존 체험존`, `뉴존 선물 수령존`, `파페치 / TW 홍보 부스`, `인생네컷 포토존`, `쿠팡 와우회원 인증존`, `헤어쇼 이벤트(4/18)` 분기가 계속 `getOverlayLabelLines()` 한 곳만 타게 유지했다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: `getStairsLines(overlay)`는 typography payload 바깥에 남겨 overlay 종류별 책임이 다시 섞이지 않게 했다.

6. - [x] **event-zone/stairs SVG를 단일 overlay 렌더 경로로 통합한다** — shape 마크업 복제를 제거
   - [x] `src/lib/components/ExhibitionMap.svelte`: overview와 section에 중복된 event-zone `<rect>` 속성(`fill`, `stroke`, `stroke-width`, `rx`)을 `renderSharedOverlay(overlay)`로 옮겼다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: event-zone `<text>`와 `<tspan>` 반복문을 shared overlay renderer 안으로 옮기고, `overlayTextModel.centerX/centerY`만 쓰게 연결했다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: stairs `<rect>`와 `getStairsLines(overlay)` 기반 `<line>` 반복문도 같은 shared overlay renderer로 합쳐 overview/section 중복 블록을 하나로 줄였다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: overview 루프는 placement `<g transform>` 안에서 shared overlay renderer를 호출하고 section 루프는 원본 좌표를 그대로 넘기되, `arrow`와 decor rect 분기는 부모 루프에 남겨 이번 refactor 범위를 event-zone/stairs 복제 제거에 한정했다.

### Phase 4: 회귀 확인과 소비 계약을 다시 잠근다

7. - [x] **외부 소비 surface와 map interaction 계약이 흔들리지 않게 확인한다** — 구조 정리 중 공개 동작이 바뀌지 않게 방어
   - [x] `src/routes/+page.svelte`: `<ExhibitionMap>` 호출부의 prop 목록 `exhibition`, `items`, `onPinClick`, `activeMapSectionOverride`, `selectedItemId`는 변경하지 않았다.
   - [x] `src/routes/+page.svelte`: `onPinClick={(id, options) => selectItem(id, false, true, options?.preserveMapSectionOverride ?? false)}` 호출 형태를 유지해 overview 유지 계약이 소비처에서 깨지지 않게 했다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: `handleItemPinClick(itemId)`는 계속 `onPinClick(itemId, activeMapSection === 'all' ? { preserveMapSectionOverride: true } : undefined)`만 담당하게 남겨 renderer 추출물이 viewport 상태를 직접 만지지 않게 했다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: overview outer viewport의 `onpointerdown={handleViewportPointerDown}`와 section wrapper의 `onpointerdown/onpointermove/onpointerup/onpointercancel`는 booth renderer 밖에 남겼다.

8. - [x] **정적 검증과 육안 확인 포인트를 다시 기록한다** — 이번 회고 원인이던 실패/이중수정 경로가 사라졌는지 확인
   - [x] `package.json`, `src/lib/components/ExhibitionMap.svelte`, `src/lib/data/lootItems.ts`: `npm run check`를 실행해 shared renderer 추출 뒤 Svelte 템플릿/타입 오류와 required render contract 타입 오류가 없는지 기록한다.
   - [x] `package.json`, `src/lib/components/ExhibitionMap.svelte`, `src/lib/data/lootItems.ts`: `npm run build`를 실행해 모듈 import 시점 `assertCoupangMegaBeautyLayoutContract()`가 계속 통과하는지 확인한다.
   - [x] `MANUAL_TASKS.md`: overview와 single-section에서 booth badge, selection halo, multi-line booth label이 같은 시각 규칙으로 보이는지 확인하는 육안 항목을 추가했다.
   - [x] `MANUAL_TASKS.md`: overview와 single-section에서 `쿠팡 뉴존 체험존`, `뉴존 선물 수령존`, `파페치 / TW 홍보 부스`, `인생네컷 포토존` event-zone 라벨이 같은 줄바꿈으로 보이는지 확인 항목을 추가했다.

---

*상태: 구현완료 | 진행률: 8/8 (100%)*
