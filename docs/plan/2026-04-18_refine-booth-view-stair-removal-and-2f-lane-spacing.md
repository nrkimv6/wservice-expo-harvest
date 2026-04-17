# refine: booth view stair removal and 2f lane spacing

> 작성일시: 2026-04-18 00:41
> 기준커밋: cb1daf7
> 대상 프로젝트: expo-harvest
> 상태: 초안
> 진행률: 0/8 (0%)
> 출처: 사용자 요청
> 요약: `부스보기`의 현재 1F/2F 배치는 `src/lib/data/lootItems.ts`의 고정 좌표와 `assertCoupangMegaBeautyLayoutContract()`에 묶여 있어, 계단 삭제나 2F 우측 lane 공백 추가 같은 요청이 단순 좌표 수정만으로 끝나지 않는다. 이번 계획은 1F 우측 회색 계단 제거, 1F 중앙 4부스 상향, 2F 계단 제거와 우측 3부스 재배치, 2F 이벤트존 줄바꿈 가독성 개선을 한 번에 반영하면서 기존 수동 체크 기준과 레이아웃 계약을 새 형상에 맞게 다시 잠그는 데 목적이 있다.

---

## 개요

현재 `부스보기` 지도는 [`src/lib/data/lootItems.ts`](D:/work/project/service/wtools/expo-harvest/src/lib/data/lootItems.ts) 안의 `COUPANG_MEGA_BEAUTY_BOOTH_LAYOUTS`와 `COUPANG_MEGA_BEAUTY_OVERLAYS`가 실제 형상을 결정한다. 확인 결과 `1F`는 우측에 `stairs` overlay 2개가 남아 있고(L658-L659), 중앙 4부스(`에스트라`, `바닐라코`, `닥터지`, `AHC`)는 모두 `renderY: 108`에 고정돼 있어 좌측 `롬앤(24) / 듀이트리(78)` 사이 높이보다 아래에 배치돼 있다. `2F`는 우측 lane을 `계단 + 인생네컷 포토존 + 포렌코즈 + 파페치 / TW 홍보 부스`의 4블록 column으로 강제하고 있어(L793-L845), 사용자가 요청한 “계단 삭제 후 아리얼 아래 공백을 둔 3부스 배치”와 정면 충돌한다.

또한 [`src/lib/components/ExhibitionMap.svelte`](D:/work/project/service/wtools/expo-harvest/src/lib/components/ExhibitionMap.svelte)의 `getOverlayLabelLines()`는 현재 `쿠팡 뉴존 체험존`, `뉴존 선물 수령존`, `파페치 / TW 홍보 부스`만 수동 줄바꿈하고 있어(L451-L470), 이번 요청 대상인 `인생네컷 포토존`, `쿠팡 와우회원 인증존`, `헤어쇼 이벤트(4/18)`은 한 줄 또는 비의도적 자동 분기 상태로 남아 있다. 따라서 이번 수정은 단순 SVG 스타일 변경이 아니라, 데이터 좌표와 overlay 라벨 분기, 그리고 이를 고정하는 layout assertion과 수동 검증 항목을 함께 업데이트하는 작업으로 본다.

이번 계획에서는 사용자의 1번 요청을 “`1F` 우측에 보이는 회색 계단 overlay 전체 제거”로 해석한다. 현재 `hall-1f`에는 상단/하단 계단 2개가 모두 존재하므로, 구현 시 두 overlay를 함께 제거하는 방향으로 계획을 잡고, 만약 사용자가 상단 또는 하단 하나만 원했다면 검토 단계에서 범위를 다시 좁힌다.

## 기술적 고려사항

