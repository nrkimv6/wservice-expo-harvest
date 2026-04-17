# DONE

- [x] 2026-04-18: 햄버거 메뉴 무반응 및 stale route cache 회귀 복구
  - `src/routes/+page.svelte`에서 단일 박람회 상태에서도 햄버거가 열리도록 guard를 제거하고 `현재 박람회` drawer copy로 정리
  - `src/service-worker.ts`에서 route HTML precache를 제거하고 정적 asset-only cache + navigation network-first 전략으로 축소
  - `npm run check`, `npm run build:raw`, `npm run preview`와 실제 브라우저 smoke 후 plan archive, TODO 정리까지 완료

- [x] 2026-04-18: implement/merge-test/done 상태 게이트 정합성 복구
  - `.agents/skills/merge-test/SKILL.md`가 `머지대기` 상태에서도 정상 진입하도록 전제조건과 실패 안내를 확장
  - `.agents/skills/implement/SKILL.md`, `.agents/skills/done/SKILL.md`에서 구현 완료 후 `머지대기 -> /merge-test -> /done` 흐름이 끊기지 않도록 상태 용어와 차단 메시지를 통일
  - worktree 브랜치 `impl/fix-implement-merge-test-status-gate`를 `main`에 머지한 뒤 plan archive, TODO 정리, DONE 반영 완료

- [x] 2026-04-18: 쿠팡 메가뷰티쇼 맵 부스 패킹/카피 정리
  - `src/lib/data/lootItems.ts`에서 1F/2F/뷰티박스 수령존 배치를 벽·행 기준 무간격 packing으로 다시 맞추고 2F 우측 lane 계단/포토존/포렌코즈/홍보부스를 한 column 계약으로 고정
  - `src/lib/components/ExhibitionMap.svelte`, `AGENTS.md`에서 지도 제목·helper copy를 짧게 줄이고 booth/event zone 텍스트 충전도와 라벨 분할 규칙을 조정
  - `npm run check`, `npm run build` 통과 후 plan archive, TODO 정리, 수동 배치 확인 항목은 `MANUAL_TASKS.md`로 이관

- [x] 2026-04-18: 맵 부스 상세 시트 탭 회귀 복구
  - `src/routes/+page.svelte`에서 지도 탭도 리스트/즐겨찾기와 같은 첫 선택 즉시 상세 시트 오픈 계약으로 되돌림
  - `src/lib/components/ExhibitionMap.svelte`, `src/app.css`에서 `map-booth-target` 포커스 하이라이트 억제와 `pointerdown` 기반 부스 클릭 처리로 데스크톱 클릭 손실 경로를 줄임
  - `npm run check`, `npm run build` 통과 후 plan archive, TODO 정리, 수동 실기기 검증은 `MANUAL_TASKS.md`로 이관

- [x] 2026-04-18: build wrapper dev-server blind spot 방어
  - `scripts/run-dev.mjs`가 `.svelte-kit/dev-runtime.json` marker를 기록하고 `scripts/run-build.mjs`가 marker + repo-specific HTTP probe로 blank `CommandLine` 경로를 preflight에서 감지
  - `node --test scripts/run-build.test.mjs`, `npm run check`, `npm run build` 통과 후 plan archive 및 impl worktree 정리 완료

- [x] 2026-04-18: merge-test owner plan dirty guard 추가
  - `.agents/skills/merge-test/SKILL.md`에 current owner plan dirty preflight와 `MERGE_PRECHECK_FAILED[owner_plan_dirty]` hard-stop 규칙을 추가
  - unrelated root dirty만 stash 대상으로 남기고 merged main에서 `npm run check`, `npm run build` 재검증 후 plan archive 및 impl worktree 정리 완료

- [x] 2026-04-17: 쿠팡 맵 section 분리 후 레이아웃 회귀 복구
  - `13f12bd` 기준 형상으로 2F 상단 8부스 가로열, 좌측 체험존 세로열, 우측 `인생네컷/포렌코즈/파페치` column 분리를 복원
  - 1F/2F/뷰티박스 수령존의 booth-sized eventZone 크기를 공통 helper로 정규화하고, `hall-1f` 계단 2개와 `decorRect` 누락을 데이터에서 복구
  - `npm run check`, `npm run build` 통과 후 plan archive 및 impl worktree 정리 진행

