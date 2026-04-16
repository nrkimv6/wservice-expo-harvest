# fix: dev 서버 실행 중 build 잠금 충돌 방지

> 작성일시: 2026-04-16 19:01
> 기준커밋: 116270c
> 대상 프로젝트: expo-harvest
> 상태: 구현완료
> 진행률: 31/31 (100%)
> 요약: 이번 세션에서 `npm run build`가 dev 서버 실행 중 `EPERM, Permission denied: .svelte-kit\cloudflare`로 실패했다. Windows에서 dev와 build가 같은 Cloudflare 출력 경로를 동시에 건드리는 동안 실패 원인이 사용자에게 투명하게 드러나지 않으므로, 사전 감지와 실패 메시지, 문서화 경로를 먼저 고정한다.
> 출처: /review에서 자동 생성

---

## 개요

현재 `expo-harvest`의 `build` 스크립트는 단순히 `vite build`를 실행한다. 하지만 Windows 로컬 개발 환경에서는 `npm run dev`가 살아 있는 상태에서 `adapter-cloudflare`가 `.svelte-kit\cloudflare`를 정리하는 순간 파일 잠금 충돌이 발생할 수 있다. 이번 세션에서도 같은 증상이 실제로 재현됐다.

이 계획의 목표는 로컬에서 `build`를 실행할 때 충돌을 조기에 감지하고, 사용자가 원인을 바로 이해할 수 있는 실패 메시지를 받도록 하는 것이다. CI/배포 경로는 유지하고, 로컬 보조 스크립트와 문서만 최소 범위로 정리한다.

## 기술적 고려사항

