# refine: map pin hover UX

> 작성일시: 2026-04-17 14:47
> 기준커밋: 3ed884e
> 대상 프로젝트: expo-harvest
> 상태: 검토완료
> 진행률: 0/8 (0%)
> 요약: 현재 `ExhibitionMap`은 핀 근처 툴팁 대신 상단 `Focus Booth` 요약 패널을 사용한다. 재검토 결과, 예전처럼 핀 하단 툴팁을 되살리는 방향은 폐기하고, 상단 패널은 유지하되 모바일 helper copy, 첫 탭 상세 시트 오픈 계약, hover/focus 문구를 실제 동작과 맞추는 좁은 후속으로 수정한다.
> 재검토일시: 2026-04-18
> 재검토 결론: 원문의 "핀 근처 툴팁 복구" 방향은 폐기한다. 대신 현재 상단 요약 패널을 유지하는 전제로 상호작용 계약과 copy를 정리하는 수정본으로 적용한다.

> 관련 계획:
> - [`docs/archive/2026-04-17_refine-coupang-floor-map-readability-mobile.md`](D:/work/project/service/wtools/expo-harvest/docs/archive/2026-04-17_refine-coupang-floor-map-readability-mobile.md) Phase 4에서 이 문서의 초기 범위를 흡수했다.
> - [`docs/plan/2026-04-18_test-map-booth-interaction-regression-coverage.md`](D:/work/project/service/wtools/expo-harvest/docs/plan/2026-04-18_test-map-booth-interaction-regression-coverage.md)는 본 문서의 상호작용 계약을 자동 회귀 테스트로 고정하는 후속이다.

---

## 개요

현재 코드는 [`src/lib/components/ExhibitionMap.svelte`](D:/work/project/service/wtools/expo-harvest/src/lib/components/ExhibitionMap.svelte) 상단에 `Focus Booth`/`Selected Booth` 패널을 두고, `hoveredItemId`와 `focusItem`으로 문맥 정보를 보여준다. 문제는 구조 자체보다도 **문구와 실제 동작의 계약이 어긋난 점**이다. 모바일 coarse pointer에서는 패널에 "한 번 더 탭하면 상세 시트가 열립니다"라고 적혀 있지만, 실제 핀 탭은 [`src/routes/+page.svelte`](D:/work/project/service/wtools/expo-harvest/src/routes/+page.svelte)에서 첫 탭에 곧바로 상세 시트를 연다.

이번 재검토에서는 "핀 가까운 부유 툴팁을 다시 붙인다"는 원문 방향을 접는다. 대신 지도 로컬 문맥은 현재 상단 패널이 담당하고, 모바일/데스크톱/키보드 사용자가 보게 되는 안내 문구와 실제 선택 흐름을 일치시키는 쪽으로 범위를 줄인다.

## 기술적 고려사항

- [`src/lib/components/ExhibitionMap.svelte`](D:/work/project/service/wtools/expo-harvest/src/lib/components/ExhibitionMap.svelte)는 overview/section 렌더, drag, zoom, booth 선택을 함께 다루므로 핀별 부유 툴팁을 다시 넣으면 SVG 복잡도와 겹침 처리가 다시 커진다.
- [`src/routes/+page.svelte`](D:/work/project/service/wtools/expo-harvest/src/routes/+page.svelte)와 [`src/lib/components/BoothDetailSheet.svelte`](D:/work/project/service/wtools/expo-harvest/src/lib/components/BoothDetailSheet.svelte)가 이미 상세 정보 노출을 담당하므로, 지도는 "짧은 문맥 요약"까지만 맡기는 편이 책임 분리에 맞다.
- AGENTS.md의 지도 UI 규칙상 helper copy는 상태 전달용 짧은 한두 문장으로 유지해야 하므로, 모바일 패널 문구는 실제 첫 탭 동작을 오해 없이 설명하는 짧은 문장으로 정리해야 한다.
- hover는 포인터 기반 디바이스에서만 의미가 크지만, 키보드 focus는 계속 지원해야 하므로 `hoveredItemId`/`focusItem`의 접근성 동작은 유지하되 copy와 label을 현실 계약에 맞춰야 한다.

---

## TODO

### Phase 1: 현재 지도 계약을 문구와 함께 다시 고정한다

1. - [ ] **상단 요약 패널을 현재 지도 계약의 기준 UI로 고정한다**
   - [ ] `src/lib/components/ExhibitionMap.svelte`: 핀별 부유 툴팁 복구를 범위에서 제외하고, 상단 `Focus Booth`/`Selected Booth` 패널이 지도 내 짧은 문맥 요약을 담당한다는 기준을 문서와 코드 근처에 남긴다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`, `src/routes/+page.svelte`: 데스크톱 `hover/focus`는 패널 요약 갱신, 모바일 `tap`은 첫 탭 즉시 상세 시트 오픈이라는 현재 계약을 명시한다.

2. - [ ] **mobile helper copy를 실제 탭 동작과 맞춘다**
   - [ ] `src/lib/components/ExhibitionMap.svelte`: coarse pointer에서 보이는 "한 번 더 탭하면 상세 시트가 열립니다" 문구를 현재 동작과 맞는 짧은 안내 문장으로 교체한다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: `Hover Booth`/`Focus Booth`/`Selected Booth` 라벨이 포인터 타입과 선택 상태를 과장 없이 설명하는지 정리한다.

### Phase 2: hover/focus 접근성과 선택 흐름을 정리한다

3. - [ ] **키보드 포커스와 `aria-label`을 현재 패널 UX에 맞춘다**
   - [ ] `src/lib/components/ExhibitionMap.svelte`: 마우스 hover와 키보드 focus가 모두 같은 요약 패널 경로를 타는지 다시 확인하고, 불필요한 상태 전이를 줄인다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`: booth `aria-label`과 상단 패널 copy가 중복되거나 충돌하지 않는지 확인하고, 필요하면 한쪽을 더 짧게 줄인다.

4. - [ ] **mobile 탭-상세시트 흐름 오해를 없앤다**
   - [ ] `src/routes/+page.svelte`, `src/lib/components/ExhibitionMap.svelte`: 모바일에서 첫 탭에 바로 상세 시트가 열리는 현재 흐름을 유지하고, panel copy가 두 단계 선택처럼 보이지 않게 정리한다.
   - [ ] `src/lib/components/BoothDetailSheet.svelte`, `src/lib/components/ExhibitionMap.svelte`: 지도에서 생략한 상세 정보가 상세 시트에서 충분히 이어지는지 확인하고, 정보 공백이 있으면 패널보다 시트 쪽 보강을 우선 검토한다.

### Phase 3: 회귀 검증 경로를 현재 후속 계획과 맞춘다

5. - [ ] **정적 검증과 브라우저 회귀 테스트 연결 기준을 남긴다**
   - [ ] `package.json`, `src/lib/components/ExhibitionMap.svelte`: `npm run check`를 실행해 타입/이벤트 회귀가 없는지 확인한다.
   - [ ] `docs/plan/2026-04-18_test-map-booth-interaction-regression-coverage.md`: 본 문서에서 고정한 첫 탭 상세 시트 오픈 계약과 hover/focus 요약 패널 계약을 자동 회귀 테스트 요구사항으로 연결한다.

---

*상태: 검토완료 | 진행률: 0/8 (0%)*
