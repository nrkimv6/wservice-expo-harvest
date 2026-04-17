# fix: preview process cleanup before raw build smoke

> 작성일시: 2026-04-18 01:01
> 기준커밋: 3232c81
> 대상 프로젝트: expo-harvest
> 상태: 검토완료
> 진행률: 0/8 (0%)
> 출처: /review에서 자동 생성
> 요약: 이번 세션에서 `npm run build:raw`가 `.svelte-kit/cloudflare` 잠금(`EPERM`)으로 한 번 실패했고, 원인은 살아 있던 `vite preview` 프로세스였다. 현재 프로젝트는 `check -> build:raw -> preview` smoke 순서를 쓰지만, preview 잔존 프로세스를 어떻게 정리할지 계약이 없어 같은 실패가 수동 검증과 `/merge-test` 후속 smoke에서 반복될 수 있다.

---

## 개요

햄버거 회귀 검증을 진행하는 동안 `npm run build:raw`가 adapter-cloudflare 단계에서 `.svelte-kit/cloudflare`를 정리하지 못해 실패했다. 확인 결과 기존 `npm run preview`/`vite preview` 프로세스가 남아 있었고, 해당 프로세스를 정리한 뒤에는 같은 명령이 정상 통과했다. 즉, 현재 문제는 앱 코드가 아니라 **raw build smoke를 다시 돌리기 전에 preview 잔존 프로세스를 어떻게 처리할지에 대한 운영 계약 부재**다.

현재 `scripts/run-build.mjs`는 `npm run build` 경로에서 dev 서버를 감지하고 더 이른 실패 메시지를 주지만, `build:raw`는 의도적으로 그 wrapper를 우회한다. 반면 후속 smoke나 회귀 재현에서는 `build:raw -> preview` 조합이 계속 등장한다. 이번 계획의 목표는 preview 잔존 프로세스가 있을 때 어떤 preflight를 거치고, 그 책임을 스크립트/스킬/문서 중 어디에 둘지 정리해 같은 `EPERM` 수동 복구를 반복하지 않게 만드는 것이다.

## 기술적 고려사항

- [`package.json`](D:/work/project/service/wtools/expo-harvest/package.json): `build:raw`는 raw `vite build` 경로라 `scripts/run-build.mjs`의 preflight 보호를 받지 않는다.
- [`scripts/run-build.mjs`](D:/work/project/service/wtools/expo-harvest/scripts/run-build.mjs): 현재 guard는 dev 서버 감지에 집중돼 있고, 이미 살아 있는 preview 프로세스 정리나 raw build 전 handoff 규칙은 담당하지 않는다.
- [`docs/plan/2026-04-18_fix-hamburger-menu-cache-regression.md`](D:/work/project/service/wtools/expo-harvest/docs/plan/2026-04-18_fix-hamburger-menu-cache-regression.md): smoke 순서가 `check -> build:raw -> preview`로 정리됐지만, 이전 preview 프로세스가 남아 있을 때의 정리 절차는 없다.
- [`.agents/skills/merge-test/SKILL.md`](D:/work/project/service/wtools/expo-harvest/.agents/skills/merge-test/SKILL.md), [`.agents/skills/webapp-testing/SKILL.md`](D:/work/project/service/wtools/expo-harvest/.agents/skills/webapp-testing/SKILL.md): build/preview 검증 경로를 안내하지만 preview ownership과 cleanup 시점을 강제하지 않는다.
- [`scripts/kill-orphan-procs.ps1`](D:/work/project/service/wtools/expo-harvest/scripts/kill-orphan-procs.ps1): 현재 done 전 pytest 계열 orphan 정리에 쓰인다. preview cleanup을 여기에 흡수할지, 별도 helper로 둘지 범위 판단이 필요하다.

---

## TODO

### Phase R: 실패 경로를 기준화한다

1. - [ ] **raw build가 preview 잔존 프로세스에 막히는 재현 경로를 문서로 고정한다** — 이후 수정이 실제 실패를 겨냥했는지 흔들리지 않게 만든다
   - [ ] `docs/plan/2026-04-18_fix-preview-process-cleanup-before-raw-build-smoke.md`: 이번 세션의 `npm run build:raw -> EPERM -> preview 프로세스 종료 -> 재실행 성공` 순서를 검증 메모 기준으로 적는다.
   - [ ] `package.json`, `scripts/run-build.mjs`: `build`와 `build:raw`가 서로 다른 guard 경로를 가진다는 사실을 다시 읽고 본문에 책임 경계를 명확히 적는다.

