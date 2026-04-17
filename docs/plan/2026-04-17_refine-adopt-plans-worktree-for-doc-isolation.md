# refine: adopt plans worktree for doc isolation

> 작성일시: 2026-04-17 23:47
> 기준커밋: 555b4c3
> 대상 프로젝트: expo-harvest
> 상태: 초안
> 진행률: 0/20 (0%)
> 요약: 현재 문서 흐름은 `main dirty 무시/완화` 예외 규칙에 기대고 있어, plan 문서 dirty가 root/main에 남아 있을 때 구현과 merge-test가 계속 흔들린다. `plans` worktree를 정식 도입해 plan/archive/TODO/DONE 문서 변경을 root/main에서 분리하고, 스킬들이 예외 해석 대신 분리된 작업공간을 기본으로 사용하도록 정리한다.

---

## 개요

이 repo는 이미 `impl` worktree로 구현 격리를 하고 있지만, 문서(plan/archive/TODO/DONE) 변경은 여전히 root/main과 같은 작업공간에 남는다. 그 결과 `implement`, `merge-test`, `done`은 root dirty를 완화하는 예외 문구를 계속 늘렸고, 실제로는 같은 owner plan dirty가 `stash/apply` 충돌로 이어지는 경로가 남아 있다.

이번 계획의 목표는 `plans` worktree를 “있으면 사용하는 옵션”이 아니라 문서 흐름의 기본 격리 단위로 승격하는 것이다. 구현 브랜치는 `.worktrees/impl-*`, 문서 브랜치는 `.worktrees/plans`로 분리해 Codex가 root dirty 때문에 구현을 멈추거나 잘못된 stash/apply 경로를 타지 않도록 만든다.

## 기술적 고려사항

- `.agents/skills/implement/SKILL.md`, `.agents/skills/merge-test/SKILL.md`, `.agents/skills/done/SKILL.md`는 현재 root/main dirty 예외 규칙에 크게 의존하므로, `plans` 도입 후에는 “문서 변경은 plans에서 처리”를 기본 규칙으로 바꾸고 dirty 완화 문구는 축소 범위를 명확히 해야 한다.
- `.agents/skills/plan/_path-rules.md`에는 이미 `Resolve-DocsCommitRoot`, `Resolve-DocsCommitCandidates`, `Test-PlansDirty`가 있으므로, 새 helper를 늘리기보다 이 경로 해석을 “실제 생성/재개/복구” 단계까지 연결하는 방향이 낫다.
- `merge-test`는 현재 `plans 워크트리 도입 프로젝트 (.worktrees/plans 존재 시)`라는 조건부 분기만 가지고 있다. 도입 후에는 plan 헤더 수정, archive 이동, 머지 완료 기록이 항상 plans 경로에서 일어나도록 preflight와 경고 문구를 다시 써야 한다.
- `plan-list`, `next`, `pull-sync` 같은 주변 스킬도 스캔/경고/복구 메시지가 root/main 기준으로 남아 있으므로, plan 파일 실경로가 plans 쪽일 때도 일관되게 읽고 보여주는지 확인해야 한다.
- 운영 전환 시 기존 미완료 plan/dirty 문서를 한 번에 옮길 때는 “현재 실행이 만든 변경”과 “기존 잔존 dirty”를 섞어 커밋하지 않도록 migration 절차를 별도 Phase로 분리해야 한다.

---

## TODO

### Phase 1: plans worktree를 문서 경로의 정식 루트로 승격한다

1. - [ ] **문서 경로 해석과 생성 규칙을 plans 기본 전제로 재정의한다**
   - [ ] `.agents/skills/plan/_path-rules.md`: `.worktrees/plans` 존재 여부만 보는 helper 설명을 넘어서, plan/archive/TODO/DONE 문서가 어느 시점부터 plans 루트에서 생성·수정·커밋되어야 하는지 규칙을 명시한다.
   - [ ] `.agents/skills/plan/SKILL.md`: 새 plan 생성 시 root/main이 아니라 plans worktree를 우선 대상으로 삼는 조건과 fallback 규칙을 적는다.
   - [ ] `.agents/skills/plan/SKILL.md`: plans 미생성 상태에서 최초 bootstrap을 어떻게 처리할지, 생성 실패 시 어떤 상태로 중단할지 적는다.

### Phase 2: implement와 merge-test에서 root dirty 예외 대신 문서 분리를 사용하게 바꾼다

2. - [ ] **implement 진입 시 문서와 구현의 작업공간 책임을 분리한다**
   - [ ] `.agents/skills/implement/SKILL.md`: `impl` worktree 생성 규칙은 유지하되, plan 헤더 갱신·TODO 반영 같은 문서 변경은 plans worktree 경로에서 수행한다는 책임 분리를 추가한다.
   - [ ] `.agents/skills/implement/SKILL.md`: `main 기존 수정사항 무시 모드`를 문서 dirty까지 포괄하는 예외로 두지 말고, code/root와 docs/plans의 판정 범위를 나눠서 다시 정의한다.
   - [ ] `.agents/skills/implement/SKILL.md`: worktree owner 보강 커밋이나 진행률 갱신 커밋이 impl 브랜치가 아니라 plans 브랜치에 쌓이지 않도록 커밋 cwd 규칙을 분리한다.

