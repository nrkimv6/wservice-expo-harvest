# fix: merge-test owner plan dirty guard

> 완료일: 2026-04-18
> 아카이브됨
> 진행률: 16/16 (100%)
> 작성일시: 2026-04-17 16:52
> 기준커밋: 68c9022
> 대상 프로젝트: expo-harvest
> 상태: 구현완료
> 반영일시: 2026-04-18 00:06
> 머지커밋: f826ef9
> 진행률: 16/16 (100%)
> 출처: /review에서 자동 생성
> 요약: `merge-test`가 root `main`의 dirty 파일을 일반 stash 대상으로 취급하면서, 현재 worktree owner와 같은 계획서가 root에도 수정돼 있을 때 `stash apply` 충돌을 일으킬 수 있었다. 같은 owner 계획서 dirty는 stash/apply로 복원할 대상이 아니라 즉시 중단해야 하므로, merge-test에 사전 차단 규칙과 운영 메시지를 추가한다.

---

## 개요

이번 세션에서 `impl/port-coupang-mega-beauty-floor-map`를 `main`에 머지할 때, root `main`에도 같은 계획서가 dirty 상태로 남아 있었다. `merge-test`는 이를 일반 root dirty로 보고 `stash -> merge -> stash apply`를 수행했고, 그 결과 머지 후 같은 계획서 파일에서 충돌이 발생했다. 이 경우는 "root 변경 보존"이 아니라 "worktree 소유권 규칙 위반 상태"로 봐야 하므로, merge-test가 root dirty를 stash하기 전에 현재 `parent_plan_path`와 동일한 owner 계획서 파일이 포함돼 있는지 검사하고 즉시 중단해야 한다.

## 기술적 고려사항

- 현재 `.agents/skills/merge-test/SKILL.md`는 `worktree-owner` 검증으로 **브랜치 소유권**만 확인하고, root dirty 안에 같은 owner 계획서가 섞여 있는지는 보지 않는다.
- 일반 root dirty는 stash/apply로 복원해도 되지만, `docs/plan/*.md` 중 현재 `parent_plan_path` 본문이나 같은 owner 문서가 dirty이면 자동 복원 대상이 아니라 수동 정리 대상이다.
- guard는 "현재 merge 대상 parent plan과 동일한 계획서"만 막아야 한다. 다른 unrelated root dirty까지 전부 차단하면 merge-test의 정상 동작 범위를 과도하게 줄인다.
- 이번 문제는 skill 규칙 미흡과 실행 판단 누락이 함께 있었으므로, skill 문구와 사용자 노출 에러 메시지를 둘 다 고쳐야 한다.

---

## TODO

### Phase 1: root dirty 중 현재 owner 계획서 충돌 후보를 식별하는 규칙을 추가한다

1. - [x] **merge-test preflight에 owner 계획서 dirty 감지 단계를 추가한다**
   - [x] `.agents/skills/merge-test/SKILL.md`: root `git status --porcelain` 결과에서 현재 `parent_plan_path`와 동일한 계획서 파일이 dirty면 stash 전에 즉시 중단한다는 규칙을 추가
   - [x] `.agents/skills/merge-test/SKILL.md`: 단일 plan뿐 아니라 동일 `> worktree-owner:`를 가진 sibling plan/TODO 문서가 root dirty에 포함된 경우도 같은 충돌 후보로 본다는 기준을 추가

2. - [x] **guard 범위를 current owner로 한정한다**
   - [x] `.agents/skills/merge-test/SKILL.md`: unrelated root dirty는 기존 stash 흐름을 유지하고, 현재 merge 대상 `parent_plan_path`와 동일한 owner 문서만 hard-stop 대상으로 분리한다고 명시
   - [x] `.agents/skills/merge-test/SKILL.md`: plans worktree 사용 프로젝트와 단일 plan 프로젝트 각각에서 어떤 경로를 비교할지 예시를 추가

### Phase 2: stash-merge-apply 절차 앞에 명시적 중단 메시지를 넣는다

3. - [x] **운영자가 바로 이해할 수 있는 중단 메시지를 정의한다**
   - [x] `.agents/skills/merge-test/SKILL.md`: 같은 owner 계획서 dirty 감지 시 `MERGE_PRECHECK_FAILED[owner_plan_dirty]` 로그 prefix와 함께 중단하도록 문구를 추가
   - [x] `.agents/skills/merge-test/SKILL.md`: 안내 메시지에 "root 계획서를 먼저 별도 커밋하거나 수동 정리 후 재시도"를 포함해 stash/apply를 시도하지 않도록 명시

