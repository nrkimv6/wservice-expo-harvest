# fix: coupang map layout regressions after section split

> 완료일: 2026-04-17
> 아카이브됨
> 진행률: 48/48 (100%)
> 작성일시: 2026-04-17 20:15
> 기준커밋: 1bb1185
> 대상 프로젝트: expo-harvest
> 상태: 구현완료
> 반영일시: 2026-04-17 20:50
> 머지커밋: dfa1da6
> 진행률: 48/48 (100%)
> 요약: 전시관 3분할 과정에서 사용자가 요청하지 않은 부스 재배치와 스케일 왜곡이 함께 들어가면서, 이벤트 부스 크기 정규화 누락, 2F 대열 붕괴, 전시관별 부스 크기 불균일, 계단 오버레이 누락이 발생했다. 이번 계획은 `13f12bd` 기준의 원래 형상을 참조해 “배치는 되돌리고, 크기만 균일화한다”는 원칙으로 회귀를 수정하는 데 목적이 있다.

---

## 개요

이번 회귀의 핵심 문제는 “부스 크기 정규화” 요구를 “레이아웃 재배치 허용”으로 잘못 확장한 데 있다. 사용자가 허용한 것은 일부 박스의 크기 보정이었지만, 실제 구현에서는 `2F` 브랜드 8개 가로열과 하단 체험존 세로열 같은 원래 대열 구조까지 흔들렸고, `인생네컷/포렌코즈/파페치` 우측 세로축만 남긴 채 나머지 배치까지 달라졌다. 또한 이벤트 부스(`체험존`, `인증존`, `홍보 부스`, `수령존`)는 정작 공통 부스 크기로 맞춰지지 않았고, `뷰티박스 수령존` 전용 section은 상대적으로 과하게 커져 전시관 간 체감 스케일까지 어긋났다.

추가로 `src/lib/data/lootItems.ts`의 section 분리 과정에서 원래 `1F`에 있던 계단 오버레이 2개가 빠졌다. `src/lib/components/ExhibitionMap.svelte`는 `stairs` 렌더링 분기를 여전히 갖고 있으므로, 이는 컴포넌트 문제가 아니라 데이터 회귀다. 따라서 이번 수정은 UI 컴포넌트의 시각 스타일을 다시 흔드는 작업이 아니라, **데이터 기준 형상 복원**, **이벤트 부스까지 포함한 크기 규격 통일**, **section 간 동일 스케일 보장**, **누락 오버레이 복원**으로 한정해야 한다.

## 기술적 고려사항

- 원래 형상 기준은 section 분리 직전 커밋인 `13f12bd`의 `src/lib/data/lootItems.ts` 좌표다. 이번 수정은 그 배치를 기준선으로 삼고, 사용자가 명시한 세로 정렬 요구(`인생네컷/포렌코즈/파페치`) 외에는 임의 재배치를 금지해야 한다.
- 현재 `NORMALIZED_BOOTH_IDS`는 `cmbs-2026-forencos` 하나만 포함하므로, 사용자가 말한 “부스 크기를 맞춰야 할 이벤트 부스”는 `LootItem` 경로가 아니라 `MapOverlay(kind: 'eventZone')` 경로에서도 별도 정규화 규칙이 필요하다.
- `coupangMegaBeautyShow2026MapSections`의 `viewBox`가 각 section마다 다르게 잘리면서, 동일 `renderWidth/renderHeight`라도 화면상 체감 크기가 달라질 수 있다. “부스 크기 균일”은 데이터 box 크기뿐 아니라 section viewport 스케일까지 같이 봐야 한다.
- `src/lib/components/ExhibitionMap.svelte`의 `getDefaultMapSectionScale()`는 `viewBox.height <= 220`이면 기본 배율을 `1.9`로 올린다. 따라서 `beauty-box-pickup`처럼 작은 section은 `viewBox`만 조여도 더 크게 보일 수 있으므로, 체감 크기 회귀는 데이터와 렌더러 확대 규칙을 함께 고정해야 한다.
- `ExhibitionMap.svelte`는 `eventZone`, `stairs`, `booth`를 서로 다른 SVG primitive로 그린다. 따라서 “이벤트존도 부스 크기로” 요구는 item 데이터 변경만으로 해결되지 않으며, overlay 렌더 계약도 같이 고정해야 한다.
- `뷰티박스 수령존` section은 부스가 하나뿐이라 viewBox를 과하게 줄이면 같은 크기 박스도 크게 보인다. 따라서 “한 개만 있는 section이라 더 크게 보이는 현상”을 막으려면 최소 여백 규칙이 아니라 **공통 기준 폭/높이 대비 스케일 상한**을 명시해야 한다.
- 계단은 `stairs` overlay 데이터만 복원하면 렌더링된다. 누락 원인을 다시 만들지 않으려면 section 분리 후에도 `stairs`를 누가 소유하는지(`hall-1f`)를 데이터 차원에서 명시해야 한다.
- strict main drift 기준으로 `git diff --name-only 1bb1185..main`과 대상 파일별 diff를 확인했을 때, 현재 main에서 추가로 변한 파일은 `TODO.md`와 본 계획서뿐이었다. 따라서 이번 plan은 현재 `src/lib/data/lootItems.ts`, `src/lib/components/ExhibitionMap.svelte`, `MANUAL_TASKS.md`, `package.json` HEAD를 그대로 기준으로 구현해도 된다.
- 저장소에 `tests/` 디렉터리가 없어 이번 수정의 자동 검증 경로는 `npm run check`가 유일하다. 따라서 회귀 차단은 `svelte-check`와 `MANUAL_TASKS.md`의 브라우저 육안 검증을 함께 묶어야 한다.

