# fix: implement merge-test status gate mismatch

> 완료일: 2026-04-18
> 아카이브됨
> 진행률: 14/14 (100%)
> 작성일시: 2026-04-17 19:05
> 기준커밋: 16ee892
> 대상 프로젝트: expo-harvest
> 상태: 구현완료
> 반영일시: 2026-04-18 00:59
> 머지커밋: 892d0ff
> 진행률: 14/14 (100%)
> 출처: /review에서 자동 생성
> 요약: `implement` 흐름에서는 워크트리 구현 직후 plan 상태를 `머지대기`로 올릴 수 있는데, `merge-test`는 여전히 `구현중` 상태만 허용하도록 적혀 있어 실제 완료 직후 `merge-test`가 차단될 수 있다. 이후 `done`은 활성 `branch/worktree`가 남아 있으면 중단되므로, 세 스킬 사이에서 완료 흐름이 막히는 deadlock 성격의 절차 불일치가 발생한다.
> 재검토일시: 2026-04-18
> 재검토 결론: 적용한다. 2026-04-18 기준 `merge-test`에는 `owner_plan_dirty` preflight가 추가됐지만, 상태 게이트는 여전히 `구현중`만 허용하고 있어 본 계획의 핵심 불일치는 그대로 남아 있다.

---

## 개요

이번 세션에서 `fix-coupang-mega-beauty-hardcoded-review-data` 구현은 워크트리 브랜치까지 정상적으로 완료됐지만, 후속 `/merge-test` 진입 시 스킬 문구상 전제조건이 `상태: 구현중`으로 고정돼 있어 plan이 `머지대기`일 경우 바로 진행할 수 없는 상황이 드러났다. 반면 `implement` 스킬의 상태 표는 `머지대기`를 정식 런타임 단계로 정의하고 있고, 실제 구현 완료 후 사용자가 머지 전 대기 상태를 확인할 수 있게 계획서를 그렇게 올리는 흐름도 자연스럽다.

이 불일치는 단순 문구 차이가 아니라 워크플로우 차단으로 이어진다. `done` 스킬은 활성 `branch/worktree`가 남아 있으면 `/merge-test`를 먼저 실행하라고 hard-stop 하기 때문에, `merge-test`가 `머지대기`를 거부하면 사용자는 구현 완료 이후에도 정상적인 완료 처리 경로를 밟을 수 없다. 이번 계획의 목적은 `implement`, `merge-test`, `done` 세 스킬의 상태 계약을 다시 맞춰 "구현 완료 직후 머지 대기 → merge-test → done" 흐름이 중단되지 않도록 정리하는 것이다.

## 기술적 고려사항

- `.agents/skills/implement/SKILL.md`는 상태 표에 `머지대기`를 포함하고 있고, 실제 완료 단계 설명도 `verify/test 통과 후 머지 대기`로 정의한다.
- `.agents/skills/merge-test/SKILL.md`의 전제 조건은 현재 `plan 상태가 구현중`이라고 고정돼 있어, 같은 프로젝트 내부 스킬 간 상태 계약이 서로 다르다.
- `.agents/skills/done/SKILL.md`는 `branch/worktree`가 남아 있으면 `/merge-test`를 먼저 실행하라고 중단시키므로, `merge-test`가 좁은 상태 조건을 유지하면 사용자가 우회 경로 없이 막힌다.
- 2026-04-18 현재 `.agents/skills/merge-test/SKILL.md`는 `MERGE_PRECHECK_FAILED[owner_plan_dirty]` guard를 추가했지만, 전제 조건과 실패 메시지는 아직 `구현중` 고정 상태다.
- 이번 수정은 코드가 아니라 스킬 문서/워크플로우 규칙 정합성 문제이므로, 대상은 `.agents/skills/*.md` 범위로 한정하고 앱 코드나 사용자 기능 계획과 섞지 않는다.

## 검증 메모

- 재발 경로 기준: `implement 완료 -> plan 상태 머지대기 -> merge-test 호출 -> 정상 진입`
- done 연계 기준: `done 호출 -> 활성 worktree 감지 -> merge-test 안내 -> merge-test 정상 진입`
- `owner_plan_dirty` preflight는 root 문서 dirty 충돌을 막는 별도 guard이며, 이번 계획이 다루는 상태 deadlock 해소와는 별개다.

---

## TODO

### Phase R: 재발 경로 분석

