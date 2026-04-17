# fix: coupang map layout regressions after section split

> 작성일시: 2026-04-17 20:15
> 기준커밋: 1bb1185
> 대상 프로젝트: expo-harvest
> 상태: 초안
> 진행률: 0/33 (0%)
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

---

## TODO

### Phase 1: 원래 형상 기준과 금지선을 문서화한다

1. - [ ] **배치 기준선을 `13f12bd`로 고정한다** — 이번 수정에서 참조할 좌표 원본을 명시
   - [ ] `src/lib/data/lootItems.ts`: `13f12bd` 기준 `1F/2F` booth, `eventZone`, `stairs`, `decorRect` 좌표를 다시 대조해 “형상 유지 대상” 목록을 추출한다.
   - [ ] `docs/plan/2026-04-17_fix-coupang-map-layout-regressions-after-section-split.md`: 사용자 요구와 다른 임의 재배치 금지 원칙을 기술적 고려사항과 TODO 설명에 명시한다.

2. - [ ] **이번 수정에서 허용되는 변경과 금지되는 변경을 분리한다** — 크기 보정만 허용하고 대열 붕괴는 금지
   - [ ] `src/lib/data/lootItems.ts`: `2F` 상단 8부스 가로 1열, 하단 체험존 좌측 세로 1열, 우측 `인생네컷/포렌코즈/파페치` 세로축을 고정 불변 규칙으로 상수 인접 설명이나 helper 이름에 남긴다.
   - [ ] `MANUAL_TASKS.md`: “배치가 원본 형상에서 어긋나지 않았는지”를 보는 육안 기준을 별도 항목으로 추가할 계획을 반영한다.

### Phase 2: 이벤트 부스와 일반 부스의 크기 규격을 다시 맞춘다

3. - [ ] **이벤트 부스도 공통 부스 크기 규격에 포함한다** — 요청 누락분을 실제로 반영
   - [ ] `src/lib/data/lootItems.ts`: `체험존`, `인증존`, `홍보 부스`, `뷰티박스 수령존` 등 booth-sized `eventZone` 목록을 명시하고 공통 `width/height` 기준 또는 preset helper를 정의한다.
   - [ ] `src/lib/data/lootItems.ts`: `1F`, `2F`, `뷰티박스 수령존` section에서 booth-sized overlay가 같은 가로세로 비율과 같은 절대 크기를 쓰도록 좌표를 재계산한다.

4. - [ ] **section별 체감 크기 차이를 줄인다** — 한 개만 있는 section이 더 크게 보이지 않게 조정
   - [ ] `src/lib/data/lootItems.ts`: `coupangMegaBeautyShow2026MapSections`의 `viewBox`를 다시 계산해 `뷰티박스 수령존`만 과도하게 확대되어 보이지 않도록 공통 기준 폭/높이 대비 스케일 상한을 반영한다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: `getDefaultMapSectionScale()`와 booth-sized `eventZone` 타이포/패딩 규칙을 함께 점검해, 작은 section 자동 확대와 overlay density가 같은 회귀를 다시 만들지 않게 한다.

### Phase R: 재발 경로를 닫는다

5. - [ ] **레이아웃 회귀가 다시 생길 수 있는 모든 경로를 열거한다** — `fix` 계획 필수 분석
   - [ ] `src/lib/data/lootItems.ts`, `src/lib/components/ExhibitionMap.svelte`: `renderWidth/renderHeight`, `eventZone`, `stairs`, `viewBox`, `getDefaultMapSectionScale()` 참조 경로를 grep으로 다시 모아 “데이터 기준 회귀”와 “렌더 기준 회귀”를 분리한다.
   - [ ] `docs/plan/2026-04-17_fix-coupang-map-layout-regressions-after-section-split.md`: 각 경로별로 방어 대상과 제외 대상(예: overview zoom 계획과 분리)을 표나 bullet로 남긴다.

