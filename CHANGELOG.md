# Changelog

All notable changes to this project will be documented in this file.

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
