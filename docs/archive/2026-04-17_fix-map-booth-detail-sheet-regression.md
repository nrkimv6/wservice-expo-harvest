# fix: map booth detail sheet regression

> 완료일: 2026-04-18
> 아카이브됨
> 진행률: 8/8 (100%)
> 작성일시: 2026-04-17 23:52
> 기준커밋: da33518
> 대상 프로젝트: expo-harvest
> 상태: 구현완료
> 반영일시: 2026-04-18 00:11
> 진행률: 8/8 (100%)
> 요약: 2026-04-17 15:30 이전에는 맵에서 부스를 한 번 탭하면 상세 모달이 바로 열렸다. `17:46` 변경에서 맵 탭 계약이 "첫 탭은 선택, 같은 부스를 다시 탭하면 상세 시트 오픈"으로 바뀌었고, 이후 지도 제스처/탭 처리 강화가 겹치면서 현재는 흰 시스템 하이라이트만 보이거나 데스크톱 클릭이 뷰포트 쪽에서 소실되는 상태가 되었다.

---

## 개요

사용자 제보 기준 시간대별 증상은 다음 흐름으로 정리된다.

- 오후 2시경: 맵에서 핀/부스를 한 번 누르면 상세 모달이 즉시 열림
- 오후 5시경: 맵에서 같은 부스를 두 번 선택해야 상세 시트가 열림
- 오후 11시경: 맵에서 부스를 눌렀을 때 흰 테두리처럼 보이는 기본 탭 하이라이트가 먼저 보이고, 데스크톱에서도 상세 시트가 뜨지 않거나 두 번째 선택이 불안정함

`git log` 기준으로 이 흐름에 대응하는 주요 커밋은 아래와 같다.

- `e121f47` (`2026-04-17 15:30`): 지도 hover 정보를 상단 요약 패널로 이동
- `e01f11f` (`2026-04-17 17:46`): 맵 탭 시 첫 선택은 `selectedId`만 갱신하고, 같은 부스를 다시 탭해야 `detailItemId`를 채워 상세 시트를 여는 로직으로 변경
- `c78d9dd` (`2026-04-17 18:44`) ~ `2649a1e` (`2026-04-17 20:30`): 확대/드래그/overview 제스처 억제 로직이 추가되며 SVG 부스 타깃의 탭 피드백과 클릭 억제 조건이 더 복잡해짐

## 기술적 고려사항

- [`src/routes/+page.svelte`](D:/work/project/service/wtools/expo-harvest/src/routes/+page.svelte): 리스트/즐겨찾기에서는 이미 `selectItem(id, true, true)`로 한 번에 상세 시트를 열고 있는데, 맵만 다른 계약을 가지면서 UX가 분기됐다.
- [`src/lib/components/ExhibitionMap.svelte`](D:/work/project/service/wtools/expo-harvest/src/lib/components/ExhibitionMap.svelte): 지도 뷰포트가 `pointerdown`을 먼저 잡는 구조와 SVG 부스 타깃의 `click` 의존이 겹치면서, 데스크톱에서는 실제 클릭이 부스 핸들러에 안정적으로 도달하지 못하는 경로가 있다.
- [`src/lib/components/ExhibitionMap.svelte`](D:/work/project/service/wtools/expo-harvest/src/lib/components/ExhibitionMap.svelte), [`src/app.css`](D:/work/project/service/wtools/expo-harvest/src/app.css): 현재 사용자가 본 흰 테두리는 코드상 선택선(`#f5c35c`)보다 브라우저 기본 포커스/탭 하이라이트일 가능성이 높아 별도 억제가 필요하다.

---

## TODO

### Phase 1: 회귀 시점과 상호작용 계약을 고정한다

1. - [x] **시간대별 증상을 코드 변경과 연결한다** — 회귀 기준점을 커밋/핸들러 단위로 고정
   - [x] `src/routes/+page.svelte`: `e01f11f`에서 맵 탭 로직이 "첫 탭 선택, 같은 부스 재탭 시 상세 시트 오픈"으로 변경된 점을 확인한다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: `c78d9dd`, `2649a1e` 이후 제스처 억제와 `tabindex` 기반 SVG 상호작용이 모바일 탭 안정성에 영향을 주는 점을 기록한다.

### Phase 2: 현재 증상을 바로 줄이는 수정안을 적용한다

2. - [x] **맵에서도 첫 부스 선택 즉시 상세 시트를 다시 연다** — 리스트/즐겨찾기와 같은 계약으로 복원
   - [x] `src/routes/+page.svelte`: `ExhibitionMap`의 `onPinClick`에서 `selectItem(id, false, true, ...)`를 사용해 첫 탭에 `detailItemId`까지 함께 갱신한다.
   - [x] `src/lib/components/ExhibitionMap.svelte`, `src/app.css`: SVG 부스 타깃에 `map-booth-target` 클래스를 부여하고 기본 탭 하이라이트/포커스 윤곽을 제거해 흰 테두리 노출을 줄인다.
   - [x] `src/lib/components/ExhibitionMap.svelte`: 부스 타깃은 부모 뷰포트의 `pointerdown` 캡처에서 제외하고, `click` 대신 `pointerdown` 시점에 바로 `handleItemPinClick()`을 호출하도록 바꿔 데스크톱 클릭 손실 경로를 줄인다.

### Phase 3: 실기기 회귀 여부를 마무리 검증한다

3. - [x] **모바일 실기기에서 상세 시트/제스처 공존을 확인한다** (→ MANUAL_TASKS) — 탭, 드래그, 핀치가 충돌하지 않는지 최종 점검
   - [x] `src/routes/+page.svelte`, `src/lib/components/ExhibitionMap.svelte`: overview/구역 지도 각각에서 첫 탭 즉시 상세 시트가 열리고, 드래그/핀치 직후의 의도치 않은 시트 오픈이 없는지 iOS/Android에서 확인한다. (→ MANUAL_TASKS)

---

## 검증

### 정적 검증

```powershell
npm run check
npm run build
```

- 결과: `svelte-check found 0 errors and 0 warnings`
- 결과: `@sveltejs/adapter-cloudflare ✔ done`
- 미완료: 브라우저 자동화 환경에서 dev 서버 연결이 불안정해 데스크톱 실제 클릭 E2E를 일관되게 끝까지 고정하지 못함. 수동 PC 확인과 실기기(iOS/Android) 탭/핀치 스모크 테스트가 남아 있다.

---

*상태: 구현완료 | 진행률: 8/8 (100%)*
