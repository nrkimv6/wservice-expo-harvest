# refine: booth view stair removal and 2f lane spacing

> 작성일시: 2026-04-18 00:41
> 기준커밋: cb1daf7
> 대상 프로젝트: expo-harvest
> branch: impl/refine-booth-view-stair-removal-and-2f-lane-spacing
> worktree: .worktrees/impl-refine-booth-view-stair-removal-and-2f-lane-spacing
> worktree-owner: D:\work\project\service\wtools\expo-harvest\docs\plan\2026-04-18_refine-booth-view-stair-removal-and-2f-lane-spacing.md
> 상태: 머지대기
> 진행률: 9/10 (90%)
> 출처: 사용자 요청
> 요약: `부스보기`의 현재 1F/2F 배치는 `src/lib/data/lootItems.ts`의 고정 좌표와 `assertCoupangMegaBeautyLayoutContract()`에 묶여 있어, 계단 삭제나 2F 우측 lane 공백 추가 같은 요청이 단순 좌표 수정만으로 끝나지 않는다. 이번 계획은 1F 우측 회색 계단 제거, 1F 중앙 4부스 상향, 2F 계단 제거와 우측 3부스 재배치, 2F 이벤트존 줄바꿈 가독성 개선을 한 번에 반영하면서 기존 수동 체크 기준과 레이아웃 계약을 새 형상에 맞게 다시 잠그는 데 목적이 있다.
> 재검토일시: 2026-04-18
> 재검토 결론: 적용한다. 다만 원안에는 이미 끝난 `TODO.md` 반영 작업이 남아 있었고, `getCoupangMegaBeautyStairs()` 정리 및 `헤어쇼 이벤트(4/18)`의 현재 데이터 키 유지 방침이 빠져 있었다. 재검토본에서는 구현 범위를 실제 변경 코드에 맞게 좁히고, 2F 우측 lane 계약을 "계단 포함 packed 4블록"에서 "아리얼 아래 여백을 둔 3블록 column"으로 다시 정의한다.

> 관련 계획:
> - [`docs/plan/2026-04-18_fix-map-booth-viewport-normalization.md`](D:/work/project/service/wtools/expo-harvest/docs/plan/2026-04-18_fix-map-booth-viewport-normalization.md): section별 기본 확대 체감 크기를 맞추는 별도 후속이다. 이번 문서는 부스/overlay 좌표와 copy만 다루며 viewport 스케일 변경은 포함하지 않는다.
> - [`docs/plan/2026-04-18_refactor-dedup-exhibition-map-render-contract.md`](D:/work/project/service/wtools/expo-harvest/docs/plan/2026-04-18_refactor-dedup-exhibition-map-render-contract.md): overview/single-section 렌더 중복 제거 후속이다. 이번 문서는 현재 구조 위에서 필요한 좌표/라벨 수정만 수행한다.

---

## 개요

현재 `부스보기` 지도는 [`src/lib/data/lootItems.ts`](D:/work/project/service/wtools/expo-harvest/src/lib/data/lootItems.ts) 안의 `COUPANG_MEGA_BEAUTY_BOOTH_LAYOUTS`와 `COUPANG_MEGA_BEAUTY_OVERLAYS`가 실제 형상을 결정한다. 확인 결과 `1F`는 우측에 `stairs` overlay 2개가 남아 있고, 중앙 4부스(`에스트라`, `바닐라코`, `닥터지`, `AHC`)는 모두 `renderY: 108`에 고정돼 있어 좌측 `롬앤(24) / 듀이트리(78)` 사이 높이보다 아래에 배치돼 있다. `2F`는 우측 lane을 `계단 + 인생네컷 포토존 + 포렌코즈 + 파페치 / TW 홍보 부스`의 4블록 column으로 강제하고 있어, 사용자가 요청한 "계단 삭제 후 아리얼 아래 공백을 둔 3부스 배치"와 정면 충돌한다.

또한 [`src/lib/components/ExhibitionMap.svelte`](D:/work/project/service/wtools/expo-harvest/src/lib/components/ExhibitionMap.svelte)의 `getOverlayLabelLines()`는 현재 `쿠팡 뉴존 체험존`, `뉴존 선물 수령존`, `파페치 / TW 홍보 부스`만 수동 줄바꿈하고 있어, 이번 요청 대상인 `인생네컷 포토존`, `쿠팡 와우회원 인증존`, `헤어쇼 이벤트(4/18)`은 한 줄 또는 비의도적 자동 분기 상태로 남아 있다. 사용자가 쓴 "헤어존 이벤트"는 현행 데이터 키상 `헤어쇼 이벤트(4/18)`에 대응하므로, 이번 수정은 현재 라벨 키를 유지한 채 줄바꿈만 보정하는 범위로 제한한다.

