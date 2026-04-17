# port: coupang mega beauty floor map

> 완료일: 2026-04-17
> 아카이브됨
> 작성일시: 2026-04-17 14:52 (2026-04-17 15:55 확장)
> 기준커밋: e121f47
> 대상 프로젝트: expo-harvest
> 상태: 구현완료
> 반영일시: 2026-04-17 16:08
> 머지커밋: 628313c
> 진행률: 83/83 (100%)
> 원본 자료: `C:/Users/Narang/Downloads/b_FU8ddfFKm4k.zip` (압축 내부 `app/page.tsx` — 1F/2F/all 토글, 순수 SVG 도형, 배경 이미지 없음)
> 요약: 원본은 1F(viewBox 700×400)와 2F(viewBox 700×320) 두 SVG를 세로로 스택하여 배경 이미지 없이 브랜드 박스·이벤트존·계단·화살표만 그린다. 현재 expo-harvest는 `mapBackgroundImage` 1장과 퍼센트 `mapX/mapY` 단일 좌표만 지원하므로, 층·viewBox·오버레이 엔터티를 보존하는 데이터 모델로 재설계하고, 데이터를 이 모델 위에 재이식한다.

---

## 개요

원본 `app/page.tsx`는 `activeFloor: "1F" | "2F" | "all"` 토글로 두 SVG를 분기 렌더링한다. 두 층은 **서로 다른 viewBox**(1F 700×400, 2F 700×320)를 쓰며 배경 이미지 없이 `Booth`, `EventZone`, `Arrow`, `Stairs`, 그리고 의미 불명의 파란 세로 `rect`(1F) 같은 순수 SVG 도형만으로 구성된다. 반면 현재 [`src/lib/data/lootItems.ts`](../../src/lib/data/lootItems.ts)는 행사당 배경 이미지 1장과 퍼센트 `mapX/mapY` 단일 좌표만 저장하고, [`src/lib/components/ExhibitionMap.svelte`](../../src/lib/components/ExhibitionMap.svelte)는 그 위에 원형 핀을 얹는 구조다.

이 계획의 목표는 (1) 원본의 층 + viewBox + 오버레이 정보를 손실 없이 담을 데이터 모델 재설계, (2) 쿠팡 메가뷰티쇼 2026 데이터의 층별 재이식, (3) 1F/2F/전체 토글 UI 이식, (4) 회귀 검증이다.

## 선행 조건 및 주요 설계 결정

### 선행 조건 (Phase 1 착수 전)

1. **hover UX 선행 분리 커밋 완료**: `src/lib/components/ExhibitionMap.svelte`의 hover 패널 변경은 2026-04-17 커밋 `e121f47`(`refactor: move map hover details to summary panel`)로 이미 분리됐다. 본 plan은 그 이후 상태를 기준으로 진행한다.
2. **zip 재해석 안 하도록 좌표 표 박제**(아래 §부록 A·B·C).

### 설계 결정 (이 plan 내에서 확정)

| 결정 항목 | 선택 | 근거 |
|---|---|---|
| 좌표 단위 | **픽셀 보존 (viewBox 기반)** | 층마다 viewBox가 달라 단일 퍼센트 변환 시 가로세로 왜곡. 원본과 동일한 픽셀 좌표 + 층별 viewBox 저장이 단순·무손실 |
| 배경 이미지 | **제거 확정** | 원본엔 배경 이미지가 없음. SVG 오버레이만으로 완전 재현 가능하며 이중 좌표계를 방지 |
| `all` 뷰 레이아웃 | **1F/2F 세로 스택** | 원본 그대로. 단일 캔버스 합성은 층별 viewBox 차이로 불가 |
| 부스 UI | **박스 라벨 기본, 클릭 시 상세 시트** | 원본의 박스 라벨을 유지하되 브랜드 박스만 클릭 가능. 기존 원형 핀 렌더러는 `mapBackgroundImage`를 쓰는 다른 전시가 없으므로 이 전시 한정 대체 가능 |
| 이벤트존/계단/화살표/파란 세로줄 | **비선택 장식 오버레이** | 클릭 비활성, 목록/검색에서도 제외 |
| 이벤트존 검색성 | **이번 범위에서 제외** | 비브랜드 지점 검색은 별도 요구사항. 제외임을 문서화 |
| 브랜드 `fontSize` | **데이터 필드로 저장** | 원본이 라벨 길이에 따라 8/9/10 혼재. 자동 계산 대신 데이터 보존이 단순·충실 |
| AGE20'S 항목 누락 지적 | **반박** | 현 데이터에 이미 `cmbs-2026-age20s` item(lootItems.ts:391), hashtag preset(:93), social link가 존재한다. 추가가 아니라 `floorId`/픽셀 좌표 재이식 대상이다 |
| `aspectRatio` / 그리드 배경 / hallLabels | **전면 제거** | viewBox 기반 렌더로 대체. `ExhibitionMap.svelte` L53(aspect-ratio), L64-78(rows/columns 그리드), L80-86(hallLabels) 제거 |
| 호버 패널 | **유지** | e121f47에서 추가된 summary 패널(L34-49)은 그대로. hover 타겟만 `<rect>` 박스로 변경 |