- [`src/lib/data/lootItems.ts`](D:/work/project/service/wtools/expo-harvest/src/lib/data/lootItems.ts): `1F` 중앙 4부스는 `HALL_1F_CENTER_ROW_BOOTH_IDS`와 `assertSingleAxis(hall1fCenterRowY, ...)`로 같은 `renderY` 행만 강제하므로, 네 부스를 함께 위로 올리는 것은 계약을 유지한 채 해결할 수 있다.
- [`src/lib/data/lootItems.ts`](D:/work/project/service/wtools/expo-harvest/src/lib/data/lootItems.ts): 반대로 `2F` 우측 lane은 현재 `getCoupangMegaBeautyStairs('hall-2f')`를 포함한 packed column 전제를 강제한다. 계단 삭제와 `아리얼` 아래 공백 확보를 반영하려면 `HALL_2F_RIGHT_LANE_LABELS`의 기준과 `assertPackedAxis(hall2fRightLaneY, ...)` 자체를 새 형상에 맞게 재정의해야 한다.
- [`src/lib/components/ExhibitionMap.svelte`](D:/work/project/service/wtools/expo-harvest/src/lib/components/ExhibitionMap.svelte): `getOverlayLabelLines()`와 `getEventZoneTextOffset()`는 overview/section 렌더 양쪽에서 그대로 재사용되므로, 줄바꿈 규칙을 이 helper 한 곳에서 보정하면 `전체`와 `2F` 단일 뷰가 동시에 맞춰진다.
- [`MANUAL_TASKS.md`](D:/work/project/service/wtools/expo-harvest/MANUAL_TASKS.md): 현재 미완료 항목에는 `1F` 계단이 보여야 한다는 검증(L33)과 `2F`에서 계단을 포함한 우측 4블록 lane 검증(L12)이 남아 있어, 이번 형상 변경 뒤에는 그대로 두면 잘못된 기대치를 유지하게 된다.

---

## TODO

### Phase 1: 1F/2F 새 형상을 데이터 기준으로 다시 정의한다

1. - [ ] **1F 계단 삭제 범위와 중앙 4부스 목표 높이를 데이터 기준으로 확정한다** — 사용자 요청을 실제 좌표로 번역
   - [ ] `src/lib/data/lootItems.ts`: `hall-1f`의 `stairs` 2개(L658-L659)를 모두 제거 대상으로 문서화하고, 구현 시 남겨둘 장식 요소가 `arrow`뿐인지 확인한다.
   - [ ] `src/lib/data/lootItems.ts`: `cmbs-2026-aestura`, `cmbs-2026-banilaco`, `cmbs-2026-drg`, `cmbs-2026-ahc`의 `renderY`를 `롬앤(24)`과 `듀이트리(78)` 사이 높이로 함께 올릴 수 있는 목표값으로 재산정한다.

2. - [ ] **2F 우측 3부스의 새 column 계약을 정의한다** — 계단 없는 3블록 배치와 아리얼 아래 여백을 동시에 만족
   - [ ] `src/lib/data/lootItems.ts`: `hall-2f` 계단 overlay(L696)를 제거하고, `인생네컷 포토존`, `포렌코즈`, `파페치 / TW 홍보 부스`의 `x/y` 또는 `renderX/renderY`를 `아리얼` 하단보다 한 칸 아래에서 시작하는 새 세로축으로 다시 계산한다.
   - [ ] `src/lib/data/lootItems.ts`: 우측 lane이 더 이상 “무간격 4블록”이 아니라 “상단 공백 + 3부스 세로열”이라는 점을 반영해 `HALL_2F_RIGHT_LANE_LABELS` 사용 방식과 관련 주석을 새 의미에 맞게 정리한다.

### Phase 2: 이벤트존 카피 가독성과 layout contract를 새 요구사항에 맞춘다

3. - [ ] **2F 이벤트존 라벨 줄바꿈 규칙을 명시적으로 추가한다** — 요청된 3개 문구가 한눈에 읽히게 만든다
   - [ ] `src/lib/components/ExhibitionMap.svelte`: `getOverlayLabelLines()`에 `인생네컷 포토존`, `쿠팡 와우회원 인증존`, `헤어쇼 이벤트(4/18)` 전용 분기를 추가해 각 라벨이 2줄로 안정적으로 보이게 한다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: 새 2줄 라벨이 `getEventZoneTextOffset()`/`getEventZoneLineGap()` 기준에서 위아래로 잘리지 않는지, 추가 font-size 보정이 필요한 label이 있는지 함께 점검한다.