이번 계획에서는 사용자의 1번 요청을 "`1F` 우측에 보이는 회색 계단 overlay 전체 제거"로 해석한다. 현재 `hall-1f`에는 상단/하단 계단 2개가 모두 존재하므로, 구현 시 두 overlay를 함께 제거하는 방향으로 계획을 잡고, 만약 사용자가 상단 또는 하단 하나만 원했다면 검토 단계에서 범위를 다시 좁힌다.

## 기술적 고려사항

- [`src/lib/data/lootItems.ts`](D:/work/project/service/wtools/expo-harvest/src/lib/data/lootItems.ts): `1F` 중앙 4부스는 `HALL_1F_CENTER_ROW_BOOTH_IDS`와 `assertSingleAxis(hall1fCenterRowY, ...)`로 같은 `renderY` 행만 강제하므로, 네 부스를 함께 위로 올리는 것은 계약을 유지한 채 해결할 수 있다.
- [`src/lib/data/lootItems.ts`](D:/work/project/service/wtools/expo-harvest/src/lib/data/lootItems.ts): 반대로 `2F` 우측 lane은 현재 `getCoupangMegaBeautyStairs('hall-2f')`를 포함한 packed column 전제를 강제한다. 계단 삭제와 `아리얼` 아래 공백 확보를 반영하려면 `HALL_2F_RIGHT_LANE_LABELS`의 기준과 `assertPackedAxis(hall2fRightLaneY, ...)` 자체를 새 형상에 맞게 재정의해야 한다.
- [`src/lib/data/lootItems.ts`](D:/work/project/service/wtools/expo-harvest/src/lib/data/lootItems.ts): `getCoupangMegaBeautyStairs()`는 현재 layout assertion 내부에서만 쓰인다. `1F/2F` 계단 overlay를 모두 제거하면 helper가 불필요해질 수 있으므로, 구현 범위에는 좌표 데이터뿐 아니라 assertion helper 정리도 포함해야 한다.
- [`src/lib/components/ExhibitionMap.svelte`](D:/work/project/service/wtools/expo-harvest/src/lib/components/ExhibitionMap.svelte): `getOverlayLabelLines()`와 `getEventZoneTextOffset()`는 overview/section 렌더 양쪽에서 그대로 재사용되므로, 줄바꿈 규칙을 이 helper 한 곳에서 보정하면 `전체`와 `2F` 단일 뷰가 동시에 맞춰진다.
- [`src/lib/components/ExhibitionMap.svelte`](D:/work/project/service/wtools/expo-harvest/src/lib/components/ExhibitionMap.svelte), [`src/routes/+page.svelte`](D:/work/project/service/wtools/expo-harvest/src/routes/+page.svelte): 지도 overlay를 실제로 그리는 경로는 `ExhibitionMap`뿐이고, 소비처는 현재 `+page.svelte` 한 곳이라서 side effect 범위는 layout data와 map renderer 내부에 한정된다.
- [`MANUAL_TASKS.md`](D:/work/project/service/wtools/expo-harvest/MANUAL_TASKS.md): 현재 미완료 항목에는 `1F` 계단이 보여야 한다는 검증과 `2F`에서 계단을 포함한 우측 4블록 lane 검증이 남아 있어, 이번 형상 변경 뒤에는 그대로 두면 잘못된 기대치를 유지하게 된다.
- [`package.json`](D:/work/project/service/wtools/expo-harvest/package.json): 현재 프로젝트에는 `check`와 `build`만 있고 별도 지도 자동 테스트 스크립트는 없다. 따라서 이번 계획의 자동 검증은 `npm run check`와 `npm run build`로 제한하고, 배치 확인은 `MANUAL_TASKS.md`에 의존한다.
- `git diff --name-only cb1daf7..main` 기준으로 이번 plan의 핵심 수정 파일(`src/lib/data/lootItems.ts`, `src/lib/components/ExhibitionMap.svelte`, `MANUAL_TASKS.md`, `package.json`)에는 추가 드리프트가 없었고, 관련 경로 중 `src/routes/+page.svelte`만 변해 있다. 따라서 구현 시 `ExhibitionMap`의 prop surface를 바꾸지 않는 것이 안전하다.

---

## TODO

