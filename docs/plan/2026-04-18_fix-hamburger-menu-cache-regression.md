# fix: hamburger menu and cache regression

> 작성일시: 2026-04-18 00:14
> 기준커밋: 43ef242
> 대상 프로젝트: expo-harvest
> branch: main
> worktree: D:\work\project\service\wtools\expo-harvest
> worktree-owner: D:\work\project\service\wtools\expo-harvest\docs\plan\2026-04-18_fix-hamburger-menu-cache-regression.md
> 상태: 구현완료
> 진행률: 44/44 (100%)
> 요약: 현재 햄버거 무반응 증상은 코드상 두 축으로 정리됐다. 첫째, 단일 박람회 데이터 상태에서 `src/routes/+page.svelte`의 가드가 햄버거 클릭을 100% 막고 있었다. 둘째, `src/service-worker.ts`가 라우트 HTML까지 앱 셸로 캐시해 오래된 HTML과 새 JS가 섞일 수 있었다. 두 원인은 수정됐고, main 기준 `check/build/preview`와 실제 브라우저 클릭 검증까지 끝냈다.

---

## 개요

사용자 제보는 "하단 네비가 죽었다"로 시작했지만, 재현을 좁혀 보니 핵심은 **햄버거 메뉴가 단일 박람회 상태에서 아예 열리지 않는 코드 가드**와 **서비스워커가 예전 문서를 계속 내보낼 수 있는 캐시 전략**이었다. 이번 계획의 목표는 이미 들어간 수정을 문서화하고, 이 수정이 진짜로 완료 가능한지 판단할 마지막 검증과 정리 단계를 명확히 만드는 것이었다.

즉, 이 plan은 새 기능 구현이 아니라 다음 두 질문에 답하기 위한 plan이다.

1. 들어간 수정이 실제 원인을 겨냥한 게 맞는가
2. main 기준에서 어떤 증거가 확보되면 "완료"라고 부를 수 있는가

## 기술적 고려사항

- `src/routes/+page.svelte`: 현재 `EXHIBITIONS`는 단일 전시 데이터 1개만 포함한다. 따라서 기존 `if (EXHIBITIONS.length < 2) return;` 가드는 햄버거 클릭을 항상 막는 하드 블로커였다.
- `src/service-worker.ts`: 기존 `APP_SHELL = ['/', '/app', ...]` precache는 경로 HTML까지 캐시에 넣어 hydration mismatch를 다시 만들 수 있었다. 정적 자산만 캐시하고 navigation은 네트워크 우선으로 바꾸는 방향이 맞다.
- `src/app.html`: manifest 연결은 한 곳뿐이라, 서비스워커 캐시 전략을 바꿨다면 등록 경로 자체를 더 건드릴 필요는 낮다.
- `static/manifest.webmanifest`: 현재 start URL은 `/`라서 서비스워커가 오래된 루트 HTML을 잡고 있으면 설치형 PWA에서 회귀가 더 오래 남을 수 있다.
- 헤드리스 CDP에서 synthetic click이 Svelte 5 delegated 이벤트를 안정적으로 반영하지 못한 흔적이 있었다. 이 자동화 결과만으로 "아직 안 고쳐짐"이라고 단정하면 안 된다.
- preview 서버는 `.env`가 없으면 Supabase 초기화에서 500이 난다. 따라서 production smoke는 env 주입이 전제다.
- main에는 동일 plan 파일과 `src/routes/+page.svelte`, `src/service-worker.ts`의 별도 드리프트가 있었고, 실제로 main 머지 시 수동 충돌 해소가 필요했다.

---

## TODO

### Phase 1: 원인 수정의 범위를 고정한다

1. - [x] **햄버거 무반응의 코드상 직접 원인을 제거한다** — 단일 박람회 상태에서도 클릭이 막히지 않게 만든다
   - [x] `src/routes/+page.svelte`: `toggleExhibitionMenu()` 본문에서 `EXHIBITIONS.length < 2` 조기 종료를 제거해 버튼 클릭이 항상 `isExhibitionMenuOpen`을 토글하게 만든다.
   - [x] `src/routes/+page.svelte`: 우측 상단 햄버거 버튼의 `onclick={toggleExhibitionMenu}` 연결이 유지되는지 확인해 수정이 실제 진입 버튼에 걸리게 만든다.
   - [x] `src/routes/+page.svelte`: 드로어 타이틀/설명 문구를 `EXHIBITIONS.length > 1` 기준 분기로 바꿔 단일 박람회 상태에서는 `현재 박람회` 안내가 보이게 만든다.

