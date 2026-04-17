# refine: coupang floor map gesture usability

> 작성일시: 2026-04-17 18:31
> 기준커밋: f38947e
> 대상 프로젝트: expo-harvest
> 상태: 초안
> 진행률: 0/22 (0%)
> 요약: 현재 `ExhibitionMap`의 pinch/pan은 코드상 구현돼 있지만 확대 여유, pan 체감, tap 충돌 방지가 모두 보수적으로 잡혀 있어 모바일에서 거의 작동하지 않는 것처럼 느껴진다. 이번 계획은 제스처 체감을 실제 탐색 가능한 수준으로 끌어올리고, 이전 계획에서 제외했던 명시적 확대/축소 버튼을 별도 UX 보강 항목으로 재도입하는 데 목적이 있다.

---

## 개요

기존 [`docs/archive/2026-04-17_refine-coupang-floor-map-readability-mobile.md`](D:/work/project/service/wtools/expo-harvest/docs/archive/2026-04-17_refine-coupang-floor-map-readability-mobile.md)에서는 모바일 단일층 탐색을 위해 pinch-zoom과 drag pan을 넣되, 확대/축소 버튼은 넣지 않기로 결정했다. 하지만 실제 구현 상태를 보면 [`src/lib/components/ExhibitionMap.svelte`](D:/work/project/service/wtools/expo-harvest/src/lib/components/ExhibitionMap.svelte)에서 기본 배율과 최대 배율 사이 여유가 작고, pan clamp와 클릭 억제가 공격적으로 조율되지 않아 사용자가 드래그와 pinch를 해도 "거의 안 된다"는 체감이 생긴다. 이번 계획은 기존 지도 가독성 리팩터를 되돌리는 것이 아니라, 현 제스처 모델을 실제 모바일 사용성에 맞게 재튜닝하고 필요 시 명시적 zoom controls를 보강하는 후속 refinement다.

## 기술적 고려사항

- 현재 단일층 viewport는 `viewBox`를 동적으로 잘라 쓰는 구조라서, `DEFAULT_SINGLE_FLOOR_SCALE`, `MIN_SINGLE_FLOOR_SCALE`, `MAX_SINGLE_FLOOR_SCALE` 값 조정이 pan 가능 범위와 직접 연결된다.
- pan은 [`clampViewportCenter()`](D:/work/project/service/wtools/expo-harvest/src/lib/components/ExhibitionMap.svelte:221)에서 중앙점 기준으로 제한되므로, 제스처 체감 개선은 단순히 이벤트를 더 받는 문제가 아니라 viewport 모델과 선택 포커스 복원 규칙을 함께 봐야 한다.
- 현재 부스 클릭 억제는 시간 기반 `suppressPinClickUntil`만 사용하므로, 실제 이동량 기준 gesture intent 플래그로 바꾸지 않으면 pan 후 오탭이 계속 남을 수 있다.
- 지도 탭 재진입과 층 복귀는 [`src/routes/+page.svelte`](D:/work/project/service/wtools/expo-harvest/src/routes/+page.svelte)의 `selectItem()` 및 `mapFloorOverride` 흐름과 연결돼 있으므로, 확대/선택 상태 보강이 이 흐름을 깨지 않는지 같이 확인해야 한다.

---

## TODO

### Phase 1: 제스처 체감 문제를 상태 모델 기준으로 다시 정의한다

1. - [ ] **약한 zoom/pan 체감의 원인을 현재 viewport 모델 기준으로 고정한다**
   - [ ] `src/lib/components/ExhibitionMap.svelte`: `DEFAULT_SINGLE_FLOOR_SCALE`, `MIN_SINGLE_FLOOR_SCALE`, `MAX_SINGLE_FLOOR_SCALE`와 `getRenderedViewBox()`의 현재 관계를 정리하고, 왜 기본 상태에서 pinch headroom과 pan 여유가 작게 느껴지는지 코드 기준으로 메모한다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: `clampViewportCenter()`와 `focusViewportOnItem()`의 상호작용을 점검해, 선택 부스 포커스가 수동 pan/zoom 체감을 덮어쓰는 조건을 정리한다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: `suppressPinClickUntil` 기반 오탭 방지 방식이 느린 드래그 후 탭 오인식을 얼마나 남기는지 판단하고, 이동량 기반 intent로 교체할지 결정한다.

