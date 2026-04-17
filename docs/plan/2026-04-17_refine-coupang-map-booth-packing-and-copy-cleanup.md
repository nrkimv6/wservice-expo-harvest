# refine: coupang map booth packing and copy cleanup

> 작성일시: 2026-04-17 23:15
> 기준커밋: 61d3d82
> 대상 프로젝트: expo-harvest
> 상태: 초안
> 진행률: 0/28 (0%)
> 요약: 쿠팡 메가뷰티쇼 지도는 section split 회귀를 복구한 뒤에도 여백이 많은 박스, 벽에서 뜬 배치, 긴 안내 문구가 남아 있다. 이번 후속 변경은 1F/2F/외부 수령존의 부스를 벽과 행 기준으로 다시 붙이고, 표기와 타이포를 짧고 조밀하게 정리해 지도 자체가 표처럼 읽히도록 만드는 데 목적이 있다.

---

## 개요

직전 회귀 수정은 section split 이후 무너진 형상과 scale을 복구하는 데 초점이 있었고, 이번 요청은 그 위에서 **배치 밀도**, **사용자 표기**, **문구 절제**, **텍스트 충전도**를 다시 다듬는 후속 정리다. 따라서 이번 plan은 기존 `src/lib/data/lootItems.ts`의 booth/eventZone/stairs 계약과 `src/lib/components/ExhibitionMap.svelte`의 렌더 구조를 유지한 채, 좌표축과 카피만 요청 범위 안에서 다시 맞추는 작업으로 한정한다.

## 기술적 고려사항

- 현재 지도 데이터의 id와 사용자 표기가 완전히 일치하지 않는다. 예를 들어 `cmbs-2026-mediheal`, `cmbs-2026-ariul`, `쿠팡 뉴존 체험존`, `뉴존 선물 수령존`, `파페치 / TW 홍보 부스` 같은 기존 키는 유지하고, 표시 문구만 요청 범위에서 조정해야 한다.
- "같은 행에 적은 열 부스는 여백 없이 붙인다"는 요구는 단순 spacing 감소가 아니라, 같은 row/column에 속한 박스들이 서로 맞닿아 표 셀처럼 읽히게 좌표와 폭/높이를 함께 조정해야 한다는 뜻이다.
- `decorRect`는 `hall-1f` stair gap의 파란 가벽 역할이므로, 삭제 시 다른 `stairs` overlay와 `viewBox`는 유지되는지 함께 확인해야 한다.
- 부스 내부 공백 축소는 전역 폰트 크기만 키우면 끝나지 않는다. `mapLabelLines`, `mapLabelFontSize`, `getLabelFontSize()`, multi-line anchor/line-height가 함께 움직여야 긴 브랜드명과 이벤트명이 박스를 넘치지 않는다.
- 지도 내부 긴 설명 문구 제거 요청은 현재 `ExhibitionMap.svelte`의 section header 설명과 hover/empty-state helper copy 양쪽에 걸쳐 있다. 단순 삭제 후 빈 자리가 어색하지 않게 짧은 상태 문구만 남겨야 한다.
- 저장소 루트에 `AGENTS.md`가 아직 없으므로, "지도 영역 안 긴 문장 금지" 규칙은 기존 문서 수정이 아니라 새 파일 생성으로 다뤄야 한다.

---

## TODO

### Phase 1: 배치 규칙과 표기 범위를 먼저 고정한다