2. - [x] **서비스워커 캐시 전략을 라우트 문서에서 분리한다** — 오래된 HTML과 새 JS 혼합 경로를 줄인다
   - [x] `src/service-worker.ts`: route HTML을 포함하던 `APP_SHELL` 상수를 제거하고 `build/files` 기반 `PRECACHE_ASSETS`만 남긴다.
   - [x] `src/service-worker.ts`: `isCacheableAsset()`를 `/_app/immutable/`, `/images/`, precache asset만 true가 되도록 좁혀 라우트 문서가 cache-first 경로에 들어가지 않게 만든다.
   - [x] `src/service-worker.ts`: `request.mode === 'navigate'`는 `networkFirst()`, 정적 자산은 `cacheFirst()`로 분리해 문서 요청과 asset 요청의 캐시 전략을 분리한다.

### Phase 2: 완료 가능성을 판정하는 증거를 만든다

3. - [x] **캐시 경로가 정말 줄었는지 연결 지점을 다시 확인한다** — manifest/service-worker 등록면에서 추가 회귀 포인트가 없는지 닫는다
   - [x] `src/app.html`: `<link rel="manifest" href="/manifest.webmanifest" />` 하나만 남아 있는지 읽고, 별도 route shell 또는 legacy start URL이 없는지 확인한다.
   - [x] `static/manifest.webmanifest`: `start_url`과 `scope`가 모두 `/`인지 확인해 PWA 진입점이 예전 `/app` 문서를 다시 고정하지 않게 만든다.
   - [x] `src/service-worker.ts`: `install`/`activate` 흐름에서 이전 cache key 정리 외에 route HTML을 다시 추가하는 분기가 없는지 재확인한다.

4. - [x] **실서버와 가까운 smoke 환경을 다시 올린다** — preview가 실제 build 산출물을 기준으로 열리게 만든다
   - [x] `package.json`: `check`, `build:raw`, `preview` 스크립트 이름과 실제 명령을 읽고 smoke 순서를 `check -> build:raw -> preview`로 고정한다.
   - [x] `.env.example`: `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, `PUBLIC_AUTH_WORKER_URL`, `PUBLIC_APP_ID`를 preview용 최소 env로 사용 가능한지 확인한다.
   - [x] main 루트: `npm run check`를 다시 실행해 현재 수정 상태에서 `svelte-check` 0 error/0 warning을 재확인한다.
   - [x] main 루트: `npm run build:raw`를 다시 실행해 실제 배포 번들이 생성되는지 재확인한다.
   - [x] main 루트: 필요한 public env를 주입한 뒤 `npm run preview`로 `/` 루트가 500 없이 열리는지 확인한다.

5. - [x] **실제 클릭 기준으로 햄버거 동작을 최종 판정한다** — synthetic event 한계를 넘는 실제 브라우저 상호작용 결과를 확보한다
   - [x] `src/routes/+page.svelte`: 실제 브라우저에서 우측 상단 햄버거를 1회 클릭했을 때 `#exhibition-menu-drawer`가 DOM에 나타나는지 확인한다.
   - [x] `src/routes/+page.svelte`: 드로어 바깥 배경 클릭과 우측 상단 닫기 버튼 클릭 각각에서 drawer가 닫히는지 별도 시나리오로 확인한다.
   - [x] `src/routes/+page.svelte`: 단일 박람회 데이터(`EXHIBITIONS.length === 1`) 상태에서 타이틀이 `현재 박람회`로 보이고 전시 카드가 1개 렌더되는지 확인한다.
   - [x] `src/routes/+page.svelte`: drawer open 동안 background가 의도대로 차단되고, backdrop/닫기/Escape 이후 다른 상호작용이 정상 복귀하는지 확인한다.

6. - [x] **회귀 범위를 함께 닫는다** — 햄버거 수정이 다른 클릭 경로를 깨지 않았는지 본다
   - [x] `src/routes/+page.svelte`: 하단 네비 `지도`, `리스트`, `즐겨찾기` 버튼이 각각 `activeTab`을 바꾸는지 실제 클릭으로 확인한다.
   - [x] `src/routes/+page.svelte`: 현재 main에서 실제 노출되는 리스트 상세 -> 지도 복귀 흐름이 기존 기능과 충돌하지 않는지 확인한다.
   - [x] `src/routes/+page.svelte`, `src/service-worker.ts`: preview 새로고침 후 첫 hydration에서 클릭 이벤트가 끊기지 않는지 확인한다.
   - [x] `src/routes/+page.svelte`, `src/lib/stores/farmState.ts`: 현재 단일 박람회 데이터 기준으로 `selectedExhibition` 키와 loot 로컬 저장 상태가 새로고침 뒤 유지되는지 확인한다.

### Phase 3: 재발 경로를 따로 닫는다

