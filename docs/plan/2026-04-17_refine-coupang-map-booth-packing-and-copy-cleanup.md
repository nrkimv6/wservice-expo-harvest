# refine: coupang map booth packing and copy cleanup

> 작성일시: 2026-04-17 23:15
> 기준커밋: 61d3d82
> 대상 프로젝트: expo-harvest
> 상태: 초안
> 진행률: 0/80 (0%)
> 요약: 쿠팡 메가뷰티쇼 지도는 section split 회귀를 복구한 뒤에도 여백이 많은 박스, 벽에서 뜬 배치, 긴 안내 문구가 남아 있다. 이번 후속 변경은 1F/2F/외부 수령존의 부스를 벽과 행 기준으로 다시 붙이고, 표기와 타이포를 짧고 조밀하게 정리해 지도 자체가 표처럼 읽히도록 만드는 데 목적이 있다.

---

## 개요

직전 회귀 수정은 section split 이후 무너진 형상과 scale을 복구하는 데 초점이 있었고, 이번 요청은 그 위에서 **배치 밀도**, **사용자 표기**, **문구 절제**, **텍스트 충전도**를 다시 다듬는 후속 정리다. 따라서 이번 plan은 기존 `src/lib/data/lootItems.ts`의 booth/eventZone/stairs 계약과 `src/lib/components/ExhibitionMap.svelte`의 렌더 구조를 유지한 채, 좌표축과 카피만 요청 범위 안에서 다시 맞추는 작업으로 한정한다.

## 기술적 고려사항

- 현재 지도 데이터의 id와 사용자 표기가 완전히 일치하지 않는다. 예를 들어 `cmbs-2026-mediheal`, `cmbs-2026-ariul`, `쿠팡 뉴존 체험존`, `뉴존 선물 수령존`, `파페치 / TW 홍보 부스` 같은 기존 키는 유지하고, 표시 문구만 요청 범위에서 조정해야 한다.
- "같은 행에 적은 열 부스는 여백 없이 붙인다"는 요구는 단순 spacing 감소가 아니라, 같은 row/column에 속한 박스들이 서로 맞닿아 표 셀처럼 읽히게 좌표와 폭/높이를 함께 조정해야 한다는 뜻이다.
- `decorRect`는 `hall-1f` stair gap의 파란 가벽 역할이므로, 삭제 시 다른 `stairs` overlay와 `viewBox`는 유지되는지 함께 확인해야 한다.
- 부스 내부 공백 축소는 전역 폰트 크기만 키우면 끝나지 않는다. `mapLabelLines`, `mapLabelFontSize`, `getLabelFontSize()`, multi-line anchor/line-height가 함께 움직여야 긴 브랜드명과 이벤트명이 박스를 넘치지 않는다.
- 지도 내부 긴 설명 문구 제거 요청은 현재 `ExhibitionMap.svelte`의 section header 설명, coarse-pointer 선택 안내, hover/empty-state helper copy 양쪽에 걸쳐 있다. 단순 삭제 후 빈 자리가 어색하지 않게 짧은 상태 문구만 남겨야 한다.
- 저장소 루트에 `AGENTS.md`가 아직 없으므로, "지도 영역 안 긴 문장 금지" 규칙은 기존 문서 수정이 아니라 새 파일 생성으로 다뤄야 한다.
- `src/routes/+page.svelte`는 `selectedExhibition.venue`와 전시회 목록 `exhibition.venue`를 그대로 렌더한다. 따라서 section 탭 라벨 변경과 별개로 `lootItems.ts`의 `venue` 문자열도 함께 갱신해야 홈/전시회 목록 표기가 어긋나지 않는다.
- 사용자 요구에는 "2층 우측 세로로 1열 3부스"라고 쓰였지만 실제 열거 항목은 `계단 / 인생네컷 포토존 / 포렌코스 / 파페치 TW 홍보부스` 4개다. 이번 plan은 이를 "계단 + 3개 부스/이벤트가 한 vertical lane을 공유"하는 요구로 해석한다.
- 사용자 요구에는 "1층 하단 가로열 4부스"라고 쓰였지만 실제 열거 항목은 4개 이벤트 박스와 `출구`다. 이번 plan은 이를 "4개 booth-sized event zone + 하단 출구 arrow"로 해석한다.
- `ExhibitionMap.svelte`는 overview와 single-section 렌더 경로에 booth/eventZone SVG 블록이 중복되어 있다. 타이포와 helper copy 보정은 두 경로를 함께 수정 대상으로 잡지 않으면 같은 버그가 재발한다.
- `git diff --name-only 61d3d82..main` 기준 현재 코드 드리프트는 없고 문서 파일만 바뀌었다. 따라서 구현 기준은 지금 읽은 `lootItems.ts`, `ExhibitionMap.svelte`, `+page.svelte`, `MANUAL_TASKS.md`, `package.json` 상태로 고정해도 된다.
- `tests/` 디렉터리가 없어 자동 검증은 `npm run check`, `npm run build`가 전부다. 배치/타이포 품질은 결국 브라우저 육안 확인을 `MANUAL_TASKS.md`에 남겨야 한다.