- [x] 2026-04-17: 쿠팡 전체 overview 지도 확대/축소 지원
  - `ExhibitionMap.svelte`의 `전체` 탭을 단일 overview SVG와 전용 viewport 모델로 재구성해 pinch, drag, wheel, `+ / - / 리셋` 확대 흐름을 연결
  - overview에서 부스를 탭해도 `all` 상태를 유지하도록 `selectItem()` override 정책을 분리하고, 선택 부스 포커스와 안내 문구를 새 계약 기준으로 갱신
  - `npm run check`, `npm run build` 통과 후 plan archive 및 impl worktree 정리 완료

- [x] 2026-04-17: 쿠팡 메가뷰티쇼 지도 구역 분리 및 부스 정규화
  - 지도를 `1F 전시관`, `2F 전시관`, `뷰티박스 수령존(1F 외부)` 3개 map section으로 분리하고 리스트/상세의 지도 포커스를 구역 기준으로 다시 연결
  - 정보 부족 부스를 공통 4:3 박스로 정규화하고 내부 여백, 글자 밀도, 부스 간격, 우측 세로 컬럼 배치를 조정해 한 화면 정보량을 높임
  - `npm run check`, `npm run build` 통과 후 plan archive와 impl worktree 정리까지 완료

- [x] 2026-04-17: 쿠팡 메가뷰티쇼 지도 제스처 사용성 개선
  - `ExhibitionMap.svelte`의 단일층 viewport에 scale helper, drag/pinch intent 분리, pan 후 오탭 차단 로직을 추가해 모바일 확대/이동 체감을 높임
  - 단일층 헤더에 `+ / - / 리셋` 확대 컨트롤을 추가하고, 안내 문구와 `MANUAL_TASKS.md`를 새 제스처 계약 기준으로 갱신
  - `npm run check`, `npm run build` 통과 후 plan archive 및 impl worktree 정리 완료

- [x] 2026-04-17: 쿠팡 메가뷰티쇼 후기 데이터 정합성 보정
  - 실제 후기 기준으로 19개 부스의 해시태그, 미션, 경품, 선착순 문구를 다시 맞추고 AHC/에뛰드/아리얼 등 누락·오표기 데이터를 정리
  - 상세 시트에 `업로드 조건` 칩과 `추첨 이벤트` 섹션을 추가해 피드/스토리/후속 추첨을 분리 노출
  - `npm run check`, `npm run build` 통과 후 plan archive 및 worktree 정리 완료

- [x] 2026-04-17: 쿠팡 메가뷰티쇼 지도 가독성/모바일 탐색 리파인
  - 브랜드 부스를 3:4 비율의 render box와 지도 전용 라벨로 재배치하고, `1F/2F` 단일층 기본 확대 viewport를 도입
  - 모바일에서 첫 탭은 지도 포커스/선택 요약, 같은 부스 재탭은 상세 시트 오픈으로 분리하고 상세 시트에 `지도에서 보기` CTA 추가
  - `npm run check`, `npm run build` 통과 후 plan archive 및 hover UX 병합 큐를 정리

- [x] 2026-04-17: 쿠팡 메가뷰티쇼 1F/2F SVG 플로어맵 이식
  - `mapBackgroundImage + percent pin` 구조를 층별 `viewBox + SVG 박스/오버레이` 모델로 교체
  - 1F/2F/전체 토글, 리스트 선택 시 층 동기화, 카드/상세 층 배지, hover summary 패널을 연결
  - `npm run check`, `npm run build` 통과 후 plan archive 및 수동 검증 항목을 `MANUAL_TASKS.md`로 분리

