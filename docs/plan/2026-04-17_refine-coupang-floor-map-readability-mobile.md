# refine: coupang floor map readability and mobile flow

> 작성일시: 2026-04-17 16:59
> 기준커밋: 419b177
> 대상 프로젝트: expo-harvest
> 상태: 초안
> 진행률: 0/20 (0%)
> 요약: 현재 쿠팡 메가뷰티쇼 지도는 원본 SVG 좌표를 충실히 옮겼지만, 실제 현장 탐색 기준으로는 부스가 작고 라벨이 약해 한눈에 들어오지 않는다. 이번 계획은 원본 좌표는 유지하되 화면 렌더 정책을 가독성 우선으로 재정의하고, hover 의존도를 줄인 모바일 터치 흐름까지 함께 정리하는 데 목적이 있다.

---

## 개요

현재 [`src/lib/components/ExhibitionMap.svelte`](D:/work/project/service/wtools/expo-harvest/src/lib/components/ExhibitionMap.svelte)는 층별 SVG를 `viewBox + w-full`로 그대로 축소 렌더하고, 브랜드 라벨은 `item.englishTitle ?? item.title`를 한 줄 `<text>`로 출력한다. 이 구조는 원본 도면 보존에는 유리하지만, 실제 사용자는 "지금 어느 부스가 어디 있는지"를 빠르게 읽어야 하므로 부스 크기, 라벨 선택 기준, 줄바꿈, 강조 우선순위가 더 중요하다.

모바일에서는 문제가 더 분명하다. 현재 앱 셸은 [`src/routes/+page.svelte`](D:/work/project/service/wtools/expo-harvest/src/routes/+page.svelte)의 `max-w-lg` 단일 컬럼이며 지도 탭 안에서도 hover 요약 패널이 남아 있어, 터치 환경에서 공간을 차지하지만 정보 전달력은 낮다. 또한 [`src/lib/components/LootFeed.svelte`](D:/work/project/service/wtools/expo-harvest/src/lib/components/LootFeed.svelte)와 상세 시트 흐름은 이미 잘 갖춰져 있으므로, 지도는 "탐색", 리스트는 "검색", 시트는 "상세" 역할을 더 명확히 나눌 필요가 있다.

이번 계획의 목표는 다음 네 가지다.

1. 원본 좌표 데이터와 화면용 렌더 규칙을 분리한다.
2. 단일 층에서 브랜드 부스가 더 크게, 더 균일하게 보이도록 렌더 정책을 바꾼다.
3. 짧은 한글명 우선, 필요 시 자동 줄바꿈되는 라벨 시스템을 도입한다.
4. 모바일에서는 hover 대신 탭, 선택 상태, 층 전환, 리스트 점프로 탐색 흐름을 완성한다.

## 기술적 고려사항

- [`src/lib/data/lootItems.ts`](D:/work/project/service/wtools/expo-harvest/src/lib/data/lootItems.ts)는 현재 `englishTitle`, `floorId`, `mapX`, `boxWidth`, `fontSize` 정도만 가지고 있어 "지도에 무엇을 어떻게 적을지"를 결정하는 표현 계층이 부족하다. `mapLabel`, `mapLabelLines`, `renderBoxPreset` 같은 화면용 메타가 필요하다.
- [`src/lib/components/ExhibitionMap.svelte`](D:/work/project/service/wtools/expo-harvest/src/lib/components/ExhibitionMap.svelte)는 hover/focus 이벤트와 상단 요약 패널을 함께 관리하고 있어, 데스크톱/모바일의 상호작용 차이를 분기하기 어렵다. `pointer fine`와 `pointer coarse` 기준으로 표시 정책을 나누는 편이 낫다.
- [`src/routes/+page.svelte`](D:/work/project/service/wtools/expo-harvest/src/routes/+page.svelte)는 `mapFloorOverride`와 `activeTab` 연동이 이미 있으므로, 모바일 quick jump나 "리스트에서 선택하면 해당 층으로 이동" 같은 흐름은 기존 상태를 확장해서 해결할 수 있다.
- [`src/lib/components/LootCard.svelte`](D:/work/project/service/wtools/expo-harvest/src/lib/components/LootCard.svelte)와 [`src/lib/components/BoothDetailSheet.svelte`](D:/work/project/service/wtools/expo-harvest/src/lib/components/BoothDetailSheet.svelte)는 층 배지와 상세 위치 문구를 이미 보여주므로, 모바일에서는 지도를 과하게 설명하지 말고 선택된 부스를 보조하는 형태가 적절하다.

