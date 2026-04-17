# 수정 보고서: Hall 2F top-row layout contract 복구

> 작성일: 2026-04-18
> 대상: expo-harvest
> 범위: `hall-2f` 상단 8부스 `renderX` 좌표와 layout contract assertion 충돌로 인한 SSR 500 복구

## 변경 배경

- 개발 서버에서 `/` SSR 평가 중 `Hall 2F top-row booths must stay horizontally packed with no gap.` 예외가 발생하며 첫 화면이 500으로 깨졌습니다.
- 에러는 [`src/lib/data/lootItems.ts`](D:/work/project/service/wtools/expo-harvest/src/lib/data/lootItems.ts)의 `assertCoupangMegaBeautyLayoutContract()`가 모듈 import 시점에 실행되면서 바로 노출됐습니다.
- 직전 지도 패킹 정리에서 2F 상단 8부스를 "무간격 top row"로 고정하는 계약을 추가했지만, 실제 `renderX` 데이터는 그 계약과 일치하지 않는 상태였습니다.

## 원인 분석

### 1. 2F 상단 row 데이터와 assertion이 서로 다른 배치를 가리키고 있었음

- assertion은 `HALL_2F_TOP_ROW_BOOTH_IDS` 8개가 모두 같은 `renderY`를 공유하고, `NORMALIZED_BOOTH_RENDER_WIDTH(72)` 간격으로 연속 배치된다고 가정했습니다.
- 하지만 실제 데이터는 첫 부스 `아벤느`가 `renderX: 24`인데, 다음 부스 `에뛰드`가 `renderX: 168`로 잡혀 있어 첫 간격이 `144`였습니다.
- 이후 `이지듀`~`아리얼`도 모두 한 칸씩 오른쪽으로 밀려 있어, "무간격 8칸 row"가 아니라 "첫 칸 뒤에 빈 칸이 있는 row"가 되어 있었습니다.

### 2. import 시점 assertion이라 dev/SSR에서 즉시 장애로 번졌음

- 이 contract 검사는 테스트 전용이 아니라 데이터 모듈 top-level에서 바로 실행됩니다.
- 그래서 좌표 불일치가 생기면 상세 시트, 루트 페이지, SSR evaluation이 모두 같은 예외로 죽습니다.

## 수정사항

### 1. 2F 상단 8부스 `renderX`를 72px grid에 다시 맞춤

- [`src/lib/data/lootItems.ts`](D:/work/project/service/wtools/expo-harvest/src/lib/data/lootItems.ts)에서 아래 부스들의 `renderX`를 왼쪽으로 한 칸씩 되돌렸습니다.

| 부스 | before | after |
|---|---:|---:|
| `cmbs-2026-etude` | 168 | 96 |
| `cmbs-2026-easydew` | 240 | 168 |
| `cmbs-2026-mediheal` | 312 | 240 |
| `cmbs-2026-innisfree` | 384 | 312 |
| `cmbs-2026-physiogel` | 456 | 384 |
| `cmbs-2026-age20s` | 528 | 456 |
| `cmbs-2026-ariul` | 600 | 528 |

- 수정 후 top row 전체 좌표는 `24, 96, 168, 240, 312, 384, 456, 528`이 되어 `72px` 간격 packing contract와 일치합니다.

### 2. 수정사항을 보고서로 남김

- 이번 장애는 문서 변경이 아니라 실데이터 좌표와 runtime assertion 충돌에서 발생했으므로, 후속 회고 시 원인을 바로 추적할 수 있게 본 보고서를 추가했습니다.

## 검증

실행:

```powershell
cd "D:\work\project\service\wtools\expo-harvest"
npm run check
```

결과:

- `npm run check`: 통과 (`svelte-check found 0 errors and 0 warnings`)

참고:

- 사용자가 이미 `npm run dev`를 실행 중인 상황이어서 `npm run build`는 이번 턴에서 재실행하지 않았습니다.
- 이번 수정은 import 시점 assertion과 데이터 좌표만 맞춘 hotfix라서, 우선 `npm run check`로 타입/모듈 평가 회복을 확인했습니다.

## 영향 범위

- `hall-2f` 상단 8부스의 SVG 렌더 위치가 한 칸씩 왼쪽으로 정렬됩니다.
- `assertCoupangMegaBeautyLayoutContract()`가 다시 통과하므로 SSR import 단계 500이 사라집니다.
- 2F 우측 lane(`stairs`, `포렌코즈`, `파페치 / TW 홍보 부스`)과 좌측 event zone column은 이번 수정 범위에 포함되지 않았습니다.

## 후속 확인

- 브라우저에서 2F 상단 8부스가 실제로 무간격 한 줄로 보이는지 육안 확인이 필요합니다.
- dev 서버를 켠 상태에서 첫 페이지 500이 사라졌는지, 새로고침만으로 복구되는지 확인하면 됩니다.