- [x] 2026-04-17: 루트 라우트 통합 + 하단 네비 + 첫 실행 모달
  - `/`를 실사용 앱 엔트리로 전환하고 `/app`은 루트 리다이렉트 호환 페이지로 정리
  - 하단 네비게이션, 저장됨 탭, 첫 실행 온보딩 모달, 홈/지도/리스트 분리 구조를 연결
  - `npm run check` 통과, `npm run build`는 `.svelte-kit/cloudflare` 잠금으로 최종 adapter 단계 실패

- [x] 2026-04-17: 다중 박람회 선택 + 쿠팡메가뷰티쇼 2026 데이터 + 부스별 해시태그/SNS 기능
  - `/app`을 다중 박람회 선택 구조로 전환하고 상단 메뉴에서 행사 버전을 전환할 수 있게 정리
  - `쿠팡메가뷰티쇼 2026` 테스트 데이터와 부스배치도 이미지를 추가하고 행사별 localStorage 상태를 분리
  - 부스 상세에 해시태그 코드블럭 복사와 SNS 외부 링크 버튼을 추가하고 `npm run check`, `npm run build`로 검증 완료

- [x] 2026-04-16: dev 서버 실행 중 build 잠금 충돌 방지
  - `package.json`의 `build`를 `scripts/run-build.mjs` wrapper로 전환하고 `build:raw`를 raw `vite build`로 분리
  - Windows에서 repo/path 기준으로 `npm run dev` 동시 실행을 감지해 `.svelte-kit/cloudflare` 충돌 시 명시적 실패 메시지 출력
  - `npm run build`, `npm run build:raw`, dev 동시 실행 재현, `npm run check`로 검증 완료

- [x] 2026-04-16: 원본 디자인 ZIP 기준 색상 테마 재정렬
  - `C:\Users\Narang\Downloads\exhibition-loot-boss-main.zip`의 `src/index.css`, `tailwind.config.ts`, 주요 컴포넌트를 직접 대조
  - 기존 Pitch Black + Orange 재매핑을 원본의 Deep Navy + Gold + Mint 팔레트로 다시 조정
  - `/`, `/app`, 에러 화면, 공통 컴포넌트의 하드코딩 색상과 Tailwind 토큰을 함께 정리
  - `npm run check`, `npm run build`로 재검증 완료

- [x] 2026-04-16: `/app` 파밍 UI 1차 구현
  - `/app` 라우트와 6개 UI 컴포넌트(AlertBanner, ExhibitionMap, LootFeed, LootCard, FilterChips, BoothDetailSheet) 추가
  - 부스 mock 데이터, 지도 핀, 검색/필터, 바텀시트 상세 흐름 연결
  - 메모/찜/완료 상태를 localStorage로 저장하도록 연결
  - 모달 접근성(role/aria, Escape 닫기, 포커스 이동, body scroll lock) 보강
  - headless Playwright로 `/app` 인터랙션과 키보드 접근성 검증 완료

- [x] 2026-04-16: 실시간 상단 알림 배너 데이터 연결
  - Supabase Realtime broadcast channel `expo-harvest-alerts` 구독 추가
  - live alert 없을 때는 일정 기반 fallback 배너 유지
  - `expiresAt` 기준으로 live alert 자동 만료 후 fallback 복귀

- [x] 2026-04-16: 오프라인 캐시 전략(service worker/PWA) 반영
  - 서비스워커로 `/`, `/app`, build/static asset 앱 셸 캐시 추가
  - 네비게이션 요청은 network-first, 실패 시 캐시 fallback으로 처리
  - `manifest.webmanifest`와 `app.html` manifest 링크 추가

- [x] 2026-04-16: expo-harvest 부트스트랩 생성
  - `_sample/sveltekit-supabase` 기반으로 새 프로젝트 디렉토리 생성
  - 앱 slug, env, wrangler 설정을 `expo-harvest` 기준으로 정리
  - PRD 문서와 앱 전용 README/TODO/DONE 초기화
  - 샘플 알림/Capacitor/CRUD 잔여물 제거
  - 전시회 파밍 앱용 랜딩 페이지 초안 적용