4. - [ ] **기존 packed layout assertion을 새 형상 기준으로 재작성한다** — 삭제된 계단과 추가된 공백 때문에 초기화 에러가 나지 않게 한다
   - [ ] `src/lib/data/lootItems.ts`: `assertCoupangMegaBeautyLayoutContract()`에서 `hall-1f` stairs 존재를 전제로 한 검증이 남지 않도록 제거하고, `1F` 중앙 4부스는 “같은 row를 공유한다”는 계약만 유지한다.
   - [ ] `src/lib/data/lootItems.ts`: `hall-2f` 우측 lane 검증을 `stairs + packed step` 전제에서 `3부스 동일 x축 + 아리얼 아래 시작 + 부스 간 의도된 간격` 전제로 바꾼다.

### Phase 3: 검증 기준과 문서를 새 형상으로 동기화한다

5. - [ ] **수동 검증 항목을 기존 기대치에서 새 기대치로 교체한다** — 구현 후 확인 포인트가 반대로 남지 않게 한다
   - [ ] `MANUAL_TASKS.md`: `1F` 계단 존재 확인 항목을 제거하거나 수정해 “우측 회색 계단이 사라지고 중앙 4부스가 더 위에 보이는지”를 확인하는 문구로 교체한다.
   - [ ] `MANUAL_TASKS.md`: `2F`의 “계단 포함 우측 4블록 lane” 검증을 “아리얼 아래 여백 후 우측 3부스 세로열”과 “3개 이벤트존 줄바꿈 가독성” 검증으로 교체한다.

6. - [ ] **현재 관련 문서와의 충돌 여부를 정리한다** — 이전 복원 계획이 이번 요구와 충돌하는 지점을 명확히 남긴다
   - [ ] `docs/plan/2026-04-18_refine-booth-view-stair-removal-and-2f-lane-spacing.md`: 기존 archive 문서들이 `1F/2F stairs 복원`, `2F right lane packed`를 목표로 삼았다는 점과, 이번 요청이 그 계약을 덮어쓴다는 점을 개요/주의사항에 명시한다.
   - [ ] `TODO.md`: 이번 plan 링크를 Pending에 추가해 이후 `/implement`가 새 요구를 기준으로 진행되게 만든다.

### Phase 4: 정적 검증과 시각 회귀 확인 경로를 남긴다

7. - [ ] **정적 검증으로 좌표/타입 회귀를 막는다** — 데이터 수정 후 즉시 깨지는 경로를 먼저 확인
   - [ ] `package.json`, `src/lib/data/lootItems.ts`, `src/lib/components/ExhibitionMap.svelte`: `npm run check`를 실행해 overlay label helper 분기, layout assertion, 타입 경계가 모두 통과하는지 확인한다.
   - [ ] `package.json`, `src/lib/data/lootItems.ts`, `src/lib/components/ExhibitionMap.svelte`: 필요하면 `npm run build`까지 실행해 Svelte compile 단계에서 SVG/markup 회귀가 없는지 추가 확인한다.

8. - [ ] **육안 확인 포인트를 새 요청 순서대로 다시 묶는다** — 사용자가 바로 확인할 수 있는 acceptance 기준을 남긴다
   - [ ] `MANUAL_TASKS.md`: `1F`에서는 “우측 회색 계단 삭제”와 “에스트라/바닐라코/닥터지/AHC 상향”을, `2F`에서는 “계단 삭제”, “우측 3부스 아리얼 아래 공백 배치”, “인생네컷/인증존/헤어존 이벤트 줄바꿈”을 각각 독립 확인 항목으로 정리한다.
   - [ ] `docs/plan/2026-04-18_refine-booth-view-stair-removal-and-2f-lane-spacing.md`: 검토 시 사용자가 바로 판단할 수 있도록 이번 요청 1~5번이 각각 어떤 데이터/렌더 변경으로 연결되는지 요약 문장을 유지한다.

---

*상태: 초안 | 진행률: 0/8 (0%)*