---

## TODO

### Phase 1: 범위와 전파 경로를 다시 고정한다 (10 tasks)

1. - [ ] **표기 변경이 퍼지는 surface를 코드 기준으로 고정한다** — section 탭만 바꾸고 다른 화면을 놓치지 않게 한다
   - [ ] `src/lib/data/lootItems.ts`: `coupangMegaBeautyShow2026MapSections`의 `hall-1f`, `hall-2f`, `beauty-box-pickup` `label` 값을 `1F`, `2F`, `뷰티박스 수령존`으로 바꿀 지점을 확정한다.
   - [ ] `src/lib/data/lootItems.ts`: `venue` 문자열을 `1F / 2F / 뷰티박스 수령존` 기준으로 축약하고, 기존 괄호 표기를 제거하는 변경 지점을 확정한다.
   - [ ] `src/lib/data/lootItems.ts`: `description`과 `mapNote` 중 새 짧은 표기에 맞춰 같이 줄일 필드와 그대로 둘 필드를 분리해 기록한다.
   - [ ] `src/routes/+page.svelte`: home 카드와 전시회 선택 목록에서 `exhibition.venue`가 노출되는 두 블록을 전파 확인 대상으로 묶는다.

2. - [ ] **사용자 요구와 현재 데이터 키 차이를 구현 단위로 매핑한다** — id rename 없이 표시문구만 조정하게 만든다
   - [ ] `src/lib/data/lootItems.ts`: `cmbs-2026-mediheal`이 사용자 요구의 `메디필`이 아니라 현재 코드상 `메디힐`이라는 점을 기준 표기로 기록한다.
   - [ ] `src/lib/data/lootItems.ts`: `cmbs-2026-ariul`이 사용자 요구의 `아리엘`이 아니라 현재 코드상 `아리얼`이라는 점을 기준 표기로 기록한다.
   - [ ] `src/lib/data/lootItems.ts`: `쿠팡 뉴존 체험존`, `뉴존 선물 수령존`, `파페치 / TW 홍보 부스`가 사용자 문장과 다르더라도 기존 label key는 유지하고 표시문구만 조정한다는 원칙을 적는다.
   - [ ] `AGENTS.md` (new file): 루트에 새 파일을 만들고 "지도 UI 안에는 장문 사용법/설명문을 넣지 않는다"는 규칙 추가를 이번 구현 범위에 포함한다고 기록한다.

### Phase 2: 1F 브랜드축과 하단 동선을 초원자 단위로 다시 붙인다 (20 tasks)

3. - [ ] **1F 좌측 벽 세로열 3부스를 무간격 column으로 맞춘다** — 좌측 브랜드 축을 표 셀처럼 복원한다
   - [ ] `src/lib/data/lootItems.ts`: `COUPANG_MEGA_BEAUTY_BOOTH_LAYOUTS['cmbs-2026-romand']`의 `renderX/renderY`를 좌측 벽 세로열 최상단 anchor에 맞춘다.
   - [ ] `src/lib/data/lootItems.ts`: `COUPANG_MEGA_BEAUTY_BOOTH_LAYOUTS['cmbs-2026-dewytree']`의 `renderX/renderY`를 같은 좌측 column 중단 anchor에 맞춘다.
   - [ ] `src/lib/data/lootItems.ts`: `COUPANG_MEGA_BEAUTY_BOOTH_LAYOUTS['cmbs-2026-naturerepublic']`의 `renderX/renderY`를 같은 좌측 column 하단 anchor에 맞춘다.
   - [ ] `src/lib/data/lootItems.ts`: 좌측 3부스가 세로 gap 없이 맞닿는다는 계약을 `COUPANG_MEGA_BEAUTY_BOOTH_LAYOUTS` 인접 주석이나 assertion 대상에 추가한다.

