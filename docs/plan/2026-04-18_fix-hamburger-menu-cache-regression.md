# fix: hamburger menu and cache regression

> 작성일시: 2026-04-18 00:14
> 기준커밋: 43ef242
> 대상 프로젝트: expo-harvest
> branch: codex/hamburger-fix
> worktree: D:\work\project\service\wtools\expo-harvest-hamburger-fix
> worktree-owner: D:\work\project\service\wtools\expo-harvest\docs\plan\2026-04-18_fix-hamburger-menu-cache-regression.md
> 상태: 구현중
> 진행률: 2/8 (25%)
> 요약: 현재 햄버거 무반응 증상은 코드상 두 축으로 정리된다. 첫째, 단일 박람회 데이터 상태에서 [`src/routes/+page.svelte`](D:/work/project/service/wtools/expo-harvest-hamburger-fix/src/routes/+page.svelte)의 가드가 햄버거 클릭을 100% 막고 있었다. 둘째, [`src/service-worker.ts`](D:/work/project/service/wtools/expo-harvest-hamburger-fix/src/service-worker.ts)가 라우트 HTML까지 앱 셸로 캐시해 오래된 HTML과 새 JS가 섞일 수 있었다. 두 원인은 이미 수정됐지만, 실제 브라우저에서 완료 판정을 내릴 증거는 아직 부족하다.

---

## 개요

사용자 제보는 "하단 네비가 죽었다"로 시작했지만, 재현을 좁혀 보니 핵심은 **햄버거 메뉴가 단일 박람회 상태에서 아예 열리지 않는 코드 가드**와 **서비스워커가 예전 문서를 계속 내보낼 수 있는 캐시 전략**이었다. 이번 계획의 목표는 이미 들어간 수정을 문서화하고, 이 수정이 진짜로 완료 가능한지 판단할 마지막 검증과 정리 단계를 명확히 만드는 것이다.

즉, 이 plan은 새 기능 구현이 아니라 다음 두 질문에 답하기 위한 plan이다.

1. 지금 들어간 수정이 실제 원인을 겨냥한 게 맞는가
2. `merge-test` 전에 어떤 증거가 더 있어야 "완료"라고 부를 수 있는가

## 기술적 고려사항

- [`src/routes/+page.svelte`](D:/work/project/service/wtools/expo-harvest-hamburger-fix/src/routes/+page.svelte): 현재 `EXHIBITIONS`는 단일 전시 데이터 1개만 포함한다. 따라서 기존 `if (EXHIBITIONS.length < 2) return;` 가드는 햄버거 클릭을 항상 막는 하드 블로커였다.
- [`src/service-worker.ts`](D:/work/project/service/wtools/expo-harvest-hamburger-fix/src/service-worker.ts): 기존 `APP_SHELL = ['/', '/app', ...]` precache는 경로 HTML까지 캐시에 넣어 hydration mismatch를 다시 만들 수 있었다. 정적 자산만 캐시하고 navigation은 네트워크 우선으로 바꾸는 방향이 맞다.
- [`src/app.html`](D:/work/project/service/wtools/expo-harvest-hamburger-fix/src/app.html): manifest 연결은 한 곳뿐이라, 서비스워커 캐시 전략을 바꿨다면 등록 경로 자체를 더 건드릴 필요는 낮다.
- [`static/manifest.webmanifest`](D:/work/project/service/wtools/expo-harvest-hamburger-fix/static/manifest.webmanifest): 현재 start URL은 `/`라서 서비스워커가 오래된 루트 HTML을 잡고 있으면 설치형 PWA에서 회귀가 더 오래 남을 수 있다.
- 헤드리스 CDP에서 synthetic click이 Svelte 5 delegated 이벤트를 안정적으로 반영하지 못한 흔적이 있었다. 이 자동화 결과만으로 "아직 안 고쳐짐"이라고 단정하면 안 된다.
- preview 서버는 `.env`가 없으면 Supabase 초기화에서 500이 난다. 따라서 production smoke는 env 주입이 전제다.

---

## TODO

### Phase 1: 원인 수정의 범위를 고정한다

