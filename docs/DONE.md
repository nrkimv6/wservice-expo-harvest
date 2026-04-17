# DONE

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
