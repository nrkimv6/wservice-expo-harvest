# fix: dev 서버 실행 중 build 잠금 충돌 방지

> 작성일시: 2026-04-16 19:01
> 기준커밋: 116270c
> 대상 프로젝트: expo-harvest
> 상태: 초안
> 진행률: 0/13 (0%)
> 요약: 이번 세션에서 `npm run build`가 dev 서버 실행 중 `EPERM, Permission denied: .svelte-kit\cloudflare`로 실패했다. Windows에서 dev와 build가 같은 Cloudflare 출력 경로를 동시에 건드리는 동안 실패 원인이 사용자에게 투명하게 드러나지 않으므로, 사전 감지와 실패 메시지, 문서화 경로를 먼저 고정한다.
> 출처: /review에서 자동 생성

---

## 개요

현재 `expo-harvest`의 `build` 스크립트는 단순히 `vite build`를 실행한다. 하지만 Windows 로컬 개발 환경에서는 `npm run dev`가 살아 있는 상태에서 `adapter-cloudflare`가 `.svelte-kit\cloudflare`를 정리하는 순간 파일 잠금 충돌이 발생할 수 있다. 이번 세션에서도 같은 증상이 실제로 재현됐다.

이 계획의 목표는 로컬에서 `build`를 실행할 때 충돌을 조기에 감지하고, 사용자가 원인을 바로 이해할 수 있는 실패 메시지를 받도록 하는 것이다. CI/배포 경로는 유지하고, 로컬 보조 스크립트와 문서만 최소 범위로 정리한다.

## 기술적 고려사항

- 현재 `package.json`의 `build`는 `vite build` 단일 호출이며, 사전 점검 단계가 없다.
- `svelte.config.js`는 `@sveltejs/adapter-cloudflare`를 사용하고, 출력 경로는 `.svelte-kit\cloudflare`에 모인다.
- 이번 실패는 코드 오류가 아니라 Windows 파일 잠금과 실행 순서 충돌에 가깝다. 단순 재시도보다 사전 감지와 안내가 맞다.
- 새 완화 로직은 로컬 개발 편의 목적이며, 배포/CI의 기본 `vite build` 동작을 깨뜨리면 안 된다.
- 프로젝트에 `scripts\` 디렉터리가 아직 없으므로, 새 스크립트 추가 시 디렉터리 생성부터 포함해야 한다.

---

## TODO

### Phase 1: 충돌 경로 고정 및 로컬 가드 설계

1. - [ ] **현재 build 실패 경로를 코드와 로그 기준으로 고정** — 증상을 재현 가능한 규칙으로 문서화한다
   - [ ] `package.json`: 현재 `build` 스크립트가 `vite build` 단일 호출인지 다시 확인한다
   - [ ] `wrangler.toml`: Cloudflare 출력 경로가 `.svelte-kit\cloudflare`인지 확인해 충돌 지점을 명시한다
   - [ ] `docs/report/2026-04-16_theme-alignment-with-exhibition-loot-boss.md`: 이번 세션의 `EPERM` 실패 사실이 어디까지 기록됐는지 읽고, 새 plan 요약과 중복되지 않게 정리한다

2. - [ ] **로컬 build 사전 점검 방식 결정** — 자동 종료 대신 안전한 실패 안내를 우선한다
   - [ ] `scripts\run-build.mjs`: 새 Node 스크립트 파일을 추가하는 방향으로 결정하고, 책임을 `dev 서버 감지 -> 안내 출력 -> vite build 위임` 3단계로 고정한다
   - [ ] `package.json`: 기존 `build`를 새 wrapper 경유로 바꿀지, `build:safe` 별도 스크립트를 둘지 결정 근거를 plan에 남긴다
   - [ ] `README.md`: 사용자가 `npm run dev` 종료 후 `npm run build`를 실행해야 한다는 로컬 개발 주의사항을 어느 섹션에 넣을지 정한다

### Phase 2: 구현 범위와 검증 경로 명세

3. - [ ] **실제 수정 파일과 동작 계약을 고정** — 구현 시 범위가 번지지 않게 한다
   - [ ] `scripts\run-build.mjs`: Windows에서만 실행 중 `vite`/`node` dev 프로세스를 점검하고, 충돌 후보가 있으면 명시적 에러 메시지와 종료코드를 반환하도록 계약을 적는다
   - [ ] `package.json`: `build` 또는 `build:safe`가 새 wrapper를 호출하고, wrapper 내부에서 최종 `vite build`를 spawn하도록 계약을 적는다
   - [ ] `README.md`: 로컬 build 실패 증상과 해결 절차(`dev 종료 -> build 재실행`)를 짧은 문제해결 섹션으로 추가하도록 명시한다
   - [ ] `docs/report/2026-04-16_theme-alignment-with-exhibition-loot-boss.md` 또는 새 후속 보고 경로: 이번 reflect plan이 해결하려는 실패가 "테마 수정과 무관한 로컬 build 가드"임을 분리해 기록 위치를 정한다

### Phase R: 재발 경로 분석 (fix: plan 필수)

4. - [ ] **수정 대상의 재발 경로를 먼저 열거** — 동일 실패가 반복될 지점을 구현 전에 좁힌다
   - [ ] `package.json`, `README.md`, `docs/report\*.md`: `build`, `vite build`, `.svelte-kit\cloudflare` 문자열을 검색해 사용자 진입 경로를 표로 정리한다
   - [ ] `svelte.config.js`, `wrangler.toml`: Cloudflare adapter/output 관련 설정이 다른 경로로도 같은 잠금 실패를 만들 수 있는지 확인한다
   - [ ] 재발 경로 표를 plan 본문 또는 구현 메모로 남기고, 각 경로를 `방어 예정` 또는 `문서 안내만 필요`로 구분한다

---

## 검증 (프론트엔드 기준)

### 실행 명령

```powershell
cd "D:\work\project\service\wtools\expo-harvest"
npm run check
npm run build
```

### 검증 기준

- [ ] `npm run build`가 dev 서버 미실행 상태에서 계속 성공한다
- [ ] dev 서버 실행 중에는 원인 설명이 포함된 명시적 실패 메시지가 나온다
- [ ] README에 로컬 build 충돌 회피 방법이 기록된다

---

*상태: 초안 | 진행률: 0/13 (0%)*
