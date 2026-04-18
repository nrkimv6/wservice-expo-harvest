# refine: adopt plans worktree for doc isolation

> 완료일: 2026-04-18
> 아카이브됨
> 진행률: 44/44 (100%)
> 작성일시: 2026-04-17 23:47
> 기준커밋: 555b4c3
> 대상 프로젝트: expo-harvest
> 상태: 구현완료
> 반영일시: 2026-04-18 09:43
> 머지커밋: add8ab5
> 진행률: 44/44 (100%)
> 요약: 현재 문서 흐름은 `main dirty 무시/완화` 예외 규칙에 기대고 있어, plan 문서 dirty가 root/main에 남아 있을 때 구현과 merge-test가 계속 흔들린다. `plans` worktree를 정식 도입해 plan/archive/TODO/DONE 문서 변경을 root/main에서 분리하고, 스킬들이 예외 해석 대신 분리된 작업공간을 기본으로 사용하도록 정리한다.
> 재검토일시: 2026-04-18
> 재검토 결론: 적용한다. 다만 현재 repo에는 `.worktrees/plans`가 아직 없고, 일부 스킬은 이미 plans dirty를 경고-only로 다루기 시작했으므로 이번 후속 범위는 "새 helper 추가"보다 "bootstrap 절차 확정 + 실제 문서 생성/커밋 cwd 전환 + 조회 스킬 경로 일치"에 맞춰야 한다.

---

## 개요

이 repo는 이미 `impl` worktree로 구현 격리를 하고 있지만, 문서(plan/archive/TODO/DONE) 변경은 여전히 root/main과 같은 작업공간에 남는다. 그 결과 `implement`, `merge-test`, `done`은 root dirty를 완화하는 예외 문구를 계속 늘렸고, 실제로는 같은 owner plan dirty가 `stash/apply` 충돌로 이어지는 경로가 남아 있다.

이번 계획의 목표는 `plans` worktree를 “있으면 사용하는 옵션”이 아니라 문서 흐름의 기본 격리 단위로 승격하는 것이다. 구현 브랜치는 `.worktrees/impl-*`, 문서 브랜치는 `.worktrees/plans`로 분리해 Codex가 root dirty 때문에 구현을 멈추거나 잘못된 stash/apply 경로를 타지 않도록 만든다.

## 기술적 고려사항

- `.agents/skills/implement/SKILL.md`, `.agents/skills/merge-test/SKILL.md`, `.agents/skills/done/SKILL.md`는 현재 root/main dirty 예외 규칙에 크게 의존하므로, `plans` 도입 후에는 “문서 변경은 plans에서 처리”를 기본 규칙으로 바꾸고 dirty 완화 문구는 축소 범위를 명확히 해야 한다.
- `.agents/skills/plan/_path-rules.md`에는 이미 `Resolve-DocsCommitRoot`, `Resolve-DocsCommitCandidates`, `Test-PlansDirty`가 있으므로, 새 helper를 늘리기보다 `Get-PlanRoot()`와 commit candidate 판정을 실제 생성/재개/복구 단계까지 연결하는 방향이 낫다. 단, 현재 repo에서는 `Get-PlanRoot()` 정의 위치가 확인되지 않으므로 이번 범위에 "공통 정의 추가 또는 dangling reference 제거"를 명시해야 한다.
- `merge-test`는 현재 `plans 워크트리 도입 프로젝트 (.worktrees/plans 존재 시)`라는 조건부 분기만 가지고 있다. 도입 후에는 plan 헤더 수정, archive 이동, 머지 완료 기록이 항상 plans 경로에서 일어나도록 preflight와 경고 문구를 다시 써야 한다.
- `plan-list`, `next`, `pull-sync` 같은 주변 스킬은 이미 plans dirty를 경고-only로 다루는 문구가 일부 들어갔지만, 여전히 plan 파일 실경로 선택과 표시 경로는 root/main 기준 설명이 섞여 있다. 이번 후속은 "경고 추가"가 아니라 "실제 읽기/표시/동기화 경로 일치"를 목표로 잡아야 한다.
- `reflect`, `review-plan`, `expand-todo`도 plan 문서를 생성·재검토·확장하면서 직접 markdown을 수정하고 커밋하므로, 이 3개가 root/main 경로 예시를 유지하면 문서 격리가 다시 깨진다. 구현/머지 계열만이 아니라 문서 생성 계열까지 같은 plan root 규칙을 써야 한다.
- 현재 repo에는 `.worktrees/plans`가 없으므로 `Test-PlansDirty`만으로는 실제 흐름을 검증할 수 없다. 최초 bootstrap이 실패했을 때 어떤 스킬이 어디서 중단해야 하는지까지 plan에 포함해야 한다.
- 최초 bootstrap은 `origin/plans`가 이미 있는 경우와 없는 경우의 명령이 다르다. 이번 계획에는 "기존 브랜치 attach"와 "최초 branch 생성 + upstream push"를 분리해 적어야 실제 적용 중 분기가 막히지 않는다.
- 운영 전환 시 기존 미완료 plan/dirty 문서를 한 번에 옮길 때는 “현재 실행이 만든 변경”과 “기존 잔존 dirty”를 섞어 커밋하지 않도록 migration 절차를 별도 Phase로 분리해야 한다.