6. - [ ] **중복된 크기·배율 규칙을 단일 경로로 모은다** — 같은 실수를 다시 만들지 않게 구조를 정리
   - [ ] `src/lib/data/lootItems.ts`: booth와 booth-sized overlay 크기 규칙이 여러 배열에 중복돼 있으면 공통 상수/helper로 수렴시킬 계획을 명시한다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: section별 확대나 overlay typography가 별도 예외 분기로 남아 있으면 공통 helper 또는 명시적 예외 목록으로 좁히는 작업을 TODO에 포함한다.

### Phase 3: 2F와 1F의 원래 배치를 복원한다

7. - [ ] **2F 브랜드 8부스 가로 대열을 복원한다** — 여러 열처럼 보이는 붕괴를 되돌림
   - [ ] `src/lib/data/lootItems.ts`: `아벤느~아리얼` 8개 브랜드의 `renderX/renderY`를 `13f12bd` 기준 가로 1열 구조로 복원한다.
   - [ ] `src/lib/data/lootItems.ts`: `포렌코즈`만 우측 세로열 기준점으로 유지하되, 상단 8부스 열과 섞이지 않도록 축 분리를 명시한다.

8. - [ ] **2F 하단 체험존 좌측 세로 1열을 복원한다** — 삼각형 배치를 원래 세로 스택으로 되돌림
   - [ ] `src/lib/data/lootItems.ts`: `헤어쇼 이벤트`, `쿠팡 메가뷰티쇼 스토리`, `쿠팡 와우회원 인증존`의 `eventZone` 좌표를 좌측 세로 1열 기준으로 복원한다.
   - [ ] `src/lib/data/lootItems.ts`: 우측 `인생네컷 포토존`, `포렌코즈`, `파페치 / TW 홍보 부스` 3개만 같은 세로축에 유지하고, 좌측 체험존 열과 섞이지 않게 간격을 다시 분리한다.

9. - [ ] **1F 이벤트존과 수령존의 위치는 유지하되 크기만 맞춘다** — 사용자가 허용한 범위만 수정
   - [ ] `src/lib/data/lootItems.ts`: `쿠팡 어워즈 체험존`, `피부측정 이벤트`, `뷰티 디바이스 체험존`, `쿠팡 뉴존 체험존`, `뉴존 선물 수령존`의 위치 앵커는 유지하고 크기만 booth 규격에 맞춘다.
   - [ ] `src/lib/data/lootItems.ts`: `뷰티박스 수령존` section의 수령존 박스도 같은 booth 기준으로 맞추되, section 내부 중앙 배치만 유지하고 임의 확대는 제거한다.

### Phase 4: 누락 오버레이와 검증 기준을 복구한다

10. - [ ] **계단 오버레이를 원래 section에 복원한다** — 데이터 누락 회귀를 되돌림
   - [ ] `src/lib/data/lootItems.ts`: `13f12bd`에 있던 `1F` 계단 2개와 필요한 보조 `decorRect`가 `hall-1f` overlays에 다시 포함되도록 복원한다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: `stairs` overlay가 section 분리 후에도 정상 렌더되는지, viewBox와 기본 배율 변경으로 잘리지 않는지 확인 기준을 계획에 포함한다.

11. - [ ] **회귀를 막는 수동 검증 항목을 보강한다** — 이번 오해가 다시 나오지 않게 기준을 남김
   - [ ] `MANUAL_TASKS.md`: `1F/2F/뷰티박스 수령존` 각각에서 “부스 크기 균일”, “이벤트 부스도 booth-sized”, “2F 8부스 가로열”, “하단 체험존 좌측 세로열”, “계단 존재”, “뷰티박스 section 과대 확대 없음”을 확인하는 항목을 추가한다.
   - [ ] `package.json`, `src/lib/data/lootItems.ts`, `src/lib/components/ExhibitionMap.svelte`: 구현 후 `npm run check`와 브라우저 육안 검증을 모두 다시 수행하는 검증 단계를 계획에 포함한다.

---

*상태: 초안 | 진행률: 0/33 (0%)*
