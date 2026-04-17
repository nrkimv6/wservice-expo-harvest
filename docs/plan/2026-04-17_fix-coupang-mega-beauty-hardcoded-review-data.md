# fix: align coupang mega beauty hardcoded review data

> 작성일시: 2026-04-17 17:05
> 기준커밋: 5853e1d
> 대상 프로젝트: expo-harvest
> 상태: 초안
> 진행률: 0/30 (0%)
> 요약: 실제 후기 원문과 `쿠팡메가뷰티쇼 2026` 하드코딩 데이터를 대조한 결과, 일부 부스의 해시태그 오탈자와 미션 설명 불일치, 잘못된 선착순 강조가 확인됐다. 이 계획의 목표는 후기 기준으로 명백한 오류를 먼저 바로잡고, 아직 비어 있는 부스 데이터를 "미반영"과 "수정 필요"로 구분해 후속 반영 범위를 명확히 만드는 것이다.

---

## 개요

사용자가 제공한 실제 후기 원문(`C:\Users\Narang\Downloads\2026-04-17_16-47-40_untitled.md`)을 기준으로 앱의 `쿠팡메가뷰티쇼 2026` 하드코딩 데이터를 검토한 결과, 현재 데이터는 일부 브랜드만 부분 반영된 상태이며 몇몇 항목은 원문과 직접 충돌한다. 특히 AHC는 해시태그 프리셋 정의가 있어도 실제 아이템에 연결되지 않아 UI에 노출되지 않고, 에뛰드는 이미 반영된 설명이 후기와 다른 이벤트 내용으로 남아 있으며, 토니모리/에스쁘아는 계정 또는 해시태그 표기에 오탈자가 있다. 아리얼은 선착순 부스로 강조되지만 원문상 핵심은 캡처 이벤트와 랜덤 증정, 부직포 백 안내에 가깝다.

이번 계획은 먼저 "명백한 오류"를 수정하는 P0 범위와, 같은 후기 기준으로 아직 비어 있는 `mission`/`prize`/`firstComeEvent` 필드를 어떤 원칙으로 채울지 정하는 P1 범위를 분리한다. 구현 시에는 후기 원문에 없는 내용은 억지로 추정하지 않고, 제공된 문구만 옮기는 방식으로 데이터 신뢰도를 유지한다.

## 기술적 고려사항

- `src/lib/data/lootItems.ts`는 해시태그 프리셋과 실제 부스 아이템 데이터가 분리돼 있어, 프리셋이 정의돼 있어도 아이템에서 `hashtags: []`를 직접 넣으면 UI에는 반영되지 않는다.
- `firstComeEvent`는 지도 hover, 리스트, 상세 시트에서 별도 강조 문구로 노출되므로, 근거가 약한 선착순 표시는 과장된 사용자 인상을 만들 수 있다.
- `BoothDetailSheet.svelte`는 `prize`, `mission`, `category`, `hashtags`가 비어 있지 않으면 그대로 노출하므로, 후기 기준 문구 정합성이 중요하다.
- 이번 계획은 코드 구현뿐 아니라, 후기 기준과 앱 반영 범위를 다시 설명하는 보고 문서 또는 변경 로그 갱신까지 포함해야 이후 재검토 시 기준이 흔들리지 않는다.

---

## TODO

### Phase 1: 후기 기준과 현재 데이터의 충돌 지점을 고정한다

1. [ ] **명백한 오류 후보를 후기 원문 기준으로 확정한다** — 수정 대상과 미반영 대상을 섞지 않게 분리
   - [ ] `src/lib/data/lootItems.ts`: AHC, 에뛰드, 토니모리, 에스쁘아, 아리얼의 현재 `hashtags`, `hashtagAccountTags`, `mission`, `prize`, `firstComeEvent` 값을 후기 원문과 1:1로 대조해 충돌 항목 목록을 정리한다.
   - [ ] `C:\Users\Narang\Downloads\2026-04-17_16-47-40_untitled.md`: 충돌 항목마다 근거 문구를 다시 확인해 "오탈자", "설명 불일치", "강조 과장", "단순 미반영"으로 분류한다.

2. [ ] **후기 원문으로 채울 수 있는 정보 범위를 확정한다** — 추정 반영을 방지
   - [ ] `src/lib/data/lootItems.ts`: 19개 부스 중 현재 `mission`/`prize`/`firstComeEvent`가 비어 있는 항목을 추려, 이번 수정에서 채울 수 있는 부스와 그대로 둘 부스를 나눈다.
   - [ ] `docs/report/2026-04-17_coupang-mega-beauty-brand-reference.md`: 기존 기준 문서가 해시태그/계정 중심이라 미션/경품 기준을 담지 못하는 한계를 메모하고, 구현 후 보강이 필요한지 판단 근거를 남긴다.

### Phase 2: 명백한 하드코딩 오류를 후기 기준으로 수정한다

3. [ ] **AHC 데이터를 프리셋과 후기 설명이 모두 보이도록 바로잡는다** — 현재 빈 데이터 때문에 UI에 정보가 사라진 상태 해소
   - [ ] `src/lib/data/lootItems.ts`: `cmbs-2026-ahc` 아이템에 `getCoupangMegaBeautyHashtagBlock('cmbs-2026-ahc')`를 연결해 해시태그와 고정 계정 태그가 실제 UI에 노출되게 수정한다.
   - [ ] `src/lib/data/lootItems.ts`: 후기 기준으로 `category`, `mission`, `prize`를 `카플친/인스타 팔로우 + 슈팅게임 + 본품 뽑기` 흐름이 드러나도록 문구화한다.