4. - [ ] **1F 중앙 가로열 4부스를 한 줄로 내린다** — 중앙 브랜드 row를 현재보다 아래에서 재정렬한다
   - [ ] `src/lib/data/lootItems.ts`: `COUPANG_MEGA_BEAUTY_BOOTH_LAYOUTS['cmbs-2026-aestura']`의 `renderX/renderY`를 1F 중앙 row 시작점으로 내린다.
   - [ ] `src/lib/data/lootItems.ts`: `COUPANG_MEGA_BEAUTY_BOOTH_LAYOUTS['cmbs-2026-banilaco']`의 `renderX/renderY`를 같은 중앙 row 두 번째 칸에 맞춘다.
   - [ ] `src/lib/data/lootItems.ts`: `COUPANG_MEGA_BEAUTY_BOOTH_LAYOUTS['cmbs-2026-drg']`의 `renderX/renderY`를 같은 중앙 row 세 번째 칸에 맞춘다.
   - [ ] `src/lib/data/lootItems.ts`: `COUPANG_MEGA_BEAUTY_BOOTH_LAYOUTS['cmbs-2026-ahc']`의 `renderX/renderY`를 같은 중앙 row 네 번째 칸에 맞추고 모든 칸의 가로 gap을 0으로 맞춘다.

5. - [ ] **1F 우측 벽 세로열 3부스를 무간격 column으로 맞춘다** — 우측 브랜드 축을 벽 기준선에 붙인다
   - [ ] `src/lib/data/lootItems.ts`: `COUPANG_MEGA_BEAUTY_BOOTH_LAYOUTS['cmbs-2026-thefaceshop']`의 `renderX/renderY`를 우측 벽 세로열 최상단 anchor에 맞춘다.
   - [ ] `src/lib/data/lootItems.ts`: `COUPANG_MEGA_BEAUTY_BOOTH_LAYOUTS['cmbs-2026-espoir']`의 `renderX/renderY`를 같은 우측 column 중단 anchor에 맞춘다.
   - [ ] `src/lib/data/lootItems.ts`: `COUPANG_MEGA_BEAUTY_BOOTH_LAYOUTS['cmbs-2026-tonymoly']`의 `renderX/renderY`를 같은 우측 column 하단 anchor에 맞춘다.
   - [ ] `src/lib/data/lootItems.ts`: 우측 3부스가 벽과 뜨지 않고 서로 맞닿는다는 계약을 주석 또는 assertion 대상으로 추가한다.

6. - [ ] **1F 중앙 체험존과 하단 event row를 다시 맞춘다** — 브랜드축 아래 동선을 요청 위치에 고정한다
   - [ ] `src/lib/data/lootItems.ts`: `COUPANG_MEGA_BEAUTY_OVERLAYS`의 `쿠팡 어워즈 체험존` center 좌표를 중앙 브랜드 row 아랫줄 정중앙으로 옮긴다.
   - [ ] `src/lib/data/lootItems.ts`: `피부측정 이벤트` overlay center 좌표를 1F 하단 row 첫 칸 anchor에 맞춘다.
   - [ ] `src/lib/data/lootItems.ts`: `쿠팡 뉴존 체험존`과 `뷰티 디바이스 체험존` overlay center 좌표를 같은 하단 row 내부 칸 순서에 맞춘다.
   - [ ] `src/lib/data/lootItems.ts`: `뉴존 선물 수령존` overlay center 좌표와 `hall-1f` `OUT` arrow 좌표를 하단 row 마지막 칸과 출구 끝점 기준으로 다시 맞춘다.

### Phase 3: 외부 수령존과 2F 벽 부착 레이아웃을 lane 단위로 고정한다 (20 tasks)

7. - [ ] **외부 뷰티박스 수령존 입출구 배치를 다시 고정한다** — 수령존 아래 입구, 좌하단 출구 규칙을 복원한다
   - [ ] `src/lib/data/lootItems.ts`: `beauty-box-pickup`의 `뷰티박스 수령존` event zone 중심은 유지할지 미세 조정할지 current `viewBox` 기준으로 확정한다.
   - [ ] `src/lib/data/lootItems.ts`: `beauty-box-pickup`의 `IN` arrow 좌표를 수령존 바로 아래로 재배치한다.
   - [ ] `src/lib/data/lootItems.ts`: `beauty-box-pickup`의 `OUT` arrow 좌표를 section 좌하단으로 재배치한다.
   - [ ] `src/lib/data/lootItems.ts`: `hall-1f` stair gap의 `decorRect` entry를 삭제하고, 상하단 `stairs` 2개는 그대로 유지되게 정리한다.