- 현재 `package.json`의 `build`는 `vite build` 단일 호출이며, 사전 점검 단계가 없다.
- `package.json`의 `dev`/`prepare`/`check`와 `tsconfig.json`은 모두 `.svelte-kit` 루트 산출물을 공유한다.
- `svelte.config.js`의 `adapter-cloudflare()`가 실제 Cloudflare 산출물을 만드는 source of truth이고, `wrangler.toml`은 `.svelte-kit\cloudflare`를 소비하는 설정이다. `wrangler.toml`은 source of truth가 아니라 consumer로만 취급한다.
- 이번 실패는 코드 오류가 아니라 Windows 파일 잠금과 실행 순서 충돌에 가깝다. 단순 재시도보다 사전 감지와 안내가 맞다.
- 전역 `vite`/`node` 프로세스 스캔은 다른 프로젝트까지 오탐할 수 있다. 가드는 이 repo의 작업 디렉터리와 build output 경로 같은 repo/path 기준 신호로 좁혀야 한다.
- build 전용 외부 출력 경로 분리는 `svelte.config.js`, `wrangler.toml`, `tsconfig.json` 소비 경로를 함께 만져야 하므로 이번 fix의 최소 범위보다 크다. 이번 fix는 wrapper 가드 우선으로 본다.
- 새 완화 로직은 로컬 개발 편의 목적이며, `npm run build` 사용자 진입점은 유지하되 raw `vite build` 경로는 별도 스크립트로 남기는 방향이 안전하다.
- 사용자에게 보일 실패 메시지는 wrapper의 `[build] Windows detected a running dev server in this repo while preparing .svelte-kit/cloudflare.` 문장을 기준으로 둔다.
- plan 헤더의 `기준커밋 116270c`는 현재 상위 `wtools` Git에서 바로 해석되지 않았다. main 드리프트 점검은 `작성일시 2026-04-16 19:01` 이후 `expo-harvest` 경로 변경 탐색 fallback으로 처리한다.
- 프로젝트에 `scripts\` 디렉터리가 아직 없으므로, 새 스크립트 추가 시 디렉터리 생성부터 포함해야 한다.

## 계약/참조 메모

| 경로 | 역할 | 비고 |
|------|------|------|
| `package.json` | `build` wrapper, `build:raw` raw entry, `dev`/`prepare`/`check` shared `.svelte-kit` | 사용자 진입점 |
| `svelte.config.js` | Cloudflare 산출물 source of truth | adapter output |
| `wrangler.toml` | `.svelte-kit/cloudflare` consumer | source of truth 아님 |
| `tsconfig.json` | `.svelte-kit/tsconfig.json` consumer | 타입 체인 |
| `docs/report/2026-04-16_theme-alignment-with-exhibition-loot-boss.md` | 테마 정렬 보고 | build-lock fix와 분리 |

---

## TODO

### Phase 1: 충돌 경로 고정 및 로컬 가드 설계

1. - [x] **현재 build/output 계약을 코드 기준으로 고정** — 충돌 설명의 source of truth를 명확히 한다
   - [x] `package.json`: `scripts.build`가 현재 `vite build` 단일 호출인지 확인하고 plan 개요 문구와 맞춘다
   - [x] `package.json`: `scripts.dev`, `scripts.prepare`, `scripts.check`가 `.svelte-kit`를 공유하는지 확인해 충돌 설명에 반영한다
   - [x] `svelte.config.js`: `adapter-cloudflare()`가 실제 Cloudflare 산출물 생성 지점임을 기술적 고려사항과 TODO 설명에 반영한다
   - [x] `wrangler.toml`: `main`, `assets.directory`가 `.svelte-kit/cloudflare` 소비 경로인지 확인하고 source of truth가 아님을 명시한다
   - [x] `tsconfig.json`: `extends`가 `./.svelte-kit/tsconfig.json`인지 확인해 `.svelte-kit` 루트 의존 메모를 추가한다

2. - [x] **이번 세션 증거와 기존 성공 사례를 문서 기준으로 분리** — 재현 조건을 더 좁힌다
   - [x] `docs/report/2026-04-16_theme-alignment-with-exhibition-loot-boss.md`: `EPERM` 실패 기록 위치를 확인하고 테마 정렬 보고와 분리할 메모 위치를 정한다
   - [x] `docs/archive/2026-04-16_port-react-ui-to-svelte.md`: dev 미실행 상태의 `npm run build` 성공 기록을 읽고, "dev 동시 실행 때만 실패"라는 재현 조건을 plan에 반영한다
   - [x] `README.md`: 현재 개발 시작 섹션에서 build 충돌 주의사항을 추가할 위치를 고정한다

### Phase 2: 구현 범위와 검증 경로 명세

3. - [x] **이번 fix를 wrapper 가드 방식으로 고정하고 outDir 분리안은 제외 근거를 남긴다** — 구현 축을 하나로 좁힌다
   - [x] `svelte.config.js`, `wrangler.toml`: build 전용 outDir 분리가 Cloudflare 소비 경로까지 함께 수정해야 하는지 확인하고, 이번 fix 제외 근거를 plan에 적는다
   - [x] `tsconfig.json`: outDir 분리안이 타입 체크 경로까지 함께 흔드는지 확인하고 이번 fix 제외 근거를 plan에 적는다
   - [x] `docs/plan/2026-04-16_fix-build-lock-while-dev-server-running.md`: 해결축을 `wrapper 가드`로 명시하고 `출력 경로 분리`는 후속 후보로 이동한다
   - [x] `docs/plan/2026-04-16_fix-build-lock-while-dev-server-running.md`: 전역 `vite`/`node` 프로세스 스캔은 오탐 위험이 있어 repo/path 기준 신호만 사용한다고 제한을 적는다

4. - [x] **CLI 진입점과 신규 파일 범위를 고정** — 사용자가 계속 `npm run build`를 쓰는 전제를 유지한다
   - [x] `package.json`: `build`를 `node ./scripts/run-build.mjs`로 교체하는 안을 최종 진입점으로 고정한다
   - [x] `package.json`: raw `vite build` 보존용 `build:raw` 스크립트를 추가 대상으로 명시한다
   - [x] `scripts/`: 새 디렉터리 생성 후 `run-build.mjs` 1개만 추가하는 최소 범위로 plan에 적는다

### Phase R: 재발 경로 분석 (fix: plan 필수)

5. - [x] **수정 대상의 호출/참조 경로를 표로 정리** — 어떤 경로를 wrapper가 실제로 막는지 먼저 고정한다
   - [x] `package.json`: `dev`, `build`, `build:raw`, `prepare`, `check`가 `.svelte-kit`와 연결되는 경로를 표로 정리한다
   - [x] `README.md`, `docs/report/2026-04-16_theme-alignment-with-exhibition-loot-boss.md`: 사용자가 `npm run build`를 보게 되는 문서 경로를 표에 기록한다
   - [x] `docs/archive/2026-04-16_port-react-ui-to-svelte.md`: 과거 build 성공 기록을 `archive-only` 경로로 분류해 현재 fix 대상과 분리한다
   - [x] `svelte.config.js`, `wrangler.toml`, `tsconfig.json`: output path chain을 `source of truth` / `consumer` / `type consumer`로 나눠 표에 기록한다

### Phase 3: 구현 계약 고정

6. - [x] **`scripts/run-build.mjs` 동작 계약을 함수 수준으로 쪼갠다** — 구현 중 범위 확장을 막는다
   - [x] `scripts/run-build.mjs`: `process.platform === 'win32'`에서만 잠금 충돌 가드를 켜고, 다른 플랫폼은 바로 `vite build`로 위임하도록 계약을 적는다
   - [x] `scripts/run-build.mjs`: 다른 프로젝트를 오탐하지 않도록 `expo-harvest` 작업 디렉터리와 이 repo의 `.svelte-kit/cloudflare` 경로 신호만 검사하도록 계약을 적고, generic `vite`/`node` 프로세스 열거는 쓰지 않는다고 적는다
   - [x] `scripts/run-build.mjs`: 충돌 감지 시 `.svelte-kit/cloudflare` 경로와 `npm run dev 종료 후 재시도` 문구가 포함된 명시적 오류 메시지를 출력하도록 적는다
   - [x] `scripts/run-build.mjs`: 비충돌 시 `vite build`를 spawn하고 종료코드를 그대로 반환하도록 적는다

7. - [x] **문서 반영 범위를 최소 수정으로 고정** — 구현 후 변경 파일이 번지지 않게 한다
   - [x] `README.md`: 로컬 개발 섹션에 `dev 실행 중 build 충돌` 문제해결 문단 1개만 추가하도록 적는다
   - [x] `docs/report/2026-04-16_theme-alignment-with-exhibition-loot-boss.md`: 이번 fix가 테마 작업과 별개임을 기록하는 메모를 남긴다
   - [x] `docs/plan/2026-04-16_fix-build-lock-while-dev-server-running.md`: 사용자가 보게 될 실패 메시지 예시를 plan 메모에 남길지 여부를 결정한다
   - [x] `docs/DONE.md`: 완료 후 요약 문장을 1줄만 추가한다고 범위를 제한한다

### Phase 4: Windows 재현 검증

8. - [x] **두 터미널 기준 재현 절차를 검증 섹션에 고정** — 완료 판정을 실제 실패 모드에 맞춘다
   - [x] `docs/plan/2026-04-16_fix-build-lock-while-dev-server-running.md`: 터미널 A에서 `npm run dev` 유지, 터미널 B에서 `npm run build` 실행 절차를 검증 섹션에 적는다
   - [x] `docs/plan/2026-04-16_fix-build-lock-while-dev-server-running.md`: dev 미실행 상태에서 `npm run check`, `npm run build`가 모두 성공해야 한다는 기준을 적는다
   - [x] `docs/plan/2026-04-16_fix-build-lock-while-dev-server-running.md`: dev 실행 중 `npm run build`가 명시적 실패 메시지와 비정상 종료코드로 끝나야 한다는 기준을 적는다
   - [x] `docs/plan/2026-04-16_fix-build-lock-while-dev-server-running.md`: dev 종료 후 `npm run build` 재실행이 성공해야 한다는 기준을 적는다

---

## 작업 수 요약

- Phase 1: 8개 작업
- Phase 2: 7개 작업
- Phase R: 4개 작업
- Phase 3: 8개 작업
- Phase 4: 4개 작업
- 총 31개 원자 작업

## 정합성 메모

- V1 경로 존재 검증: `package.json`, `svelte.config.js`, `wrangler.toml`, `tsconfig.json`, `README.md`, `docs/DONE.md`, `docs/report/2026-04-16_theme-alignment-with-exhibition-loot-boss.md`, `docs/archive/2026-04-16_port-react-ui-to-svelte.md`가 현재 `expo-harvest` 경로에 모두 존재한다.
- V2 참조 조사: `build`, `vite build`, `.svelte-kit/cloudflare`, `adapter-cloudflare` 검색으로 사용자 진입 문서와 설정 체인을 확인했다.
- V3 시그니처 정합성: `package.json`은 `build: vite build`, `svelte.config.js`는 `adapter-cloudflare()`, `wrangler.toml`은 `.svelte-kit/cloudflare` 소비, `tsconfig.json`은 `./.svelte-kit/tsconfig.json` 확장을 사용한다.
- V4 설계 보정: 전역 `vite`/`node` 프로세스 스캔은 오탐 위험이 있어 repo/path 기준 신호로 좁히도록 plan을 수정했다.
- V5 테스트/검증 보정: 기존 검증은 `npm run build` 단일 성공만 적혀 있었으므로, 두 터미널 동시 재현 절차를 별도 Phase로 추가했다.
- V6 메타 정합성: fix plan 필수 `Phase R`를 유지했고, 진행률은 확장된 총 31개 작업 기준으로 `31/31`이다.

## 검증 (프론트엔드 기준)

### 실행 절차

1. dev 미실행 상태에서 먼저 기본 검증을 통과시킨다.

```powershell
cd "D:\work\project\service\wtools\expo-harvest"
npm run check
npm run build
npm run build:raw
```

2. 두 터미널로 concurrent failure를 재현한다.

```powershell
# Terminal A
cd "D:\work\project\service\wtools\expo-harvest"
npm run dev
```

```powershell
# Terminal B
cd "D:\work\project\service\wtools\expo-harvest"
npm run build
```

### 검증 기준

- [x] dev 미실행 상태에서 터미널 B의 `npm run check`와 `npm run build`가 모두 성공한다
- [x] 터미널 A에서 `npm run dev`를 유지한 상태로, 터미널 B의 `npm run build`는 원인 설명이 포함된 명시적 실패 메시지를 출력한다
- [x] 터미널 A의 dev 서버를 종료한 뒤, 터미널 B의 `npm run build` 재실행이 성공한다
- [x] `npm run build:raw`는 raw `vite build` 경로로 계속 남아 있고, README에는 로컬 충돌 회피 방법이 기록된다

---

*상태: 구현완료 | 진행률: 31/31 (100%)*
