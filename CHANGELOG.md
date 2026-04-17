# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] - 2026-04-17

### Added

- `/app`을 다중 박람회 선택 구조로 전환하고, 메뉴에서 행사 버전을 전환할 수 있도록 변경
- `쿠팡메가뷰티쇼 2026` 테스트 행사와 부스배치도 이미지를 추가하고, 브랜드별 임시 부스 데이터를 연결
- 부스 상세에 해시태그 코드블럭 복사 버튼과 SNS 외부 링크 버튼을 추가

### Fixed

- 박람회별 찜/완료/메모 상태가 서로 섞이지 않도록 localStorage 키를 행사별 구조로 분리
- 지도와 리스트 검색이 선택된 박람회 데이터, 해시태그, SNS 링크 라벨을 기준으로 동작하도록 정리

## [0.1.2] - 2026-04-17

### Fixed

- `npm run build`를 Windows에서 실행할 때 `npm run dev`가 같은 `.svelte-kit/cloudflare` 경로를 잡고 있으면 먼저 감지해서 명시적으로 실패하도록 변경
- `npm run build:raw`를 raw `vite build` 경로로 분리해, 잠금 회피가 필요한 경우 대체 진입점을 제공
- `README.md`, `docs/plan`, `docs/DONE.md`, `docs/report`에 충돌 대응과 검증 절차를 반영

## [0.1.1] - 2026-04-16

### Fixed

- `exhibition-loot-boss-main.zip` 기준으로 `expo-harvest`의 색상 테마를 Deep Navy + Gold 팔레트로 다시 정렬
- `/`, `/app`, 에러 화면, 공통 UI 컴포넌트의 하드코딩 색상과 Tailwind 토큰을 함께 수정
- 수정 보고서와 완료 기록을 추가하고 임시 `.codex-temp` 디렉터리를 `.gitignore`에 등록
