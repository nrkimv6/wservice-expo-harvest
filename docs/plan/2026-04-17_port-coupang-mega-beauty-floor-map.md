# port: coupang mega beauty floor map

> 작성일시: 2026-04-17 14:52
> 기준커밋: 273a5ae
> 대상 프로젝트: expo-harvest
> 상태: 초안
> 진행률: 0/18 (0%)
> 요약: 전달된 React 원본은 `1F`, `2F`, `all` 토글과 층별 도형 오버레이를 함께 갖고 있지만, 현재 expo-harvest의 `쿠팡메가뷰티쇼 2026` 데이터는 배경 이미지 1장과 `mapX/mapY` 단일 좌표만 지원한다. 이번 계획은 단일층 임시 배치를 층 분리 가능한 구조로 바꾸고, 쿠팡 메가뷰티쇼 데이터를 실제 층 기준으로 다시 이식하는 데 목적이 있다.

---

## 개요

사용자가 제공한 React ZIP의 [`app/page.tsx`](D:/work/project/service/wtools/expo-harvest/codex-temp/zip-inspect/app/page.tsx)는 `activeFloor` 상태로 `1F`, `2F`, `all`을 전환하며, 브랜드 부스와 이벤트존을 층별 SVG로 각각 렌더링한다. 반면 현재 expo-harvest는 [`src/lib/data/lootItems.ts`](D:/work/project/service/wtools/expo-harvest/src/lib/data/lootItems.ts)에서 행사당 `mapBackgroundImage` 1장과 아이템별 `mapX`, `mapY`만 저장하고, [`src/lib/components/ExhibitionMap.svelte`](D:/work/project/service/wtools/expo-harvest/src/lib/components/ExhibitionMap.svelte)는 그 단일 캔버스 위에 모든 핀을 한꺼번에 올리는 구조다.

이 상태로는 React 원본이 가진 1층/2층 분리 정보가 납작하게 합쳐지고, 사용자가 언급한 "1층과 1층이 모두 포함" 문제도 결국 층 구분이 데이터 모델에서 사라진 결과로 해석된다. ZIP 원본 기준으로는 실제 이슈가 `1F`와 `2F`를 모두 담아야 한다는 뜻이므로, 계획은 "층 정보 보존"을 우선으로 잡는다.

## 기술적 고려사항

- 현재 `LootItem`은 `mapX`, `mapY`, `location`만 가져서 층, 영역 유형(브랜드 부스/이벤트존/동선), SVG 도형 크기 같은 정보를 표현할 수 없다. React 원본의 `Booth`, `EventZone`, `Arrow`, `Stairs`처럼 층별 오버레이 엔터티가 필요하다.
- [`src/routes/+page.svelte`](D:/work/project/service/wtools/expo-harvest/src/routes/+page.svelte)는 `selectedExhibition`을 기준으로 지도 탭 하나만 렌더링하므로, 층 전환 상태는 `ExhibitionMap` 내부에서 관리하거나 상위 페이지로 끌어올리는 선택이 필요하다.
- 현재 `쿠팡메가뷰티쇼 2026`의 부스 데이터는 일부 브랜드만 테스트용으로 배치되어 있고 위치 텍스트는 비워 둔 상태다. 층 분리 이식 시에는 좌표만 옮기는 것이 아니라 각 브랜드가 어느 층에 속하는지와 이벤트존을 목록 UX에 어떻게 연결할지도 같이 정해야 한다.
- 현재 워크트리에는 [`src/lib/components/ExhibitionMap.svelte`](D:/work/project/service/wtools/expo-harvest/src/lib/components/ExhibitionMap.svelte) 미커밋 수정이 있으므로, 구현 단계에서는 기존 hover UX 수정과 충돌하지 않도록 지도 구조 변경 범위를 분리해서 다뤄야 한다.

---

## TODO

### Phase 1: 층 분리 가능한 지도 데이터 모델을 정의한다

1. - [ ] **단일 배경 이미지 모델을 층별 지도 모델로 확장한다**
   - [ ] `src/lib/data/lootItems.ts`: `Exhibition`에 층별 지도 배열(예: `floorMaps`)과 기본 층, 층 라벨을 담을 수 있는 타입을 추가하고 기존 `mapBackgroundImage`, `mapAspectRatio`, `hallLabels` 의존 구간을 정리한다.
   - [ ] `src/lib/data/lootItems.ts`: `LootItem`에 `floorId` 같은 층 식별자를 추가해 브랜드 핀이 어느 층에 속하는지 분리 저장할 수 있게 만든다.

2. - [ ] **브랜드 핀 외 오버레이 엔터티를 수용한다**
   - [ ] `src/lib/data/lootItems.ts`: React 원본의 `Booth`, `EventZone`, `Arrow`, `Stairs`를 표현할 별도 지도 오버레이 타입을 정의하고, 아이템 리스트와 독립적으로 관리할 구조를 설계한다.
   - [ ] `src/lib/data/lootItems.ts`, `src/lib/components/ExhibitionMap.svelte`: 브랜드 부스는 상세 시트와 연결되는 인터랙티브 핀으로, 이벤트존/계단/IN·OUT은 비선택형 안내 오버레이로 구분하는 렌더링 계약을 문서화한다.

