# refactor: dedup exhibition map render contract

> 작성일시: 2026-04-18 00:25
> 기준커밋: cd0da6a
> 대상 프로젝트: expo-harvest
> 상태: 검토대기
> 진행률: 0/8 (0%)
> 출처: /review에서 자동 생성
> 요약: `ExhibitionMap.svelte`는 overview와 single-section SVG 렌더 경로가 같은 booth/event-zone/stairs 마크업을 두 번 들고 있어 이번 좌표·카피 수정도 양쪽 블록을 함께 건드려야 했다. 같은 세션에서 `lootItems.ts` layout assertion은 optional `renderX/renderY` 타입 경계 때문에 `npm run check`에서 한 번 실패했으므로, 렌더 중복과 layout contract 경계를 함께 정리해 다음 지도 수정이 한 경로에서 끝나게 만든다.

---

## 개요

이번 구현은 기능적으로는 마무리됐지만, 회고 관점에서는 두 가지 후속 리스크가 남았다. 첫째, [`src/lib/components/ExhibitionMap.svelte`](D:/work/project/service/wtools/expo-harvest/src/lib/components/ExhibitionMap.svelte)는 overview(`activeMapSection === 'all'`)와 single-section 렌더가 booth text/event-zone/stairs SVG 블록을 거의 복제한 상태라서, 텍스트 offset이나 라벨 분할 규칙을 바꿀 때 같은 수정을 두 번 반복해야 한다. 실제로 이번 카피/배치 정리에서도 `overlayLabelLines`, `getBoothTextOffset()`, `getBoothLineGap()`를 쓰는 마크업이 두 구간에서 나란히 수정됐다.

둘째, [`src/lib/data/lootItems.ts`](D:/work/project/service/wtools/expo-harvest/src/lib/data/lootItems.ts)의 layout contract assertion은 `renderX`/`renderY`가 optional인 원본 booth layout 타입을 그대로 읽다가 `npm run check`에서 한 차례 타입 실패를 냈고, 이후 `getRequiredBoothRenderValue()`로 복구됐다. 현재 수정은 동작하지만, "layout contract를 검사하는 경로는 required render 좌표만 다룬다"는 타입 경계가 여전히 구현 의도보다 약하다.

이번 후속은 UI 동작을 새로 바꾸는 계획이 아니라, 이미 반영된 지도 렌더 규칙을 공통 경로로 수렴시키고 required layout contract를 더 분명히 드러내는 구조 정리다. 범위는 `ExhibitionMap.svelte`와 `lootItems.ts` 내부 재구성에 한정하고, 외부 소비 경로는 [`src/routes/+page.svelte`](D:/work/project/service/wtools/expo-harvest/src/routes/+page.svelte)의 기존 `ExhibitionMap` 사용 계약을 유지한다.

## 기술적 고려사항

- [`src/lib/components/ExhibitionMap.svelte`](D:/work/project/service/wtools/expo-harvest/src/lib/components/ExhibitionMap.svelte): 파일 길이가 1420줄이고, event-zone 렌더 블록이 overview L1000대와 section L1310대에, booth label/배지 렌더 블록이 overview L1160대와 section L1470대에 각각 중복되어 있다.
- [`src/routes/+page.svelte`](D:/work/project/service/wtools/expo-harvest/src/routes/+page.svelte): `ExhibitionMap` 소비처는 현재 이 한 곳뿐이라 prop surface를 유지하면 side effect 범위는 제한적이다.
- [`src/lib/data/lootItems.ts`](D:/work/project/service/wtools/expo-harvest/src/lib/data/lootItems.ts): `getRequiredBoothRenderValue()`와 `assertCoupangMegaBeautyLayoutContract()`는 파일 내부 전용 helper라서, required layout 전용 타입/selector를 도입해도 외부 import 영향은 없다.
- 기존 미완료 plan [`docs/plan/2026-04-18_test-map-booth-interaction-regression-coverage.md`](D:/work/project/service/wtools/expo-harvest/docs/plan/2026-04-18_test-map-booth-interaction-regression-coverage.md)는 pointer/drag 회귀 자동화가 목적이므로, 이번 구조 중복 정리 plan과는 범위가 겹치지 않는다.

---

## TODO

### Phase 1: 중복 렌더와 contract 경계를 고정한다

1. - [ ] **overview/section SVG 중복 지점을 렌더 책임 단위로 다시 나눈다** — 어떤 블록을 공통화할지 먼저 고정
   - [ ] `src/lib/components/ExhibitionMap.svelte`: overview 경로와 single-section 경로에서 중복되는 `eventZone`, `stairs`, `booth` SVG 블록의 차이를 표로 정리하고, 정말 다른 책임이 `placement offset`과 `interactive wrapper`뿐인지 확인한다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: 공통화 이후에도 section 전용으로 남겨야 하는 상태(`isInteractiveSection`, viewport 이벤트, `preserveMapSectionOverride`)와 렌더 공통부를 분리하는 기준을 문서화 수준으로 코드 근처에 남긴다.