## UX 방향

- 기본 진입은 계속 `1F`로 유지하되, 단일층에서는 지도를 지금보다 크게 보여준다. `전체` 뷰는 상세 탐색이 아니라 층 구조 훑기 용도로 유지한다.
- 확대/축소 버튼은 넣지 않는다. 대신 단일층과 전체뷰의 스케일 정책을 다르게 두고, 모바일에서는 카드 폭 자체를 적극 활용한다.
- 브랜드 부스는 동일한 3:4 비율의 화면용 박스로 정렬해 "정리된 지도"처럼 보이게 하고, 이벤트존/계단/화살표는 한 단계 더 연한 톤으로 내려 시선 분산을 줄인다.
- 지도 라벨은 "짧은 한글 우선, 아니면 영문, 필요 시 2줄" 규칙으로 통일한다.
- 모바일에서는 hover 패널보다 `선택된 부스 미니 요약`, `sticky 층 전환`, `리스트/검색에서 지도로 점프`가 더 중요하다.

---

## TODO

### Phase 1: 화면용 렌더 규칙을 데이터 모델로 분리한다

1. [ ] **지도 전용 라벨 정책을 별도 필드로 정리한다**
   - [ ] `src/lib/data/lootItems.ts`: `LootItem`에 `mapLabel?: string`, `mapLabelLines?: string[]`, `mapLabelFontSize?: number` 같은 화면용 필드를 추가하고, `englishTitle ?? title` 즉석 분기를 대체할 기준을 정의한다.
   - [ ] `src/lib/data/lootItems.ts`: 쿠팡 메가뷰티쇼 19개 브랜드에 대해 "짧은 한글명 우선, 예외는 영문 유지" 기준으로 `mapLabel` 초안을 채운다. 예: `롬앤`, `닥터지`, `에뛰드`, `Dr.G`, `AHC`.

2. [ ] **원본 좌표와 화면용 박스 정책을 분리한다**
   - [ ] `src/lib/data/lootItems.ts`: 기존 `mapX/mapY/boxWidth/boxHeight`는 원본 좌표로 유지하되, `renderBoxPreset` 또는 `renderWidth/renderHeight` 계층을 설계해 3:4 통일 박스를 지원한다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: 브랜드 박스는 화면용 비율 정책을 우선 적용하고, 이벤트존/계단/화살표는 원본 도면 좌표를 그대로 쓰는 렌더 경계를 문서화한다.

### Phase 2: 데스크톱 가독성 중심으로 지도 렌더를 재정렬한다

3. [ ] **층별 스케일 정책을 다시 정한다**
   - [ ] `src/lib/components/ExhibitionMap.svelte`: `1F` 또는 `2F` 단일층일 때는 현재보다 약 150% 크게 보이도록 컨테이너 폭, 내부 패딩, SVG 래퍼 스타일을 조정하고 `전체` 뷰는 축약된 overview로 유지한다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: 확대/축소 버튼은 추가하지 않고, 현재 층 토글만으로 충분히 읽히는지 기준을 정한다.

4. [ ] **부스 우선 시각 계층을 강하게 만든다**
   - [ ] `src/lib/components/ExhibitionMap.svelte`: 브랜드 부스를 3:4 렌더 박스, 큰 텍스트, 상태 배지 기준으로 재정렬하고 선택된 부스는 외곽선 또는 강조 배경으로 즉시 눈에 띄게 만든다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: 이벤트존, 계단, 입출구 화살표, 장식 rect는 더 연한 색상과 낮은 대비로 조정해 브랜드 탐색을 방해하지 않게 한다.