### 브랜드 매핑 표 (원본 → 현 데이터)

**1F (10개)**

| 원본 라벨 | 현 id |
|---|---|
| rom&nd | cmbs-2026-romand |
| DEWYTREE | cmbs-2026-dewytree |
| NATURE REPUBLIC | cmbs-2026-naturerepublic |
| AESTURA | cmbs-2026-aestura |
| BANILA CO | cmbs-2026-banilaco |
| Dr.G | cmbs-2026-drg |
| AHC | cmbs-2026-ahc |
| THE FACE SHOP | cmbs-2026-thefaceshop |
| espoir | cmbs-2026-espoir |
| TONYMOLY | cmbs-2026-tonymoly |

**2F (9개)**

| 원본 라벨 | 현 id | 비고 |
|---|---|---|
| Avène | cmbs-2026-avene | |
| ETUDE | cmbs-2026-etude | |
| easydew | cmbs-2026-easydew | |
| MEDIHEAL | cmbs-2026-mediheal | |
| innisfree | cmbs-2026-innisfree | |
| PHYSIOGEL | cmbs-2026-physiogel | |
| AGE20'S | cmbs-2026-age20s | 현 데이터에 이미 존재. 2F `floorId`와 픽셀 박스 좌표만 재설정 |
| Ariul | cmbs-2026-ariul | |
| FORENCOS | cmbs-2026-forencos | |

**이벤트존 (참고용, 이번 범위 브랜드만 이식)**
- 1F: 쿠팡 어워즈 체험존, 피부측정 이벤트, 뷰티 디바이스 체험존, 쿠팡 뉴존 체험존, 뉴존 선물 수령존, 뷰티박스 수령존
- 2F: 인생네컷 포토존, 파페치/TW 홍보 부스, 헤어쇼 이벤트(4/18), 쿠팡 메가뷰티쇼 스토리, 쿠팡 와우회원 인증존

---

## TODO

### Phase 1: 층 + viewBox + 오버레이를 수용하는 데이터 모델을 정의한다

1. - [x] **`FloorMap` / 오버레이 / `MapOverlay` 타입 정의**
   - [x] `src/lib/data/lootItems.ts`: `interface FloorMap { id: string; label: string; viewBox: string; overlays: MapOverlay[] }` 추가 (export)
   - [x] `src/lib/data/lootItems.ts`: `interface EventZoneOverlay { kind: 'eventZone'; floorId: string; x: number; y: number; width: number; height: number; label: string; fontSize?: number }` 추가
   - [x] `src/lib/data/lootItems.ts`: `interface StairsOverlay { kind: 'stairs'; floorId: string; x: number; y: number; width: number; height: number; steps?: number }` 추가 (기본 6)
   - [x] `src/lib/data/lootItems.ts`: `interface ArrowOverlay { kind: 'arrow'; floorId: string; x: number; y: number; direction: 'up'|'down'|'left'|'right'; label: string; color?: string }` 추가
   - [x] `src/lib/data/lootItems.ts`: `interface DecorRectOverlay { kind: 'decorRect'; floorId: string; x: number; y: number; width: number; height: number; fill: string }` 추가 (의미 불명 파란 세로줄 주석)
   - [x] `src/lib/data/lootItems.ts`: `type MapOverlay = EventZoneOverlay | StairsOverlay | ArrowOverlay | DecorRectOverlay` 유니온 export