3. - [ ] **merge-test의 stash-merge-apply 흐름에서 owner plan dirty 충돌 경로를 제거한다**
   - [ ] `.agents/skills/merge-test/SKILL.md`: 현재 root `git status --porcelain`를 기준으로 문서 dirty를 stash하는 절차를 plans 분리 전제에 맞게 재작성한다.
   - [ ] `.agents/skills/merge-test/SKILL.md`: `반영일시`/`머지커밋` 기록, archive 이동, 완료 헤더 갱신이 항상 plans worktree 내 절대경로에서 수행되도록 단계 순서를 명시한다.
   - [ ] `.agents/skills/merge-test/SKILL.md`: `owner_plan_dirty` 같은 현재 fix plan의 hard-stop 규칙이 plans 도입 후에도 필요한지, 필요하다면 root가 아니라 plans 쪽 잔존 dirty만 검사하도록 기준을 다시 적는다.

### Phase 3: done와 주변 스킬을 plans-aware 기본 동작으로 정리한다

4. - [ ] **done의 완료 처리와 plans dirty 복구 단계를 단일 흐름으로 정리한다**
   - [ ] `.agents/skills/done/SKILL.md`: archive 이동, DONE/TODO 갱신, plans dirty 사전 점검을 “사람 세션이면 경고” 수준이 아니라 plans worktree 기준 정상 흐름으로 재배치한다.
   - [ ] `.agents/skills/done/SKILL.md`: root/main에서 문서 변경을 직접 정리하던 예시 명령을 plans cwd 기준 예시로 바꾼다.
   - [ ] `.agents/skills/done/SKILL.md`: 완료 검증 항목에 `plans 브랜치/워크트리 정리 확인`과 `root/main에 문서 dirty가 남지 않았는지`를 추가한다.

5. - [ ] **조회·선택 계열 스킬이 plans 경로를 일관되게 읽도록 맞춘다**
   - [ ] `.agents/skills/plan-list/skill.md`: plan 스캔 시 root `docs/plan`과 `.worktrees/plans/docs/plan` 중 우선순위를 명시하고, 사람 세션 경고 문구를 현재 구조에 맞게 다듬는다.
   - [ ] `.agents/skills/next/skill.md`: 다음 작업 선택 시 plans dirty는 “복구 경고 후 차단”인지 “비차단 조회”인지 역할을 분리하고, 현재 plan 파일 탐색 경로를 정리한다.
   - [ ] `.agents/skills/pull-sync/SKILL.md`: pull 후 변경된 plan 문서 감지·archive·DONE 동기화가 plans 브랜치와 root/main 브랜치를 혼동하지 않도록 경로 기준을 보강한다.

### Phase 4: bootstrap·운영 전환·검증 절차를 문서화한다

6. - [ ] **이 repo에 plans worktree를 실제로 붙이는 bootstrap 절차를 적는다**
   - [ ] `docs/plan/2026-04-17_refine-adopt-plans-worktree-for-doc-isolation.md`: `.worktrees/plans` 생성, plans 브랜치 준비, 기존 문서 경로 연결 순서를 운영 메모로 추가한다.
   - [ ] `.agents/skills/plan/SKILL.md` 또는 관련 스킬 문서: 최초 1회 생성/재개/복구 절차에서 필요한 `git worktree add`/`git switch`/`git push` 순서를 예시로 적는다.

7. - [ ] **전환 이후 회귀를 막는 검증 기준을 정의한다**
   - [ ] `docs/plan/2026-04-17_refine-adopt-plans-worktree-for-doc-isolation.md`: 수동 검증 항목에 `root에 문서 dirty가 있는 상태`, `plans에 기존 dirty가 있는 상태`, `impl + plans 동시 수정 상태`의 기대 동작을 적는다.
   - [ ] `docs/plan/2026-04-17_refine-adopt-plans-worktree-for-doc-isolation.md`: 완료 기준을 “Codex가 root dirty 때문에 implement/merge-test를 멈추지 않고, 문서 커밋은 plans 브랜치에만 남는다” 한 문장으로 명시한다.

---

## 검증

### 확인 대상

- `.agents/skills/plan/_path-rules.md`
- `.agents/skills/plan/SKILL.md`
- `.agents/skills/implement/SKILL.md`
- `.agents/skills/merge-test/SKILL.md`
- `.agents/skills/done/SKILL.md`
- `.agents/skills/plan-list/skill.md`
- `.agents/skills/next/skill.md`
- `.agents/skills/pull-sync/SKILL.md`

### 검증 기준

- [ ] plan 문서 생성/갱신 경로가 root `docs/plan`과 `.worktrees/plans/docs/plan` 중 어느 쪽인지 스킬마다 일관된다.
- [ ] implement/merge-test/done이 문서 dirty를 root stash 예외로 처리하지 않고 plans 작업공간으로 분리한다.
- [ ] 조회 스킬이 plans dirty 경고와 plan 파일 스캔을 충돌 없이 수행한다.
- [ ] bootstrap 직후와 기존 dirty 존재 시나리오 모두에서 수동 복구 절차가 모호하지 않다.

---

*상태: 초안 | 진행률: 0/20 (0%)*
