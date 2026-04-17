# port: coupang mega beauty floor map

> 작성일시: 2026-04-17 14:52 (2026-04-17 15:38 개정)
> 기준커밋: 273a5ae
> 대상 프로젝트: expo-harvest
> 상태: 초안
> 진행률: 0/22 (0%)
> 원본 자료: `C:/Users/Narang/Downloads/b_FU8ddfFKm4k.zip` (압축 내부 `app/page.tsx` — 1F/2F/all 토글, 순수 SVG 도형, 배경 이미지 없음)
> 요약: 원본은 1F(viewBox 700×400)와 2F(viewBox 700×320) 두 SVG를 세로로 스택하여 배경 이미지 없이 브랜드 박스·이벤트존·계단·화살표만 그린다. 현재 expo-harvest는 `mapBackgroundImage` 1장과 퍼센트 `mapX/mapY` 단일 좌표만 지원하므로, 층·viewBox·오버레이 엔터티를 보존하는 데이터 모델로 재설계하고, 데이터를 이 모델 위에 재이식한다.

---

## 개요

원본 `app/page.tsx`는 `activeFloor: "1F" | "2F" | "all"` 토글로 두 SVG를 분기 렌더링한다. 두 층은 **서로 다른 viewBox**(1F 700×400, 2F 700×320)를 쓰며 배경 이미지 없이 `Booth`, `EventZone`, `Arrow`, `Stairs`, 그리고 의미 불명의 파란 세로 `rect`(1F) 같은 순수 SVG 도형만으로 구성된다. 반면 현재 [`src/lib/data/lootItems.ts`](../../src/lib/data/lootItems.ts)는 행사당 배경 이미지 1장과 퍼센트 `mapX/mapY` 단일 좌표만 저장하고, [`src/lib/components/ExhibitionMap.svelte`](../../src/lib/components/ExhibitionMap.svelte)는 그 위에 원형 핀을 얹는 구조다.

이 계획의 목표는 (1) 원본의 층 + viewBox + 오버레이 정보를 손실 없이 담을 데이터 모델 재설계, (2) 쿠팡 메가뷰티쇼 2026 데이터의 층별 재이식, (3) 1F/2F/전체 토글 UI 이식, (4) 회귀 검증이다.

## 선행 조건 및 주요 설계 결정

### 선행 조건 (Phase 1 착수 전)

1. **hover UX 선행 분리 커밋 완료**: `src/lib/components/ExhibitionMap.svelte`의 hover 패널 변경은 2026-04-17 커밋 `e121f47`(`refactor: move map hover details to summary panel`)로 이미 분리됐다. 본 plan은 그 이후 상태를 기준으로 진행한다.
2. **zip 재해석 안 하도록 매핑 표 박제**(아래 §브랜드 매핑 표).

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
| AGE20'S 항목 누락 지적 | **반박** | 현 데이터에 이미 `cmbs-2026-age20s` item, hashtag preset, social link가 존재한다. 추가가 아니라 `floorId`/픽셀 좌표 재이식 대상이다 |

### 브랜드 매핑 표 (원본 → 현 데이터)

**1F (10개)**

| 원본 라벨 | 현 id | 비고 |
|---|---|---|
| rom&nd | cmbs-2026-romand | |
| DEWYTREE | cmbs-2026-dewytree | |
| NATURE REPUBLIC | cmbs-2026-naturerepublic | |
| AESTURA | cmbs-2026-aestura | |
| BANILA CO | cmbs-2026-banilaco | |
| Dr.G | cmbs-2026-drg | |
| AHC | cmbs-2026-ahc | |
| THE FACE SHOP | cmbs-2026-thefaceshop | |
| espoir | cmbs-2026-espoir | |
| TONYMOLY | cmbs-2026-tonymoly | |

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

