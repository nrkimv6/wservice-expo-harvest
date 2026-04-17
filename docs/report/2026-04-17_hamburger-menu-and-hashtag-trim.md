# 수정 보고서: 박람회 메뉴 숨김 + 해시태그 축소 + 부스 위치 제거

> 작성일: 2026-04-17
> 대상: expo-harvest
> 범위: `/app` 박람회 선택 UI 위치 변경, 해시태그 정리, 부스 위치 정보 제거

## 변경 배경

- 메인 화면에서 박람회 선택 카드가 바로 노출되어 있어, 사용자가 파밍 화면보다 설정성 UI를 먼저 보게 되는 상태였습니다.
- 해시태그 데이터는 전 부스에 임시값이 섞여 있어 실제 현장 사용 기준으로는 노이즈가 컸습니다.
- 부스 위치 텍스트도 시안 단계 정보라 신뢰도가 낮아, 현 단계에서는 오히려 오정보가 될 가능성이 있었습니다.

## 핵심 변경

### 1. 박람회 선택을 햄버거 메뉴로 이동

- `src/routes/app/+page.svelte`에서 메인 본문에 있던 박람회 선택 섹션을 제거했습니다.
- 우측 상단에 `박람회 메뉴` 버튼을 추가하고, 눌렀을 때만 우측 드로어가 열리도록 변경했습니다.
- 드로어는 배경 클릭과 `Esc` 키로 닫을 수 있게 처리했습니다.
- 메인 요약 카드에는 현재 박람회만 보여주고, 전환 위치는 짧은 안내 문구로만 남겼습니다.

### 2. 해시태그를 두 부스만 남기도록 정리

- `src/lib/data/lootItems.ts`에 `stripBoothMeta()` helper를 추가해 부스 위치와 기본 해시태그를 일괄 비우도록 정리했습니다.
- `쿠팡메가뷰티쇼 2026`에서는 아래 2개 부스만 해시태그를 유지했습니다.

```text
Ariul
#쿠팡뷰티
#메가뷰티쇼
#아리얼
@ariul_official

NATURE REPUBLIC
#네이처리퍼블릭
#쿠팡뷰티
#메가뷰티쇼
@naturerepublic_kr
```

### 3. 부스 위치 문구를 화면 전반에서 제거

- 데이터상 `location` 값을 빈 문자열로 통일했습니다.
- `BoothDetailSheet.svelte`, `LootCard.svelte`, `ExhibitionMap.svelte`에서 위치가 있을 때만 노출하도록 조건부 렌더링으로 바꿨습니다.
- 실시간 fallback 알림 문구에서도 `→ 위치` 꼬리표를 제거해 빈 문장이 생기지 않게 맞췄습니다.

### 4. 빈 해시태그 상태 대응

- 상세 시트에서 해시태그가 없는 부스는 `Hashtag Block` 섹션 자체를 렌더링하지 않도록 바꿨습니다.
- 리스트 카드에서도 `#n hashtags` 뱃지는 실제 해시태그가 있는 부스에만 표시되도록 조정했습니다.
- 메모 placeholder는 위치/해시태그 전제를 제거한 일반 현장 메모 문구로 정리했습니다.

## 검증

실행:

```powershell
cd "D:\work\project\service\wtools\expo-harvest"
npm run check
npm run build
```

결과:

- `npm run check`: 통과 (`0 errors, 0 warnings`)
- `npm run build`: Svelte/Vite 빌드는 완료됐지만, 마지막 Cloudflare adapter 단계에서 기존 Windows 파일 잠금 이슈로 실패

빌드 실패 메시지 핵심:

```text
EPERM, Permission denied: .svelte-kit\cloudflare
Close the terminal running `npm run dev` and rerun `npm run build`.
```

## 참고

- 현재 `쿠팡메가뷰티쇼 2026` 참여 브랜드 목록은 유지하되, 해시태그와 위치 표시는 최소화한 상태입니다.
- 이후 실제 운영안이 정리되면 특정 브랜드만 다시 선택적으로 위치/해시태그를 복원하는 방식으로 확장하면 됩니다.
