# 수정 보고서: 루트 화면 버튼 먹통 수정

> 작성일: 2026-04-17
> 대상: expo-harvest
> 범위: `/` 루트 화면의 하단 네비게이션, 층 선택 버튼, dev 실행 재현 검증

## 변경 배경

- 사용자가 `npm run dev -- --host`로 실행한 뒤 루트 화면에서 하단 네비게이션과 층 선택 버튼이 전부 동작하지 않는 현상이 확인됐습니다.
- 처음에는 dev wrapper의 `5173 -> 내부 Vite 포트` 리다이렉트 문제 가능성도 있었지만, 실제로는 루트 화면 하이드레이션 중 클라이언트 예외가 먼저 발생하고 있었습니다.
- 버튼 DOM은 렌더되지만 반응성이 중간에 끊겨 상태 전환이 멈추는 유형이라, 실행 방식과 UI 코드를 분리해서 원인을 확인할 필요가 있었습니다.

## 원인 분석

### 1. 실행 방식 자체는 직접 원인이 아니었음

- `scripts/run-dev.mjs`는 외부 포트에 스플래시 서버를 띄우고, 준비가 되면 내부 Vite 포트로 리다이렉트하는 구조입니다.
- Playwright로 `http://127.0.0.1:5173`과 실제 내부 포트 `http://127.0.0.1:5174`를 각각 열어 비교한 결과, 두 경로 모두 동일하게 버튼이 멈췄습니다.
- 따라서 `--host` 옵션이나 wrapper redirect 자체보다, 클라이언트 부트 중 예외가 더 근본 원인임을 확인했습니다.

### 2. `ExhibitionMap.svelte`의 effect update loop

- 문제 지점은 `src/lib/components/ExhibitionMap.svelte`의 viewport 초기화/저장 로직이었습니다.
- `resetViewport()`와 `setViewportCenter()`가 `floorViewportStates`를 읽은 뒤 같은 effect 흐름에서 다시 쓰고 있었고, 이 읽기가 반응성 추적으로 잡히면서 `effect_update_depth_exceeded`가 발생했습니다.
- 그 결과 루트 페이지 하이드레이션이 중단되어, 하단 네비와 층 버튼의 `onclick` 상태 전환이 모두 멈췄습니다.

## 핵심 변경

### 1. viewport state 읽기를 `untrack`으로 분리

- `src/lib/components/ExhibitionMap.svelte`에 `untrack` import를 추가했습니다.
- 저장된 viewport를 읽을 때 `untrack(() => floorViewportStates[floor.id])`로 반응성 추적을 끊었습니다.
- 상태를 다시 병합할 때도 기존 `floorViewportStates` 전체를 `untrack`으로 읽어서 effect가 자기 자신을 다시 구독하지 않도록 정리했습니다.

### 2. 루트 화면 버튼 동작 재검증

- 모바일 터치 조건으로 headless 브라우저를 열어 루트 화면을 직접 눌러 확인했습니다.
- 하단 `리스트`, `즐겨찾기`, `지도` 탭 전환과 지도 내부 `2F` 버튼 활성화가 모두 정상 반영되는지 확인했습니다.
- `5173` 진입 후 내부 포트로 리다이렉트된 경우에도 동일하게 정상 동작함을 다시 확인했습니다.

## 검증

실행:

```powershell
cd "D:\work\project\service\wtools\expo-harvest"
npm run check
```

결과:

- `npm run check`: 통과 (`svelte-check found 0 errors and 0 warnings`)
- Playwright 재현 테스트:
  - `http://127.0.0.1:5173` 접속 후 `리스트` 탭 전환 성공
  - `즐겨찾기` 탭 전환 성공
  - `지도` 복귀 후 `2F` 버튼 활성화 성공
  - 초기 `pageerror`/`effect_update_depth_exceeded` 재현되지 않음

## 참고

- 이번 수정은 dev wrapper를 변경한 작업이 아니라, wrapper를 통해 드러난 클라이언트 하이드레이션 결함을 바로잡은 작업입니다.
- 동일 패턴의 viewport 저장 로직이 다른 컴포넌트에 추가될 경우에도, effect 내부에서 상태를 읽고 다시 쓸 때는 `untrack` 또는 구조 분리가 필요합니다.