5. [ ] **라벨을 한 줄 텍스트에서 2줄 허용 구조로 바꾼다**
   - [ ] `src/lib/components/ExhibitionMap.svelte`: SVG `<text>`를 `tspan` 기반 다중 행 렌더로 바꿔 긴 브랜드명이 박스 안을 충분히 채우면서도 넘치지 않게 한다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`, `src/lib/data/lootItems.ts`: `NATURE REPUBLIC`, `THE FACE SHOP`, `FORENCOS` 같은 긴 이름과 `Dr.G`, `AHC` 같은 짧은 이름이 서로 다른 기준으로 자연스럽게 보이는지 예외 규칙을 정리한다.

### Phase 3: 모바일 터치 흐름을 별도 기준으로 설계한다

6. [ ] **hover 의존을 줄이고 터치 중심 피드백으로 바꾼다**
   - [ ] `src/lib/components/ExhibitionMap.svelte`: 모바일에서는 상단 `Hover Booth` 패널을 제거하거나 축소하고, 탭한 부스의 이름/층/상태만 짧게 보이는 선택 요약 영역으로 대체하는 안을 설계한다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: 포인터가 정밀한 환경에서는 hover/focus 요약을 유지하되, 터치 환경에서는 `click/tap -> 선택 강조 -> 상세 시트` 흐름이 우선되도록 상호작용 계약을 분리한다.

7. [ ] **모바일에서 층 전환과 부스 점프를 더 빠르게 만든다**
   - [ ] `src/lib/components/ExhibitionMap.svelte`: 층 토글 버튼을 지도 상단 고정 또는 스크롤 중 계속 보이는 sticky 컨트롤로 바꾸는 안을 검토한다.
   - [ ] `src/routes/+page.svelte`, `src/lib/components/LootFeed.svelte`: 리스트 검색 결과나 즐겨찾기에서 부스를 누르면 지도 탭으로 이동하면서 해당 층과 선택 상태가 즉시 보이는 흐름을 유지하고, 필요 시 "지도에서 보기" CTA를 더 명확히 드러낸다.

8. [ ] **모바일에서 지도를 보조할 대체 탐색 수단을 보강한다**
   - [ ] `src/lib/components/LootFeed.svelte`, `src/lib/components/LootCard.svelte`: 카드에 층 배지를 더 또렷하게 두고, 검색 결과 정렬에서 층/선착순/시간 기반 우선순위가 모바일 탐색에도 맞는지 다시 점검한다.
   - [ ] `src/lib/components/BoothDetailSheet.svelte`, `src/routes/+page.svelte`: 상세 시트 안에 현재 층으로 복귀하거나 지도 위치를 다시 확인하는 CTA가 필요한지 검토한다.

### Phase 4: 정적 검증과 모바일 수동 시나리오를 고정한다

9. [ ] **정적 검증으로 타입/레이아웃 회귀를 막는다**
   - [ ] `package.json`, `src/lib/components/ExhibitionMap.svelte`, `src/lib/data/lootItems.ts`: `npm run check`와 필요 시 `npm run build` 기준으로 새 라벨 필드와 SVG 렌더 변경이 타입 오류 없이 통과하는지 확인한다.

10. [ ] **모바일 우선 수동 시나리오를 검증 목록으로 남긴다**
   - [ ] `src/routes/+page.svelte`, `src/lib/components/ExhibitionMap.svelte`: 모바일 폭에서 기본 진입 시 `1F`가 크게 보이고, `전체` 뷰는 축약 overview로만 소비되는지 확인한다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`, `src/lib/components/BoothDetailSheet.svelte`: 모바일에서 부스를 탭하면 선택 강조와 상세 시트 열림이 자연스럽고, hover 전용 정보 공백이 없는지 확인한다.
   - [ ] `src/lib/components/LootFeed.svelte`, `src/routes/+page.svelte`: 리스트 검색 -> 부스 선택 -> 지도 탭 이동 -> 해당 층 노출 흐름이 한 손 사용 기준으로 빠르게 이어지는지 점검한다.

---

*상태: 초안 | 진행률: 0/20 (0%)*