---

## TODO

### Phase 1: plans worktree를 문서 경로의 정식 루트로 승격한다 (9개 작업)

1. - [x] **문서 경로 해석 규칙을 `_path-rules.md` 하나로 수렴한다**
   - [x] `.agents/skills/plan/_path-rules.md`: 기본 경로 표 아래에 “plans worktree가 있으면 plan/archive/TODO/DONE 조회·커밋은 해당 cwd를 우선 사용한다” 규칙을 1문단으로 추가한다.
   - [x] `.agents/skills/plan/_path-rules.md`: `Get-PlanRoot()` 호출 예시 옆에 정의 위치 계약 또는 대체 문구를 추가해 dangling reference를 제거한다.
   - [x] `.agents/skills/plan/_path-rules.md`: `Resolve-DocsCommitRoot`/`Resolve-DocsCommitCandidates` 설명을 `docs/plan`, `docs/archive`, `TODO.md`, `docs/DONE.md` 4개 허용 경로 기준으로 다시 적는다.
   - [x] `.agents/skills/plan/_path-rules.md`: `Test-PlansDirty` 설명에 `.worktrees/plans` 부재 시 false 반환과 bootstrap 미완료 상태 해석을 명시한다.

2. - [x] **plan 생성 문서와 템플릿이 같은 plan root 설명을 사용하게 맞춘다**
   - [x] `.agents/skills/plan/SKILL.md`: 생성 위치 설명에 root/main 기본 저장 대신 `Get-PlanRoot()` 또는 plans worktree 우선 규칙을 명시한다.
   - [x] `.agents/skills/plan/SKILL.md`: 커밋 절차 예시의 `docs/plan/...` 고정 add 문구를 `Resolve-DocsCommitRoot`/`Resolve-DocsCommitCandidates` 기준 설명으로 교체한다.
   - [x] `.agents/skills/plan/SKILL.md`: 출력 예시의 `plan: docs/plan/...`와 `todo-N: docs/plan/...` 문구를 plan root 상대경로 설명으로 바꾼다.
   - [x] `.agents/skills/plan/_template.md`: `### 파일 위치`의 `{project}/docs/plan/...` 고정 문구를 AGENTS 문서 위치 규칙 + plan root 기준 문구로 교체한다.
   - [x] `.agents/skills/plan/_template.md`: “모든 파일은 `docs/plan/`에 유지한다” 문장을 “모든 파일은 해석된 plan root 아래에 유지한다”는 뜻으로 다시 쓴다.

### Phase 2: 문서 생성·재검토와 구현 진입을 같은 경로 규칙으로 묶는다 (10개 작업)