0. [x] **상태 전이 deadlock이 만들어지는 경로를 문서로 고정한다**
   - [x] `.agents/skills/implement/SKILL.md`, `.agents/skills/merge-test/SKILL.md`, `.agents/skills/done/SKILL.md`: 각 스킬이 기대하는 plan 상태와 `branch/worktree` 전제조건을 나란히 비교해 충돌 지점을 기록한다.
   - [x] `docs/plan/2026-04-17_fix-implement-merge-test-status-gate.md`: `implement 완료 -> plan 머지대기 -> merge-test 거부 -> done 거부` 순서의 재발 경로를 한 문단으로 명시한다.

### Phase 1: 상태 계약의 기준값을 확정한다

1. [x] **머지 직전 허용 상태를 하나로 정한다**
   - [x] `.agents/skills/implement/SKILL.md`: 구현 종료 시점에 `구현중`을 유지해야 하는지, `머지대기`로 올려도 되는지 현재 문구를 다시 읽고 기준 상태를 결정한다.
   - [x] `.agents/skills/merge-test/SKILL.md`: 전제조건을 `구현중`만 허용할지, `머지대기`도 정상 허용할지 사용자 흐름 기준으로 판정 근거를 적는다.

2. [x] **done 차단 규칙과 merge-test 상태 규칙을 함께 맞춘다**
   - [x] `.agents/skills/done/SKILL.md`: `branch/worktree` 존재 시 merge-test 선행을 요구하는 현재 hard-stop 문구가 유지되어야 하는지 확인한다.
   - [x] `.agents/skills/merge-test/SKILL.md`, `.agents/skills/done/SKILL.md`: `done`이 요구하는 선행 흐름과 `merge-test`의 허용 상태가 서로 모순되지 않게 기준 문장을 정리한다.

### Phase 2: merge-test 진입 조건을 수정한다

3. [x] **merge-test 전제조건 문구를 상태 계약에 맞게 보정한다**
   - [x] `.agents/skills/merge-test/SKILL.md`: "plan 상태가 구현중" 고정 문구를 허용 상태 집합 기준으로 바꾼다.
   - [x] `.agents/skills/merge-test/SKILL.md`: 실패 메시지도 새 허용 상태에 맞게 갱신해, 실제로 어떤 상태에서만 중단되는지 명확히 적는다.

4. [x] **상태 전이 예시를 현재 규칙과 맞춘다**
   - [x] `.agents/skills/merge-test/SKILL.md`: 전제 조건 섹션 또는 예시 로그에 `머지대기` plan에서 정상 진입하는 흐름을 추가한다.
   - [x] `.agents/skills/implement/SKILL.md`, `.agents/skills/merge-test/SKILL.md`: 상태 표와 실행 예시가 서로 다른 상태 이름을 쓰지 않는지 교차 확인한다.

### Phase 3: 구현 후 안내 흐름을 다시 맞춘다

5. [x] **implement 종료 안내가 merge-test와 충돌하지 않게 정리한다**
   - [x] `.agents/skills/implement/SKILL.md`: 구현 완료 후 사용자가 보게 되는 상태/다음 단계 설명이 실제 `merge-test` 진입 조건과 일치하도록 수정한다.
   - [x] `.agents/skills/merge-test/SKILL.md`: `머지대기` 또는 동등 상태에서 사용자가 곧바로 이 스킬을 호출해도 되는지 안내 문구를 명시한다.

6. [x] **done 차단 메시지도 최종 흐름 기준으로 맞춘다**
   - [x] `.agents/skills/done/SKILL.md`: 활성 worktree가 남아 있을 때 출력하는 중단 메시지가 현재 상태 계약을 오해 없이 설명하는지 검토한다.
   - [x] `.agents/skills/done/SKILL.md`, `.agents/skills/merge-test/SKILL.md`: 사용자가 `/done`에서 `/merge-test`로 이동한 뒤 다시 막히지 않도록 메시지 톤과 상태 용어를 통일한다.

### Phase 4: 재발 방지 검증을 남긴다

7. [x] **수동 재현 시나리오를 계획서에 남긴다**
   - [x] `docs/plan/2026-04-17_fix-implement-merge-test-status-gate.md`: `implement로 worktree 완료 -> plan 상태 머지대기 -> merge-test 호출 -> 정상 진입` 시나리오를 검증 항목으로 적는다.
   - [x] `docs/plan/2026-04-17_fix-implement-merge-test-status-gate.md`: `done 호출 시 활성 worktree 감지 -> merge-test 안내 -> merge-test 정상 진입` 흐름도 함께 적는다.

---

*상태: 구현완료 | 진행률: 14/14 (100%)*