### Phase 2: zoom/pan 입력을 실제 탐색 가능한 수준으로 재튜닝한다

2. - [ ] **단일층 zoom 범위와 기본 배율을 다시 조율한다**
   - [ ] `src/lib/components/ExhibitionMap.svelte`: 단일층 기본 배율을 현재 1.55 고정값에서 재검토하고, 초기 가독성과 추가 확대 여유를 함께 만족하는 새 기본값과 최대값 범위를 정한다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: 휠 확대와 pinch 확대가 같은 scale clamp를 쓰더라도 모바일에서 체감이 둔하지 않도록 delta/ratio 반응을 조정할지 결정한다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: floor별 저장 viewport(`floorViewportStates`)를 유지하되, 사용자가 수동으로 조정한 zoom 상태를 선택 포커스나 floor 전환이 과하게 덮어쓰지 않도록 보정 규칙을 정한다.

3. - [ ] **pan과 booth tap 충돌을 이동량 기준으로 분리한다**
   - [ ] `src/lib/components/ExhibitionMap.svelte`: pointer down/move/up에서 실제 이동량을 누적해 drag intent와 tap intent를 분리하는 상태를 추가한다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: pan 직후 `onclick`을 시간으로만 막는 현재 방식 대신, 이번 제스처가 drag/pinch였는지 여부로 booth click 허용을 판단하도록 이벤트 흐름을 정리한다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: 두 손가락 pinch가 끝난 뒤 한 손가락 pan으로 자연스럽게 이어질 때 gesture 상태가 끊기지 않도록 `activePointers`, `dragGesture`, `pinchGesture` 전환 규칙을 다듬는다.

4. - [ ] **명시적 확대/축소 컨트롤을 새 UX 보강으로 추가한다**
   - [ ] `src/lib/components/ExhibitionMap.svelte`: 기존 계획에서 제외했던 확대/축소 버튼을 단일층 전용 UI로 다시 도입하고, `+`, `-`, `reset` 또는 동등한 2~3버튼 조합 중 어떤 형태가 가장 작은 공간으로 동작하는지 결정한다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: 버튼 동작이 wheel/pinch와 동일한 clamp 및 viewport center 규칙을 공유하도록 공통 zoom 업데이트 경로를 정리한다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: coarse pointer와 desktop 모두에서 접근 가능하도록 `aria-label`, 비활성 조건, 배치 위치를 설계하고 층 토글/선택 배지와 시각적으로 충돌하지 않게 정리한다.

### Phase 3: 지도 재진입 흐름과 수동 검증 기준을 함께 보강한다

5. - [ ] **선택/재진입 흐름이 새 제스처 모델과 충돌하지 않게 유지한다**
   - [ ] `src/routes/+page.svelte`, `src/lib/components/ExhibitionMap.svelte`: 리스트/상세 시트에서 지도로 돌아왔을 때 `selectItem()`, `mapFloorOverride`, `selectedItemId` 흐름이 새 zoom 상태와 충돌하지 않는지 점검하고 필요한 동기화 규칙을 반영한다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: 부스를 다시 탭해 상세 시트를 여는 현재 계약은 유지하되, pan 후 즉시 상세 시트가 튀지 않는지 확인할 수 있는 가드 조건을 명시한다.

6. - [ ] **정적/수동 검증 항목을 이번 제스처 회귀 기준에 맞게 갱신한다**
   - [ ] `MANUAL_TASKS.md`: 모바일 실기 또는 브라우저 디바이스 모드에서 확인할 `pinch 확대`, `drag pan`, `zoom 버튼`, `pan 후 부스 탭`, `층 전환 후 viewport 복원` 체크리스트를 추가한다.
   - [ ] `package.json`, `src/lib/components/ExhibitionMap.svelte`, `src/routes/+page.svelte`: `npm run check` 기준으로 타입/이벤트 경고 회귀가 없는지 확인하는 검증 단계를 계획에 포함한다.

---

*상태: 초안 | 진행률: 0/22 (0%)*