1. [x] **햄버거 무반응의 코드상 직접 원인을 제거한다** — 단일 박람회 상태에서도 클릭이 막히지 않게 만든다
   - [x] `src/routes/+page.svelte`: `toggleExhibitionMenu()`의 `EXHIBITIONS.length < 2` 가드를 제거한다.
   - [x] `src/routes/+page.svelte`: drawer 제목/설명 문구를 단일 박람회 상태에서도 어색하지 않게 분기한다.

2. [x] **서비스워커 캐시 전략을 라우트 문서에서 분리한다** — 오래된 HTML과 새 JS 혼합 경로를 줄인다
   - [x] `src/service-worker.ts`: `APP_SHELL` 기반 route precache를 제거하고 build/files 기반 `PRECACHE_ASSETS`로 축소한다.
   - [x] `src/service-worker.ts`: navigation은 `networkFirst`, 정적 자산만 `cacheFirst`로 분리한다.

### Phase 2: 완료 가능성을 판정하는 증거를 만든다

3. [ ] **캐시 경로가 정말 줄었는지 연결 지점을 다시 확인한다** — manifest/service-worker 등록면에서 추가 회귀 포인트가 없는지 닫는다
   - [ ] `src/app.html`: manifest 연결과 기본 head 구성이 현재 서비스워커 전략과 충돌하지 않는지 확인한다.
   - [ ] `static/manifest.webmanifest`: start_url/scope가 루트 문서 캐시 회귀를 다시 키우는 별도 설정을 갖고 있지 않은지 확인한다.

4. [ ] **실서버와 가까운 smoke 환경을 다시 올린다** — preview가 실제 build 산출물을 기준으로 열리게 만든다
   - [ ] `src/service-worker.ts`, `package.json`: `npm run check`, `npm run build:raw`를 다시 실행해 정적 검증을 고정한다.
   - [ ] `.env.example`: preview 실행 시 필요한 public env를 주입해 500 없이 루트 `/`가 뜨는지 확인한다.

5. [ ] **실제 클릭 기준으로 햄버거 동작을 최종 판정한다** — synthetic event 한계를 넘는 실제 브라우저 상호작용 결과를 확보한다
   - [ ] `src/routes/+page.svelte`: 브라우저에서 햄버거 1회 클릭 시 drawer open, 닫기 클릭 시 close 되는지 확인한다.
   - [ ] `src/routes/+page.svelte`: 단일 박람회 데이터 상태에서도 drawer가 "현재 박람회" 정보 패널로 열리는지 확인한다.

6. [ ] **회귀 범위를 함께 닫는다** — 햄버거 수정이 다른 클릭 경로를 깨지 않았는지 본다
   - [ ] `src/routes/+page.svelte`: 하단 네비 `map/list/saved` 탭 전환이 그대로 살아 있는지 확인한다.
   - [ ] `src/routes/+page.svelte`, `src/service-worker.ts`: 새 서비스워커 전략에서 hard refresh 없이도 route hydration이 깨지지 않는지 확인한다.

### Phase 3: merge-test 전 상태를 만들 수 있는지 결정한다

7. [ ] **완료 판정의 남은 리스크를 문서화한다** — "고쳐짐"과 "머지 가능"을 분리해 적는다
   - [ ] `docs/plan/2026-04-18_fix-hamburger-menu-cache-regression.md`: 자동 검증과 실제 브라우저 검증의 차이를 결과 섹션에 기록한다.
   - [ ] `MANUAL_TASKS.md`: PWA/모바일에서 필요한 캐시 초기화 또는 확인 절차가 남는다면 수동 항목으로 남긴다.

8. [ ] **머지 가능한 상태인지 최종 결정한다** — 완료면 커밋/merge-test, 아니면 추가 수정으로 되돌린다
   - [ ] `src/routes/+page.svelte`, `src/service-worker.ts`: 검증이 충분하면 워크트리 변경을 커밋 가능한 상태로 정리한다.
   - [ ] `docs/plan/2026-04-18_fix-hamburger-menu-cache-regression.md`: 완료 가능이면 상태를 유지한 채 구현 완료 직전으로 올리고, 불충분하면 추가 수정 필요 근거를 남긴다.

---

*상태: 구현중 | 진행률: 2/8 (25%)*