7. - [x] **햄버거/탭 클릭 경로의 방어 여부를 전수 확인한다** — 같은 유형의 클릭 무반응이 다른 overlay/guard에 남아 있지 않은지 확인한다
   - [x] `src/routes/+page.svelte`: `toggleExhibitionMenu()`, `setActiveTab()`, 관련 클릭 경로를 다시 확인해 조기 return 또는 조건부 렌더 누락이 없는지 적는다.
   - [x] `src/routes/+page.svelte`: drawer open 상태에서 background는 modal 의도대로 차단되고, 배경 클릭/Escape 후 탭 클릭과 detail 경로가 다시 정상 동작하는지 확인한다.
   - [x] `src/routes/+page.svelte`: `svelte:window onkeydown`의 `Escape` 닫기 경로가 drawer open 상태에서만 작동하는지 확인한다.

8. - [x] **서비스워커 재발 경로의 방어 여부를 전수 확인한다** — 이전 문서와 새 번들이 다시 섞이는 우회 경로가 없는지 닫는다
   - [x] `src/service-worker.ts`: `networkFirst()`가 navigation 응답을 cache에 다시 쓰지 않는지 함수 본문을 재확인한다.
   - [x] `src/service-worker.ts`: `cacheFirst()`가 정적 asset 외 경로에서 호출되지 않는지 `isCacheableAsset()` 조건과 fetch 분기를 함께 대조한다.
   - [x] 브라우저/Application 패널 또는 동등한 확인 수단: 서비스워커 업데이트 뒤 예전 cache name이 삭제되고 최신 cache 하나만 남는지 확인한다.

### Phase 4: merge-test 전 상태를 만들 수 있는지 결정한다

9. - [x] **완료 판정의 남은 리스크를 문서화한다** — "고쳐짐"과 "머지 가능"을 분리해 적는다
   - [x] `docs/plan/2026-04-18_fix-hamburger-menu-cache-regression.md`: 정적 검증(`check/build`)과 실제 브라우저 검증 결과를 분리해 결과 메모를 남긴다.
   - [x] `docs/plan/2026-04-18_fix-hamburger-menu-cache-regression.md`: merge 직전 main 드리프트 때문에 수동 충돌 해소가 필요했다는 점을 기록한다.
   - [x] `docs/plan/2026-04-18_fix-hamburger-menu-cache-regression.md`: PWA/모바일에서 남는 캐시 초기화 또는 설치형 재실행 절차가 있으면 수동 확인 메모로 남긴다.

10. - [x] **머지 가능한 상태인지 최종 결정한다** — 완료면 후속 완료 처리, 아니면 추가 수정으로 되돌린다
   - [x] `src/routes/+page.svelte`, `src/service-worker.ts`: 브라우저 smoke와 캐시 검증이 끝난 뒤 현재 수정이 추가 코드 변경 없이 유지 가능한지 판단한다.
   - [x] `docs/plan/2026-04-18_fix-hamburger-menu-cache-regression.md`: main 기준 검증 결과를 반영해 상태를 `구현완료`로 갱신한다.
   - [x] owner plan 후속 절차: main 기준 검증이 끝났고, unrelated 문서 변경이 있는 `TODO.md`는 건드리지 않는다고 기록한 뒤 plan 기준 완료 처리로 닫는다.

## 검증 메모

- 정적 코드 검토 기준으로는 `src/routes/+page.svelte`, `src/service-worker.ts`, `src/app.html`, `static/manifest.webmanifest`, `package.json`, `.env.example`를 다시 읽어 직접 원인과 연결 지점을 재확인했다.
- main 기준 정적 검증 결과:
  `npm run check` 통과
  `npm run build:raw` 통과
  `npm run preview -- --host 127.0.0.1 --port 4173`에서 `/` 응답 200 확인
- Playwright 자동화 기준 브라우저 검증 결과:
  햄버거 클릭 시 drawer open 확인
  닫기 버튼/배경 클릭/Escape 닫기 확인
  drawer title `현재 박람회` 확인
  하단 `리스트` 탭 전환 후 `전체 이벤트 리스트` 노출 확인
  리스트 상세 진입 후 `지도에서 보기`로 map 복귀 및 detail close 확인
  즐겨찾기 등록 후 `즐겨찾기` 탭 노출 확인
  새로고침 뒤 bookmark/memo/localStorage persistence 확인
- 서비스워커 캐시 검증 결과:
  cache name `expo-harvest-*` 1건 확인
  cache 내부에 `/`, `/app` route document 미포함 확인
- 현재 시점의 판정은 `완료`다. worktree 브랜치 수정은 main에 수동 머지됐고, 그 뒤 `check/build/preview`와 브라우저 smoke를 다시 실행해 통과했다.
- PWA/모바일 수동 확인 메모: 이미 열린 설치형 앱이나 탭이 이전 서비스워커 문서를 잡고 있을 수 있으므로, 최종 통합 검증 시 강력 새로고침 또는 설치형 PWA 재실행으로 stale cache 영향을 분리해서 본다.

---

*상태: 구현완료 | 진행률: 44/44 (100%)*
