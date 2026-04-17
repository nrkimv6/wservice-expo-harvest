# restore: root home shell and clean dummy data

> 작성일시: 2026-04-17 11:10
> 기준커밋: b3f72cb
> 대상 프로젝트: expo-harvest
> 상태: 완료
> 진행률: 6/6 (100%)
> branch: main
> worktree: .
> worktree-owner: docs/plan/2026-04-17_restore-root-home-shell-and-clean-dummy-data.md
> 요약: 루트 홈 앱 셸이 랜딩 페이지로 덮어써지면서 하단 네비, 홈 기본 탭, 우측 상단 햄버거 메뉴 구성이 사라졌다. 루트 앱 셸을 복구하고, 햄버거 동작/헤더 크기/더미 문구와 더미 데이터를 함께 정리한다.
> 재검토일시: 2026-04-18
> 재검토 결론: 이 계획 자체의 재적용은 폐기한다. 루트 홈 셸 복구, `/app` 리다이렉트, 더미 문구/데이터 정리는 이미 반영됐고, 현재 HEAD에 남은 햄버거 무반응과 서비스워커 캐시 회귀는 [`docs/plan/2026-04-18_fix-hamburger-menu-cache-regression.md`](D:/work/project/service/wtools/expo-harvest/docs/plan/2026-04-18_fix-hamburger-menu-cache-regression.md)에서 좁은 범위로 처리한다.

---

## 재검토 메모

- [`src/routes/+page.svelte`](D:/work/project/service/wtools/expo-harvest/src/routes/+page.svelte)의 홈/지도/리스트/저장됨 셸, [`src/routes/app/+page.svelte`](D:/work/project/service/wtools/expo-harvest/src/routes/app/+page.svelte)의 루트 리다이렉트, [`src/lib/components/AlertBanner.svelte`](D:/work/project/service/wtools/expo-harvest/src/lib/components/AlertBanner.svelte)의 실사용 문구는 현재 코드에 남아 있다.
- 다만 햄버거 열림 조건은 이후 회귀로 다시 깨졌고, 이 문서의 2번 완료 체크를 다시 뒤집기보다 후속 회귀 계획에서 따로 추적하는 편이 기록 보존에 맞다.
- 따라서 이 문서는 "완료된 원 복구 작업"으로 유지하고, 재적용 큐에서는 제외한다.

---

## TODO

1. - [x] **루트 홈 앱 셸을 복구한다**
   - [x] `src/routes/+page.svelte`: 홈/지도/리스트/저장됨 하단 네비 구조와 홈 기본 탭을 다시 연결한다.
   - [x] `src/routes/+page.svelte`: 헤더를 카드형 hero 대신 단순한 상단 헤더로 줄인다.

2. - [x] **햄버거 메뉴 위치와 열림 동작을 복구한다**
   - [x] `src/routes/+page.svelte`: 햄버거 버튼을 화면 오른쪽 상단 고정 위치로 유지한다.
   - [x] `src/routes/+page.svelte`: 박람회 수와 관계없이 메뉴 드로어가 열리도록 토글 조건을 정리한다.

3. - [x] **레거시 `/app` 라우트를 다시 루트로 돌린다**
   - [x] `src/routes/app/+page.svelte`: 별도 앱 셸 대신 `/` 루트로 이동하는 레거시 라우트로 복구한다.

4. - [x] **더미 문구와 더미 데이터를 제거한다**
   - [x] `src/lib/components/AlertBanner.svelte`: `Hot Drop` 같은 더미 표현을 실제 파밍 알림 표현으로 바꾼다.
   - [x] `src/lib/data/lootItems.ts`: 데모 전시회를 제거한 상태를 유지하고 `AHC`의 시간제한/경품 더미 값을 정리한다.

---

*상태: 완료 | 진행률: 6/6 (100%)*
