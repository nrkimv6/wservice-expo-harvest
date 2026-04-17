# 수정 보고서: 맵 부스 상세 시트 회귀 수정

> 작성일: 2026-04-18
> 대상: expo-harvest
> 범위: 맵 부스 선택 시 상세 시트 오픈 회귀, 흰 탭 하이라이트 제거, 데스크톱 클릭 손실 완화

## 변경 배경

- 2026-04-17 15시대까지는 맵에서 부스를 한 번 선택하면 상세 시트가 바로 열렸습니다.
- 같은 날 17:46 변경 이후 맵 탭 계약이 "첫 선택은 강조만, 같은 부스를 다시 눌러야 상세 시트 오픈"으로 바뀌면서 사용성이 악화됐습니다.
- 이후 지도 확대/드래그 제스처 로직이 추가되며, 데스크톱에서는 클릭이 상세 시트까지 이어지지 않거나 기본 흰 하이라이트만 보이는 경로가 생겼습니다.

## 원인 분석

### 1. 맵 탭만 다른 선택 계약을 사용하고 있었음

- `src/routes/+page.svelte`에서 리스트/즐겨찾기 탭은 `selectItem(..., openDetail=true)`를 사용했지만, 맵 탭만 같은 부스를 두 번째 눌러야 `detailItemId`를 채우는 분기 로직을 사용하고 있었습니다.
- 이 차이 때문에 동일한 부스 선택 UX가 탭마다 달라졌고, 맵에서는 상세 시트가 늦게 뜨거나 아예 안 뜨는 체감이 생겼습니다.

### 2. 지도 뷰포트의 포인터 캡처와 SVG 타깃의 click 의존이 겹쳤음

- `src/lib/components/ExhibitionMap.svelte`의 지도 뷰포트는 확대/드래그를 위해 `pointerdown`을 먼저 잡습니다.
- 부스 타깃은 SVG `<g role="button">`의 `click`에 의존하고 있었는데, 이 구조와 겹치면서 데스크톱 경로에서 실제 클릭이 부스 핸들러까지 안정적으로 도달하지 못하는 상태가 생겼습니다.

### 3. 기본 포커스/탭 하이라이트가 디자인과 충돌했음

- 사용자가 본 흰 테두리는 코드상 선택 강조선(`#f5c35c`)이 아니라 브라우저 기본 포커스/탭 하이라이트에 가까웠습니다.
- SVG 부스 타깃에는 이 기본 하이라이트를 별도로 억제하는 스타일이 없었습니다.

## 핵심 변경

### 1. 맵에서도 첫 선택 즉시 상세 시트를 열도록 복원

- `src/routes/+page.svelte`에서 맵의 `onPinClick`을 `selectItem(id, false, true, ...)`로 변경했습니다.
- 이제 맵도 리스트/즐겨찾기와 동일하게 첫 선택 시 `selectedId`와 `detailItemId`가 함께 갱신됩니다.

### 2. 부스 타깃이 부모 뷰포트의 포인터 캡처에 묻히지 않도록 조정

- `src/lib/components/ExhibitionMap.svelte`에서 `handleViewportPointerDown()`은 `.map-booth-target`에서 시작한 포인터다운을 무시하도록 바꿨습니다.
- 부스 타깃의 상호작용은 `click` 대신 `pointerdown`에서 바로 `handleItemPinClick()`을 호출하도록 옮겼습니다.
- 이 변경으로 데스크톱에서 클릭이 뷰포트 쪽 제스처 로직에 먼저 소비되는 경로를 줄였습니다.

### 3. 흰 기본 하이라이트 제거

- `src/lib/components/ExhibitionMap.svelte`의 부스 타깃 `<g>`에 `map-booth-target` 클래스를 부여했습니다.
- `src/app.css`에 `-webkit-tap-highlight-color: transparent`와 `outline: none`을 추가해 기본 하이라이트가 노출되지 않도록 맞췄습니다.

### 4. 계획서도 현재 분석 결과에 맞게 갱신

- `docs/plan/2026-04-17_fix-map-booth-detail-sheet-regression.md`에 데스크톱 클릭 손실 경로와 포인터 캡처 이슈를 반영했습니다.

## 검증

실행:

```powershell
cd "D:\work\project\service\wtools\expo-harvest"
npm run check
```

결과:

- `npm run check`: 통과 (`svelte-check found 0 errors and 0 warnings`)

추가 확인:

- 브라우저 자동화로 맵 부스 클릭 경로를 추적해, 기존에는 맵 탭이 첫 선택에서 상세 시트를 열지 않았고 뷰포트 포인터 처리와 충돌 가능한 구조였음을 확인했습니다.
- 다만 세션 중 dev 서버 연결이 `ERR_CONNECTION_REFUSED` / `ERR_CONNECTION_RESET`으로 불안정해, 자동화 기반 데스크톱 E2E를 끝까지 일관되게 고정하지는 못했습니다.

## 남은 확인 사항

- 실제 사용 중인 PC 브라우저에서 맵 부스를 한 번 눌렀을 때 상세 시트가 즉시 열리는지 수동 재확인이 필요합니다.
- 확대/드래그 직후 의도치 않게 상세 시트가 열리는 부작용이 없는지도 함께 확인해야 합니다.
- iOS/Android에서도 동일 회귀가 없는지 후속 스모크 테스트가 필요합니다.