1. - [ ] **배치 축과 표기 매핑을 현재 데이터 기준으로 고정한다** — 구현 중 id rename과 좌표 드리프트가 다시 섞이지 않게 한다
   - [ ] `src/lib/data/lootItems.ts`: `hall-1f` 좌측/중앙/우측 브랜드축, `hall-2f` 상단/좌측/우측 축을 상수나 주석으로 묶어 "같은 행/열 박스는 gap 없이 맞닿는다"는 계약을 명시한다.
   - [ ] `src/lib/data/lootItems.ts`: 사용자 표기와 다른 기존 데이터 키(`mediheal`, `ariul`, `쿠팡 뉴존 체험존`, `뉴존 선물 수령존`, `파페치 / TW 홍보 부스`)를 현재 id 기준으로 매핑하고, 불필요한 id rename 없이 표시문구만 바꾸는 범위를 명시한다.
   - [ ] `src/lib/data/lootItems.ts`: `beauty-box-pickup` section의 입구/출구 상대 위치를 "수령존 아래 입구, 좌하단 출구" 기준으로 고정할 메모 또는 helper 경계를 추가한다.

2. - [ ] **표기면을 요청된 짧은 문구로 정리한다** — 헤더와 섹션명이 지도 목적에 맞게 바로 읽히게 만든다
   - [ ] `src/lib/data/lootItems.ts`: map section label을 `1F`, `2F`, `뷰티박스 수령존`으로 줄이고, `venue`/description에 남은 `1F 전시관`, `2F 전시관`, `뷰티박스 수령존 (1F 외부)` 표기도 함께 정리한다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: `전시 구역별 부스 보기` 헤더를 `부스보기`로 축약하고, 이 변경이 모바일/desktop header 구조를 깨지 않는지 같이 맞춘다.
   - [ ] `AGENTS.md`: 저장소 루트에 새 파일을 만들고 "지도 영역 UI 안에는 장문 사용법/설명문을 넣지 않는다"는 카피 가드레일을 추가한다.

### Phase 2: 1F 브랜드축과 이벤트 동선을 다시 붙인다

3. - [ ] **1F 브랜드 부스를 벽과 행 기준으로 재배치한다** — 브랜드 박스가 표 셀처럼 읽히도록 축을 다시 맞춘다
   - [ ] `src/lib/data/lootItems.ts`: `롬앤`, `듀이트리`, `네이처리퍼블릭`을 1F 좌측 벽 세로열 3부스로 재배치하고 각 박스의 세로 간격을 0으로 맞춘다.
   - [ ] `src/lib/data/lootItems.ts`: `에스트라`, `바닐라코`, `닥터지`, `AHC`를 1F 중앙 가로열 4부스로 다시 묶고, 현재보다 아래로 내리면서 박스 사이 가로 gap을 없앤다.
   - [ ] `src/lib/data/lootItems.ts`: `더페이스샵`, `에스쁘아`, `토니모리`를 1F 우측 벽 세로열 3부스로 재배치하고 각 박스가 벽 기준선에 맞닿도록 조정한다.

4. - [ ] **1F 이벤트존과 외부 수령 동선을 요청 위치로 정리한다** — 중앙 체험존, 하단 열, 외부 입출구를 한 번에 맞춘다
   - [ ] `src/lib/data/lootItems.ts`: `쿠팡 어워즈 체험존`을 1F 메인 배치 아랫줄 중앙으로 옮기고, 주변 브랜드축과 시각적으로 충돌하지 않는 중심점으로 다시 맞춘다.
   - [ ] `src/lib/data/lootItems.ts`: `피부측정 이벤트`, `쿠팡 뉴존 체험존`, `뷰티 디바이스 체험존`, `뉴존 선물 수령존`, `출구`를 1F 하단 가로열로 재배치하고, 박스/이벤트존이 서로 gap 없이 이어지게 조정한다.
   - [ ] `src/lib/data/lootItems.ts`: `beauty-box-pickup` section에서 `뷰티박스 수령존` 아래 `입구`, 좌하단 `출구`를 다시 두고, `hall-1f` stair gap의 파란 `decorRect`는 삭제한다.

### Phase 3: 2F 벽 부착 레이아웃을 단일 축으로 복구한다