3. - [x] **문서 생성·재검토 스킬이 같은 plan root를 읽고 쓰게 맞춘다**
   - [x] `.agents/skills/review-plan/SKILL.md`: 기존 plan 중복 검색 경로 설명을 AGENTS 문서 위치 규칙 + 실제 plan root 기준으로 바꾼다.
   - [x] `.agents/skills/review-plan/SKILL.md`: 3단계 커밋 규칙의 `{plan경로}/*.md`, `TODO.md` 화이트리스트를 `Resolve-DocsCommitRoot`/`Resolve-DocsCommitCandidates` 기준으로 다시 적는다.
   - [x] `.agents/skills/expand-todo/SKILL.md`: 입력 예시의 `docs/plan/2026-02-23-feature.md` 단일 예시를 “현재 plan root의 계획 문서 경로” 의미로 완화한다.
   - [x] `.agents/skills/expand-todo/SKILL.md`: 5단계 저장 규칙에 확장된 체크리스트를 plan이 읽힌 동일 실경로에 저장한다는 문장을 추가한다.
   - [x] `.agents/skills/reflect/SKILL.md`: plan 생성 위치 분기 설명에 plans worktree 도입 프로젝트는 root 대신 plan root에 생성한다는 규칙을 넣는다.
   - [x] `.agents/skills/reflect/SKILL.md`: fallback 커밋 설명의 `{plan경로}/*.md` 문구를 docs commit candidate 기반 화이트리스트로 바꾼다.

4. - [x] **implement 진입 시 문서 작업과 구현 작업의 저장소 책임을 분리한다**
   - [x] `.agents/skills/implement/SKILL.md`: preflight에 code/root dirty와 docs/plans dirty를 별도 판정한다는 문장을 추가한다.
   - [x] `.agents/skills/implement/SKILL.md`: TODO 동기화와 plan 헤더 갱신 같은 문서 변경은 `Resolve-DocsCommitRoot` 기준 cwd에서 수행한다고 명시한다.
   - [x] `.agents/skills/implement/SKILL.md`: `main 기존 수정사항 무시 모드` 설명에서 문서 dirty 면제를 제거하고 plans dirty 처리 규칙을 별도로 적는다.
   - [x] `.agents/skills/implement/SKILL.md`: 커밋 절차에 impl 브랜치 코드 add와 plans 브랜치 문서 add의 cwd 분리를 한 항목씩 적는다.

### Phase 3: merge-test, done, 조회 스킬을 plans-aware 기본 동작으로 정리한다 (16개 작업)

5. - [x] **merge-test가 root stash 예외 대신 plans owner 문서 규칙을 사용하게 바꾼다**
   - [x] `.agents/skills/merge-test/SKILL.md`: 전제조건 실패 문구의 `owner_plan_dirty` 대상을 root 계획서가 아니라 plans worktree owner 문서 dirty로 바꾼다.
   - [x] `.agents/skills/merge-test/SKILL.md`: `.worktrees/plans` 존재 시 plan 파일 실경로·헤더 Edit·커밋 cwd를 한 묶음 절차로 다시 정리한다.
   - [x] `.agents/skills/merge-test/SKILL.md`: owner dirty 탐지 예시의 `docs/plan/...` 경로를 `.worktrees/plans` 실경로 기준 예시로 바꾼다.
   - [x] `.agents/skills/merge-test/SKILL.md`: stash-merge-apply 설명에 root unrelated dirty만 stash하고 plans dirty는 별도 중단/복구 대상으로 남긴다고 적는다.
   - [x] `.agents/skills/merge-test/SKILL.md`: 머지 완료 후 `git push origin plans`까지 필요한 조건과 실패 시 중단 포인트를 plans 흐름 기준으로 보강한다.