### Phase 1: cleanup 책임을 어디에 둘지 정한다

2. - [ ] **smoke 순서와 cleanup owner를 확정한다** — raw build 전 preflight를 어느 계층이 맡는지 결정
   - [ ] `.agents/skills/merge-test/SKILL.md`, `.agents/skills/webapp-testing/SKILL.md`: 수동 smoke와 merge 이후 smoke에서 preview cleanup 지시를 스킬 계약으로 강제할지 읽고 비교한다.
   - [ ] `docs/plan/2026-04-18_fix-hamburger-menu-cache-regression.md`: 이미 문서화된 smoke 순서를 다시 보고, 이 후속이 햄버거 회귀 plan의 범위를 넘어서는 공통 운영 규칙인지 판단한다.

3. - [ ] **preview 정리 수단을 결정한다** — 문서 지시만으로 끝낼지 helper/script까지 둘지 판정
   - [ ] `scripts/kill-orphan-procs.ps1`: 기존 orphan cleanup 스크립트가 preview/vite 프로세스까지 맡아도 되는 범위인지 확인한다.
   - [ ] `scripts/`, `.agents/skills/`: 새 helper가 필요하면 어디에 둘지, 아니면 PowerShell one-liner 문서화로 충분한지 선택 근거를 남긴다.

### Phase 2: preflight와 smoke handoff를 설계한다

4. - [ ] **raw build 재실행 전에 필요한 preflight를 설계한다** — stale preview 때문에 같은 EPERM이 재발하지 않게 만든다
   - [ ] `package.json`, `scripts/run-build.mjs`: `build:raw` 자체를 감쌀지, `merge-test/webapp-testing` 단계에서만 cleanup을 강제할지 수정 후보를 정리한다.
   - [ ] `.agents/skills/merge-test/SKILL.md`, `.agents/skills/webapp-testing/SKILL.md`: 실패 시 어떤 메시지와 어떤 종료 조건을 보여줄지 문구 초안을 잡는다.

5. - [ ] **preview handoff 문구를 짧게 고정한다** — smoke 실행자가 build와 preview 순서를 헷갈리지 않게 만든다
   - [ ] `docs/plan/2026-04-18_fix-preview-process-cleanup-before-raw-build-smoke.md`: `build:raw` 전 preview 종료, preview 후 포트 확인, 재검증 순서를 한두 문장 운영 규칙으로 정리한다.
   - [ ] `.agents/skills/webapp-testing/SKILL.md` 또는 관련 안내 문서: preview를 다시 띄우기 전 이전 프로세스를 정리해야 한다는 점을 짧은 helper copy 수준으로 남긴다.

### Phase 3: 검증 기준을 남긴다

6. - [ ] **실패 재현과 복구 성공을 모두 검증 대상으로 남긴다** — 단순 성공 사례만 적지 않는다
   - [ ] `scripts/kill-orphan-procs.ps1` 또는 새 helper 후보: preview가 남아 있을 때 탐지/정리가 되는지 검증 시나리오를 계획서에 적는다.
   - [ ] `package.json`, `.agents/skills/merge-test/SKILL.md`: cleanup 후 `npm run build:raw`, `npm run preview`를 다시 순서대로 돌려 smoke가 회복되는지 확인 항목으로 적는다.

7. - [ ] **기존 build wrapper 계약과 충돌하지 않게 경계를 남긴다** — 새 규칙이 `npm run build`의 의미를 흐리지 않게 유지
   - [ ] `scripts/run-build.mjs`: 기존 dev-server guard가 계속 `npm run build` 전용이라는 점을 유지해야 하는지 확인한다.
   - [ ] `.agents/skills/merge-test/SKILL.md`, `.agents/skills/webapp-testing/SKILL.md`: raw build smoke와 wrapper build의 쓰임새를 섞지 않는 설명을 남긴다.

### Phase 4: 운영 메모를 마감한다

8. - [ ] **후속 구현자가 바로 닫을 수 있게 증거 포맷을 남긴다** — 다음 세션이 같은 로그를 다시 재구성하지 않게 만든다
   - [ ] `docs/plan/2026-04-18_fix-preview-process-cleanup-before-raw-build-smoke.md`: 실패 명령, 종료코드, 잠금 원인 프로세스, 성공 재실행 명령을 짧은 검증 메모 형식으로 고정한다.
   - [ ] `TODO.md`: 구현 대기 항목으로 연결할 때 진행률이 `0/8`로 맞는지 확인한다.

---

*상태: 검토완료 | 진행률: 0/8 (0%)*
