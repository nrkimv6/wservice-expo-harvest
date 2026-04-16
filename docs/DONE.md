# DONE

- [x] 2026-04-16: `/app` 파밍 UI 1차 구현
  - `/app` 라우트와 6개 UI 컴포넌트(AlertBanner, ExhibitionMap, LootFeed, LootCard, FilterChips, BoothDetailSheet) 추가
  - 부스 mock 데이터, 지도 핀, 검색/필터, 바텀시트 상세 흐름 연결
  - 메모/찜/완료 상태를 localStorage로 저장하도록 연결
  - 모달 접근성(role/aria, Escape 닫기, 포커스 이동, body scroll lock) 보강

- [x] 2026-04-16: expo-harvest 부트스트랩 생성
  - `_sample/sveltekit-supabase` 기반으로 새 프로젝트 디렉토리 생성
  - 앱 slug, env, wrangler 설정을 `expo-harvest` 기준으로 정리
  - PRD 문서와 앱 전용 README/TODO/DONE 초기화
  - 샘플 알림/Capacitor/CRUD 잔여물 제거
  - 전시회 파밍 앱용 랜딩 페이지 초안 적용