2. - [x] **`Exhibition` 인터페이스를 층 기반으로 재편 (L40-52)**
   - [x] `src/lib/data/lootItems.ts`: `Exhibition`에 `floors: FloorMap[]`, `defaultFloorId: string` 필드 추가
   - [x] `src/lib/data/lootItems.ts`: `mapAspectRatio`, `mapBackgroundImage`, `hallLabels` 필드 제거 (쿠팡 메가뷰티쇼 외 전시 없음 → 안전)
   - [x] `src/lib/data/lootItems.ts`: 제거 대신 필드 존치 시 타 참조처 파급이 필요하므로 **제거를 우선**. `npm run check`로 타 참조 없음 검증

3. - [x] **`LootItem`에 층·박스 필드 추가 (L20-38)**
   - [x] `src/lib/data/lootItems.ts`: `LootItem`에 `floorId: string`, `boxWidth: number`, `boxHeight: number`, `fontSize?: number` 추가
   - [x] `src/lib/data/lootItems.ts`: `mapX`, `mapY` 주석을 "퍼센트(0–100)" → "픽셀(viewBox 기준)"으로 바꾸고 의미 변경을 명시
   - [x] `src/lib/data/lootItems.ts`: 과거 `stripBoothMeta` 전제는 현재 제거됐다. 대신 `applyCoupangMegaBeautyBoothLayout()`에서 `location`을 `floorId`로만 보정하고, 명시적 위치 문구는 유지한다는 주석으로 정리

### Phase 2: 쿠팡 메가뷰티쇼 2026 데이터를 층·픽셀 기준으로 재이식한다

4. - [x] **`coupangMegaBeautyShow2026`에 `floors` 정의 주입 (L152-163)**
   - [x] `src/lib/data/lootItems.ts`: `mapBackgroundImage: '/images/exhibitions/coupang-mega-beauty-show-2026-layout.png'`, `mapAspectRatio: '11 / 12'` 제거
   - [x] `src/lib/data/lootItems.ts`: `floors: [{ id: '1F', label: '1F', viewBox: '0 0 700 400', overlays: [...1F overlays] }, { id: '2F', label: '2F', viewBox: '0 0 700 320', overlays: [...2F overlays] }]`, `defaultFloorId: '1F'` 설정
   - [x] `src/lib/data/lootItems.ts`: `mapNote` 문구를 "임시사진" 언급에서 "1F/2F 레이아웃 기준" 같은 정확한 설명으로 갱신
   - [x] `static/images/exhibitions/coupang-mega-beauty-show-2026-layout.png`: 코드 참조 없음 확인 후 삭제

5. - [x] **19개 브랜드 좌표를 원본 픽셀로 이식**
   - [x] `src/lib/data/lootItems.ts`: 1F 10개 브랜드 항목(`romand`, `dewytree`, `naturerepublic`, `aestura`, `banilaco`, `drg`, `ahc`, `thefaceshop`, `espoir`, `tonymoly`)에 `floorId: '1F'` 및 §부록 A의 `mapX`, `mapY`, `boxWidth`, `boxHeight`, `fontSize` 주입. 기존 퍼센트 `mapX/mapY` 값은 폐기
   - [x] `src/lib/data/lootItems.ts`: 2F 9개 브랜드 항목(`avene`, `etude`, `easydew`, `mediheal`, `innisfree`, `physiogel`, `age20s`, `ariul`, `forencos`)에 `floorId: '2F'` 및 §부록 A의 픽셀 좌표 주입