### Phase 1: 1F/2F 새 형상을 데이터 기준으로 다시 정의한다 (상위 4개 작업)

1. - [x] **1F 우측 회색 계단 2개를 데이터에서 제거한다** — 현재 보이는 회색 `stairs` overlay를 아예 렌더 경로에서 뺀다
   - [x] `src/lib/data/lootItems.ts`: `COUPANG_MEGA_BEAUTY_OVERLAYS`에서 `mapSectionId: 'hall-1f'` 상단 `stairs` entry 1개만 삭제해 첫 번째 회색 계단이 더 이상 렌더되지 않게 만든다.
   - [x] `src/lib/data/lootItems.ts`: 같은 배열에서 `mapSectionId: 'hall-1f'` 하단 `stairs` entry 1개만 삭제해 두 번째 회색 계단도 함께 사라지게 만든다.
   - [x] `src/lib/data/lootItems.ts`: `hall-1f` overlay 주석을 다시 읽고, 남는 overlay가 `eventZone`과 `arrow`뿐이라는 현재 상태를 설명하는 문장으로 교체한다.

2. - [x] **1F 중앙 4부스를 같은 row로 유지한 채 위로 올린다** — `듀이트리`와 `롬앤` 사이 높이대에 맞춘다
   - [x] `src/lib/data/lootItems.ts`: `cmbs-2026-romand.renderY = 24`와 `cmbs-2026-dewytree.renderY = 78` 사이에 들어가는 목표 `renderY` 값을 먼저 정하고, 중앙 row 4개가 공유할 숫자를 확정한다.
   - [x] `src/lib/data/lootItems.ts`: `cmbs-2026-aestura`와 `cmbs-2026-banilaco`의 `renderY`를 새 공통값으로 바꿔 좌측 절반 중앙 row를 위로 올린다.
   - [x] `src/lib/data/lootItems.ts`: `cmbs-2026-drg`와 `cmbs-2026-ahc`의 `renderY`를 같은 공통값으로 바꿔 우측 절반 중앙 row를 같은 높이로 맞춘다.
   - [x] `src/lib/data/lootItems.ts`: `assertCoupangMegaBeautyLayoutContract()`의 `hall1fCenterRowY` 계산이 여전히 `HALL_1F_CENTER_ROW_BOOTH_IDS` 4개를 같은 row로 보는지 확인하고, 새 높이에서도 assertion 문구를 유지한다.

3. - [x] **2F 계단을 제거하고 우측 3부스 column 시작점을 아리얼 아래로 내린다** — 상단 공백을 의도된 배치로 바꾼다
   - [x] `src/lib/data/lootItems.ts`: `COUPANG_MEGA_BEAUTY_OVERLAYS`에서 `mapSectionId: 'hall-2f'` `stairs` entry 1개를 삭제해 2F 우측 계단이 더 이상 그려지지 않게 만든다.
   - [x] `src/lib/data/lootItems.ts`: `cmbs-2026-ariul.renderY` 값을 읽어 우측 lane 간격 계산의 시작 기준 숫자로 삼는다.
   - [x] `src/lib/data/lootItems.ts`: `cmbs-2026-ariul.renderHeight` 값을 읽어 첫 번째 우측 block top이 넘어야 할 `ariulBottomY` 기준을 계산한다.
   - [x] `src/lib/data/lootItems.ts`: `인생네컷 포토존` overlay의 목표 top `y`를 먼저 정하고, 그 값으로부터 center `y`를 다시 계산해 event box가 `아리얼` 하단보다 아래에서 시작하도록 옮긴다.
   - [x] `src/lib/data/lootItems.ts`: `cmbs-2026-forencos.renderY`를 `인생네컷 포토존` 아래 새 위치로 조정해 우측 middle booth가 같은 column 흐름을 타게 만든다.
   - [x] `src/lib/data/lootItems.ts`: `파페치 / TW 홍보 부스` overlay center `y`를 `포렌코즈` 아래 위치로 다시 계산해 우측 bottom block이 같은 column 안에서 마무리되게 만든다.