4. [ ] **에뛰드 이벤트 설명을 후기 기준으로 교체한다** — 현재 다른 현장안으로 보이는 설명 제거
   - [ ] `src/lib/data/lootItems.ts`: `cmbs-2026-etude`의 `mission`을 `인스타 팔로우/업로드 + 뽑기` 구조로 바꾸고, 후기 원문에 없는 `쿠션 TEST`, `품평지 작성` 문구를 제거한다.
   - [ ] `src/lib/data/lootItems.ts`: `cmbs-2026-etude`의 `prize`를 `최소 틴트 본품, 쿠션 본품` 요지가 드러나도록 수정하고, 필요 시 연결된 `detailImage` 캡션도 새 설명과 충돌하지 않게 정리한다.

5. [ ] **오탈자와 잘못된 계정 태그를 후기 기준으로 수정한다** — 복사/공유 시 잘못된 값이 퍼지는 문제 방지
   - [ ] `src/lib/data/lootItems.ts`: `cmbs-2026-tonymoly`의 `hashtagAccountTags`와 `socialLinks` 핸들을 `@tonymoly` 기준으로 정정한다.
   - [ ] `src/lib/data/lootItems.ts`: `cmbs-2026-espoir`의 해시태그 `#에스뿌아`를 후기 원문 기준 `#에스쁘아`로 정정한다.

6. [ ] **아리얼의 강조 방식을 후기 기준으로 재조정한다** — 선착순 강조 대신 실제 핵심 정보 노출
   - [ ] `src/lib/data/lootItems.ts`: `cmbs-2026-ariul`의 `firstComeEvent`를 제거하거나 후기 근거가 있는 표현으로 낮추고, 현재의 과도한 선착순 강조를 없앤다.
   - [ ] `src/lib/data/lootItems.ts`: `cmbs-2026-ariul`의 `mission`/`prize`를 `인스타/카플친 + 사다리타기 + 캡처 이벤트 + 부직포 백 안내`가 드러나도록 보강한다.

### Phase 3: 미반영 부스 데이터 보강 원칙과 사용자 노출을 정리한다

7. [ ] **이번 턴에 함께 채울 부스와 후속으로 남길 부스를 결정한다** — 빈 데이터가 의도인지 누락인지 구분
   - [ ] `src/lib/data/lootItems.ts`: 후기 원문에 미션/경품이 명확히 적힌 부스 중 아직 빈 값인 항목을 추려 동일한 문장 스타일로 채울 우선순위 후보를 만든다.
   - [ ] `docs/plan/2026-04-17_fix-coupang-mega-beauty-hardcoded-review-data.md`: 이번 계획의 범위를 "즉시 수정"과 "후속 반영"으로 구분해, 구현 단계에서 범위가 불어나지 않도록 정리한다.

8. [ ] **기준 문서와 변경 기록을 후기 기준으로 갱신한다** — 다음 검토 시 출처 혼선을 줄이기
   - [ ] `docs/report/2026-04-17_coupang-mega-beauty-brand-reference.md`: 해시태그/계정 기준에 더해, 이번에 실제로 수정한 부스의 미션/경품/강조 기준을 짧게 보강하거나 별도 후속 문서 필요 여부를 명시한다.
   - [ ] `CHANGELOG.md`: 후기 기준 하드코딩 정합성 수정 사항(AHC, 에뛰드, 토니모리, 에스쁘아, 아리얼)을 사용자 관점으로 요약해 기록한다.

### Phase 4: 화면 노출과 검색 영향 범위를 검증한다

9. [ ] **상세 시트와 리스트에서 바뀐 데이터가 의도대로 보이는지 확인한다** — 텍스트 수정이 실제 노출과 일치하는지 검증
   - [ ] `src/lib/components/BoothDetailSheet.svelte`: `firstComeEvent`, `prize`, `mission`, `hashtags`가 새 값으로 표시될 때 섹션 순서와 문구 흐름이 자연스러운지 확인 포인트를 정리한다.
   - [ ] `src/lib/components/LootFeed.svelte`, `src/lib/components/ExhibitionMap.svelte`: 검색/정렬/hover 강조가 수정된 `firstComeEvent`와 텍스트에 맞게 달라지는지 검증 항목을 적는다.

10. [ ] **기본 검증 절차를 문서화한다** — 구현 직후 빠르게 회귀 확인 가능하게 유지
   - [ ] `package.json`: 현재 사용 가능한 검증 명령(`npm run check`, 필요 시 `npm run build`)을 기준으로 문서형 검증 절차를 계획서에 반영한다.
   - [ ] `docs/plan/2026-04-17_fix-coupang-mega-beauty-hardcoded-review-data.md`: 구현 완료 후 확인할 항목을 `해시태그 복사`, `SNS 핸들`, `선착순 강조`, `상세 시트 텍스트` 중심으로 요약한다.

---

*상태: 초안 | 진행률: 0/30 (0%)*