### Phase 2: 쿠팡 메가뷰티쇼 데이터를 1F/2F 기준으로 재배치한다

3. - [ ] **React 원본 좌표를 현재 전시 데이터로 옮길 기준표를 만든다**
   - [ ] `codex-temp/zip-inspect/app/page.tsx`, `src/lib/data/lootItems.ts`: React 원본에 있는 브랜드/이벤트존 명칭을 현재 `쿠팡메가뷰티쇼 2026` 아이템 ID와 매핑해 누락/추가 브랜드를 표로 정리한다.
   - [ ] `docs/report/2026-04-17_multi-exhibition-booths.md`, `src/lib/data/lootItems.ts`: 기존 테스트 데이터에만 있는 브랜드와 React 원본에만 있는 이벤트존을 구분해, 이번 이식 범위가 "브랜드만 우선"인지 "이벤트존 포함"인지 결정 근거를 남긴다.

4. - [ ] **`쿠팡메가뷰티쇼 2026` 전시 데이터를 층별로 재구성한다**
   - [ ] `src/lib/data/lootItems.ts`: 현재 단일 `coupangMegaBeautyShow2026` 정의를 `1F`, `2F` 층 데이터와 오버레이 정의로 재작성한다.
   - [ ] `static/images/exhibitions`, `src/lib/data/lootItems.ts`: 필요하면 층별 배경 이미지 자산을 추가하거나, SVG 오버레이만으로 충분하면 기존 임시 이미지 의존을 제거하는 방향을 결정한다.

5. - [ ] **목록/상세 정보도 층 정보를 잃지 않게 맞춘다**
   - [ ] `src/lib/components/LootCard.svelte`, `src/lib/components/BoothDetailSheet.svelte`: 부스 카드와 상세 시트에 층 또는 구역 표기가 필요한지 검토하고, 지도에서 선택한 층과 정보 문맥이 이어지도록 표시 규칙을 정한다.
   - [ ] `src/lib/data/lootItems.ts`, `src/routes/+page.svelte`: 층별 필터 없이 전체 리스트를 유지하더라도 선택된 부스가 어느 층인지 찾을 수 있는 최소 텍스트 정보(`location` 또는 별도 floor label)를 복구한다.

### Phase 3: 지도 UI를 층 전환형으로 바꾼다

6. - [ ] **React 원본의 `1F/2F/all` 전환을 Svelte 흐름에 맞게 이식한다**
   - [ ] `src/lib/components/ExhibitionMap.svelte`: 층 전환 상태와 토글 UI를 추가하고, 선택된 층 또는 전체 보기 기준으로 배경/오버레이/핀을 분기 렌더링한다.
   - [ ] `src/routes/+page.svelte`, `src/lib/components/ExhibitionMap.svelte`: 층 전환 상태를 지도 내부에 둘지 상위 페이지로 올릴지 결정하고, 탭 전환 후에도 UX가 흔들리지 않는 구조로 고정한다.

7. - [ ] **층별 보기에서 핀 선택 계약을 다시 맞춘다**
   - [ ] `src/lib/components/ExhibitionMap.svelte`: `all` 보기에서는 층이 다른 핀의 겹침과 시인성을 점검하고, 필요하면 `all`은 오버레이 요약만 보여주고 상세 선택은 층별 보기에서만 허용하는지 결정한다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`, `src/lib/components/BoothDetailSheet.svelte`: 2층 부스를 탭했을 때 상세 시트에 현재 층 정보가 이어지고, 시트를 닫아도 사용자가 보던 층이 유지되도록 상태 흐름을 정리한다.

### Phase 4: 회귀를 막는 검증과 문서 정리를 한다

8. - [ ] **정적 검증과 수동 체크 기준을 준비한다**
   - [ ] `package.json`, `src/lib/components/ExhibitionMap.svelte`, `src/lib/data/lootItems.ts`: `npm run check` 기준으로 타입/템플릿 오류가 없는지 검증한다.
   - [ ] `src/routes/+page.svelte`, `src/lib/components/ExhibitionMap.svelte`: 지도 탭에서 `1F`, `2F`, `전체` 전환, 브랜드 핀 선택, 상세 시트 열기/닫기, 리스트 선택 후 해당 층으로 복귀하는 수동 확인 시나리오를 체크한다.

9. - [ ] **후속 좌표 보정 작업과 충돌 지점을 기록한다**
   - [ ] `docs/plan/2026-04-17_port-coupang-mega-beauty-floor-map.md`: 실제 운영 배치도 확정 전까지 어떤 좌표와 텍스트가 임시값인지 명시해 다음 수정 때 다시 해석하지 않게 한다.
   - [ ] `src/lib/components/ExhibitionMap.svelte`, `TODO.md`: 진행 중인 hover UX 수정과 이번 층 분리 작업의 순서를 분리해, 두 변경이 한 파일에서 충돌하는 지점을 추적 가능하게 남긴다.

---

*상태: 초안 | 진행률: 0/18 (0%)*