8. - [ ] **2F 상단 벽 가로 1열 8부스를 무간격 top row로 맞춘다** — 상단 브랜드 대열을 한 줄로 복원한다
   - [ ] `src/lib/data/lootItems.ts`: `cmbs-2026-avene`, `cmbs-2026-etude`, `cmbs-2026-easydew`, `cmbs-2026-mediheal`의 `renderY`를 동일 top-row 기준으로 맞추고 좌→우 순서를 다시 고정한다.
   - [ ] `src/lib/data/lootItems.ts`: `cmbs-2026-innisfree`, `cmbs-2026-physiogel`, `cmbs-2026-age20s`, `cmbs-2026-ariul`의 `renderY`를 같은 top-row 기준으로 맞추고 좌→우 순서를 다시 고정한다.
   - [ ] `src/lib/data/lootItems.ts`: 상단 8부스 전체가 가로 gap 없이 맞닿도록 `renderX` 간격을 다시 계산한다.
   - [ ] `src/lib/data/lootItems.ts`: `assertCoupangMegaBeautyLayoutContract()`에 top-row 동일 `renderY`뿐 아니라 row packing 유지 조건을 추가한다.

9. - [ ] **2F 좌측 벽 가로 1열 3부스를 요청 순서대로 붙인다** — story/wow/hairshow lane을 하나의 수평 축으로 맞춘다
   - [ ] `src/lib/data/lootItems.ts`: `쿠팡 메가뷰티쇼 스토리` overlay center 좌표를 2F 좌측 lane 첫 칸 anchor에 맞춘다.
   - [ ] `src/lib/data/lootItems.ts`: `쿠팡 와우회원 인증존` overlay center 좌표를 같은 lane 두 번째 칸 anchor에 맞춘다.
   - [ ] `src/lib/data/lootItems.ts`: `헤어쇼 이벤트(4/18)` overlay center 좌표를 같은 lane 세 번째 칸 anchor에 맞춘다.
   - [ ] `src/lib/data/lootItems.ts`: 좌측 3칸이 같은 `renderY`와 무간격 `centerX` spacing을 공유한다는 계약을 주석 또는 assertion 대상으로 추가한다.

10. - [ ] **2F 우측 벽 vertical lane을 계단 포함 4블록으로 고정한다** — stairs와 포토/부스/홍보존이 한 column을 공유하게 만든다
   - [ ] `src/lib/data/lootItems.ts`: `hall-2f` 우측 `stairs` overlay가 있으면 그 `x/y/height`를 column 최상단 기준으로 맞추고, 없으면 새 `stairs` entry 추가 위치를 명시한다.
   - [ ] `src/lib/data/lootItems.ts`: `인생네컷 포토존` overlay center 좌표를 같은 우측 lane 두 번째 블록 anchor에 맞춘다.
   - [ ] `src/lib/data/lootItems.ts`: `COUPANG_MEGA_BEAUTY_BOOTH_LAYOUTS['cmbs-2026-forencos']`의 `renderX/renderY`를 같은 우측 lane 세 번째 블록 anchor에 맞춘다.
   - [ ] `src/lib/data/lootItems.ts`: `파페치 / TW 홍보 부스` overlay center 좌표를 같은 우측 lane 최하단 anchor에 맞추고 column 공통 `x`를 contract에 추가한다.

### Phase 4: 표기와 타이포를 중복 렌더 경로까지 포함해 줄인다 (20 tasks)

11. - [ ] **지도 표기와 헤더 문구를 요청된 짧은 형태로 줄인다** — 탭, 제목, 전시회 표기가 같은 톤을 갖게 한다
   - [ ] `src/lib/components/ExhibitionMap.svelte`: 상단 `전시 구역별 부스 보기` 제목을 `부스보기`로 바꾼다.
   - [ ] `src/lib/data/lootItems.ts`: `venue`와 `description`의 구역명을 `1F / 2F / 뷰티박스 수령존` 표기로 정리한다.
   - [ ] `src/lib/data/lootItems.ts`: `mapNote`를 유지한다면 한 줄 short note로 줄이고, 제거한다면 빈자리 없는 대체 문구 기준을 적는다.
   - [ ] `src/routes/+page.svelte`: `exhibition.venue`가 짧아진 뒤 home 카드와 전시회 목록 줄바꿈이 어색하지 않은지 확인 대상으로 남긴다.