1. - [ ] **층별 지도 모델을 도입한다**
   - [ ] `src/lib/data/lootItems.ts`: `Exhibition`에 `floors: FloorMap[]`과 `defaultFloorId`를 추가한다. `FloorMap`은 `id`, `label`, `viewBox`(예: `"0 0 700 400"`), `overlays: MapOverlay[]`를 갖는다.
   - [ ] `src/lib/data/lootItems.ts`: 기존 `mapBackgroundImage`, `mapAspectRatio`, `hallLabels` 필드를 제거하거나 deprecated로 표시한다(쿠팡 메가뷰티쇼 외 전시가 없으므로 제거 가능).

2. - [ ] **LootItem에 층·박스 렌더링 정보를 추가한다**
   - [ ] `src/lib/data/lootItems.ts`: `LootItem`에 `floorId: string`, `boxWidth: number`, `boxHeight: number`, `fontSize?: number`를 추가한다. `mapX`, `mapY`는 픽셀 좌표로 의미를 바꾼다(기존 퍼센트 0–100 해석 폐기).
   - [ ] `src/lib/data/lootItems.ts`: 좌표 단위 변경이 타 전시에 미치는 영향을 확인한다(현재 `EXHIBITIONS`엔 쿠팡 메가뷰티쇼만 있음 — 영향 없음 확인 후 주석으로 명시).

3. - [ ] **비선택 오버레이 타입을 정의한다**
   - [ ] `src/lib/data/lootItems.ts`: `MapOverlay`를 `EventZoneOverlay | StairsOverlay | ArrowOverlay | DecorRectOverlay` 유니온으로 정의한다. 파란 세로 `rect`는 `DecorRectOverlay`로 포용(의미 불명 주석 포함).
   - [ ] `src/lib/data/lootItems.ts`: 각 오버레이는 `floorId`, 픽셀 좌표(`x, y, width, height` 또는 `x, y, direction`), `label`/`color` 등 렌더링 필수 속성만 갖는다. 상세 시트와 연결되지 않음을 타입 레벨(또는 주석)에서 명시한다.

### Phase 2: 쿠팡 메가뷰티쇼 2026 데이터를 층·픽셀 기준으로 재이식한다

4. - [ ] **AGE20'S 기존 데이터 정합성을 확인한다**
   - [ ] `src/lib/data/lootItems.ts`: 이미 존재하는 `cmbs-2026-age20s` 항목의 `floorId`, 픽셀 좌표, 박스 크기, `fontSize`, 해시태그/소셜링크 연결이 원본 2F 박스와 일치하는지 검증한다.

5. - [ ] **19개 브랜드 좌표를 원본 픽셀로 이식한다**
   - [ ] `src/lib/data/lootItems.ts`: `§브랜드 매핑 표`를 따라 각 브랜드의 `floorId`, `mapX`, `mapY`, `boxWidth`, `boxHeight`, `fontSize`를 원본 `app/page.tsx`의 `<Booth>` 호출과 일치하게 설정한다. 기존 퍼센트 좌표는 폐기한다.

6. - [ ] **1F/2F 비브랜드 오버레이를 이식한다**
   - [ ] `src/lib/data/lootItems.ts`: 1F EventZone 6개(쿠팡 어워즈 체험존, 피부측정 이벤트, 뷰티 디바이스 체험존, 쿠팡 뉴존 체험존, 뉴존 선물 수령존, 뷰티박스 수령존), 2F EventZone 5개(인생네컷 포토존, 파페치/TW 홍보 부스, 헤어쇼 이벤트(4/18), 쿠팡 메가뷰티쇼 스토리, 쿠팡 와우회원 인증존)를 `EventZoneOverlay`로 기록한다.
   - [ ] `src/lib/data/lootItems.ts`: 1F 계단 2개, IN/OUT 화살표 4개, 파란 세로 `rect`를 해당 오버레이 타입으로 기록한다.