4. - [x] **실패 후 상태 보존 계약을 적는다**
   - [x] `.agents/skills/merge-test/SKILL.md`: `owner_plan_dirty` 경로에서는 merge를 시작하지 않았으므로 worktree/branch/main 상태를 그대로 보존하고 종료한다고 명시
   - [x] `.agents/skills/merge-test/SKILL.md`: 이미 merge 이후 충돌이 난 경우의 복구 경로는 별도 수동 절차임을 짧게 추가

### Phase R: 재발 경로 분석 (fix: plan 필수)

5. - [x] **같은 원인이 다른 스킬에도 반복되는지 점검한다**
   - [x] `.agents/skills/merge-test/SKILL.md`, `.agents/skills/implement/SKILL.md`, `.agents/skills/done/SKILL.md`: root dirty/stash를 다루는 단계가 있는지 다시 검색하고, 동일 owner 계획서 예외가 merge-test에만 필요한지 판정 근거를 기록
   - [x] `docs/archive/2026-04-17_port-coupang-mega-beauty-floor-map.md`, 이번 세션 로그 근거: 경로별로 "방어 필요 / 이미 방어됨 / 범위 외"를 표로 남길 TODO를 계획서에 반영

6. - [x] **미방어 경로가 있으면 후속 범위를 결정한다**
   - [x] `.agents/skills/implement/SKILL.md` 또는 `.agents/skills/done/SKILL.md`까지 같은 owner 계획서 dirty guard가 필요하면 별도 후속 plan 분리 기준을 적는다
   - [x] merge-test만 수정하면 충분하다면 그 이유를 "현재 재발 경로는 merge 직전 stash/apply뿐"이라는 근거로 명시

재발 경로 판정표:

| 경로 | 관찰 근거 | 판정 |
|---|---|---|
| `.agents/skills/merge-test/SKILL.md` | root dirty를 stash 후 merge, 다시 `stash apply`하는 유일한 경로 | **방어 필요** |
| `.agents/skills/implement/SKILL.md` | root가 `main`이 아닐 때만 신규 worktree 생성을 위해 일회성 stash/apply를 수행하고, merge는 시작하지 않음 | 이미 owner scope 밖. **범위 외** |
| `.agents/skills/done/SKILL.md` | 활성 branch/worktree가 있으면 hard-stop 하며 merge/stash 절차가 없음 | **이미 방어됨** |
| `docs/archive/2026-04-17_port-coupang-mega-beauty-floor-map.md` + 이번 세션 로그 | 사건 기록은 archive에 남아 있지만, 수정 규칙은 reflect fix plan으로 분리하는 편이 맞음 | archive 본문 수정 불필요, **계획서에만 근거 기록** |

후속 범위 결론:
- 현재 재발 경로는 `merge-test`의 merge 직전 stash/apply뿐이다.
- `implement`와 `done`은 동일 owner 계획서 dirty를 merge 이후에 다시 적용하는 경로가 아니므로, 이번 fix 범위는 `merge-test` 문구 보강으로 한정한다.

### Phase 3: 문서와 회고 산출물을 정렬한다

7. - [x] **이번 사건의 원인과 수정 방향을 문서에 남긴다**
   - [x] `docs/archive/2026-04-17_port-coupang-mega-beauty-floor-map.md`: 이번 구현 archive에는 workflow 충돌 자체를 다시 섞지 않고, reflect plan으로 분리했다는 점만 필요 여부 검토
   - [x] `TODO.md`: 이 fix plan을 Pending으로 추가하고 진행률을 `0/16 (0%)`로 연결

8. - [x] **완료 기준을 검증 가능한 문장으로 고정한다**
   - [x] `.agents/skills/merge-test/SKILL.md`: 최종 완료 기준을 "같은 owner 계획서 dirty가 있으면 stash 전에 중단, unrelated dirty만 stash" 한 문장으로 넣는다
   - [x] 계획서 본문: 수동 재현 시나리오를 "root에 parent plan dirty 생성 -> merge-test 실행 -> stash 전 hard-stop" 형태로 적어 구현자가 바로 검증할 수 있게 만든다

수동 재현 시나리오:
1. root `main`에서 현재 `parent_plan_path` 또는 같은 `> worktree-owner:`를 가진 sibling plan/TODO 문서를 dirty 상태로 만든다.
2. 현재 impl branch에 대해 `merge-test`를 실행한다.
3. 기대 결과: `MERGE_PRECHECK_FAILED[owner_plan_dirty]`가 출력되고, stash/merge는 시작되지 않으며 root/main, worktree, branch 상태가 그대로 유지된다.

---

*상태: 구현중 | 진행률: 16/16 (100%)*