## Phase R 결과

- 데이터 기준 회귀: `src/lib/data/lootItems.ts`에서 `NORMALIZED_BOOTH_IDS`는 booth item 정규화, `renderWidth`/`renderHeight`는 booth 시각 크기, `COUPANG_MEGA_BEAUTY_OVERLAYS`는 eventZone·stairs·decorRect 소유권을 결정한다. 이번 수정은 booth-sized overlay helper와 Hall 2F row/column contract assertion으로 이 경로를 방어했다.
- 렌더 기준 회귀: `src/lib/components/ExhibitionMap.svelte`에서 `getDefaultMapSectionScale()`는 section 기본 배율, `getRenderedViewBox()`는 최종 viewport, `getBoothRect()`는 booth 실제 SVG box를 결정한다. 이번 수정은 section별 기본 배율을 `DEFAULT_MAP_SECTION_SCALES`로 고정하고 eventZone typography literal을 상수/helper로 수렴시켜 이 경로를 방어했다.
- 범위 제외: `src/routes/+page.svelte`는 `mapSectionOverride = nextItem.mapSectionId`로 탭 이동만 담당하고 booth/eventZone geometry는 계산하지 않는다. 따라서 이번 layout 회귀 수정 범위에서는 제외했다.
- 검증 순서: `package.json`의 기존 `check` 스크립트(`svelte-kit sync && svelte-check --tsconfig ./tsconfig.json`)를 그대로 재사용한다. 다만 `/implement` 단계에서는 worktree에서 frontend verify를 실행하지 않고, main 머지 후 `npm run check`를 먼저 실행한 다음 브라우저에서 `MANUAL_TASKS.md` 항목을 육안 검증한다.

---

## TODO

### Phase 1: 원래 형상 기준과 금지선을 문서화한다 (8 tasks)

1. - [x] **배치 기준선을 `13f12bd`로 고정한다** — 기준 좌표가 어느 데이터 묶음에 적용되는지 코드에서 바로 읽히게 만든다
   - [x] `src/lib/data/lootItems.ts`: `COUPANG_MEGA_BEAUTY_BOOTH_LAYOUTS` 선언 바로 위에 `13f12bd` 기준선이 1F/2F 브랜드 booth 복원 기준이라는 주석 또는 상수명을 추가한다.
   - [x] `src/lib/data/lootItems.ts`: `COUPANG_MEGA_BEAUTY_OVERLAYS` 선언 바로 위에 `eventZone`, `stairs`, `decorRect`도 같은 기준커밋 좌표를 따른다는 주석 또는 그룹명을 추가한다.
   - [x] `src/lib/data/lootItems.ts`: `beauty-box-pickup`이 “임의 확대 허용 예외”가 아니라 “위치 유지 + 스케일 상한 적용 대상”임을 section 정의 인접 주석으로 명시한다.

2. - [x] **허용 변경과 금지 변경을 상수 경계로 분리한다** — 구현 중 임의 재배치를 막는 가드레일을 만든다
   - [x] `src/lib/data/lootItems.ts`: `2F` 상단 가로 1열을 구성하는 8개 브랜드 id 목록을 별도 상수로 뽑아 top-row 고정 범위를 코드에 남긴다.
   - [x] `src/lib/data/lootItems.ts`: `2F` 좌측 세로 1열을 구성하는 `헤어쇼 이벤트`, `쿠팡 메가뷰티쇼 스토리`, `쿠팡 와우회원 인증존` label 목록을 별도 상수로 뽑는다.
   - [x] `src/lib/data/lootItems.ts`: 우측 세로축을 구성하는 `인생네컷 포토존`, `포렌코즈`, `파페치 / TW 홍보 부스`를 별도 상수나 helper 이름으로 고정해 다른 overlay와 섞이지 않게 한다.