4. - [x] **2F 우측 lane 계약을 "무간격 4블록"에서 "상단 공백 + 3블록 세로열"로 바꾼다** — 계단 삭제 뒤에도 의도한 구조를 코드로 고정한다
   - [x] `src/lib/data/lootItems.ts`: `HALL_2F_RIGHT_LANE_LABELS`가 더 이상 stairs를 포함하지 않는 3개 block anchor 목록이라는 점을 설명하는 주석을 해당 상수 근처에 추가한다.
   - [x] `src/lib/data/lootItems.ts`: `hall2fRightLaneX` 계산에서 `getCoupangMegaBeautyStairs('hall-2f').x`를 제거하고, `인생네컷 포토존`, `포렌코즈`, `파페치 / TW 홍보 부스` 3개만으로 column 축을 계산하게 바꾼다.
   - [x] `src/lib/data/lootItems.ts`: `hall2fRightLaneY` 계산에서도 stairs 시작점을 제거하고, 3개 block의 현재 `y`만 수집하도록 바꾼다.
   - [x] `src/lib/data/lootItems.ts`: `hall2fRightLaneY` 배열의 원소 순서가 `인생네컷 포토존 -> 포렌코즈 -> 파페치 / TW 홍보 부스`로 유지되게 정렬 기준을 고정한다.

### Phase 2: 이벤트존 카피 가독성과 layout contract를 새 요구사항에 맞춘다 (상위 3개 작업)

5. - [x] **2F 이벤트존 라벨 줄바꿈 규칙을 명시적으로 추가한다** — 요청된 3개 문구가 한눈에 읽히게 만든다
   - [x] `src/lib/components/ExhibitionMap.svelte`: `getOverlayLabelLines(label)`에 `인생네컷 포토존 -> ['인생네컷', '포토존']` 전용 분기를 추가한다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: 같은 함수에 `쿠팡 와우회원 인증존 -> ['와우회원', '인증존']` 또는 동등한 2줄 분기를 추가해 긴 첫 단어를 줄인다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: 같은 함수에 `헤어쇼 이벤트(4/18) -> ['헤어쇼 이벤트', '(4/18)']` 전용 분기를 추가해 현재 데이터 키는 유지하면서 2줄로 나눈다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: overview L996대와 section L1312대 eventZone 렌더가 모두 같은 `getOverlayLabelLines()` 결과를 쓰므로, 추가 분기가 두 경로에 동시에 적용된다는 점을 확인한다.

6. - [x] **기존 packed layout assertion을 새 형상 기준으로 재작성한다** — 삭제된 계단과 추가된 공백 때문에 초기화 에러가 나지 않게 한다
   - [x] `src/lib/data/lootItems.ts`: `assertCoupangMegaBeautyLayoutContract()` 안에 `ariulBottomY = getRequiredBoothRenderValue('cmbs-2026-ariul', 'renderY') + NORMALIZED_BOOTH_RENDER_HEIGHT` 계산을 추가해 right lane 시작 기준선을 코드로 만든다.
   - [x] `src/lib/data/lootItems.ts`: `assertSingleAxis(hall2fRightLaneX, ...)`는 유지해 3개 block이 같은 `x` column 위에 있는지만 계속 검사하게 둔다.
   - [x] `src/lib/data/lootItems.ts`: `assertPackedAxis(hall2fRightLaneY, BOOTH_SIZED_EVENT_ZONE_HEIGHT, ...)` 호출 1개를 제거해 packed 간격 강제를 해제한다.
   - [x] `src/lib/data/lootItems.ts`: `hall2fRightLaneY` 인접 원소를 순회하며 값이 strictly increasing인지 검사하는 새 loop 또는 helper를 추가한다.
   - [x] `src/lib/data/lootItems.ts`: 새 오름차순 검사 실패 시 메시지가 `Hall 2F right lane items must stay ordered from top to bottom.`을 포함하도록 고정한다.
   - [x] `src/lib/data/lootItems.ts`: 첫 번째 right lane `y`가 `ariulBottomY`보다 커야 한다는 조건을 별도 assertion으로 추가해 "아리얼 아래 공백" 요구를 코드로 고정한다.

7. - [x] **계단 helper와 generic renderer의 책임을 새 데이터와 맞춘다** — 계단 데이터 삭제가 map renderer를 불필요하게 흔들지 않게 한다
   - [x] `src/lib/data/lootItems.ts`: `rg` 결과 기준으로 `getCoupangMegaBeautyStairs()` 호출처가 layout assertion뿐인지 다시 확인하고, 남은 호출이 없으면 함수 자체를 삭제한다.
   - [x] `src/lib/data/lootItems.ts`: `StairsOverlay` 타입과 `MapOverlay` union은 다른 전시회 overlay 확장을 막지 않도록 그대로 유지한다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: `overlay.kind === 'stairs'` 분기는 건드리지 않고, 이번 변경이 "해당 section의 stairs 데이터가 0개여도 렌더가 조용히 빠진다"는 기존 동작만 이용한다는 점을 계획에 명시한다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: 이번 작업에서 `export let` surface에 새 prop을 추가하지 않는다고 범위를 고정한다.
   - [x] `src/routes/+page.svelte`: `<ExhibitionMap>` 호출부의 기존 prop 목록(`exhibition`, `items`, `onPinClick`, `activeMapSectionOverride`, `selectedItemId`)을 그대로 유지한다고 범위를 고정한다.