7. - [ ] **목록/카드/시트에 층 정보를 노출한다**
   - [ ] `src/lib/components/LootCard.svelte`, `src/lib/components/BoothDetailSheet.svelte`: `floorId` 또는 `floors[*].label`을 조회해 "1F"/"2F" 배지를 표시한다.
   - [ ] `src/routes/+page.svelte`: 리스트에서 브랜드 선택 시 해당 브랜드의 층으로 지도 상태를 동기화할지, 선택한 층을 유지할지 결정 후 구현한다(기본: 해당 층으로 이동).

### Phase 3: 1F/2F/전체 토글 지도를 구현한다

8. - [ ] **층 전환 상태와 토글 UI를 이식한다**
   - [ ] `src/lib/components/ExhibitionMap.svelte`: `activeFloor` 상태를 추가하고, 원본과 동일한 "전체/1F/2F" 토글 버튼을 렌더링한다. 기본값은 `defaultFloorId` 또는 `all` — 결정 후 주석으로 명시.
   - [ ] `src/routes/+page.svelte`, `src/lib/components/ExhibitionMap.svelte`: 층 상태는 `ExhibitionMap` 내부 소유로 두되, 외부에서 특정 층으로 점프할 수 있는 props/이벤트 경로(리스트→층 이동용)를 하나 노출한다.

9. - [ ] **층별 SVG를 viewBox 단위로 렌더링한다**
   - [ ] `src/lib/components/ExhibitionMap.svelte`: 각 층을 독립 SVG(`viewBox={floor.viewBox}`)로 렌더링한다. `activeFloor === "all"`은 1F SVG와 2F SVG를 **세로 스택**으로 동시 렌더(원본 레이아웃 재현).
   - [ ] `src/lib/components/ExhibitionMap.svelte`: `mapBackgroundImage` 관련 렌더 경로를 제거한다.

10. - [ ] **브랜드 박스와 비선택 오버레이를 렌더링한다**
    - [ ] `src/lib/components/ExhibitionMap.svelte`: 브랜드 `LootItem`은 `<rect>` + `<text>` 박스로 렌더하고 클릭 시 `BoothDetailSheet`를 연다. 포커스/호버 스타일은 기존 UX 결과물과 호환되게 유지한다.
    - [ ] `src/lib/components/ExhibitionMap.svelte`: `EventZoneOverlay`/`StairsOverlay`/`ArrowOverlay`/`DecorRectOverlay`는 원본 `EventZone`/`Stairs`/`Arrow`/`rect fill="#1976d2"` 스타일로 렌더하고 pointer-events 비활성화한다.

11. - [ ] **선택 컨텍스트와 층 상태의 일관성을 맞춘다**
    - [ ] `src/lib/components/ExhibitionMap.svelte`, `src/lib/components/BoothDetailSheet.svelte`: 2F 브랜드 탭 시 상세 시트에 "2F" 배지가 나타나고, 시트 닫을 때 사용자가 보던 층이 유지되도록 상태를 분리한다.

### Phase 4: 회귀 방지와 문서 정리

12. - [ ] **정적·수동 검증**
    - [ ] `npm run check` 기준 타입/템플릿 오류 없음을 확인한다.
    - [ ] 수동 시나리오: 전체/1F/2F 전환, 1F·2F 브랜드 각각 1개 탭하여 시트 열고 닫기, 리스트에서 2F 브랜드 선택 시 지도가 2F로 전환되는지, 이벤트존/계단/화살표/파란 세로줄이 클릭되지 않는지 확인한다.

13. - [ ] **후속 좌표 보정 기록과 파일 충돌 정리**
    - [ ] `docs/plan/2026-04-17_port-coupang-mega-beauty-floor-map.md`: 이식 후 임시로 남겨둔 좌표/라벨/색상이 있다면 명시한다(없으면 "모두 원본 일치"로 기록).
    - [ ] `src/lib/components/ExhibitionMap.svelte`, `TODO.md`(존재 시에만): 선행 hover UX 커밋(`e121f47`)과 층 분리 작업 사이의 충돌 흔적이 남아 있으면 정리한다.

---

*상태: 초안 | 진행률: 0/22 (0%)*
