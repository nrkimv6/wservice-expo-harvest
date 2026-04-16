# DONE

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