### Phase 3: 검증 기준과 문서를 새 형상으로 동기화한다 (상위 1개 작업)

8. - [x] **수동 검증 항목을 기존 기대치에서 새 기대치로 교체한다** — 구현 후 확인 포인트가 반대로 남지 않게 한다
   - [x] `MANUAL_TASKS.md`: 기존 "`1F 전시관`에서 상·하단 계단 2개와 파란 `decorRect`가 함께 다시 보이는지 확인" 문장을 찾아 "우측 회색 계단 2개가 사라졌는지"를 확인하는 문장으로 교체한다.
   - [x] `MANUAL_TASKS.md`: 같은 영역의 1F 검증에 "에스트라/바닐라코/닥터지/AHC가 기존보다 위에 올라와 듀이트리와 롬앤 사이 높이대에 보이는지" 문장을 별도 항목으로 추가한다.
   - [x] `MANUAL_TASKS.md`: 기존 "`2F`에서 새 계단을 포함한 우측 4블록 lane이 한 column으로 정렬되어 보이는지 확인" 문장을 찾아 계단 언급을 제거한다.
   - [x] `MANUAL_TASKS.md`: 기존 "`인생네컷 포토존 / 포렌코즈 / 파페치·TW 홍보 부스`가 2F 우측 컬럼에서 세로로 나란히 보이는지 확인" 문장을 찾아 "아리얼 아래 공백 뒤에 3개 block이 세로열로 보이는지" 문장으로 구체화한다.
   - [x] `MANUAL_TASKS.md`: `인생네컷 포토존`, `쿠팡 와우회원 인증존`, `헤어쇼 이벤트(4/18)` 3개가 각각 2줄 라벨로 읽히는지 확인하는 항목을 추가한다.

### Phase 4: 정적 검증과 시각 회귀 확인 경로를 남긴다 (상위 2개 작업)

9. - [ ] **정적 검증으로 좌표/타입 회귀를 막는다** — 데이터 수정 후 즉시 깨지는 경로를 먼저 확인
   - [x] `package.json`: `npm run check` 명령이 여전히 `svelte-check` 기반 정적 검증임을 확인하고, 이번 작업의 기본 자동 검증 명령으로 고정한다.
   - [ ] `src/lib/data/lootItems.ts`: 계단 삭제 직후 모듈 평가 단계에서 `assertCoupangMegaBeautyLayoutContract()`가 throw하지 않는지 `npm run check` 결과로 확인한다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: 새 `getOverlayLabelLines()` 분기가 Svelte 타입/템플릿 오류를 만들지 않는지 `npm run check` 결과로 확인한다.
   - [x] `package.json`: `npm run build` 명령이 존재하는지 확인해 production 검증 경로를 유지한다.
   - [ ] `src/lib/data/lootItems.ts`, `src/lib/components/ExhibitionMap.svelte`: 수정이 끝나면 `npm run build`까지 실행해 data assertion과 Svelte 템플릿이 production 번들 단계에서도 통과하는지 확인한다.

10. - [x] **육안 확인 포인트를 새 요청 순서대로 다시 묶는다** — 사용자가 바로 확인할 수 있는 acceptance 기준을 남긴다
   - [x] `src/routes/+page.svelte`, `MANUAL_TASKS.md`: `map` 탭 진입 후 `전체` overview에서 1F/2F 모두 새 배치가 반영되는지 확인하는 순서를 수동 확인 기준에 적는다.
   - [x] `src/routes/+page.svelte`, `MANUAL_TASKS.md`: `2F` 단일 section으로 전환했을 때도 우측 3부스 순서가 `인생네컷 -> 포렌코즈 -> 파페치 / TW 홍보 부스`로 유지되는지 확인 기준을 적는다.
   - [x] `src/routes/+page.svelte`, `MANUAL_TASKS.md`: 이번 변경이 상세 시트 열기나 section 전환 계약과 무관하다는 점을 반영해, 배치/카피 확인만 수행하는 육안 체크로 범위를 제한한다.

---

*상태: 머지대기 | 진행률: 9/10 (90%)*