6. - [x] **1F EventZone 6개를 오버레이 배열에 추가** (§부록 B 1F)
   - [x] `src/lib/data/lootItems.ts`: 쿠팡 어워즈 체험존, 피부측정 이벤트, 뷰티 디바이스 체험존, 쿠팡 뉴존 체험존, 뉴존 선물 수령존, 뷰티박스 수령존 6건을 `EventZoneOverlay`로 기록

7. - [x] **2F EventZone 5개를 오버레이 배열에 추가** (§부록 B 2F)
   - [x] `src/lib/data/lootItems.ts`: 인생네컷 포토존, 파페치/TW 홍보 부스, 헤어쇼 이벤트(4/18), 쿠팡 메가뷰티쇼 스토리, 쿠팡 와우회원 인증존 5건을 `EventZoneOverlay`로 기록

8. - [x] **1F 비브랜드 오버레이 이식** (§부록 C)
   - [x] `src/lib/data/lootItems.ts`: 1F 계단 2개(`Stairs x=620 y=30 w=50 h=80`, `x=620 y=280 w=50 h=80`)를 `StairsOverlay`로 기록
   - [x] `src/lib/data/lootItems.ts`: 1F IN/OUT 화살표 4개(460/210 down OUT, 510/210 up IN, 430/365 down OUT, 480/365 up IN)를 `ArrowOverlay`로 기록
   - [x] `src/lib/data/lootItems.ts`: 1F 파란 세로 rect(`x=595 y=280 w=15 h=100 fill=#1976d2`)를 `DecorRectOverlay`로 기록하고 "의미 불명 — 원본 재현용" 주석 추가

9. - [x] **AGE20'S 기존 데이터 정합성 확인 (L391-421)**
   - [x] `src/lib/data/lootItems.ts`: 이미 존재하는 `cmbs-2026-age20s`의 좌표를 §부록 A의 2F 값으로 덮어쓴다 (신규 추가 아님)

10. - [x] **목록/카드에 층 배지 노출**
    - [x] `src/lib/components/LootCard.svelte`: 카드 헤더 또는 메타 영역에 `item.floorId` 배지(예: "1F") 렌더
    - [x] `src/lib/components/BoothDetailSheet.svelte`: 상세 시트 제목 하단에 "1F"/"2F" 배지 렌더
    - [x] `src/lib/data/lootItems.ts` export 상수: 층 라벨을 얻는 헬퍼 `getFloorLabel(exhibition, floorId)` 추가 (선택)

11. - [x] **리스트 → 층 이동 연동**
    - [x] `src/routes/+page.svelte`: `selectItem(id)` 흐름에서 해당 브랜드의 `floorId`를 `ExhibitionMap`에 전달해 활성 층을 동기화. 이를 위해 `ExhibitionMap`에 `activeFloorOverride?: string` prop 또는 bindable 상태 추가
    - [x] `src/routes/+page.svelte`: 맵 탭이 아닌 상태에서 선택 시 탭 전환 여부 결정 후 구현 (기본: 맵 탭으로 전환)

### Phase 3: 1F/2F/전체 토글 지도를 구현한다

12. - [x] **`ExhibitionMap.svelte` 기존 렌더 경로 제거**
    - [x] `src/lib/components/ExhibitionMap.svelte`: L53 `style={aspect-ratio:${exhibition.mapAspectRatio ?? '16 / 10'}}` 제거
    - [x] `src/lib/components/ExhibitionMap.svelte`: L55-62 `#if exhibition.mapBackgroundImage` 이미지 블록 제거
    - [x] `src/lib/components/ExhibitionMap.svelte`: L64-78 rows/columns 그리드 배경 제거 (`rows`, `columns` 선언도 삭제)
    - [x] `src/lib/components/ExhibitionMap.svelte`: L80-86 `hallLabels` 렌더 블록 제거
    - [x] `src/lib/components/ExhibitionMap.svelte`: L92-140 원형 핀 `<button>` 블록 제거 (다음 항목에서 박스 렌더로 대체)

