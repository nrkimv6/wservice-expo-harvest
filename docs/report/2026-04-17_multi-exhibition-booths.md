# 수정 보고서: 다중 박람회 선택 + 부스별 해시태그/SNS 기능

> 작성일: 2026-04-17
> 대상: expo-harvest
> 범위: `/app` 다중 박람회 구조 전환, `쿠팡메가뷰티쇼 2026` 테스트 데이터 추가, 부스 상세 액션 확장

## 변경 배경

- 기존 `/app`은 단일 mock 박람회만 가정하고 있어, 다른 행사 버전을 추가하려면 데이터를 직접 덮어써야 했습니다.
- 사용자는 메뉴에서 박람회를 선택할 수 있는 구조와, 테스트용 행사로 `쿠팡메가뷰티쇼 2026`을 바로 확인할 수 있는 버전을 원했습니다.
- 추가로 각 부스마다 해시태그를 코드블럭 형태로 복사하고, SNS 링크로 바로 이동하는 기능이 필요했습니다.

## 핵심 변경

### 1. 다중 박람회 데이터 구조 도입

- `src/lib/data/lootItems.ts`를 단일 `initialLootItems` 배열에서 `EXHIBITIONS` 구조로 전환했습니다.
- `Exhibition`, `BoothSocialLink` 타입을 추가해 행사 메타데이터, 지도 배경 이미지, 해시태그, SNS 링크를 함께 관리하도록 변경했습니다.
- 기존 demo 행사도 보존해 메뉴 전환과 상태 저장 분리 동작을 같이 확인할 수 있게 했습니다.

### 2. `쿠팡메가뷰티쇼 2026` 테스트 버전 추가

- 주신 배치도 이미지를 `static/images/exhibitions/coupang-mega-beauty-show-2026-layout.png`로 프로젝트에 포함했습니다.
- `Dr.G`, `innisfree`, `AESTURA`, `AHC`, `MEDIHEAL`, `ETUDE`, `rom&nd`, `Avène`, `FORENCOS` 등 시안에 보이는 브랜드 중심으로 테스트 부스를 배치했습니다.
- 각 부스에는 임시 경품/미션/해시태그/SNS 링크를 넣어 실제 인터랙션 테스트가 가능하도록 구성했습니다.
- 배치도는 요청대로 “변경예정” 전제를 유지하는 문구를 화면에 반영했습니다.

### 3. `/app` UI를 박람회 선택형으로 전환

- `src/routes/app/+page.svelte` 상단에 `Exhibition Menu` 섹션을 추가했습니다.
- 선택된 박람회 기준으로 hero 문구, 지도, 리스트, 실시간 fallback 메시지가 모두 함께 바뀌도록 연결했습니다.
- 각 박람회별로 즐겨찾기/완료/메모 상태가 따로 저장되도록 localStorage 키 구조를 분리했습니다.

### 4. 부스 상세 액션 확장

- `src/lib/components/BoothDetailSheet.svelte`에 해시태그 코드블럭과 `코드블럭 복사` 버튼을 추가했습니다.
- Clipboard API 성공 시 `복사됨` 상태를 잠깐 보여주고, 실패 시 재시도 버튼 문구로 바뀌게 했습니다.
- 같은 상세 화면에 SNS 링크 버튼 목록을 추가해 각 부스 브랜드 계정으로 바로 이동할 수 있게 했습니다.

### 5. 지도/리스트 보조 정보 보강

- `ExhibitionMap.svelte`가 행사별 지도 배경 이미지를 지원하도록 수정했습니다.
- `LootCard.svelte`에는 해시태그 개수와 SNS 링크 개수를 보조 정보로 노출했습니다.
- `LootFeed.svelte` 검색 대상에 해시태그와 SNS 링크 라벨도 포함해 부스 검색 범위를 넓혔습니다.

## 저장 방식 변경

- 기존: `expo-harvest:loot-state`
- 변경 후: `expo-harvest:loot-state:v2` + `expo-harvest:selected-exhibition`

의도:

1. 박람회별 상태 충돌 방지
2. 마지막으로 선택한 박람회 복원
3. 새 구조 적용 시 기존 단일 키와 분리

## 검증

실행:

```powershell
cd "D:\work\project\service\wtools\expo-harvest\.worktrees\impl-multi-exhibition-booths"
npm run check
```

결과:

- `svelte-check found 0 errors and 0 warnings`

참고:

- `.svelte` 파일에 대한 `prettier`는 현재 환경에서 `getVisitorKeys is not a function` 오류로 실패했습니다.
- 따라서 이번 세션의 검증 게이트는 `npm run check` 기준으로 확인했습니다.

## 후속 후보

1. `쿠팡메가뷰티쇼 2026` 부스 좌표와 미션/경품 데이터를 실제 운영안 기준으로 정교화
2. SNS 링크를 단순 외부 이동이 아니라 앱 내 공유/복사 흐름으로 확장
3. 부스배치도 변경 시 좌표를 수동 수정하지 않도록 별도 편집 데이터 포맷 도입