2. - [ ] **layout assertion이 required render 좌표만 읽도록 입력 경계를 분명히 한다** — optional booth layout을 그대로 흘리지 않게 만든다
   - [ ] `src/lib/data/lootItems.ts`: `assertCoupangMegaBeautyLayoutContract()`가 사용하는 booth id 묶음을 기준으로 `renderX/renderY`가 필수인 layout access 경로를 별도 helper 또는 타입 alias로 정리한다.
   - [ ] `src/lib/data/lootItems.ts`: `getRequiredBoothRenderValue()`와 lane assertion 호출부가 "검사 대상은 required 좌표가 보장된다"는 의도를 이름/타입으로 드러내도록 정리한다.

### Phase 2: booth 렌더 경로를 한 곳으로 수렴시킨다

3. - [ ] **booth rect/text/badge 계산 입력을 공통 payload로 묶는다** — overview와 section이 같은 계산 결과를 재사용하게 만든다
   - [ ] `src/lib/components/ExhibitionMap.svelte`: `getBoothRect()`, `getLabelLines()`, `getBoothTextOffset()`, `getBoothLineGap()`를 호출하는 데 필요한 입력을 `item + visual + selection state + placement offset` 기준의 공통 payload/helper로 정리한다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: selection halo, 완료/북마크 배지, booth text anchor 계산이 overview와 section에서 동일 rect 기준만 쓰도록 숫자 literal 중복을 제거한다.

4. - [ ] **overview booth SVG와 section booth SVG를 같은 마크업 경로로 통합한다** — 좌표계 차이는 wrapper에서만 처리
   - [ ] `src/lib/components/ExhibitionMap.svelte`: booth `<g role="button">` 내부의 rect/text/badge SVG 마크업을 단일 snippet/helper/component 경로로 옮긴다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: overview는 placement transform 또는 offset adapter만 추가하고, section은 원본 좌표를 그대로 넘기는 방식으로 booth 공통 렌더를 연결한다.

### Phase 3: overlay 렌더 경로를 한 곳으로 수렴시킨다

5. - [ ] **event-zone typography 계산을 공통 overlay 모델로 묶는다** — 라벨 줄바꿈 규칙 변경이 두 경로에서 따로 놀지 않게 만든다
   - [ ] `src/lib/components/ExhibitionMap.svelte`: `getOverlayLabelLines()`, `getEventZoneFontSize()`, `getEventZoneTextOffset()`, `getEventZoneLineGap()` 호출 결과를 한 번에 소비하는 overlay text payload/helper를 만든다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: `쿠팡 뉴존 체험존`, `뉴존 선물 수령존`, `파페치 / TW 홍보 부스` 같은 다행 라벨 split 규칙이 overview/section 모두 같은 helper만 타는지 확인한다.

6. - [ ] **event-zone/stairs SVG를 단일 overlay 렌더 경로로 통합한다** — shape 마크업 복제를 제거
   - [ ] `src/lib/components/ExhibitionMap.svelte`: overview와 section에 중복된 `eventZone` `<rect> + <text>` 및 `stairs` `<rect> + <line>` 블록을 단일 렌더 경로로 옮긴다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: overview에서 필요한 placement 좌표 보정과 section 원본 좌표 사용이 같은 overlay 렌더 helper를 통해 표현되도록 연결한다.

### Phase 4: 회귀 확인과 소비 계약을 다시 잠근다

7. - [ ] **외부 소비 surface와 map interaction 계약이 흔들리지 않게 확인한다** — 구조 정리 중 공개 동작이 바뀌지 않게 방어
   - [ ] `src/lib/components/ExhibitionMap.svelte`, `src/routes/+page.svelte`: `onPinClick(id, options?)`, `activeMapSectionOverride`, section 전환/overview 유지 계약이 리팩터링 후에도 동일 시그니처와 호출 순서를 유지하는지 대조한다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: `pointerdown` 기반 booth 선택, `activeMapSection === 'all'`일 때의 `preserveMapSectionOverride` 경로가 공통 렌더 추출 뒤에도 남아 있는지 재검색한다.

8. - [ ] **정적 검증과 육안 확인 포인트를 다시 기록한다** — 이번 회고 원인이던 실패/이중수정 경로가 사라졌는지 확인
   - [ ] `package.json`, `src/lib/components/ExhibitionMap.svelte`, `src/lib/data/lootItems.ts`: `npm run check`와 `npm run build`를 실행해 Svelte/TypeScript 회귀가 없는지 확인하고, 특히 layout assertion 타입 오류가 재발하지 않는지 기록한다.
   - [ ] `MANUAL_TASKS.md`: 부스 라벨 줄바꿈, 2F 우측 lane, 수령존 overlay가 overview/section 모두 같은 시각 결과를 유지하는지 브라우저 육안 확인 항목이 이미 충분한지 점검하고 부족하면 보강한다.

---

*상태: 검토대기 | 진행률: 0/8 (0%)*
