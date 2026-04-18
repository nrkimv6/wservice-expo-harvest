# fix: agent merge completion reporting guard

> 작성일시: 2026-04-18 02:25
> 출처: /review에서 자동 생성
> 대상 프로젝트: expo-harvest
> 상태: 초안
> 진행률: 0/8 (0%)
> 요약: 이번 세션에서 worktree 구현물은 준비됐지만 `main` 머지 전인데도 완료율을 `100%`로 보고했고, root 문서 변경을 이유로 "머지 불가"라고 단정했다가 이후 실제로는 코드와 문서를 모두 `main`에 반영했다. merge 상태와 보고 문구 사이의 증거 기준이 없어서 같은 오보고가 반복될 수 있으므로, 로컬 skill 문구와 완료 보고 계약을 보강한다.

---

## 개요

이번 후속은 앱 코드가 아니라 로컬 workflow 문구와 완료 보고 기준을 다룬다. 실제 구현 자체는 정상 완료됐지만, 세션 중 "코드 100%"와 "전체 100%"를 섞어 말했고, `main` worktree의 문서 dirty를 이유로 머지를 불가능하다고 단정했다. 이후 확인 결과 코드는 `main`에 체리픽으로 반영 가능했고, 문서도 내가 수정한 파일만 골라 별도 커밋으로 마무리할 수 있었다.

즉 문제는 merge 자체보다 "언제 완료라고 말해도 되는가", "언제 머지 불가라고 말해도 되는가", "루트 dirty 중 어떤 범위까지 내가 병합 가능한가"에 대한 증거 기준 부재다. 이번 계획은 `.agents/skills/implement`, `.agents/skills/merge-test`, `.agents/skills/done`의 안내 문구와 검증 절차를 보강해, worktree 검증 완료와 `main` 반영 완료를 구분해서 보고하도록 만드는 데 목적이 있다.

## 기술적 고려사항

- [`.agents/skills/implement/SKILL.md`](D:/work/project/service/wtools/expo-harvest/.agents/skills/implement/SKILL.md): 구현 완료 후 worktree 검증까지 마친 상태와 `main` 반영 완료 상태를 구분하는 보고 문구가 약해, 에이전트가 진행률을 과대 보고할 수 있다.
- [`.agents/skills/merge-test/SKILL.md`](D:/work/project/service/wtools/expo-harvest/.agents/skills/merge-test/SKILL.md): merge 성공/실패 후 어떤 표현을 써야 하는지, root dirty가 있어도 "내가 수정한 파일만 병합 가능"한 경우와 진짜 hard-stop을 구분하는 표현 계약이 더 필요하다.
- [`.agents/skills/done/SKILL.md`](D:/work/project/service/wtools/expo-harvest/.agents/skills/done/SKILL.md): 활성 branch/worktree 게이트는 있지만, 이미 `main`에 반영된 뒤 최종 보고에서 어떤 증거를 다시 확인해야 하는지는 구체적이지 않다.
- [`docs/plan/2026-04-18_fix-preview-process-cleanup-before-raw-build-smoke.md`](D:/work/project/service/wtools/expo-harvest/docs/plan/2026-04-18_fix-preview-process-cleanup-before-raw-build-smoke.md): 이번 세션의 `build:raw` 실패 이력은 이미 별도 후속으로 열려 있으므로, 이번 계획은 검증 명령 실패 자체가 아니라 merge/보고 계약 문제에만 집중해야 한다.
- 이번 세션 로그 기준 재발 경로는 `worktree 검증 완료 -> root dirty 감지 -> 머지 불가 단정 또는 100% 보고 -> 사용자 교정 -> root에서 선택적 문서 커밋/코드 반영 가능 확인` 순서였다.

---

## TODO

### Phase 1: 완료/머지 상태 용어를 다시 정의한다

1. [ ] **worktree 완료와 main 완료를 분리하는 보고 용어를 고정한다** — 진행률 과대 보고를 막는다
   - [ ] `.agents/skills/implement/SKILL.md`: worktree에서 `check/build:raw`까지 끝난 상태를 어떤 표현으로 보고해야 하는지, `100%` 표현 금지 조건을 포함해 정리한다.
   - [ ] `.agents/skills/done/SKILL.md`: `main` 반영 완료 전에는 "코드 준비 완료", "merge 필요", "문서 미반영" 같은 중간 상태 문구를 우선하도록 보강한다.