6. - [x] **완료 처리와 조회·선택 계열이 같은 실경로를 읽도록 맞춘다**
   - [x] `.agents/skills/done/SKILL.md`: archive 예시의 `git mv "docs/plan/...`와 `git add "docs/archive/...` 문구를 plans cwd 또는 resolved plan root 예시로 교체한다.
   - [x] `.agents/skills/done/SKILL.md`: plans dirty 사전 점검 절차를 “사람 세션이면 경고” 보조 규칙이 아니라 정상 완료 흐름의 필수 단계로 재배치한다.
   - [x] `.agents/skills/done/SKILL.md`: 완료 검증 체크리스트에 plans worktree clean, root 문서 dirty 잔존 여부, docs candidate만 스테이징됐는지 3개 항목을 추가한다.
   - [x] `.agents/skills/plan-list/skill.md`: plan 스캔 순서에 `.worktrees/plans` 실경로 우선, root fallback 후순위를 명시한다.
   - [x] `.agents/skills/plan-list/skill.md`: 목록 출력 예시가 사용자가 실제 열어야 할 plan 실경로를 가리키도록 링크/표시 기준을 고친다.
   - [x] `.agents/skills/next/skill.md`: plan 탐색 대상 설명의 `{project}/docs/plan/*.md` 고정 문구를 resolved plan root 스캔 규칙으로 바꾼다.
   - [x] `.agents/skills/next/skill.md`: `[→WORKER-ID]` 마킹 단계에 읽은 plan 파일과 같은 실경로에만 상태를 기록한다고 명시한다.
   - [x] `.agents/skills/pull-sync/SKILL.md`: 변경된 plan 문서 감지 규칙의 `docs/plan/*.md` 필터를 plans 브랜치/plan root 기준 diff로 다시 적는다.
   - [x] `.agents/skills/pull-sync/SKILL.md`: archive/DONE/TODO 동기화 절차에 root/main과 plans 브랜치의 읽기·쓰기 cwd를 분리해서 적는다.
   - [x] `.agents/skills/batch-done/SKILL.md`: 완료 `_todo.md` 스캔 대상을 AGENTS plan 경로 문자열이 아니라 resolved plan root 실경로 기준으로 고친다.
   - [x] `.agents/skills/batch-done/SKILL.md`: 사용자 확인 표의 파일명/프로젝트 열이 plans worktree realpath를 잃지 않도록 표시 규칙을 보강한다.

### Phase 4: bootstrap·운영 전환·검증 절차를 문서화한다 (9개 작업)

7. - [x] **plans worktree bootstrap 절차를 attach/create 두 갈래로 분리해 적는다**
   - [x] `docs/plan/2026-04-17_refine-adopt-plans-worktree-for-doc-isolation.md`: 운영 메모에 `origin/plans`가 이미 있을 때 attach하는 순서를 별도 항목으로 추가한다.
   - [x] `docs/plan/2026-04-17_refine-adopt-plans-worktree-for-doc-isolation.md`: 운영 메모에 `plans` 브랜치가 없을 때 생성·upstream push하는 순서를 별도 항목으로 추가한다.
   - [x] `docs/plan/2026-04-17_refine-adopt-plans-worktree-for-doc-isolation.md`: 기존 root 문서 dirty를 plans로 옮길 때 현재 실행 변경과 섞지 않는 migration 절차를 추가한다.
   - [x] `.agents/skills/plan/SKILL.md`: bootstrap 예시에 `git worktree add .worktrees/plans ...` attach 명령을 추가한다.
   - [x] `.agents/skills/plan/SKILL.md`: bootstrap 예시에 branch 생성 + `git push -u origin plans` 명령을 추가한다.

8. - [x] **전환 이후 회귀 검증과 완료 기준을 계획서에 고정한다**
   - [x] `docs/plan/2026-04-17_refine-adopt-plans-worktree-for-doc-isolation.md`: 수동 검증 섹션에 “root에 문서 dirty가 있는 상태” 기대 동작을 추가한다.
   - [x] `docs/plan/2026-04-17_refine-adopt-plans-worktree-for-doc-isolation.md`: 수동 검증 섹션에 “plans에 기존 dirty가 있는 상태” 기대 동작을 추가한다.
   - [x] `docs/plan/2026-04-17_refine-adopt-plans-worktree-for-doc-isolation.md`: 수동 검증 섹션에 “impl + plans 동시 수정 상태” 기대 동작을 추가한다.
   - [x] `docs/plan/2026-04-17_refine-adopt-plans-worktree-for-doc-isolation.md`: 완료 기준을 unrelated root dirty 비차단, 문서 커밋의 plans 브랜치 고정, 조회/생성/재검토 스킬의 실경로 일치까지 포함한 한 문장으로 다듬는다.

---

## 운영 메모

### plans worktree bootstrap

