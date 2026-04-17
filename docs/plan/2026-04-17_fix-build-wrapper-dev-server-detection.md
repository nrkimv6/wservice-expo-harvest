# fix: build wrapper dev-server detection blind spot

> 작성일시: 2026-04-17 10:12
> 기준커밋: 6835b16
> 대상 프로젝트: expo-harvest
> 상태: 초안
> 진행률: 0/12 (0%)
> 요약: `npm run build`가 이번 세션에서도 `.svelte-kit/cloudflare` 잠금으로 실패했지만, `scripts/run-build.mjs`의 사전 감지는 이를 먼저 잡지 못했다. 현재 wrapper는 Win32_Process CommandLine 기반 탐지만 사용하므로, 명령행이 비어 있거나 부모/자식 프로세스 형태로 남는 dev 서버를 놓치는 경로를 보강해야 한다.
> 출처: /review에서 자동 생성

---

## 개요

Windows 로컬에서 `npm run dev`가 살아 있는 상태면 `npm run build`가 `.svelte-kit/cloudflare`를 정리하는 마지막 adapter 단계에서 `EPERM`으로 실패할 수 있다. 이 문제를 줄이기 위해 `scripts/run-build.mjs`에 사전 감지 wrapper를 넣었지만, 이번 세션에서는 wrapper preflight가 통과한 뒤 실제 build 마지막 단계에서만 다시 실패했다. 목표는 repo 범위를 벗어나지 않는 선에서 dev 서버 탐지 정확도를 높여, 사용자가 더 이른 시점에 명확한 실패 메시지를 받도록 만드는 것이다.

## 기술적 고려사항

- 기존 계약처럼 탐지는 `expo-harvest` repo 범위로 제한해야 하며, 다른 프로젝트의 generic `node` 프로세스를 오탐하면 안 된다.
- `Win32_Process.CommandLine`이 비어 있는 프로세스가 실제로 존재하므로, 현재 조건식만으로는 dev 서버를 놓칠 수 있다.
- fallback은 포트/프로세스 트리/작업 디렉터리처럼 repo 범위를 유지하는 신호를 우선 검토해야 한다.
- README와 보고서 문구는 최종 탐지 방식과 재시도 경로(`npm run build:raw`)를 다시 맞춰야 한다.

---

## TODO

### Phase 1: blind spot 재현 경로를 고정한다

1. - [ ] **현재 wrapper 탐지 누락 조건을 재현 로그 기준으로 정리한다** — 무엇을 놓쳤는지 먼저 문서화
   - [ ] `scripts/run-build.mjs`: 현재 `getWindowsRepoDevProcesses()`가 의존하는 입력(`CommandLine`, repo path, dev 명령 regex)을 주석과 함께 다시 읽고 누락 가능 조건을 적는다.
   - [ ] `docs/report/2026-04-17_hamburger-menu-and-hashtag-trim.md`: 이번 세션의 `EPERM` 실패 기록을 근거로 "preflight 통과 후 adapter 단계 실패"가 재현됐음을 요약 메모로 남길 위치를 정한다.

### Phase 2: repo 한정 fallback 탐지를 설계한다

2. - [ ] **CommandLine 공백 프로세스를 보완할 repo-한정 신호를 결정한다** — 오탐 없이 blind spot만 메우기
   - [ ] `scripts/run-build.mjs`: `Win32_Process` 외에 사용할 수 있는 후보 신호를 정리한다. 예: 부모/자식 프로세스 트리, `Get-NetTCPConnection` + repo 실행 포트, 현재 작업 디렉터리 기반 힌트.
   - [ ] `scripts/run-build.mjs`: 후보별로 "repo 범위 제한 가능 여부 / 오탐 위험 / 구현 난이도"를 짧은 결정표로 정리하고 최종 1개만 선택한다.

### Phase 3: wrapper와 안내 문구를 보강한다

3. - [ ] **사전 감지 로직을 선택한 fallback까지 확장한다** — 최종 build 직전이 아니라 preflight에서 잡히게 만들기
   - [ ] `scripts/run-build.mjs`: 기존 CommandLine 탐지가 실패해도 선택한 fallback 신호로 동일 repo의 dev 서버를 판정하는 분기를 추가한다.
   - [ ] `scripts/run-build.mjs`: fallback이 발동한 경우에도 현재와 동일한 clear failure message를 출력하고 종료코드를 유지하도록 맞춘다.

4. - [ ] **문서와 운영 안내를 새 탐지 계약에 맞춘다** — 사용자가 재현/회피 경로를 혼동하지 않게 유지
   - [ ] `README.md`: `npm run build` wrapper 설명을 새 탐지 방식과 함께 갱신하고, 언제 `build:raw`를 써야 하는지 다시 적는다.
   - [ ] `docs/report/*.md` 또는 신규 보고서: 이번 보강이 기존 build-lock fix의 후속임을 기록하고, "preflight miss → adapter EPERM" 재현 경로가 닫혔는지 남긴다.

### Phase 4: Windows 로컬 검증을 다시 고정한다

5. - [ ] **dev on/off 두 경로를 모두 다시 검증한다** — 성공/실패가 기대 지점에서 일어나는지 확인
   - [ ] `package.json`, `scripts/run-build.mjs`: dev 미실행 상태에서 `npm run check`, `npm run build`가 통과하는지 확인하는 검증 절차를 적는다.
   - [ ] `package.json`, `scripts/run-build.mjs`: dev 실행 상태에서 `npm run build`가 adapter 단계까지 가지 않고 preflight에서 명시적으로 실패하는지 확인하는 검증 절차를 적는다.

---

*상태: 초안 | 진행률: 0/12 (0%)*
