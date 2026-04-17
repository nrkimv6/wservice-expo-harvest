# Changelog

All notable changes to this project will be documented in this file.

## [0.2.3] - 2026-04-17

### Fixed

- `npm run dev` 시작 직후 브라우저가 먼저 접속해도 `ERR_CONNECTION_REFUSED` 대신 검은 스플래시를 먼저 표시하도록 dev wrapper를 추가
- README에 dev 부팅 중 임시 스플래시 동작을 문서화

## [0.2.2] - 2026-04-17

### Fixed

- 지도, 리스트, 상세 시트에서 선착순 이벤트 부스를 별도로 강조하고 검색·정렬에도 반영
- 상세 시트에 `선착순 이벤트 있음` 강조 문구와 안내 문장을 추가

## [0.2.1] - 2026-04-17

### Fixed

- 저장됨 리스트 카드에서 `prize`가 비어 있으면 선물 아이콘과 경품 행을 숨기도록 정리
- 부스 상세 시트에서 `Prize`, `Mission` 값이 없으면 해당 섹션 자체를 렌더링하지 않도록 변경

## [0.2.0] - 2026-04-17

### Added

- `/app`을 다중 박람회 선택 구조로 전환하고, 메뉴에서 행사 버전을 전환할 수 있도록 변경
- `쿠팡메가뷰티쇼 2026` 테스트 행사와 부스배치도 이미지를 추가하고, 브랜드별 임시 부스 데이터를 연결
- 부스 상세에 해시태그 코드블럭 복사 버튼과 SNS 외부 링크 버튼을 추가

### Fixed

- 박람회별 찜/완료/메모 상태가 서로 섞이지 않도록 localStorage 키를 행사별 구조로 분리
- 지도와 리스트 검색이 선택된 박람회 데이터, 해시태그, SNS 링크 라벨을 기준으로 동작하도록 정리

## [0.1.3] - 2026-04-17

### Fixed

- `package-lock.json`을 재생성해 `picomatch` 의존성 해상도를 바로잡고 Cloudflare Workers 빌드의 `npm ci` 실패를 해결

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