13. - [x] **층 상태 및 토글 UI 추가**
    - [x] `src/lib/components/ExhibitionMap.svelte`: `type ActiveFloor = string | 'all'` 도입 후 `let activeFloor: ActiveFloor = $state(exhibition.defaultFloorId)` 선언
    - [x] `src/lib/components/ExhibitionMap.svelte`: props에 `activeFloorOverride?: string` 추가. `$effect`로 override 변경 시 `activeFloor`에 반영
    - [x] `src/lib/components/ExhibitionMap.svelte`: `[{ value: 'all', label: '전체' }, ...exhibition.floors.map(f => ({ value: f.id, label: f.label }))]` 리스트로 토글 버튼 렌더. 활성 상태 스타일은 기존 border/배경 토큰 재사용

14. - [x] **층별 SVG 렌더러 구현**
    - [x] `src/lib/components/ExhibitionMap.svelte`: `visibleFloors = $derived(activeFloor === 'all' ? exhibition.floors : exhibition.floors.filter(f => f.id === activeFloor))`
    - [x] `src/lib/components/ExhibitionMap.svelte`: `{#each visibleFloors as floor}` 블록 안에 `<h3>` 층 라벨 + `<svg viewBox={floor.viewBox} class="w-full">` 렌더. 세로 스택은 `flex flex-col gap-4`
    - [x] `src/lib/components/ExhibitionMap.svelte`: SVG 내부 가장자리 `<rect x=20 y=20 width=660 height={floorHeight-40} stroke="#4caf50" fill="none">` outline 렌더 (원본 재현)

15. - [x] **브랜드 박스 렌더 + 클릭·hover 처리**
    - [x] `src/lib/components/ExhibitionMap.svelte`: `floorItems = items.filter(i => i.floorId === floor.id)` 후 `{#each floorItems as item}`로 `<g>` + `<rect>` + `<text>` 렌더
    - [x] `src/lib/components/ExhibitionMap.svelte`: `<rect>`는 `item.mapX`, `item.mapY`, `item.boxWidth`, `item.boxHeight`, `fill="#e8f5e9"`, `stroke="#4caf50"` 적용. 상태별 색(완료/선착순/찜) 기존 토큰으로 오버라이드
    - [x] `src/lib/components/ExhibitionMap.svelte`: `<text>`는 박스 중앙 + `font-size={item.fontSize ?? 10}`로 `item.englishTitle ?? item.title` 렌더
    - [x] `src/lib/components/ExhibitionMap.svelte`: `<g>`에 `onclick={() => onPinClick(item.id)}`, `onmouseenter/leave/focus/blur`를 옮겨 기존 hover summary 패널 동작 보존
    - [x] `src/lib/components/ExhibitionMap.svelte`: 선착순 이벤트 뱃지(L125-130), 완료/북마크 아이콘(L132-138)을 박스 우상단에 `<foreignObject>` 또는 SVG `<circle>`로 축소 배치

16. - [x] **오버레이 렌더 (비선택)**
    - [x] `src/lib/components/ExhibitionMap.svelte`: `floor.overlays`를 순회하며 `kind`별 `<rect>`/`<path>`/`<g stairs>` 렌더. `pointer-events="none"` 공통 적용
    - [x] `src/lib/components/ExhibitionMap.svelte`: `ArrowOverlay`는 원본 `getPath()`(plan 부록 C 참조) 로직을 Svelte 헬퍼 함수로 이식
    - [x] `src/lib/components/ExhibitionMap.svelte`: `StairsOverlay`는 `steps` 수만큼 `<line>` 반복 렌더
    - [x] `src/lib/components/ExhibitionMap.svelte`: `DecorRectOverlay`는 단순 `<rect fill={overlay.fill}>`

17. - [x] **`+page.svelte` 연동 점검 (L350)**
    - [x] `src/routes/+page.svelte`: `<ExhibitionMap exhibition={selectedExhibition} items={items} onPinClick={selectItem} />` 호출부 유지. 필요 시 `activeFloorOverride={...}` prop만 추가
    - [x] `src/routes/+page.svelte`: 선택된 아이템 변경 시 override 계산 로직 추가 (Phase 2 Item 11 연동)

### Phase 4: 회귀 방지와 문서 정리