12. - [ ] **장문 사용법/hover 문구를 짧은 상태 문구로 교체한다** — 지도 내부 정보 밀도를 올린다
   - [ ] `src/lib/components/ExhibitionMap.svelte`: coarse-pointer `focusItem` 블록의 `부스를 다시 탭하면... 핀치 확대...` 장문 안내를 제거하거나 한 문장으로 줄인다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: empty-state fine-pointer 문구 `브랜드 박스에 커서를 올리면...` 두 버전을 삭제하고 짧은 상태 문구로 바꾼다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: active section empty-state 문구 `이 구역은 브랜드 부스보다...`가 남더라도 두 줄 이하 short helper로 정리한다.
   - [ ] `AGENTS.md` (new file): 지도 UI에서 장문 사용법/hover 설명을 금지하는 규칙과 짧은 상태 문구 우선 원칙을 추가한다.

13. - [ ] **booth 타이포 기본값을 더 크게 잡는다** — 박스 내부 공백보다 글자 점유율을 우선한다
   - [ ] `src/lib/components/ExhibitionMap.svelte`: `getLabelFontSize(item)`의 기본 fallback 값을 현재 `11.5`보다 크게 조정한다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: booth `<text>`의 `y` 기준점 계산을 multi-line 기준으로 다시 조정해 상단 여백을 줄인다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: booth `<tspan>`의 `dy` line spacing을 현재보다 조밀하게 줄여 박스 내부를 더 채우게 한다.
   - [ ] `src/lib/data/lootItems.ts`: 폰트 상향 후에도 예외가 필요한 브랜드만 `mapLabelFontSize`로 다시 조정한다.

14. - [ ] **event zone 타이포와 라벨 분할도 같이 맞춘다** — booth와 event box의 조밀도가 따로 놀지 않게 한다
   - [ ] `src/lib/components/ExhibitionMap.svelte`: `getOverlayLabelLines(label)`가 `쿠팡 뉴존 체험존`, `뉴존 선물 수령존`, `파페치 / TW 홍보 부스`를 박스 안에 맞게 나누는지 기준을 다시 정한다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: `getEventZoneFontSize(overlay)`의 booth-sized default를 상향 조정한다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: `getEventZoneTextOffset(overlay, lineCount)`를 새 폰트 기준으로 다시 맞춰 상하 여백을 줄인다.
   - [ ] `src/lib/data/lootItems.ts`: 필요한 event zone만 `fontSize` 예외값을 다시 지정한다.

### Phase 5: 회귀 방지 계약과 검증 순서를 문서로 남긴다 (10 tasks)

15. - [ ] **좌표 회귀를 막는 contract assertion을 넓힌다** — 이번 후속 배치가 다시 흐트러지지 않게 한다
   - [ ] `src/lib/data/lootItems.ts`: `assertCoupangMegaBeautyLayoutContract()`에 1F 좌측 세로열 동일 `renderX` 검증을 추가한다.
   - [ ] `src/lib/data/lootItems.ts`: `assertCoupangMegaBeautyLayoutContract()`에 1F 중앙 가로열 동일 `renderY` 검증을 추가한다.
   - [ ] `src/lib/data/lootItems.ts`: `assertCoupangMegaBeautyLayoutContract()`에 1F 우측 세로열 동일 `renderX` 검증을 추가한다.
   - [ ] `src/lib/data/lootItems.ts`: `assertCoupangMegaBeautyLayoutContract()`에 2F 좌측 lane과 우측 lane 공통 axis 검증을 추가한다.

16. - [ ] **정적 검증과 육안 검증 순서를 구현용 문서에 남긴다** — 레이아웃 수정 후 확인 루틴을 고정한다
   - [ ] `MANUAL_TASKS.md`: 1F 좌측/중앙/우측 브랜드축이 서로 무간격으로 붙는지 확인하는 항목을 추가한다.
   - [ ] `MANUAL_TASKS.md`: 1F 중앙 `쿠팡 어워즈 체험존`, 하단 4개 event box, `출구`, 외부 수령존 `입구/출구` 위치를 확인하는 항목을 추가한다.
   - [ ] `MANUAL_TASKS.md`: 2F 상단 8부스, 좌측 3칸, 우측 4블록 vertical lane, 장문 안내 제거, 부스 글자 점유율 증가를 확인하는 항목을 추가한다.
   - [ ] `docs/plan/2026-04-17_refine-coupang-map-booth-packing-and-copy-cleanup.md`: 구현 검증 순서를 `npm run check` → `npm run build` → 브라우저 육안 검증으로 명시한다.

---

*상태: 초안 | 진행률: 0/80 (0%)*
