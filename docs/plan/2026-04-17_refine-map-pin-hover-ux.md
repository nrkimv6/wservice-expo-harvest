# refine: map pin hover UX

> 작성일시: 2026-04-17 14:47
> 기준커밋: 3ed884e
> 대상 프로젝트: expo-harvest
> 상태: 초안
> 진행률: 0/9 (0%)
> 요약: `ExhibitionMap`의 상단 `Hover Booth` 패널은 지도 탐색 중 시선을 핀에서 떼게 만들고, 모바일에서는 hover 자체가 약해서 효용이 낮다. 지도에서는 핀 가까운 즉시 피드백을 유지하고, 상세 정보는 기존 바텀 시트에 맡기는 방향으로 상호작용 계약을 다시 정리한다.

---

## 개요

현재 미커밋 변경은 [`src/lib/components/ExhibitionMap.svelte`](D:/work/project/service/wtools/expo-harvest/src/lib/components/ExhibitionMap.svelte)에서 기존 핀 하단 툴팁을 제거하고 상단 `Hover Booth` 패널을 추가하는 방향이다. 하지만 이 구조는 지도 탐색의 핵심인 "핀 근처에서 즉시 문맥 확인"을 약하게 만들고, 모바일 탭 UI에서는 고정 패널이 공간만 차지할 가능성이 크다. 이번 계획의 목표는 데스크톱에서는 핀 인접 툴팁을 유지하고, 모바일에서는 기존 탭-상세시트 흐름을 그대로 살리는 쪽으로 지도를 정리하는 것이다.

## 기술적 고려사항

- 현재 선택 상태와 상세 정보 노출은 [`src/routes/+page.svelte`](D:/work/project/service/wtools/expo-harvest/src/routes/+page.svelte) 및 [`src/lib/components/BoothDetailSheet.svelte`](D:/work/project/service/wtools/expo-harvest/src/lib/components/BoothDetailSheet.svelte)에 이미 존재하므로, 지도 컴포넌트가 별도 고정 요약 패널까지 책임질 필요는 작다.
- hover는 포인터 기반 디바이스에서만 강한 상호작용이므로, 모바일에서 필수 정보 전달을 hover에 의존하면 안 된다.
- 키보드 접근성은 유지해야 하므로, hover만 복원하는 것이 아니라 focus 시점에도 같은 문맥 정보가 노출되도록 맞춰야 한다.

---

## TODO

### Phase 1: 지도 핀 상호작용 계약을 다시 고정한다

1. - [ ] **지도에서 보여줄 정보의 역할을 `hover`와 `select`로 분리한다**
   - [ ] `src/lib/components/ExhibitionMap.svelte`: 상단 `Hover Booth` 패널과 `hoveredItemId` 상태가 실제로 해결하려던 문제를 정리하고, 지도 자체 책임을 "근접 문맥 안내"로 한정한다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: 핀 `hover/focus`는 짧은 문맥 정보, 핀 `click/tap`은 기존 상세 시트 오픈이라는 계약으로 되돌릴 구현 기준을 적는다.

### Phase 2: 핀 근처 즉시 피드백을 복구한다

2. - [ ] **핀 가까운 툴팁을 다시 붙여 시선 이동을 줄인다**
   - [ ] `src/lib/components/ExhibitionMap.svelte`: 각 핀 하단의 툴팁 블록을 복구하되, 브랜드명·선착순 이벤트·위치만 짧게 보이는 구조로 유지한다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: 현재 남아 있는 `Hover Booth` 패널과 파생 상태, 불필요한 클래스/이벤트를 제거하거나 축소해 컴포넌트 복잡도를 낮춘다.

3. - [ ] **키보드 포커스에도 동일한 문맥 피드백을 맞춘다**
   - [ ] `src/lib/components/ExhibitionMap.svelte`: 마우스 hover뿐 아니라 `focus-visible` 또는 포커스 상태에서도 같은 툴팁이 보이도록 접근성 동작을 맞춘다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: `aria-label`과 툴팁 내용이 서로 충돌하지 않는지 점검하고, 중복 문구가 심하면 한쪽을 간결화한다.

### Phase 3: 모바일 회귀와 정적 검증을 확인한다

4. - [ ] **모바일에서는 탭-상세시트 흐름이 흔들리지 않게 유지한다**
   - [ ] `src/routes/+page.svelte`, `src/lib/components/ExhibitionMap.svelte`: 모바일에서 핀 탭 시 기존처럼 `selectItem()`을 통해 상세 시트가 열리고, hover 전용 패널 흔적이 남지 않도록 확인한다.
   - [ ] `src/lib/components/BoothDetailSheet.svelte`, `src/lib/components/ExhibitionMap.svelte`: 지도에서 생략한 상세 정보가 바텀 시트에서 충분히 이어지는지 확인하고, 정보 공백이 있으면 지도보다 시트 쪽 보강을 우선 검토한다.

5. - [ ] **정적 검증으로 이벤트/타입 회귀를 막는다**
   - [ ] `package.json`, `src/lib/components/ExhibitionMap.svelte`: `npm run check`를 실행해 Svelte 경고, 타입 오류, 이벤트 핸들러 회귀가 없는지 확인한다.

---

*상태: 초안 | 진행률: 0/9 (0%)*
