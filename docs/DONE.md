# DONE

- [x] 2026-04-18: map booth viewport normalization
  - `src/lib/data/lootItems.ts`에 `displayViewBox`와 `defaultScale` 계약을 추가해 `1F` 기준 부스 체감 크기를 `2F`와 `뷰티박스 수령존`에도 맞춤
  - `src/lib/components/ExhibitionMap.svelte`에서 overview/source metrics와 single-section/display metrics를 분리해 초기 진입, 리셋, 포커스, wrapper ratio를 같은 기준으로 정리
  - `npm run check`, `npm run build:raw` 통과 후 계획서 archive, TODO 정리, 수동 확인 항목은 `MANUAL_TASKS.md`로 유지