5. - [ ] **2F 상단/좌측/우측 벽 부착 축을 다시 맞춘다** — 2F가 가로 1열 + 좌우 보조축 구조로 읽히게 만든다
   - [ ] `src/lib/data/lootItems.ts`: `아벤느`, `에뛰드`, `이지듀`, `메디힐`, `이니스프리`, `피지오겔`, `에이지20s`, `아리얼`을 2F 상단 벽 가로 1열 8부스로 재배치하고, 모든 박스가 같은 `renderY`와 무간격 좌우 접합을 공유하게 만든다.
   - [ ] `src/lib/data/lootItems.ts`: `쿠팡 메가뷰티쇼 스토리`, `쿠팡 와우회원 인증존`, `헤어쇼 이벤트(4/18)`를 2F 좌측 벽 가로 1열 3부스로 다시 놓고, 요청 순서대로 서로 붙여 배치한다.
   - [ ] `src/lib/data/lootItems.ts`: `stairs`, `인생네컷 포토존`, `포렌코즈`, `파페치 / TW 홍보 부스`를 2F 우측 벽 세로 1열 기준으로 맞추고, 같은 column 축 위에서만 간격을 조정한다.

### Phase 4: 부스 내부 공백과 문구 길이를 줄인다

6. - [ ] **부스 내부 타이포를 box-filling 기준으로 다시 키운다** — 박스 내부 여백보다 텍스트 가독성을 우선한다
   - [ ] `src/lib/components/ExhibitionMap.svelte`: `getLabelFontSize()` 또는 동일 역할 helper의 기본/상한 폰트를 키우고, booth 내부 padding처럼 보이는 여백을 줄이는 방향으로 rect-text 조합을 다시 맞춘다.
   - [ ] `src/lib/data/lootItems.ts`: 전역 폰트 상향 후에도 넘치거나 지나치게 작은 label만 `mapLabelLines`/`mapLabelFontSize` 예외값으로 다시 조정한다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: booth/eventZone multi-line text의 `y`, `dy`, line spacing을 조정해 박스를 더 꽉 채우되 상하 clipping은 나지 않게 한다.

7. - [ ] **긴 안내 문구를 삭제하고 짧은 상태 문구만 남긴다** — 지도 안에서는 사용설명보다 배치 정보가 먼저 보이게 만든다
   - [ ] `src/lib/components/ExhibitionMap.svelte`: `지도 영역 안에서는 한 손가락 드래그...`, `브랜드 박스에 커서를 올리면 층과 상태를 요약...` 계열의 장문 안내를 제거하고, 필요하면 짧은 상태 문구만 남긴다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: hover/selected/empty 상태 helper copy가 삭제 후에도 레이아웃 높이를 과하게 차지하지 않도록 문구 길이와 spacing을 함께 줄인다.
   - [ ] `MANUAL_TASKS.md`: "장문 안내 없음", "부스 글자가 박스를 충분히 채움", "같은 행/열 박스 무간격"을 육안 검증 항목으로 추가한다.

### Phase 5: 정적 점검과 수동 검증 순서를 고정한다

8. - [ ] **검증 절차를 이번 후속 변경에 맞게 남긴다** — 구현 후 어디를 봐야 하는지 문서에서 바로 읽히게 한다
   - [ ] `MANUAL_TASKS.md`: 1F에서 좌/중/우 브랜드축, 중앙 어워즈 체험존, 하단 이벤트 가로열, 외부 수령존 입출구 위치를 확인하는 체크를 추가한다.
   - [ ] `MANUAL_TASKS.md`: 2F에서 상단 8부스, 좌측 3부스, 우측 stair/photo/forencos/TW column이 벽 기준으로 붙어 있는지 확인하는 체크를 추가한다.
   - [ ] `docs/plan/2026-04-17_refine-coupang-map-booth-packing-and-copy-cleanup.md`: 구현 검증 순서를 `npm run check` 후 브라우저 육안 검증으로 고정하고, 타이포/문구 변경은 자동 테스트만으로 닫히지 않는다고 명시한다.

---

*상태: 초안 | 진행률: 0/28 (0%)*
