# DONE

- [x] 2026-04-18: booth view stair removal and 2f lane spacing
  - `src/lib/data/lootItems.ts`에서 `1F`/`2F` 계단 overlay를 제거하고, `1F` 중앙 4부스를 `renderY: 51`로 올리고, `2F` 우측 3블록을 `아리얼` 아래 공백이 보이도록 재배치
  - `src/lib/components/ExhibitionMap.svelte`에 `인생네컷 포토존`, `쿠팡 와우회원 인증존`, `헤어쇼 이벤트(4/18)` 2줄 라벨 분기를 추가
  - `MANUAL_TASKS.md`를 새 배치 기준으로 갱신했고 `npm run check`, `npm run build`를 main에서 통과
- [x] 2026-04-18: map booth viewport normalization
  - `src/lib/data/lootItems.ts`에 `displayViewBox`와 `defaultScale` 계약을 추가해 `1F` 기준 부스 체감 크기를 `2F`와 `뷰티박스 수령존`에도 맞춤
  - `src/lib/components/ExhibitionMap.svelte`에서 overview/source metrics와 single-section/display metrics를 분리해 초기 진입, 리셋, 포커스, wrapper ratio를 같은 기준으로 정리
  - `npm run check`, `npm run build:raw` 통과 후 계획서 archive, TODO 정리, 수동 확인 항목은 `MANUAL_TASKS.md`로 유지