18. - [x] **정적 검증**
    - [x] `npm run check`: 타입/템플릿 오류 0건 확인 (lootItems.ts, ExhibitionMap.svelte, LootCard.svelte, BoothDetailSheet.svelte, +page.svelte 전파)
    - [x] `npm run build`: 빌드 성공 확인
    - [x] 미사용 import 정리 (특히 `MapPin`, `Bookmark`, `CheckCircle2` 재배치 여부 확인)

19. - [x] **수동 시나리오 검증**
    - [x] 초기 진입 시 기본 층(`defaultFloorId`)이 1F로 표시되는지 확인 (→ MANUAL_TASKS)
    - [x] "전체/1F/2F" 토글 전환 3방향 모두 정상 렌더 확인 (→ MANUAL_TASKS)
    - [x] 1F 브랜드 1개, 2F 브랜드 1개 각각 클릭 → 상세 시트 열림 → 층 배지 표시 확인 (→ MANUAL_TASKS)
    - [x] 상세 시트 닫은 뒤 사용자가 보던 층이 유지되는지 확인 (→ MANUAL_TASKS)
    - [x] 리스트(`LootFeed`)에서 2F 브랜드 선택 시 지도 탭이 2F로 이동하는지 확인 (→ MANUAL_TASKS)
    - [x] 이벤트존/계단/화살표/파란 세로줄 클릭 시 반응 없는지 확인 (→ MANUAL_TASKS)
    - [x] hover summary 패널(L34-49)이 박스 hover 시 정상 업데이트되는지 확인 (→ MANUAL_TASKS)

20. - [x] **임시 좌표/문서 정리**
    - [x] `docs/plan/2026-04-17_port-coupang-mega-beauty-floor-map.md`: 현재 반영 좌표/라벨은 부록 A·B·C 기준으로 모두 원본 일치
    - [x] `TODO.md`(존재 시에만): 관련 항목이 이미 In Progress에서 이 plan 링크를 가리키도록 유지

---

## 자동 생성 스킵 판정

- **Phase R (fix plan 재발 경로 분석)**: 해당 없음 — 본 plan은 `port:` plan이며 fix 성격 아님
- **Phase IA (파일 이동 영향 분석)**: 해당 없음 — 별도 파일 이동/이름변경 없음. 기존 `static/images/...layout.png`는 참조 없음 확인 후 삭제 완료
- **Phase DB-Direct**: 해당 없음 — DB 없는 SvelteKit 프로젝트
- **Phase T1~T5 (Python 백엔드 테스트)**: 해당 없음 — SvelteKit 프론트엔드이며 `tests/` 디렉토리 부재 (Glob 확인). `npm run check` + 수동 시나리오(Phase 4)로 대체

> T1 해당 없음: Python 백엔드 아님 (SvelteKit+TS). `tests/` 디렉토리 없음.
> T2 해당 없음: 동일.
> T3 해당 없음: 동일. 프런트엔드 수동 시나리오는 Phase 4 Item 19에 포함.
> T4 해당 없음: 동일. pytest/Playwright 인프라 부재.
> T5 해당 없음: HTTP 백엔드 없음.

---

## 부록 A: 브랜드 박스 좌표 (원본 `app/page.tsx` 픽셀)

### 1F (viewBox `0 0 700 400`)

| id | 원본 라벨 | mapX | mapY | boxWidth | boxHeight | fontSize |
|---|---|---|---|---|---|---|
| cmbs-2026-romand | rom&nd | 30 | 30 | 80 | 40 | 10 |
| cmbs-2026-dewytree | DEWYTREE | 30 | 75 | 80 | 35 | 10 |
| cmbs-2026-naturerepublic | NATURE REPUBLIC | 30 | 115 | 80 | 40 | 8 |
| cmbs-2026-aestura | AESTURA | 150 | 50 | 60 | 35 | 9 |
| cmbs-2026-banilaco | BANILA CO | 215 | 50 | 70 | 35 | 9 |
| cmbs-2026-drg | Dr.G | 290 | 50 | 50 | 35 | 10 |
| cmbs-2026-ahc | AHC | 345 | 50 | 50 | 35 | 10 |
| cmbs-2026-thefaceshop | THE FACE SHOP | 500 | 30 | 90 | 45 | 9 |
| cmbs-2026-espoir | espoir | 500 | 80 | 90 | 45 | 10 |
| cmbs-2026-tonymoly | TONYMOLY | 500 | 130 | 90 | 45 | 10 |