### Phase 2: 이벤트 부스와 일반 부스의 크기 규격을 다시 맞춘다 (8 tasks)

3. - [x] **이벤트 부스를 공통 booth 규격에 포함한다** — booth-sized overlay의 크기 경로를 단일화한다
   - [x] `src/lib/data/lootItems.ts`: booth-sized `eventZone` label 목록을 별도 상수로 추가해 어떤 overlay가 일반 안내 박스가 아닌지 코드에서 바로 판별되게 한다.
   - [x] `src/lib/data/lootItems.ts`: booth-sized `eventZone`용 공통 `width`/`height` 상수 또는 preset 객체를 추가해 수치를 한 곳으로 모은다.
   - [x] `src/lib/data/lootItems.ts`: `COUPANG_MEGA_BEAUTY_OVERLAYS`의 booth-sized `eventZone` 항목이 새 공통 상수를 사용하도록 각 entry의 `width`/`height`를 치환한다.

4. - [x] **section별 체감 스케일 차이를 줄인다** — 작은 section만 과대 확대되는 경로를 끊는다
   - [x] `src/lib/data/lootItems.ts`: `hall-1f`와 `hall-2f` `viewBox`를 booth 공통 크기와 overlay padding 기준으로 다시 계산한다.
   - [x] `src/lib/data/lootItems.ts`: `beauty-box-pickup` `viewBox`를 단일 overlay 크기보다 과하게 타이트하지 않은 값으로 다시 계산한다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: `getDefaultMapSectionScale(section)`가 `beauty-box-pickup`에서만 과도한 기본 배율을 만들지 않도록 section별 상한 또는 예외 분기를 추가한다.

### Phase R: 재발 경로를 닫는다 (8 tasks)

5. - [x] **회귀 유입 경로를 데이터/렌더로 분리해 기록한다** — 어느 파일을 건드려야 같은 버그가 다시 안 나는지 명확히 남긴다
   - [x] `docs/plan/2026-04-17_fix-coupang-map-layout-regressions-after-section-split.md`: `src/lib/data/lootItems.ts`의 `NORMALIZED_BOOTH_IDS`, `renderWidth`, `renderHeight`, `COUPANG_MEGA_BEAUTY_OVERLAYS` 검색 결과를 “데이터 기준 회귀” 항목으로 기록한다.
   - [x] `docs/plan/2026-04-17_fix-coupang-map-layout-regressions-after-section-split.md`: `src/lib/components/ExhibitionMap.svelte`의 `getDefaultMapSectionScale()`, `getRenderedViewBox()`, `getBoothRect()` 검색 결과를 “렌더 기준 회귀” 항목으로 기록한다.
   - [x] `docs/plan/2026-04-17_fix-coupang-map-layout-regressions-after-section-split.md`: `src/routes/+page.svelte`가 `mapSectionId` 탭 이동만 담당하므로 이번 layout 회귀 수정 범위에서는 제외된다는 판정 근거를 기록한다.

6. - [x] **중복된 크기·배율 규칙을 단일 경로로 모은다** — 이후 수정이 한 곳에서 끝나게 구조를 정리한다
   - [x] `src/lib/data/lootItems.ts`: booth와 booth-sized overlay 크기 수치가 배열 literal에 흩어져 있으면 공통 constant/preset/helper 한 경로로 수렴시킨다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: `eventZone` 렌더 블록의 `font-size`, `dy`, `stroke-width`, `rx` literal을 공통 상수/helper로 끌어올린다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: section별 확대 예외가 필요하면 `getDefaultMapSectionScale()` 단일 함수에만 남기고 다른 분산 분기를 만들지 않는다.

### Phase 3: 2F와 1F의 원래 배치를 복원한다 (16 tasks)

7. - [x] **2F 상단 8부스 가로 대열을 다시 한 줄로 만든다** — 브랜드 row 붕괴를 행 단위로 복원한다
   - [x] `src/lib/data/lootItems.ts`: `avene`, `etude`, `easydew`, `mediheal`의 `renderY`를 같은 행으로 맞추고 `renderX`를 좌→우 순서로 다시 배치한다.
   - [x] `src/lib/data/lootItems.ts`: `innisfree`, `physiogel`, `age20s`, `ariul`의 `renderY`를 같은 행으로 맞추고 `renderX`를 좌→우 순서로 다시 배치한다.
   - [x] `src/lib/data/lootItems.ts`: `forencos`가 상단 가로열 좌표를 재사용하지 않도록 `renderX`/`renderY`를 우측 세로축 기준점으로 고정한다.

