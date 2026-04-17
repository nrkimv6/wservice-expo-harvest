# fix: hamburger menu and cache regression

> 작성일시: 2026-04-18 00:14
> 기준커밋: 43ef242
> 대상 프로젝트: expo-harvest
> branch: codex/hamburger-fix
> worktree: D:\work\project\service\wtools\expo-harvest-hamburger-fix
> worktree-owner: D:\work\project\service\wtools\expo-harvest\docs\plan\2026-04-18_fix-hamburger-menu-cache-regression.md
> 상태: 구현중
> 진행률: 2/8 (25%)
> 요약: 현재 햄버거 무반응 증상은 코드상 두 축으로 정리된다. 첫째, 단일 박람회 데이터 상태에서 [`src/routes/+page.svelte`](D:/work/project/service/wtools/expo-harvest-hamburger-fix/src/routes/+page.svelte)의 가드가 햄버거 클릭을 100% 막고 있었다. 둘째, [`src/service-worker.ts`](D:/work/project/service/wtools/expo-harvest-hamburger-fix/src/service-worker.ts)가 라우트 HTML까지 앱 셸로 캐시해 오래된 HTML과 새 JS가 섞일 수 있었다. 두 원인은 이미 수정됐으며, Phase 2에서 DevTools 캐시 검증, 수동 브라우저 테스트, online/offline 회귀 검증을 통해 merge-test 통과 가능성을 판정한다.

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

3. [ ] **서비스워커 캐시 감소를 DevTools로 검증한다** — 라우트 HTML이 캐시에서 제외되었는지 확인한다
   - [ ] `npm run build:raw` 재실행 후 `npm run preview` 실행
   - [ ] DevTools → Application → Cache Storage에서 기존 캐시 항목 개수와 비교 (route HTML 항목 제거 확인)
   - [ ] DevTools → Network 탭에서 `/` route 요청이 캐시(disk cache/memory cache)가 아닌 네트워크에서 오는지 확인

4. [ ] **Manifest와 Service Worker 등록점에서 회귀가 없는지 닫는다** — 캐시 전략 변경이 PWA 동작을 깨뜨리지 않았는지 본다
   - [ ] `src/app.html`: manifest 연결 및 head 구성이 현재 `networkFirst` 라우트 전략과 충돌하지 않는지 코드 검토
   - [ ] `static/manifest.webmanifest`: `start_url: "/"` 설정이 루트 문서 캐시 회귀를 다시 유발하지 않는지 확인 (로직상 모순 없음)

5. [ ] **실제 브라우저에서 햄버거 동작을 최종 검증한다** — synthetic event 한계를 넘는 실제 상호작용 결과를 확보한다
   - [ ] `npm run preview`에서 localhost:5173 접근 후 single exhibition 상태 로드
   - [ ] **기능 확인**: 햄버거 아이콘 클릭 → drawer 열림 / 닫기 버튼 클릭 → drawer 닫힘 (2회 반복)
   - [ ] **상태 확인**: 단일 박람회 상태에서 drawer 제목/설명이 "현재 박람회" 문구로 표시되는지 확인
   - [ ] **캐시 무효화 검증**: DevTools에서 Service Workers 탭 → 기존 워커 `unregister` → 새로고침 → 오래된 HTML 버전이 아닌 현재 코드가 로드되는지 확인

6. [ ] **햄버거 수정이 다른 라우트/기능을 깨뜨리지 않았는지 회귀 테스트한다** — 서비스워커 캐시 전략 변경의 side effect를 검증한다
   - [ ] `src/routes/+page.svelte`: 하단 네비 `map/list/saved` 탭 전환 동작 확인 (햄버거 수정과 독립적이나, 드로어 열림 상태에서도 탭 전환 가능 확인)
   - [ ] **online/offline 시나리오**: 개발자 모드 → Network 탭 → Throttling을 `Offline`으로 설정 후 이미 로드된 상태에서 route 전환 시도 → 오프라인에서도 정적 자산은 캐시에서 로드되는지, 새 route HTML은 대기하지 않고 적절한 에러/fallback을 보이는지 확인

### Phase 3: merge-test 통과 가능성을 최종 판정한다

7. [ ] **검증 결과를 정리하고 merge-test 통과 조건을 확인한다** — 항목 3-6의 검증 결과가 모두 완료되면 merge-test로 진행한다
   - [ ] Phase 2 항목 3, 4, 5, 6 모두 ✓ 완료 확인
   - [ ] **merge-test 통과 기준**: 
     * 항목 3 DevTools 검증 완료 (캐시 감소 증명) 
     * 항목 5 수동 브라우저 테스트 완료 (햄버거 동작 확인)
     * 항목 6 온라인/오프라인 회귀 테스트 완료 (side effect 없음)
   - [ ] 위 세 조건이 모두 충족되지 않으면 merge-test 불가 → 추가 수정 필요

8. [ ] **워크트리 변경을 정리하고 merge-test로 진행한다** — 검증 충분 시 커밋 → /merge-test 호출
   - [ ] `src/routes/+page.svelte`, `src/service-worker.ts` 변경사항 최종 확인
   - [ ] `git status` 확인 후 커밋 (메시지: `fix: hamburger menu guard and service worker cache strategy`)
   - [ ] `/merge-test` 스킬 호출 → main 머지 후 T4/T5 통합 테스트 실행

---

*상태: 구현중 | 진행률: 2/8 (25%)*