### 2F (viewBox `0 0 700 320`)

| id | 원본 라벨 | mapX | mapY | boxWidth | boxHeight | fontSize |
|---|---|---|---|---|---|---|
| cmbs-2026-avene | Avène | 30 | 30 | 60 | 35 | 9 |
| cmbs-2026-etude | ETUDE | 95 | 30 | 60 | 35 | 9 |
| cmbs-2026-easydew | easydew | 160 | 30 | 65 | 35 | 9 |
| cmbs-2026-mediheal | MEDIHEAL | 230 | 30 | 70 | 35 | 9 |
| cmbs-2026-innisfree | innisfree | 305 | 30 | 65 | 35 | 9 |
| cmbs-2026-physiogel | PHYSIOGEL | 375 | 30 | 70 | 35 | 9 |
| cmbs-2026-age20s | AGE20'S | 450 | 30 | 65 | 35 | 9 |
| cmbs-2026-ariul | Ariul | 520 | 30 | 60 | 35 | 9 |
| cmbs-2026-forencos | FORENCOS | 520 | 130 | 130 | 80 | 10 |

## 부록 B: 이벤트존 좌표

### 1F EventZones

| 라벨 | x | y | width | height | fontSize |
|---|---|---|---|---|---|
| 쿠팡 어워즈 체험존 | 200 | 160 | 120 | 28 | 9 |
| 피부측정 이벤트 | 40 | 210 | 95 | 28 | 8 |
| 뷰티 디바이스 체험존 | 140 | 210 | 95 | 28 | 7 |
| 쿠팡 뉴존 체험존 | 240 | 210 | 95 | 28 | 8 |
| 뉴존 선물 수령존 | 340 | 210 | 95 | 28 | 8 |
| 뷰티박스 수령존 | 450 | 320 | 120 | 35 | 9 |

### 2F EventZones

| 라벨 | x | y | width | height | fontSize |
|---|---|---|---|---|---|
| 인생네컷 포토존 | 520 | 90 | 130 | 28 | 9 |
| 헤어쇼 이벤트(4/18) | 50 | 130 | 130 | 28 | 9 |
| 쿠팡 메가뷰티쇼 스토리 | 50 | 170 | 200 | 28 | 8 |
| 쿠팡 와우회원 인증존 | 50 | 210 | 200 | 28 | 8 |
| 파페치/TW 홍보 부스 | 520 | 222 | 130 | 28 | 8 |

## 부록 C: 1F 비브랜드 오버레이

### Stairs

| x | y | width | height | steps |
|---|---|---|---|---|
| 620 | 30 | 50 | 80 | 6 |
| 620 | 280 | 50 | 80 | 6 |

### Arrows

| x | y | direction | label | color |
|---|---|---|---|---|
| 460 | 210 | down | OUT | #c62828 |
| 510 | 210 | up | IN | #c62828 |
| 430 | 365 | down | OUT | #c62828 |
| 480 | 365 | up | IN | #c62828 |

**Arrow `getPath()` 공식 (원본 `app/page.tsx`):**
- up: `M${x},${y+10} L${x},${y} L${x-5},${y+5} M${x},${y} L${x+5},${y+5}`
- down: `M${x},${y} L${x},${y+10} L${x-5},${y+5} M${x},${y+10} L${x+5},${y+5}`
- left: `M${x+10},${y} L${x},${y} L${x+5},${y-5} M${x},${y} L${x+5},${y+5}`
- right: `M${x},${y} L${x+10},${y} L${x+5},${y-5} M${x+10},${y} L${x+5},${y+5}`

### DecorRects (의미 불명 — 원본 재현용)

| x | y | width | height | fill |
|---|---|---|---|---|
| 595 | 280 | 15 | 100 | #1976d2 |

---

*상태: 구현완료 | 진행률: 83/83 (100%)*