8. - [x] **2F 좌측 체험존 세로열을 복원한다** — 좌측 event column을 overlay별로 다시 쌓는다
   - [x] `src/lib/data/lootItems.ts`: `헤어쇼 이벤트(4/18)` `eventZone`의 `x`/`y`를 좌측 세로열 최상단 기준으로 복원한다.
   - [x] `src/lib/data/lootItems.ts`: `쿠팡 메가뷰티쇼 스토리` `eventZone`의 `x`/`y`를 같은 좌측 세로열 중단 기준으로 복원한다.
   - [x] `src/lib/data/lootItems.ts`: `쿠팡 와우회원 인증존` `eventZone`의 `x`/`y`를 같은 좌측 세로열 하단 기준으로 복원한다.

9. - [x] **2F 우측 세로축 3개만 같은 column을 공유하게 만든다** — 사용자가 허용한 세로 정렬만 남긴다
   - [x] `src/lib/data/lootItems.ts`: `인생네컷 포토존` `eventZone`의 `x`를 `forencos` 기준 column과 맞추고 상단 간격만 복원한다.
   - [x] `src/lib/data/lootItems.ts`: `forencos` booth의 `renderX`를 우측 column 중앙축으로 유지하고 `인생네컷`과 `파페치 / TW 홍보 부스` 사이 간격만 조정한다.
   - [x] `src/lib/data/lootItems.ts`: `파페치 / TW 홍보 부스` `eventZone`의 `x`를 같은 column으로 맞추고 하단 간격만 복원한다.

10. - [x] **1F 이벤트존과 수령존은 위치를 유지한 채 크기만 맞춘다** — 사용자가 허용하지 않은 재배치를 막는다
   - [x] `src/lib/data/lootItems.ts`: `쿠팡 어워즈 체험존`, `피부측정 이벤트`, `뷰티 디바이스 체험존`의 중심점은 유지하고 `width`/`height`만 booth 규격으로 맞춘다.
   - [x] `src/lib/data/lootItems.ts`: `쿠팡 뉴존 체험존`, `뉴존 선물 수령존`의 중심점은 유지하고 `width`/`height`만 booth 규격으로 맞춘다.
   - [x] `src/lib/data/lootItems.ts`: `beauty-box-pickup`의 `뷰티박스 수령존` overlay는 현재 중앙 배치를 유지한 채 동일 booth 규격으로만 맞춘다.

### Phase 4: 누락 오버레이와 검증 기준을 복구한다 (8 tasks)

11. - [x] **계단 오버레이 누락을 원래 section에 되돌린다** — `hall-1f` 데이터만으로 다시 렌더되게 만든다
   - [x] `src/lib/data/lootItems.ts`: `COUPANG_MEGA_BEAUTY_OVERLAYS`에 `13f12bd` 기준 상단 계단 `stairs` entry를 `hall-1f`로 복원한다.
   - [x] `src/lib/data/lootItems.ts`: `COUPANG_MEGA_BEAUTY_OVERLAYS`에 `13f12bd` 기준 하단 계단 `stairs` entry를 `hall-1f`로 복원한다.
   - [x] `src/lib/data/lootItems.ts`: 계단과 함께 있었던 보조 `decorRect`를 `hall-1f`에 복원하고 `hall-1f` `viewBox`가 이를 자르지 않는 값인지 다시 맞춘다.

12. - [x] **수동 검증 기준과 정적 검증 순서를 복구한다** — 구현 후 확인 기준이 문서에 남게 한다
   - [x] `MANUAL_TASKS.md`: `1F 전시관`에 대해 “이벤트 부스 booth-sized”, “계단 존재”, “위치 유지 + 크기만 변경”을 확인하는 육안 항목을 추가한다.
   - [x] `MANUAL_TASKS.md`: `2F 전시관`에 대해 “상단 8부스 가로열”, “좌측 체험존 세로열”, “우측 세로축 3개”를 확인하는 육안 항목을 추가한다.
   - [x] `docs/plan/2026-04-17_fix-coupang-map-layout-regressions-after-section-split.md`: 구현 검증 순서를 “`npm run check` 실행 후 브라우저에서 `MANUAL_TASKS.md` 확인” 순으로 명시하고 `package.json`의 기존 `check` 스크립트를 그대로 재사용한다고 적는다.

---

*상태: 구현완료 | 진행률: 48/48 (100%)*