2. [ ] **머지 불가와 선택적 병합 가능 상태를 구분하는 기준을 명시한다** — root dirty가 있어도 내 수정 범위를 병합할 수 있는지 먼저 판단하게 만든다
   - [ ] `.agents/skills/merge-test/SKILL.md`: root dirty가 있어도 현재 작업 파일과 무관한 경우, 혹은 내가 수정한 문서만 따로 add/commit 가능한 경우를 hard-stop과 분리해 설명한다.
   - [ ] `.agents/skills/done/SKILL.md`: "내가 수정한 파일이면 병합/커밋 가능, 타인 변경이면 보류" 판단 기준을 완료 안내 전에 다시 확인하도록 넣는다.

### Phase 2: 최종 보고 전에 증거를 재검증하는 절차를 추가한다

3. [ ] **최종 완료 보고 전 증거 명령을 고정한다** — 말보다 git 상태를 먼저 확인하게 만든다
   - [ ] `.agents/skills/done/SKILL.md`: 최종 완료 안내 전에 최소 `git status --short`, `git worktree list`, `git branch --show-current`, 최근 커밋 확인을 하라는 체크를 추가한다.
   - [ ] `.agents/skills/merge-test/SKILL.md`: merge 성공 직후 "현재 브랜치가 main인지", "대상 commit이 main HEAD에 있는지"를 보고 문구와 같이 확인하도록 적는다.

4. [ ] **문서 병합 범위를 화이트리스트 방식으로 재강조한다** — root dirty 전체를 이유로 멈추지 않게 만든다
   - [ ] `.agents/skills/done/SKILL.md`: root에 다른 문서 수정이 있어도 이번 실행이 수정한 문서만 add/commit하는 화이트리스트 원칙을 다시 명시한다.
   - [ ] `.agents/skills/merge-test/SKILL.md`: merge 후 문서 후처리에서 "관련 파일만 선택 add" 예시를 추가해 전체 dirty를 병합 불가 사유로 과잉 해석하지 않게 한다.

5. [ ] **사용자 응답 템플릿에 상태 분리 문구를 넣는다** — "코드 100%"와 "전체 완료"를 혼동하지 않게 한다
   - [ ] `.agents/skills/implement/SKILL.md`, `.agents/skills/done/SKILL.md`: worktree 완료, main merge 완료, 문서 미반영, 수동 확인만 남음 상태별 예시 문구를 짧게 추가한다.
   - [ ] `.agents/skills/merge-test/SKILL.md`: merge 불가/보류를 설명할 때 "왜 지금은 못 하는지"와 "무엇은 바로 할 수 있는지"를 같이 쓰도록 예시를 정리한다.

### Phase R: 재발 경로 분석

6. [ ] **이번 세션의 오보고 재발 경로를 각 스킬 단계에 매핑한다** — 어느 단계에서 방어해야 하는지 명확히 한다
   - [ ] `.agents/skills/implement/SKILL.md`, `.agents/skills/merge-test/SKILL.md`, `.agents/skills/done/SKILL.md`: `worktree 완료 -> merge 필요 -> main 반영 -> 문서 마무리` 흐름을 나란히 대조해 오보고가 끼어들 수 있는 지점을 표시한다.
   - [ ] 계획서 본문: "root dirty 때문에 머지 불가라고 단정"과 "main 미반영인데 100% 보고"를 별도 재발 경로로 적고, 각 경로의 방어 기준을 연결한다.

### Phase 3: 검증과 후속 연결을 고정한다

7. [ ] **문구 보강이 기존 workflow를 깨지 않는지 확인한다** — 상태 계약 충돌을 방지한다
   - [ ] `.agents/skills/implement/SKILL.md`, `.agents/skills/merge-test/SKILL.md`, `.agents/skills/done/SKILL.md`: 서로 같은 상태 용어(`구현중`, `머지대기`, `main 반영 완료`)를 쓰는지 교차 검토한다.
   - [ ] `docs/archive/2026-04-17_fix-implement-merge-test-status-gate.md`: 기존 상태 게이트 fix와 이번 보고 문구 보강이 겹치지 않고 상위/하위 관계인지 대조한다.

8. [ ] **검증 실패 이력과 후속 계획 연결을 문서에 남긴다** — reflect 결과가 흩어지지 않게 한다
   - [ ] `docs/plan/2026-04-18_fix-preview-process-cleanup-before-raw-build-smoke.md`: 이번 세션 build 실패 후속은 기존 계획으로 이어지고, 이번 계획은 보고 계약 보강이라는 점을 본문 또는 재검토 메모에서 분리한다.
   - [ ] `TODO.md`: 새 follow-up plan을 Pending에 추가하고, reflect에서 생성한 후속 계획이라는 맥락이 유지되게 한다.

---

*상태: 초안 | 진행률: 0/8 (0%)*
