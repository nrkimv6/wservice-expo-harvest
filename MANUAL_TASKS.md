# MANUAL_TASKS

> 이 문서의 항목은 브라우저 테스트, UI 육안 확인 등 CLI로 검증 불가능한 작업입니다.
> Codex는 이 항목을 "/next" 작업 후보에서 제외합니다.

## 미완료

- [ ] 모바일 실기기에서 상세 시트/제스처 공존을 확인한다 — from: 2026-04-17_fix-map-booth-detail-sheet-regression.md#3 (2026-04-18)
- [ ] `1F`에서 좌측 3부스, 중앙 4부스, 우측 3부스가 벽/행 기준으로 무간격 packing으로 붙어 보이는지 확인 — from: 2026-04-17_refine-coupang-map-booth-packing-and-copy-cleanup.md#16 (2026-04-17)
- [ ] `1F`에서 `쿠팡 어워즈 체험존`, 하단 4개 event box, `출구`, `뷰티박스 수령존`의 `입구/출구`가 요청한 동선 위치로 보이는지 확인 — from: 2026-04-17_refine-coupang-map-booth-packing-and-copy-cleanup.md#16 (2026-04-17)
- [ ] `2F`에서 상단 8부스와 좌측 3칸 lane이 벽에 붙은 가로열처럼 읽히는지 확인 — from: 2026-04-17_refine-coupang-map-booth-packing-and-copy-cleanup.md#16 (2026-04-17)
- [ ] `2F`에서 `아리얼` 아래 공백 뒤에 `인생네컷 포토존 / 포렌코즈 / 파페치·TW 홍보 부스` 3개 block만 우측 column으로 정렬되어 보이는지 확인 — from: 2026-04-17_refine-coupang-map-booth-packing-and-copy-cleanup.md#16 (2026-04-17)
- [ ] 지도에서 장문 안내가 사라지고 부스/이벤트 박스 글자가 이전보다 더 꽉 차 보이는지 확인 — from: 2026-04-17_refine-coupang-map-booth-packing-and-copy-cleanup.md#16 (2026-04-17)
- [ ] `전체` overview에서 두 손가락 pinch와 `+ / - / 리셋` 버튼으로 확대/축소가 모두 동작하는지 확인 — from: 2026-04-17_refine-coupang-overview-map-zoom.md#12 (2026-04-17)
- [ ] `전체` overview에서 드래그 pan 후 선택이 유지되고 의도치 않은 상세 시트 오탭이 발생하지 않는지 확인 — from: 2026-04-17_refine-coupang-overview-map-zoom.md#12 (2026-04-17)
- [ ] `전체` overview에서 같은 부스를 한 번 탭하면 선택만 되고, 두 번째 탭에서 상세 시트가 열리는지 확인 — from: 2026-04-17_refine-coupang-overview-map-zoom.md#12 (2026-04-17)
- [ ] 홈/리스트/상세의 `지도에서 보기`는 기존처럼 해당 섹션으로 이동하고, overview 안에서 지도 부스를 탭할 때만 `all` 상태가 유지되는지 확인 — from: 2026-04-17_refine-coupang-overview-map-zoom.md#12 (2026-04-17)
- [ ] 단일층 지도에서 두 손가락 pinch로 확대/축소가 체감될 정도로 반응하는지 확인 — from: 2026-04-17_refine-coupang-floor-map-gesture-usability.md#7 (2026-04-17)
- [ ] 단일층 지도에서 한 손가락 drag pan 후 의도치 않은 부스 상세 시트가 바로 열리지 않는지 확인 — from: 2026-04-17_refine-coupang-floor-map-gesture-usability.md#7 (2026-04-17)
- [ ] `+ / - / 리셋` zoom 버튼이 단일층 지도에서 모두 동작하는지 확인 — from: 2026-04-17_refine-coupang-floor-map-gesture-usability.md#7 (2026-04-17)
- [ ] 층 전환 후 다시 원래 층으로 돌아왔을 때 마지막 viewport가 복원되는지 확인 — from: 2026-04-17_refine-coupang-floor-map-gesture-usability.md#7 (2026-04-17)
- [ ] 기본 진입 시 `defaultFloorId`가 1F로 표시되는지 확인 — from: 2026-04-17_port-coupang-mega-beauty-floor-map.md#19 (2026-04-17)
- [ ] `전체/1F/2F` 토글이 모두 정상 렌더되는지 확인 — from: 2026-04-17_port-coupang-mega-beauty-floor-map.md#19 (2026-04-17)
- [ ] 1F 브랜드와 2F 브랜드 클릭 시 상세 시트와 층 배지가 맞게 열리는지 확인 — from: 2026-04-17_port-coupang-mega-beauty-floor-map.md#19 (2026-04-17)
- [ ] 상세 시트 닫은 뒤 사용자가 보던 층이 유지되는지 확인 — from: 2026-04-17_port-coupang-mega-beauty-floor-map.md#19 (2026-04-17)
- [ ] 리스트에서 2F 브랜드 선택 시 지도 탭이 2F로 이동하는지 확인 — from: 2026-04-17_port-coupang-mega-beauty-floor-map.md#19 (2026-04-17)
- [ ] 이벤트존/계단/화살표/파란 세로줄이 비클릭 상태인지 확인 — from: 2026-04-17_port-coupang-mega-beauty-floor-map.md#19 (2026-04-17)
- [ ] hover summary 패널이 박스 hover에 맞춰 갱신되는지 확인 — from: 2026-04-17_port-coupang-mega-beauty-floor-map.md#19 (2026-04-17)
- [ ] `1F 전시관 / 2F 전시관 / 뷰티박스 수령존 (1F 외부)` 3개 지도 탭이 모두 보이고 선택 가능한지 확인 — from: 2026-04-17_refine-coupang-map-segmentation-and-booth-normalization.md#8 (2026-04-17)
- [ ] 1F 브랜드 카드→상세→`지도에서 보기`로 1F 전시관이 열리고, 이후 뷰티박스 수령존 탭으로 이동해도 viewport가 안정적으로 유지되는지 확인 — from: 2026-04-17_refine-coupang-map-segmentation-and-booth-normalization.md#8 (2026-04-17)
- [ ] 뷰티박스 수령존 탭에서 2F 브랜드 상세→`지도에서 보기`를 누르면 2F 전시관으로 정상 전환되는지 확인 — from: 2026-04-17_refine-coupang-map-segmentation-and-booth-normalization.md#8 (2026-04-17)
- [ ] `1F 전시관`에서 `쿠팡 어워즈 체험존 / 피부측정 이벤트 / 뷰티 디바이스 체험존 / 쿠팡 뉴존 체험존 / 뉴존 선물 수령존`이 booth-sized 박스로 보이면서 기존 위치 앵커는 유지되는지 확인 — from: 2026-04-17_fix-coupang-map-layout-regressions-after-section-split.md#10 (2026-04-17)
- [ ] `1F 전시관`에서 우측 회색 계단 2개가 모두 사라지고 파란 `decorRect`만 남는지 확인 — from: 2026-04-17_fix-coupang-map-layout-regressions-after-section-split.md#11 (2026-04-17)
- [ ] `1F 전시관`에서 `에스트라 / 바닐라코 / 닥터지 / AHC`가 기존보다 위로 올라와 `롬앤`과 `듀이트리` 사이 높이대에 보이는지 확인 — from: 2026-04-18_refine-booth-view-stair-removal-and-2f-lane-spacing.md#2 (2026-04-18)
- [ ] `2F 전시관`에서 `아벤느~아리얼` 8개 브랜드가 한 줄 가로열로 복원되고, `포렌코즈`는 그 열에 섞이지 않는지 확인 — from: 2026-04-17_fix-coupang-map-layout-regressions-after-section-split.md#7 (2026-04-17)
- [ ] `2F 전시관`에서 `헤어쇼 이벤트 / 쿠팡 메가뷰티쇼 스토리 / 쿠팡 와우회원 인증존`은 좌측 세로열, `인생네컷 포토존 / 포렌코즈 / 파페치·TW 홍보 부스`는 우측 세로축으로 분리되어 보이는지 확인 — from: 2026-04-17_fix-coupang-map-layout-regressions-after-section-split.md#8 (2026-04-17)
- [ ] `2F 전시관`에서 `인생네컷 포토존`, `쿠팡 와우회원 인증존`, `헤어쇼 이벤트(4/18)` 라벨이 각각 2줄로 개행되어 더 읽기 쉬운지 확인 — from: 2026-04-18_refine-booth-view-stair-removal-and-2f-lane-spacing.md#5 (2026-04-18)
- [ ] `뷰티박스 수령존` 탭이 단독 section이라도 다른 section보다 과대 확대되어 보이지 않고, 수령존 박스 크기가 1F/2F booth-sized eventZone과 비슷하게 느껴지는지 확인 — from: 2026-04-17_fix-coupang-map-layout-regressions-after-section-split.md#4 (2026-04-17)
- [ ] 정보 부족 부스가 긴 가로형이 아니라 공통 4:3 박스로 보이고, 부스 글씨가 이전보다 더 꽉 차게 보이는지 확인 — from: 2026-04-17_refine-coupang-map-segmentation-and-booth-normalization.md#8 (2026-04-17)
- [ ] SVG 외곽 녹색 테두리가 사라졌는지, 부스 모서리가 각지고 부스 간 간격이 이전보다 조밀해졌는지 확인 — from: 2026-04-17_refine-coupang-map-segmentation-and-booth-normalization.md#8 (2026-04-17)
- [ ] `전체` overview에서 1F 계단 삭제, 1F 중앙 4부스 상향, 2F 우측 3부스 재배치가 한 화면에서 함께 반영되는지 확인 — from: 2026-04-18_refine-booth-view-stair-removal-and-2f-lane-spacing.md#10 (2026-04-18)
- [ ] `2F` 단일 section에서도 우측 3부스 순서가 `인생네컷 포토존 -> 포렌코즈 -> 파페치·TW 홍보 부스`로 유지되는지 확인 — from: 2026-04-18_refine-booth-view-stair-removal-and-2f-lane-spacing.md#10 (2026-04-18)
- [ ] `1F → 2F → 뷰티박스 수령존` 순서로 탭을 바꿔도 기본 진입 시 부스 체감 크기가 1F 기준과 크게 다르지 않은지 확인 — from: 2026-04-18_fix-map-booth-viewport-normalization.md#7 (2026-04-18)
- [ ] `2F` 첫 진입에서 좌측 lane과 우측 column이 모두 보이는 상태로 시작하면서도 상단 8부스가 1F보다 과하게 작아 보이지 않는지 확인 — from: 2026-04-18_fix-map-booth-viewport-normalization.md#7 (2026-04-18)
- [ ] `뷰티박스 수령존`에서 `리셋` 후에도 같은 시야로 돌아오고, 단독 section 과대 확대처럼 보이지 않는지 확인 — from: 2026-04-18_fix-map-booth-viewport-normalization.md#7 (2026-04-18)

## 완료