1. `origin/plans`가 이미 있으면:
   - `git worktree add .worktrees/plans plans`
   - `.worktrees/plans`에서 문서 경로와 브랜치 상태를 확인한 뒤 이후 문서 변경을 그 cwd에서 계속한다.
2. `origin/plans`가 없으면:
   - `git worktree add .worktrees/plans -b plans`
   - `.worktrees/plans`에서 최초 문서 커밋을 만든 뒤 `git push -u origin plans`
3. attach/create 어느 경로든 실패하면:
   - 브랜치 충돌, 경로 충돌, push 실패 원인을 그대로 보고하고 중단한다.
   - root/main과 `.worktrees/plans`를 동시에 부분 수정한 채 후속 스킬을 진행하지 않는다.

### migration 절차

1. root/main에 남아 있는 기존 plan/archive/TODO/DONE dirty를 먼저 목록화한다.
2. 현재 실행이 만든 문서 변경과 기존 잔존 dirty를 섞지 않도록 파일 단위로 분리한다.
3. 필요한 파일만 `.worktrees/plans`로 옮겨 재편집하고, 문서 커밋은 plans 브랜치에서만 수행한다.
4. root/main에는 unrelated code 변경만 남기고 문서 dirty가 계속 남아 있지 않은지 다시 확인한다.

## 수동 검증

- root에 문서 dirty가 있는 상태: implement/merge-test는 unrelated root dirty 때문에 멈추지 않고, 문서 add/commit 대상은 plans worktree 또는 resolved plan root로 한정되어야 한다.
- plans에 기존 dirty가 있는 상태: `Test-PlansDirty`가 경고 또는 중단 근거를 제공하고, 현재 실행 수정분과 잔존 dirty를 섞어 커밋하지 않아야 한다.
- impl + plans 동시 수정 상태: 코드 커밋은 impl 브랜치, 문서 커밋은 plans 브랜치로 분리되고 각 스킬의 cwd 설명이 이를 일관되게 따라야 한다.

## 검증

### 확인 대상

- `.agents/skills/plan/_path-rules.md`
- `.agents/skills/plan/SKILL.md`
- `.agents/skills/plan/_template.md`
- `.agents/skills/review-plan/SKILL.md`
- `.agents/skills/expand-todo/SKILL.md`
- `.agents/skills/reflect/SKILL.md`
- `.agents/skills/implement/SKILL.md`
- `.agents/skills/merge-test/SKILL.md`
- `.agents/skills/done/SKILL.md`
- `.agents/skills/plan-list/skill.md`
- `.agents/skills/next/skill.md`
- `.agents/skills/pull-sync/SKILL.md`
- `.agents/skills/batch-done/SKILL.md`

### 검증 기준

- plan 문서 생성/갱신 경로가 root `docs/plan`과 `.worktrees/plans/docs/plan` 중 어느 쪽인지 스킬마다 일관된다.
- `plan/_template.md`의 파일 위치 안내와 본문 예시가 root `docs/plan` 고정 문구를 다시 주입하지 않는다.
- `Get-PlanRoot()` 책임이 정의되지 않았거나 문서 예시에만 남아 있는 상태가 제거된다.
- `plan`/`reflect`/`review-plan`/`expand-todo`가 같은 plan root에서 문서를 생성·수정·재검토·커밋한다.
- implement/merge-test/done이 문서 dirty를 root stash 예외로 처리하지 않고 plans 작업공간으로 분리한다.
- 조회 스킬이 plans dirty 경고와 plan 파일 스캔을 충돌 없이 수행한다.
- `batch-done`이 완료 `_todo` 탐색과 `done` 연계 시 plans worktree 기준 실경로를 사용해 root 문서와 혼동하지 않는다.
- bootstrap 직후와 기존 dirty 존재 시나리오 모두에서 수동 복구 절차가 모호하지 않다.
- 완료 기준: Codex가 unrelated root dirty 때문에 implement/merge-test를 멈추지 않고, 문서 커밋은 plans 브랜치에만 남으며, 조회/생성/재검토 스킬은 같은 실경로를 읽고 쓴다.

---

*상태: 구현완료 | 진행률: 44/44 (100%)*
